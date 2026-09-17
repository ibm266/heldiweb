// The waitlist offer, in words. BRAND.md §11.9 owns the offer; this file owns
// how the site says it. No component, FAQ or product description types its own
// offer sentence: it takes one from here, so the promise reads the same in the
// ticker, the popup, the buy box and the FAQ, and changes in one place.
//
// Anything off the site (the Klaviyo emails in docs/email/, the Shopify product
// description, the skills, social captions) copies these lines word for word.
// scripts/pricing-check.mjs reads this file and fails if the welcome email's
// three rows stop matching it.
//
// DELIBERATELY IMPORTS NOTHING. pricing-check runs this through Node's type
// stripping, which cannot resolve the "@/" alias or an extensionless relative
// import. The numbers are passed in instead: site code gets them already bound
// from lib/waitlist-offer-site.ts, so nobody on the site types a 100 or a 15.
//
// The fixed phrases, and the ones they replace (BRAND.md §11.9 has the full
// glossary): "the first 100 on the list", "a free sample pair", "we pay the
// postage", "15% off your first order", "first to know".
//
// Every line has two forms. While fewer than `firstJoiners` people are on the
// list the pair is on offer; once the list passes it, the site must stop
// promising a pair a new joiner cannot have. lib/waitlist-count.ts decides
// which form a visitor sees.

export type WaitlistOfferFacts = {
  /** WAITLIST_OFFER.freePairFirstJoiners */
  firstJoiners: number;
  /** GIFTING.percent: the public family rate, never a number typed here. */
  percent: number;
};

export type WaitlistOfferCopy = {
  /** Whether this is the form that still offers the pair. */
  pairsOpen: boolean;
  /** Ticker items, already upper case. The ticker joins them with its bullet. */
  tickerItems: string[];
  /** One or two sentences: the hero line, both buy boxes, the subpage CTAs. */
  sentence: string;
  /** The popup lede and the homepage final CTA. Identical in both. */
  paragraph: string;
  /** The same paragraph, split around the phrase that takes <CopyHighlight>. */
  paragraphParts: { before: string; highlight: string; after: string };
  /** The form's success state. */
  success: string;
  /** The offer half of the launch FAQ answer. The launch date stays with the FAQ. */
  faqAnswer: string;
};

/** Popup title and final CTA heading. Not part of the offer, but said in both. */
export const WAITLIST_HEADLINE = "Be first to stir it in.";

/** What the pair is, for the emails and the product description. */
export const WAITLIST_PAIR_EXPLAINER =
  "The pair is one Khana sachet for the pot and one Chai sachet for the mug, so you can try both before you commit to a pouch.";

export function waitlistOfferCopy(
  { firstJoiners, percent }: WaitlistOfferFacts,
  pairsOpen: boolean
): WaitlistOfferCopy {
  const everyone = `Everyone on the list gets ${percent}% off their first order.`;
  const everyoneStill = `Everyone on the list still gets ${percent}% off their first order.`;
  const gone = `The free sample pairs have all gone to the first ${firstJoiners}.`;
  const success = `You're on the list. One email, the day we launch, with ${percent}% off your first order inside.`;
  const heardFirst =
    "We send one email on the day the shop opens, so the waitlist is first to know.";

  if (!pairsOpen) {
    const before = `One email, the day we launch. ${gone} Everyone on the list still gets `;
    const highlight = `${percent}% off their first order`;
    return {
      pairsOpen,
      tickerItems: [`${percent}% OFF YOUR FIRST ORDER`],
      sentence: `${gone} ${everyoneStill}`,
      paragraph: `${before}${highlight}.`,
      paragraphParts: { before, highlight, after: "." },
      success: `${success} Tell your mum we said hi.`,
      faqAnswer: `${heardFirst} The free sample pairs have all gone to the first ${firstJoiners} people on the list. ${everyone}`
    };
  }

  const before = `One email, the day we launch. The first ${firstJoiners} on the list get `;
  const highlight = "a free sample pair";
  const after = `, one for the pot and one for the mug, and we pay the postage. ${everyone}`;
  return {
    pairsOpen,
    tickerItems: [
      `FIRST ${firstJoiners} ON THE LIST GET A FREE SAMPLE PAIR`,
      `${percent}% OFF YOUR FIRST ORDER`
    ],
    sentence: `The first ${firstJoiners} on the list get a free sample pair, and we pay the postage. ${everyone}`,
    paragraph: `${before}${highlight}${after}`,
    paragraphParts: { before, highlight, after },
    success: `${success} If you're one of the first ${firstJoiners}, your free sample pair is in there too. Tell your mum we said hi.`,
    faqAnswer: `${heardFirst} The first ${firstJoiners} people on the list get a free sample pair, one Khana sachet and one Chai sachet, and we pay the postage. ${everyone}`
  };
}

// The three-row block: the welcome email, the launch email and the summary in
// the terms all carry exactly these. The early joiners' launch email is the one
// place the third row differs, because it repeats what they were told.
export function waitlistOfferRows({
  firstJoiners,
  percent
}: WaitlistOfferFacts): { who: string; what: string }[] {
  return [
    { who: "Everyone on the list", what: "First to know, the day we launch" },
    { who: `The first ${firstJoiners}`, what: "A free sample pair, and we pay the postage" },
    { who: "Your first order", what: `${percent}% off` }
  ];
}

// The free pair as a product: lib/commerce/catalog.ts here, and pasted into the
// Shopify product by hand. The title is the one already live in Shopify.
export function freePairProductCopy({ firstJoiners }: WaitlistOfferFacts): {
  title: string;
  shortDescription: string;
  description: string;
} {
  return {
    title: "Heldi sample pair, on us",
    shortDescription: `A free sample pair for the first ${firstJoiners} on the list.`,
    description: `Two 30g sachets, one Khana for the pot and one Chai for the mug. Free for the first ${firstJoiners} on the list, and we pay the postage.`
  };
}

/** The basket's answer when a claim arrives after the last pair has gone. */
export function pairsGoneMessage({ percent }: WaitlistOfferFacts): string {
  return `The free sample pairs have all been claimed. Your ${percent}% still works on a pouch.`;
}
