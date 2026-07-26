// The stored shape of a customer review submission, shared by the /review
// form (client) and the /api/reviews route (server). No server-only imports
// in here.
//
// Storage lives in the heldi-dev Supabase project: each submission is a row in
// public.reviews plus its photo/video in the private review-media bucket
// (schema: supabase/migrations/0001_create_reviews.sql). Writes go through the
// server-only service_role key, so customer data never enters the repo or the
// client bundle. Moderation is manual: check the order number against Shopify,
// then flip the row's status to 'published' and the storefront picks it up via
// lib/reviews-store.ts. This type stays the client/server contract for the form.

export type ReviewSubmissionMedia = {
  /** Filename inside the submission folder, e.g. "media.jpg". */
  file: string;
  contentType: string;
  bytes: number;
};

export type ReviewSubmission = {
  id: string;
  submittedAt: string; // ISO datetime
  /** Every submission starts pending; publishing is a manual, checked step. */
  status: "pending";
  /** 1 to 5 stars. */
  rating: number;
  /** Chip answers: wentWrong is asked at 1 to 3 stars, wentWell at 4 to 5. */
  wentWell: string[];
  wentWrong: string[];
  /** The dish it was stirred into, as typed. */
  dish: string;
  /** Heaped tablespoons stirred in; 4 means "4 or more". */
  tablespoons: number;
  text: string;
  author: string;
  location?: string;
  /** Never published. Used to match the order and to reply. */
  email: string;
  orderNumber?: string;
  media: ReviewSubmissionMedia | null;
  /** The customer ticked "happy for Heldi to publish this". */
  publishConsent: true;
};

/** Field limits: client-side for feedback, server-side for real. */
export const REVIEW_LIMITS = {
  dishMax: 80,
  textMin: 10,
  textMax: 2000,
  nameMax: 80,
  locationMax: 80,
  emailMax: 254,
  orderNumberMax: 32,
  // Real phone video, which is the whole point of asking for a clip. The file
  // never passes through a Vercel function (their request bodies cap at 4.5MB
  // and fail with an opaque 413), so this number is not bounded by the host:
  // the browser uploads straight to Supabase storage using a signed URL that
  // /api/reviews/upload-url mints. Enforced in three places, deliberately:
  // the form for feedback, the mint route as a cheap reject, and the bucket's
  // own file_size_limit (migration 0004) as the one that cannot be bypassed
  // by a hand-crafted upload.
  mediaMaxBytes: 50 * 1024 * 1024
} as const;

/** The limit as it should appear in copy, so the form and the route agree. */
export const MEDIA_MAX_LABEL = `${REVIEW_LIMITS.mediaMaxBytes / 1024 / 1024}MB`;

/** Folder every signed upload URL is minted under. */
export const REVIEW_UPLOAD_PREFIX = "uploads";

/**
 * The only object paths a submission may claim. Because the bucket is private
 * with no policies, the sole way an object can exist here is a signed URL this
 * server minted, so a well-formed path that resolves to a real object is
 * proof of provenance. The uuid segment also makes another submission's media
 * unguessable.
 */
export const REVIEW_MEDIA_PATH_PATTERN =
  /^uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/media\.[a-z0-9]{2,4}$/;

/** Upload types we accept, mapped to the extension they are stored under. */
export const REVIEW_MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm"
};

export const REVIEW_MEDIA_ACCEPT = Object.keys(REVIEW_MEDIA_TYPES).join(",");
