"use client";

import { createContext, useContext, useMemo } from "react";
import type { WaitlistOfferCopy } from "@/lib/waitlist-offer";
import { siteWaitlistOfferCopy } from "@/lib/waitlist-offer-site";

// Whether the free sample pairs are still on offer to someone joining now. The
// root layout works it out on the server (lib/waitlist-count.ts) and
// WaitlistPopupProvider puts it here, so any client surface can state the offer
// in the form that is true today without fetching anything.
//
// In its own file because the popup renders the form and the form needs the
// offer: keeping the context in either one would make them import each other.
//
// Defaults to open so a component rendered outside the provider (the brand
// specimen, a story) states the offer as it stands today rather than throwing.
export const WaitlistPairsOpenContext = createContext(true);

/**
 * The waitlist offer's lines (BRAND.md §11.9). Every client surface that states
 * the offer reads its sentence from here rather than typing one.
 */
export function useWaitlistOffer(): WaitlistOfferCopy {
  const pairsOpen = useContext(WaitlistPairsOpenContext);
  return useMemo(() => siteWaitlistOfferCopy(pairsOpen), [pairsOpen]);
}
