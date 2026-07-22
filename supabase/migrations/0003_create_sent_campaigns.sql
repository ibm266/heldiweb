-- Heldi weekly letter: the memory of which blog posts have already been
-- emailed, so the scheduler can run as often as it likes and still send each
-- post exactly once.
--
-- PURELY ADDITIVE. Creates one small table and touches nothing else. Safe to
-- run more than once (idempotent).
--
-- Access model: same as the other tables here. Written by
-- scripts/send-weekly-letter.mjs with the service_role key; RLS is on with no
-- policies, so the anon key can read nothing.

create table if not exists public.sent_campaigns (
  -- The Heldi Living post slug that was emailed.
  post_slug      text primary key,
  sent_at        timestamptz not null default now(),
  -- The Klaviyo campaign the clone produced, for tracing a send back.
  campaign_id    text,
  campaign_name  text
);

comment on table public.sent_campaigns is
  'One row per Heldi Living post that has been sent as a weekly letter. Prevents double sends; written by scripts/send-weekly-letter.mjs.';

alter table public.sent_campaigns enable row level security;
