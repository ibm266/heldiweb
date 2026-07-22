# Migrations: apply these by hand, never with `supabase db push`

The `heldi-dev` Supabase project (`jzhrbndiybcfcgjbivxd`) is **shared with
another application**, which owns the migration history table. Running
`supabase migration list` against it shows 25 remote versions that do not exist
in this folder (`001`–`010`, `019`–`022`, and a run of timestamped ones from
July 2026), and a `public.test_session…` table this repo knows nothing about.

Because of that, `supabase db push` refuses to run and suggests:

```
supabase migration repair --status reverted 001 002 003 ...
```

**Do not run that.** It would rewrite the other application's migration history
in a database it depends on. `supabase db pull` is equally unwelcome: it would
drag that application's schema into this folder.

## How to apply a migration here

Paste the file into the Supabase dashboard SQL editor and run it:

Dashboard → heldi-dev → SQL Editor → New query → paste → Run.

Every file in this folder is written to be idempotent (`create table if not
exists`, `on conflict do nothing`), so re-running one is harmless. These files
are a record of what the schema should be, not a CLI-managed history.

Confirm it landed with the PostgREST check the app itself uses:

```bash
node --env-file=.env.local -e '
const u=process.env.SUPABASE_URL,k=process.env.SUPABASE_SERVICE_ROLE_KEY;
for (const t of ["reviews","waitlist","sent_campaigns"]) {
  const r = await fetch(`${u}/rest/v1/${t}?select=*&limit=1`,{headers:{apikey:k,Authorization:`Bearer ${k}`}});
  console.log(t.padEnd(16), r.status === 200 ? "EXISTS" : "MISSING");
}'
```

## The files

| File | Creates | Used by |
|---|---|---|
| `0001_create_reviews.sql` | `public.reviews` + `review-media` bucket | `/review`, `app/api/reviews/` |
| `0002_create_waitlist.sql` | `public.waitlist` | `app/api/waitlist/` |
| `0003_create_sent_campaigns.sql` | `public.sent_campaigns` | `scripts/send-weekly-letter.mjs` |
