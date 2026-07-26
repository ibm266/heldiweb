-- Hard limits on the review-media bucket, enforced by Supabase itself.
--
-- PURELY ADDITIVE in effect: this alters settings on the existing
-- review-media bucket and touches no data and no other project. Safe to run
-- more than once (idempotent).
--
-- Why this exists: review photos and videos now upload straight from the
-- browser to storage using a signed URL minted by /api/reviews/upload-url.
-- That is what allows a real phone video (Vercel functions reject request
-- bodies over 4.5MB), but it also means the bytes never pass through our own
-- code, so none of our server-side checks can see them. Anyone holding a
-- valid signed URL could otherwise PUT a 5GB file, or an executable with a
-- video content type.
--
-- These two settings are the only checks in that path that cannot be
-- bypassed. The mint route's checks are a cheap early reject, and the
-- verification in /api/reviews happens after the fact; this is the wall.
--
-- Keep file_size_limit in step with REVIEW_LIMITS.mediaMaxBytes in
-- lib/review-submissions.ts, and allowed_mime_types with REVIEW_MEDIA_TYPES.

update storage.buckets
set
  -- 50MB, matching REVIEW_LIMITS.mediaMaxBytes.
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
where id = 'review-media';

-- Confirm it applied (should return one row with the values above):
--   select id, public, file_size_limit, allowed_mime_types
--   from storage.buckets where id = 'review-media';
