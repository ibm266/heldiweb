-- Heldi waitlist: durable capture for every "Join waitlist" submission.
--
-- PURELY ADDITIVE. This creates one new table (public.waitlist) and touches
-- nothing else in the project. Safe to run more than once (idempotent).
--
-- Access model: identical to reviews. The Next.js server writes with the
-- service_role key only (server-side, never shipped to the browser). RLS is
-- enabled with NO policies, so the anon/public key can read nothing here --
-- the list is PII and stays private. service_role bypasses RLS, which is why
-- the app works without policies.
--
-- This table is the system of record the brand owns. Klaviyo is a downstream
-- copy: rows carry synced_to_esp_at so anything captured before the Klaviyo
-- account existed can be backfilled, and switching platforms later is an
-- export, not a rescue.

create table if not exists public.waitlist (
  email                  text primary key,     -- always stored lowercased
  joined_at              timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  -- First placement that captured them (hero-email, footer-email, ...).
  source                 text,
  -- The launch announcement needs no flag (it is what they joined for).
  -- This flag gates everything beyond it: the weekly letter and offers.
  marketing_opt_in       boolean not null default false,
  marketing_opted_in_at  timestamptz,          -- when the box was ticked
  -- The exact checkbox sentence shown at the moment of opt-in (consent
  -- evidence; mirrors WAITLIST_CONSENT_COPY in lib/waitlist.ts).
  consent_copy           text,
  -- Set once the row has been pushed to the email platform; null means
  -- "captured here only, backfill me when the account exists".
  synced_to_esp_at       timestamptz
);

comment on table public.waitlist is
  'Pre-launch waitlist signups for the Heldi storefront. Written by the server via service_role only; RLS denies anon access. System of record for the email list; the email platform is a downstream copy.';

alter table public.waitlist enable row level security;
