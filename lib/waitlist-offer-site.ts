// lib/waitlist-offer.ts with the numbers already in it. Site code imports from
// here so the 100 and the 15% always come from lib/pricing.ts and are never
// typed at a call site. The wording itself lives in lib/waitlist-offer.ts, which
// has to stay import-free (see its header).
//
// Client components should not call these directly for the offer lines: use
// useWaitlistOffer() from components/waitlist-popup.tsx, which also knows
// whether the free pairs are still open.

import { GIFTING, WAITLIST_OFFER } from "@/lib/pricing";
import {
  freePairProductCopy,
  pairsGoneMessage,
  waitlistOfferCopy,
  type WaitlistOfferCopy,
  type WaitlistOfferFacts
} from "@/lib/waitlist-offer";

export const WAITLIST_OFFER_FACTS: WaitlistOfferFacts = {
  firstJoiners: WAITLIST_OFFER.freePairFirstJoiners,
  percent: GIFTING.percent
};

export function siteWaitlistOfferCopy(pairsOpen: boolean): WaitlistOfferCopy {
  return waitlistOfferCopy(WAITLIST_OFFER_FACTS, pairsOpen);
}

export const FREE_PAIR_PRODUCT_COPY = freePairProductCopy(WAITLIST_OFFER_FACTS);

export const PAIRS_GONE_MESSAGE = pairsGoneMessage(WAITLIST_OFFER_FACTS);
