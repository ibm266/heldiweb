// Copy data for the /review form (PLAYBOOK.md §2: copy is data). Voice B on
// the happy path; the went-wrong branch stays sincere, because jokes stop
// where a customer's problem starts (BRAND.md §6). The chip values double as
// the whitelist the /api/reviews route validates against.

export const STAR_CAPTIONS: Record<number, string> = {
  1: "Oh no. Tell us everything.",
  2: "Not good. We want specifics.",
  3: "On the fence. Which way were you leaning?",
  4: "Nearly perfect. What was the nearly?",
  5: "Not one comment at the table."
};

export type ReviewChip = { value: string; label: string };

export const WENT_WRONG_CHIPS: ReviewChip[] = [
  { value: "taste", label: "I could taste it" },
  { value: "texture", label: "Lumps or grit" },
  { value: "stir", label: "It would not stir in clean" },
  { value: "packaging", label: "Pouch or packaging trouble" },
  { value: "delivery", label: "Delivery took too long" },
  { value: "price", label: "The price" },
  { value: "other", label: "Something else" }
];

export const WENT_WELL_CHIPS: ReviewChip[] = [
  { value: "vanished", label: "It vanished clean" },
  { value: "unnoticed", label: "Nobody at the table noticed" },
  { value: "numbers", label: "The protein numbers" },
  { value: "easy", label: "Easier than a shaker" },
  { value: "delivery", label: "Delivery was quick" },
  { value: "again", label: "Already planning the next pot" }
];

export const TBSP_OPTIONS: { value: number; label: string; note: string }[] = [
  { value: 1, label: "1", note: "a quiet bowl" },
  { value: 2, label: "2", note: "the usual" },
  { value: 3, label: "3", note: "a family pot" },
  { value: 4, label: "4+", note: "the full kadhi pot" }
];

export const DISH_SUGGESTIONS = [
  "dal tadka",
  "dal makhani",
  "chana masala",
  "kadhi",
  "cucumber raita",
  "bowl of dahi",
  "rajma",
  "saag",
  "khichdi",
  "sambar"
];
