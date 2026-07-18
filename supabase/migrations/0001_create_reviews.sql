-- Heldi review collector: durable storage for customer review submissions.
--
-- PURELY ADDITIVE. This creates one new table (public.reviews) and one new
-- private storage bucket (review-media). It does not touch, alter, or drop
-- anything already in the project. Safe to run more than once (idempotent).
--
-- Access model: the Next.js server talks to this table and bucket with the
-- service_role key only (server-side, never shipped to the browser). RLS is
-- enabled with NO policies, so the anon/public key can read nothing here —
-- customer PII (email, order number) and unmoderated media stay private.
-- service_role bypasses RLS, which is why the app still works without policies.

-- 1. The reviews table -------------------------------------------------------

create table if not exists public.reviews (
  id                  text primary key,          -- e.g. 2026-07-18-a1b2c3d4
  submitted_at        timestamptz not null default now(),
  -- Moderation state. Everything lands 'pending'; flip to 'published' to show
  -- it on the site, 'rejected' to keep it but hide it.
  status              text not null default 'pending'
                        check (status in ('pending', 'published', 'rejected')),
  rating              int  not null check (rating between 1 and 5),
  tablespoons         int  not null check (tablespoons between 1 and 4),
  went_well           text[] not null default '{}',
  went_wrong          text[] not null default '{}',
  dish                text not null,
  body                text not null,             -- the review copy
  author              text not null,
  location            text,
  email               text not null,             -- PII: never shown publicly
  order_number        text,
  media_path          text,                      -- object path in review-media
  media_content_type  text,
  media_bytes         bigint,
  publish_consent     boolean not null default true,
  -- Optional manual ordering for the published gallery (lower = earlier).
  display_order       int,
  published_at        timestamptz
);

comment on table public.reviews is
  'Customer review submissions for the Heldi storefront. Written by the server via service_role only; RLS denies anon access.';

-- Fast lookup of the published set for the storefront gallery.
create index if not exists reviews_status_idx
  on public.reviews (status, display_order, submitted_at desc);

-- Lock the table down: RLS on, no policies => only service_role can touch it.
alter table public.reviews enable row level security;

-- 2. The media bucket --------------------------------------------------------
-- Private bucket for the photo/video attached to each review. Reads happen
-- server-side via signed URLs, so no public policy is needed.

insert into storage.buckets (id, name, public)
values ('review-media', 'review-media', false)
on conflict (id) do nothing;
