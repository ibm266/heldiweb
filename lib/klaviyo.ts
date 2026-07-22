// Klaviyo subscribe calls, shared by the waitlist route and the backfill
// script (scripts/backfill-waitlist-to-klaviyo.mjs mirrors this shape in
// plain JS, since the repo has no TS script runner).
//
// One list per job, so an opted-in signup makes two calls: the waitlist list
// always, the weekly-letter list as well when the box was ticked. Consent is
// recorded by Klaviyo against each list, which is what makes the unsubscribe
// link and the audit trail work per-list rather than all-or-nothing.
//
// Double opt-in is a per-list setting in the Klaviyo admin, not a flag here:
// if a list has it enabled, this call sends the confirmation email instead of
// subscribing outright. Suggested setup is on for the weekly letter, off for
// the waitlist.
//
// Env (all optional; nothing is sent when the key is missing):
//   KLAVIYO_PRIVATE_API_KEY, KLAVIYO_WAITLIST_LIST_ID,
//   KLAVIYO_NEWSLETTER_LIST_ID

const KLAVIYO_API = "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs";

// Pinned API revision. Klaviyo dates its versions and keeps old ones working,
// so this only moves when we deliberately adopt a newer one.
const KLAVIYO_REVISION = "2026-07-15";

export function klaviyoConfigured(): boolean {
  return Boolean(process.env.KLAVIYO_PRIVATE_API_KEY);
}

/** The lists a signup belongs on, given whether they took the weekly letter. */
export function klaviyoListsFor(marketingOptIn: boolean): string[] {
  return [
    process.env.KLAVIYO_WAITLIST_LIST_ID,
    marketingOptIn ? process.env.KLAVIYO_NEWSLETTER_LIST_ID : null
  ].filter((id): id is string => Boolean(id));
}

async function subscribeToList(
  email: string,
  listId: string,
  source: string,
  key: string
): Promise<void> {
  const response = await fetch(KLAVIYO_API, {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${key}`,
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
  // The endpoint answers 202 Accepted; anything else is a real failure.
  if (!response.ok) {
    throw new Error(`Klaviyo ${response.status} for list ${listId}`);
  }
}

/**
 * Subscribes one address to the lists its consent earns. Returns false when
 * Klaviyo is not configured or nothing could be sent, so the caller knows to
 * leave synced_to_esp_at null for a later backfill. Throws nothing: the
 * Supabase row is the system of record and must never fail on a vendor.
 */
export async function subscribeToKlaviyo(
  email: string,
  marketingOptIn: boolean,
  source: string
): Promise<boolean> {
  const key = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!key) return false;
  const lists = klaviyoListsFor(marketingOptIn);
  if (lists.length === 0) return false;

  try {
    for (const listId of lists) {
      await subscribeToList(email, listId, source, key);
    }
    return true;
  } catch {
    return false;
  }
}
