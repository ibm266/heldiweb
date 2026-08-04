// Server-only read path for published customer reviews.
//
// Once a submission is checked and its row flipped to status='published' in
// Supabase, getPublishedReviews() surfaces it here with a signed URL for its
// media. When this returns an empty array (nothing published yet, or Supabase
// not configured) the review surfaces render nothing at all in production;
// the invented placeholders behind lib/showcase.ts are for design review only
// and never fill the gap on the live site.
//
// The VERIFIED badge is earned, not assumed: it is set from whether the row
// carries an order number. Friends, family and testers reviewing before launch
// have no order to match, so they publish without the badge, which is what
// keeps the badge meaningful and the /review page's promise ("we match every
// review to a real order before it goes up") true. Reviews given in exchange
// for free product are incentivised under CMA guidance and need disclosing on
// the review itself; there is no field for that yet, so see
// docs/go-live-checklist.md before publishing any.
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
  order_number: string | null;
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
        "id, author, location, dish, tablespoons, rating, body, media_path, media_content_type, order_number, submitted_at"
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
        // Only a review matched to a real order may wear the badge.
        verified: Boolean(row.order_number?.trim()),
        date: row.submitted_at.slice(0, 10)
      });
    }
    return reviews;
  } catch {
    return [];
  }
}
