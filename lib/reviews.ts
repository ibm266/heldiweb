// Review display data and helpers.
//
// Storage is not wired yet: everything in here is PLACEHOLDER content so the
// homepage and PDP review sections can be designed against realistic data.
// None of it may ship as-is: the CMA (DMCC Act 2024) bans publishing fake
// consumer reviews, so swap these for real submissions before launch.
//
// The Review shape is the contract for whatever backend lands later. Working
// plan: a review form posts to /api/reviews, rows land in a small database
// (pending → published after moderation), media goes to object storage. The
// tablespoon count is a first-class field because the leaderboard aggregates
// it; hosted review platforms (Judge.me etc.) can collect it as a custom
// question but won't do that maths, so display stays custom either way.

/** Keep in sync with the PDP "The protein numbers" accordion copy. */
export const PROTEIN_GRAMS_PER_TBSP = 10.4;

export type ReviewMedia =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; poster: string; alt: string };

export type Review = {
  id: string;
  author: string;
  location?: string;
  /** The dish it was stirred into, lowercase, as it reads in a sentence. */
  dish: string;
  /** Heaped tablespoons stirred in, collected on the future review form. */
  tablespoons: number;
  /** 1–5 stars. Absent on Heldi's own stock clips. */
  rating?: number;
  text: string;
  /** Only reviews with a photo or video are displayed, so this is required. */
  media: ReviewMedia;
  /** Confirmed purchaser; comes free once reviews attach to Shopify orders. */
  verified: boolean;
  /** Heldi's own stock footage seeded into the gallery. */
  stock?: boolean;
  date: string; // ISO yyyy-mm-dd
};

export function reviewProteinGrams(tablespoons: number): number {
  return Math.round(tablespoons * PROTEIN_GRAMS_PER_TBSP * 10) / 10;
}

export const PLACEHOLDER_REVIEWS: Review[] = [
  {
    id: "sample-priya-dal",
    author: "Priya M.",
    location: "Leicester",
    dish: "dal tadka",
    tablespoons: 2,
    rating: 5,
    text: "Stirred two spoonfuls in while the dal cooled. Papa had seconds and still has no idea.",
    media: {
      kind: "video",
      src: "/videos/stir-gallery/dal-tadka-stir.mp4",
      poster: "/images/stir-gallery/dal-tadka.webp",
      alt: "Dal tadka with Heldi being stirred in"
    },
    verified: true,
    date: "2026-07-02"
  },
  {
    id: "sample-arjun-chana",
    author: "Arjun S.",
    location: "Wembley",
    dish: "chana masala",
    tablespoons: 3,
    rating: 5,
    text: "Three spoons in the pot. Nothing changed except my gym app finally shut up.",
    media: {
      kind: "image",
      src: "/images/stir-gallery/chana-masala.webp",
      alt: "Bowl of chana masala with Heldi stirred in"
    },
    verified: true,
    date: "2026-06-28"
  },
  {
    id: "stock-kadhi",
    author: "The Heldi kitchen",
    dish: "kadhi",
    tablespoons: 2,
    text: "Our own Sunday kadhi, filmed the week the blend finally learned to disappear.",
    media: {
      kind: "video",
      src: "/videos/stir-gallery/kadhi-stir.mp4",
      poster: "/images/stir-gallery/kadhi.webp",
      alt: "Kadhi with Heldi being stirred in, filmed in the Heldi kitchen"
    },
    verified: false,
    stock: true,
    date: "2026-06-25"
  },
  {
    id: "sample-meera-raita",
    author: "Meera K.",
    location: "Birmingham",
    dish: "cucumber raita",
    tablespoons: 1,
    rating: 4,
    text: "One spoonful into the raita. The texture didn't move an inch, which honestly surprised me.",
    media: {
      kind: "image",
      src: "/images/stir-gallery/cucumber-raita.webp",
      alt: "Bowl of cucumber raita with Heldi stirred in"
    },
    verified: true,
    date: "2026-06-21"
  },
  {
    id: "sample-sanjay-chana",
    author: "Sanjay P.",
    location: "Harrow",
    dish: "chana masala",
    tablespoons: 2,
    rating: 5,
    text: "Filmed it so my brother would believe me. Gone before the tadka settled.",
    media: {
      kind: "video",
      src: "/videos/stir-gallery/chana-masala-stir.mp4",
      poster: "/images/stir-gallery/chana-masala.webp",
      alt: "Chana masala with Heldi being stirred in"
    },
    verified: true,
    date: "2026-06-17"
  },
  {
    id: "sample-nisha-dal",
    author: "Nisha R.",
    location: "Manchester",
    dish: "dal tadka",
    tablespoons: 2,
    rating: 5,
    text: "Mum's dal, quietly upgraded. She's finding out from this review. Sorry mum.",
    media: {
      kind: "image",
      src: "/images/stir-gallery/dal-tadka.webp",
      alt: "Bowl of dal tadka with Heldi stirred in"
    },
    verified: true,
    date: "2026-06-12"
  },
  {
    id: "stock-dahi",
    author: "The Heldi kitchen",
    dish: "bowl of dahi",
    tablespoons: 1,
    text: "Plain dahi taking a spoonful without complaint. No lumps, no drama.",
    media: {
      kind: "video",
      src: "/videos/stir-gallery/bowl-of-dahi-stir.mp4",
      poster: "/images/stir-gallery/bowl-of-dahi-clean.webp",
      alt: "Bowl of dahi with Heldi being stirred in, filmed in the Heldi kitchen"
    },
    verified: false,
    stock: true,
    date: "2026-06-08"
  },
  {
    id: "sample-dev-kadhi",
    author: "Dev T.",
    location: "Slough",
    dish: "kadhi",
    tablespoons: 3,
    rating: 4,
    text: "Three heaped spoons into the kadhi for the whole family. Not one comment at the table.",
    media: {
      kind: "image",
      src: "/images/stir-gallery/kadhi.webp",
      alt: "Bowl of kadhi with Heldi stirred in"
    },
    verified: true,
    date: "2026-06-05"
  }
];

export type LeaderboardEntry = {
  author: string;
  location?: string;
  /** The dish, phrased to follow "3 heaped tbsp into …". */
  dish: string;
  tablespoons: number;
};

// Placeholder standings. Live version aggregates the tablespoon counts from
// published reviews instead.
export const PLACEHOLDER_STANDINGS: LeaderboardEntry[] = [
  { author: "Anita B.", location: "Croydon", dish: "Sunday kadhi for six", tablespoons: 4 },
  { author: "Dev T.", location: "Slough", dish: "the family kadhi pot", tablespoons: 3 },
  { author: "Arjun S.", location: "Wembley", dish: "chana masala", tablespoons: 3 },
  { author: "Rohan G.", location: "Leeds", dish: "Saturday dal makhani", tablespoons: 3 },
  { author: "Priya M.", location: "Leicester", dish: "papa's dal tadka", tablespoons: 2 },
  { author: "Sanjay P.", location: "Harrow", dish: "chana masala", tablespoons: 2 },
  { author: "Meera K.", location: "Birmingham", dish: "cucumber raita", tablespoons: 1 }
];

export function leaderboardStandings(
  entries: LeaderboardEntry[] = PLACEHOLDER_STANDINGS
): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.tablespoons - a.tablespoons);
}
