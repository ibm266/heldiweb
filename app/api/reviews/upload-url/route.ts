import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { guard } from "@/lib/rate-limit";
import {
  REVIEW_LIMITS,
  REVIEW_MEDIA_TYPES,
  REVIEW_UPLOAD_PREFIX
} from "@/lib/review-submissions";
import { getSupabaseAdmin, REVIEW_MEDIA_BUCKET } from "@/lib/supabase/admin";

// Mints a one-shot signed URL the browser uploads a review photo or video to,
// straight into the private review-media bucket. The file never touches a
// Vercel function, which is what lets us accept a real phone video: their
// request bodies cap at 4.5MB and fail with an opaque 413 above it.
//
// The server chooses the path, never the client. That is the whole security
// model here: the bucket is private with no policies, so the only way an object
// can exist in it is a signed URL minted here, for a path containing a uuid we
// generated. /api/reviews then verifies the object really exists and reads its
// true size and type from storage rather than believing the form.
//
// Signed upload URLs are valid for 2 hours (Supabase's fixed window).

export async function POST(request: Request) {
  // The only cap that applies to this flow. See RATE_RULES.reviewUploadUrl:
  // the upload bypasses both this code and the Vercel firewall, so the mint is
  // the single choke point on how much a stranger can park in the bucket.
  const blocked = guard(request, "reviewUploadUrl");
  if (blocked) return blocked;

  let body: { contentType?: unknown; bytes?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const extension = REVIEW_MEDIA_TYPES[contentType];
  if (!extension) {
    return NextResponse.json({ error: "Unsupported media type." }, { status: 400 });
  }

  // Advisory only: the client could lie, and a signed URL holder could send a
  // different file entirely. The bucket's own file_size_limit (migration 0004)
  // is the check that actually holds, and /api/reviews re-reads the real size
  // from storage afterwards. This just fails fast on an honest oversized pick.
  const bytes = typeof body.bytes === "number" ? body.bytes : 0;
  if (bytes > REVIEW_LIMITS.mediaMaxBytes) {
    return NextResponse.json({ error: "Media over the limit." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Review storage is not configured." },
      { status: 503 }
    );
  }

  const path = `${REVIEW_UPLOAD_PREFIX}/${randomUUID()}/media${extension}`;
  const { data, error } = await supabase.storage
    .from(REVIEW_MEDIA_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not start the upload. Try again shortly." },
      { status: 500 }
    );
  }

  // signedUrl already carries the token, so the browser needs no Supabase
  // client and no anon key: a plain PUT with the file as the body is enough.
  return NextResponse.json({ path: data.path, signedUrl: data.signedUrl });
}
