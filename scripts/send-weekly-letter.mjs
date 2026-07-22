// Sends the weekly Heldi Living letter when a new post has shipped.
//
// Klaviyo has no native "email my blog posts on a schedule" feature, so this
// is Klaviyo's own recommended pattern: keep one base campaign in the admin,
// designed once, whose content block is a Web Feed pointed at
// https://heldi.co.uk/feed.xml. This script clones that campaign and sends the
// clone, so the copy always reflects the newest post without anyone opening
// the app.
//
//   node --env-file=.env.local scripts/send-weekly-letter.mjs --dry
//   node --env-file=.env.local scripts/send-weekly-letter.mjs
//
// Schedule it weekly (GitHub Action, Vercel cron hitting a thin route, or a
// laptop cron). Running it twice sends nothing twice: public.sent_campaigns
// records every post already emailed, so it is safe to run daily and let it
// decide.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, KLAVIYO_PRIVATE_API_KEY,
// KLAVIYO_BASE_CAMPAIGN_ID (the base campaign to clone). --dry reports what
// it would send and touches nothing.
//
// One deliberate omission: this never picks more than the single newest post.
// If two posts ship in a week, the older one is marked seen without a send
// rather than triggering two emails in a day.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const KLAVIYO_BASE = "https://a.klaviyo.com/api";
const KLAVIYO_REVISION = "2026-07-15";
const DRY_RUN = process.argv.includes("--dry");

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  KLAVIYO_PRIVATE_API_KEY,
  KLAVIYO_BASE_CAMPAIGN_ID
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!DRY_RUN && (!KLAVIYO_PRIVATE_API_KEY || !KLAVIYO_BASE_CAMPAIGN_ID)) {
  console.error("Missing KLAVIYO_PRIVATE_API_KEY / KLAVIYO_BASE_CAMPAIGN_ID.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function klaviyo(path, body) {
  const response = await fetch(`${KLAVIYO_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${KLAVIYO_PRIVATE_API_KEY}`,
      revision: KLAVIYO_REVISION,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`Klaviyo ${response.status} on ${path}: ${await response.text()}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// The posts file is the same source /feed.xml renders from, so the script
// agrees with the feed the campaign template reads.
const posts = JSON.parse(
  readFileSync(join(process.cwd(), "content/heldi-living/posts.json"), "utf8")
);

const published = posts
  .filter((post) => post.publishedAt)
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

if (published.length === 0) {
  console.log("No published posts. Nothing to send.");
  process.exit(0);
}

const newest = published[0];

const { data: alreadySent, error: readError } = await supabase
  .from("sent_campaigns")
  .select("post_slug, sent_at")
  .eq("post_slug", newest.slug)
  .maybeSingle();

if (readError) {
  console.error("Could not read sent_campaigns:", readError.message);
  process.exit(1);
}

if (alreadySent) {
  console.log(
    `Newest post "${newest.slug}" already went out on ${alreadySent.sent_at}. Nothing to do.`
  );
  process.exit(0);
}

const campaignName = `Heldi Living: ${newest.title}`;

if (DRY_RUN) {
  console.log(`Would clone base campaign and send: ${campaignName}`);
  console.log(`  post: ${newest.slug} (published ${newest.publishedAt})`);
  process.exit(0);
}

let campaignId = null;
try {
  const clone = await klaviyo("/campaign-clone", {
    data: {
      type: "campaign",
      id: KLAVIYO_BASE_CAMPAIGN_ID,
      attributes: { new_name: campaignName }
    }
  });
  campaignId = clone?.data?.id;
  if (!campaignId) throw new Error("Clone returned no campaign id.");

  await klaviyo("/campaign-send-jobs", {
    data: { type: "campaign-send-job", id: campaignId }
  });
} catch (cause) {
  console.error(`Send failed: ${cause.message}`);
  // Nothing is recorded, so the next run retries this post.
  process.exit(1);
}

const { error: writeError } = await supabase.from("sent_campaigns").insert({
  post_slug: newest.slug,
  sent_at: new Date().toISOString(),
  campaign_id: campaignId,
  campaign_name: campaignName
});

if (writeError) {
  // The email is already away; a missing row would resend next run, so this
  // needs a human rather than a silent pass.
  console.error(
    `SENT but could not record it. Add post_slug "${newest.slug}" to sent_campaigns by hand: ${writeError.message}`
  );
  process.exit(1);
}

console.log(`Sent "${campaignName}" (campaign ${campaignId}).`);
