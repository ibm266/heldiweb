// Pushes every waitlist row Klaviyo has not seen yet.
//
// Run this once the Klaviyo account exists, to sweep up everyone who joined
// while the site had nowhere to send them:
//
//   node --env-file=.env.local scripts/backfill-waitlist-to-klaviyo.mjs
//
// Needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, KLAVIYO_PRIVATE_API_KEY and
// KLAVIYO_WAITLIST_LIST_ID (plus KLAVIYO_NEWSLETTER_LIST_ID for the opted-in
// half). Safe to re-run: it only reads rows where synced_to_esp_at is null,
// and stamps each one as it goes. Pass --dry to list without sending.
//
// The subscribe payload mirrors lib/klaviyo.ts. Keep the two in step; this is
// plain JS because the repo has no TypeScript script runner.

import { createClient } from "@supabase/supabase-js";

const KLAVIYO_API = "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs";
const KLAVIYO_REVISION = "2026-07-15";
const DRY_RUN = process.argv.includes("--dry");

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  KLAVIYO_PRIVATE_API_KEY,
  KLAVIYO_WAITLIST_LIST_ID,
  KLAVIYO_NEWSLETTER_LIST_ID
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!DRY_RUN && (!KLAVIYO_PRIVATE_API_KEY || !KLAVIYO_WAITLIST_LIST_ID)) {
  console.error("Missing KLAVIYO_PRIVATE_API_KEY / KLAVIYO_WAITLIST_LIST_ID.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function subscribe(email, listId, source) {
  const response = await fetch(KLAVIYO_API, {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${KLAVIYO_PRIVATE_API_KEY}`,
      revision: KLAVIYO_REVISION,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          custom_source: source,
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email,
                  subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } }
                }
              }
            ]
          }
        },
        relationships: { list: { data: { type: "list", id: listId } } }
      }
    })
  });
  if (!response.ok) {
    throw new Error(`Klaviyo ${response.status}: ${await response.text()}`);
  }
}

const { data: rows, error } = await supabase
  .from("waitlist")
  .select("email, marketing_opt_in, source")
  .is("synced_to_esp_at", null)
  .order("joined_at", { ascending: true });

if (error) {
  console.error("Could not read the waitlist:", error.message);
  process.exit(1);
}

if (!rows || rows.length === 0) {
  console.log("Nothing to backfill: every row is already synced.");
  process.exit(0);
}

console.log(
  `${rows.length} row(s) to sync${DRY_RUN ? " (dry run, nothing sent)" : ""}.`
);

let synced = 0;
let failed = 0;

for (const row of rows) {
  const lists = [
    KLAVIYO_WAITLIST_LIST_ID,
    row.marketing_opt_in ? KLAVIYO_NEWSLETTER_LIST_ID : null
  ].filter(Boolean);

  if (DRY_RUN) {
    console.log(`  would sync ${row.email} to ${lists.length} list(s)`);
    continue;
  }

  try {
    for (const listId of lists) {
      await subscribe(
        row.email,
        listId,
        `heldi.co.uk waitlist backfill (${row.source ?? "unknown"})`
      );
    }
    const { error: stampError } = await supabase
      .from("waitlist")
      .update({ synced_to_esp_at: new Date().toISOString() })
      .eq("email", row.email);
    if (stampError) throw stampError;
    synced += 1;
  } catch (cause) {
    failed += 1;
    console.error(`  failed ${row.email}: ${cause.message}`);
  }

  // Klaviyo allows 75/s; this is a one-off sweep, so amble.
  await new Promise((resolve) => setTimeout(resolve, 120));
}

if (!DRY_RUN) {
  console.log(`Done. ${synced} synced, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}
