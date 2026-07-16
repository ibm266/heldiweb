// The stored shape of a customer review submission, shared by the /review
// form (client) and the /api/reviews route (server). No server-only imports
// in here.
//
// Storage today is deliberately simple: each submission lands in
// data/review-submissions/<id>/ as submission.json plus the uploaded media
// file. That directory is gitignored (customer data never enters the repo).
// Moderation is manual: read the JSON, check the order number against
// Shopify, then move the content into lib/reviews.ts as a published Review.
// When volume outgrows the founder's inbox, swap the file writes for a
// database and object storage; this type is the contract either way.

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
