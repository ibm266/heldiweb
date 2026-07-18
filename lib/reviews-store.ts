// Server-only read path for published customer reviews.
//
// The storefront still ships PLACEHOLDER_REVIEWS (see lib/reviews.ts) as the
// design default. Once a submission is checked and its row flipped to
// status='published' in Supabase, getPublishedReviews() surfaces it here with
// a signed URL for its media. Consumers fall back to the placeholders whenever
// this returns an empty array (no published reviews yet, or Supabase not
// configured), so the site never breaks on a missing backend.
import { getSupabaseAdmin, REVIEW_MEDIA_BUCKET } from "./supabase/admin";
import type { Review, ReviewMedia } from "./reviews";

// Signed media URLs sit on a statically-rendered page, so give them a long
// life; each rebuild/revalidate mints fresh ones.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365;

type ReviewRow = {
  id: string;
  author: string;
  location: string | null;
  dish: string;
  tablespoons: number;
  rating: number | null;
  body: string;
  media_path: string | null;
  media_content_type: string | null;
  submitted_at: string;
};

async function toMedia(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  row: ReviewRow
): Promise<ReviewMedia | null> {
  if (!row.media_path || !row.media_content_type) return null;
  const { data, error } = await supabase.storage
    .from(REVIEW_MEDIA_BUCKET)
    .createSignedUrl(row.media_path, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) return null;

  const alt = `${row.dish} with Heldi stirred in, from ${row.author}`;
  if (row.media_content_type.startsWith("video/")) {
    // Customer videos arrive without a still; the gallery treats an empty
    // poster as "no poster", which is fine for a signed-in <video> source.
    return { kind: "video", src: data.signedUrl, poster: "", alt };
  }
  return { kind: "image", src: data.signedUrl, alt };
}

/**
 * Published reviews, newest first (respecting manual display_order), mapped to
 * the storefront Review shape. Only reviews that still have their media are
 * returned, since the gallery is media-only. Returns [] on any failure so the
 * caller can fall back to placeholder content.
 */
export async function getPublishedReviews(): Promise<Review[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        "id, author, location, dish, tablespoons, rating, body, media_path, media_content_type, submitted_at"
      )
      .eq("status", "published")
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("submitted_at", { ascending: false });
    if (error || !data) return [];

    const reviews: Review[] = [];
    for (const row of data as ReviewRow[]) {
      const media = await toMedia(supabase, row);
      if (!media) continue;
      reviews.push({
        id: row.id,
        author: row.author,
        location: row.location ?? undefined,
        dish: row.dish,
        tablespoons: row.tablespoons,
        rating: row.rating ?? undefined,
        text: row.body,
        media,
        verified: true,
        date: row.submitted_at.slice(0, 10)
      });
    }
    return reviews;
  } catch {
    return [];
  }
}
