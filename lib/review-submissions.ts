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
  mediaMaxBytes: 50 * 1024 * 1024
} as const;

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
