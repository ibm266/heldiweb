import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  WENT_WELL_CHIPS,
  WENT_WRONG_CHIPS
} from "@/components/review-form-data";
import {
  REVIEW_LIMITS,
  REVIEW_MEDIA_TYPES,
  type ReviewSubmission
} from "@/lib/review-submissions";
import { getSupabaseAdmin, REVIEW_MEDIA_BUCKET } from "@/lib/supabase/admin";

// Review submissions land in the heldi-dev Supabase project: the row goes to
// the public.reviews table, the uploaded photo/video goes to the private
// review-media bucket. Both are reached with the service_role key, server-side
// only, so customer data never touches the repo or the client bundle. Every
// row starts status 'pending'; publishing is a manual, checked step (flip
// status to 'published'), which the storefront reads via getPublishedReviews.
// Manual review stays mandatory either way (CMA / DMCC Act 2024: reviews must
// be genuine and checked before display).
// Schema: supabase/migrations/0001_create_reviews.sql.

const WELL_VALUES = WENT_WELL_CHIPS.map((chip) => chip.value);
const WRONG_VALUES = WENT_WRONG_CHIPS.map((chip) => chip.value);

function fieldString(data: FormData, key: string, max: number): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function fieldList(data: FormData, key: string, allowed: string[]): string[] {
  return data
    .getAll(key)
    .filter((v): v is string => typeof v === "string" && allowed.includes(v));
}

export async function POST(request: Request) {
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected form data." }, { status: 400 });
  }

  // Honeypot: the hidden "website" field is invisible to humans. A filled
  // value means a bot, which gets a polite success and nothing stored.
  if (fieldString(data, "website", 200)) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const rating = Number(data.get("rating"));
  const tablespoons = Number(data.get("tablespoons"));
  const dish = fieldString(data, "dish", REVIEW_LIMITS.dishMax);
  const text = fieldString(data, "text", REVIEW_LIMITS.textMax);
  const author = fieldString(data, "name", REVIEW_LIMITS.nameMax);
  const location = fieldString(data, "location", REVIEW_LIMITS.locationMax);
  const email = fieldString(data, "email", REVIEW_LIMITS.emailMax);
  const orderNumber = fieldString(data, "orderNumber", REVIEW_LIMITS.orderNumberMax);
  const consent = data.get("consent") === "yes";

  const failures: string[] = [];
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) failures.push("rating");
  if (![1, 2, 3, 4].includes(tablespoons)) failures.push("tablespoons");
  if (!dish) failures.push("dish");
  if (text.length < REVIEW_LIMITS.textMin) failures.push("text");
  if (!author) failures.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) failures.push("email");
  if (!consent) failures.push("consent");
  if (failures.length > 0) {
    return NextResponse.json(
      { error: `Missing or invalid: ${failures.join(", ")}.` },
      { status: 400 }
    );
  }

  // Only the branch the rating actually asked for is kept.
  const wentWell = rating >= 4 ? fieldList(data, "wentWell", WELL_VALUES) : [];
  const wentWrong = rating <= 3 ? fieldList(data, "wentWrong", WRONG_VALUES) : [];

  const mediaEntry = data.get("media");
  let media: ReviewSubmission["media"] = null;
  let mediaBytes: Uint8Array | null = null;
  if (mediaEntry instanceof File && mediaEntry.size > 0) {
    const extension = REVIEW_MEDIA_TYPES[mediaEntry.type];
    if (!extension) {
      return NextResponse.json(
        { error: "Unsupported media type." },
        { status: 400 }
      );
    }
    if (mediaEntry.size > REVIEW_LIMITS.mediaMaxBytes) {
      return NextResponse.json(
        { error: "Media over the 50MB limit." },
        { status: 400 }
      );
    }
    mediaBytes = new Uint8Array(await mediaEntry.arrayBuffer());
    media = {
      file: `media${extension}`,
      contentType: mediaEntry.type,
      bytes: mediaEntry.size
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Review storage is not configured." },
      { status: 503 }
    );
  }

  const id = `${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`;
  // Store media under the review's id so the object and the row stay linked.
  const mediaPath = media ? `${id}/${media.file}` : null;

  try {
    if (media && mediaBytes && mediaPath) {
      const { error: uploadError } = await supabase.storage
        .from(REVIEW_MEDIA_BUCKET)
        .upload(mediaPath, mediaBytes, {
          contentType: media.contentType,
          upsert: false
        });
      if (uploadError) throw uploadError;
    }

    const { error: insertError } = await supabase.from("reviews").insert({
      id,
      submitted_at: new Date().toISOString(),
      status: "pending",
      rating,
      tablespoons,
      went_well: wentWell,
      went_wrong: wentWrong,
      dish,
      body: text,
      author,
      location: location || null,
      email,
      order_number: orderNumber || null,
      media_path: mediaPath,
      media_content_type: media?.contentType ?? null,
      media_bytes: media?.bytes ?? null,
      publish_consent: true
    });
    if (insertError) {
      // Don't orphan the just-uploaded media if the row failed to write.
      if (mediaPath) {
        await supabase.storage.from(REVIEW_MEDIA_BUCKET).remove([mediaPath]);
      }
      throw insertError;
    }
  } catch {
    return NextResponse.json(
      { error: "Could not store the review. Try again shortly." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
