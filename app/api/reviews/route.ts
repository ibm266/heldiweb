import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  WENT_WELL_CHIPS,
  WENT_WRONG_CHIPS
} from "@/components/review-form-data";
import { guard } from "@/lib/rate-limit";
import {
  MEDIA_MAX_LABEL,
  REVIEW_LIMITS,
  REVIEW_MEDIA_PATH_PATTERN,
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
  // The tightest cap on the site. This route accepts an unauthenticated
  // upload into our storage bucket, so repetition here costs real money and
  // could park anything at all in the bucket.
  const blocked = guard(request, "reviews");
  if (blocked) return blocked;

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

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Review storage is not configured." },
      { status: 503 }
    );
  }

  // Media arrives as a storage path, not a file: the browser already uploaded
  // it straight to the private bucket using a signed URL from
  // /api/reviews/upload-url, so nothing multi-megabyte passes through here.
  // None of what the form says about that file is trusted.
  const claimedPath = fieldString(data, "mediaPath", 200);
  let media: ReviewSubmission["media"] = null;

  if (claimedPath) {
    // Shape first, so a traversal or someone else's folder is rejected before
    // we spend a storage call on it.
    if (!REVIEW_MEDIA_PATH_PATTERN.test(claimedPath)) {
      return NextResponse.json(
        { error: "That upload reference is not valid." },
        { status: 400 }
      );
    }

    // Then existence and the real metadata. The bucket is private with no
    // policies, so an object being here at all means we minted its URL. And
    // reading size and type from storage rather than the form means a crafted
    // submission cannot record a 2KB file as a 40MB video, or claim an image
    // type for an executable.
    const { data: info, error: infoError } = await supabase.storage
      .from(REVIEW_MEDIA_BUCKET)
      .info(claimedPath);
    if (infoError || !info) {
      return NextResponse.json(
        { error: "That upload did not finish. Try attaching it again." },
        { status: 400 }
      );
    }

    const contentType = info.contentType ?? "";
    const bytes = info.size ?? 0;
    // Both of these should already be impossible (the mint route checks the
    // type, the bucket enforces the size), so a hit here means something
    // bypassed one of them: drop the object rather than keep it.
    if (!REVIEW_MEDIA_TYPES[contentType] || bytes > REVIEW_LIMITS.mediaMaxBytes) {
      await supabase.storage.from(REVIEW_MEDIA_BUCKET).remove([claimedPath]);
      return NextResponse.json(
        {
          error: REVIEW_MEDIA_TYPES[contentType]
            ? `Media over the ${MEDIA_MAX_LABEL} limit.`
            : "Unsupported media type."
        },
        { status: 400 }
      );
    }

    media = {
      file: claimedPath.split("/").pop() ?? "media",
      contentType,
      bytes
    };
  }

  const id = `${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`;
  // The object was named before the row existed, so media_path is what links
  // the two rather than a shared id prefix.
  const mediaPath = claimedPath || null;

  try {
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
