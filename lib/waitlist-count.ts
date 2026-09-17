// Whether the free sample pairs are still on offer to someone joining now.
//
// The waitlist offer gives a pair to the first WAITLIST_OFFER.freePairFirstJoiners
// people on the list (lib/pricing.ts §4b). Once the list is longer than that,
// promising a pair to a new joiner would be promising something they cannot
// have, so every offer line switches to its second form (lib/waitlist-offer.ts).
//
// Server-only: it reads public.waitlist through the service-role client. The
// root layout calls it once and hands the answer to WaitlistPopupProvider, so
// client components read it from context and no new API route exists to guard.
//
// Two rules this file must never break, because it runs in the root layout and
// a throw there takes down every page:
//   1. It fails OPEN. No Supabase, no network, a bad response: the pairs are
//      treated as still on offer, which is what the list says today.
//   2. It is cached, so a page render never waits on the database. Ten minutes
//      of staleness is fine: the signup API works out the joiner's real place
//      on the list, so the success message is exact even when the pitch lags.

import { unstable_cache } from "next/cache";
import { WAITLIST_OFFER } from "@/lib/pricing";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const REVALIDATE_SECONDS = 600;

async function readWaitlistCount(): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { count, error } = await supabase
    .from("waitlist")
    .select("email", { count: "exact", head: true });
  if (error || typeof count !== "number") return null;
  return count;
}

const cachedWaitlistCount = unstable_cache(readWaitlistCount, ["waitlist-count"], {
  revalidate: REVALIDATE_SECONDS
});

export async function getWaitlistPairsOpen(): Promise<boolean> {
  try {
    const count = await cachedWaitlistCount();
    return count === null || count < WAITLIST_OFFER.freePairFirstJoiners;
  } catch {
    return true;
  }
}
