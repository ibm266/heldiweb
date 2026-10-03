// Copy data for the /review form (PLAYBOOK.md §2: copy is data). Voice B on
// the happy path; the went-wrong branch stays sincere, because jokes stop
// where a customer's problem starts (BRAND.md §6). The chip values double as
// the whitelist the /api/reviews route validates against.

export const STAR_CAPTIONS: Record<number, string> = {
  1: "It did not work for you. Tell us what happened.",
  2: "There were problems. Please give us the details.",
  3: "Somewhere in the middle. What worked, and what did not?",
  4: "Mostly good. What could have been better?",
  5: "Everything worked for you. Tell us why."
};

export type ReviewChip = { value: string; label: string };

export const WENT_WRONG_CHIPS: ReviewChip[] = [
  { value: "taste", label: "I could taste it" },
  { value: "texture", label: "It was lumpy or gritty" },
  { value: "stir", label: "It did not stir in cleanly" },
  { value: "packaging", label: "There was a packaging problem" },
  { value: "delivery", label: "Delivery was slower than expected" },
  { value: "price", label: "The price did not feel right" },
  { value: "other", label: "Something else" }
];

export const WENT_WELL_CHIPS: ReviewChip[] = [
  { value: "vanished", label: "It disappeared into the food" },
  { value: "unnoticed", label: "Nobody noticed a difference" },
  { value: "numbers", label: "The protein numbers" },
  { value: "easy", label: "It was easy to use" },
  { value: "delivery", label: "Delivery was quick" },
  { value: "again", label: "I would use it again" }
];

export const TBSP_OPTIONS: { value: number; label: string; note: string }[] = [
  { value: 1, label: "1", note: "one bowl" },
  { value: 2, label: "2", note: "a small pot" },
  { value: 3, label: "3", note: "a family pot" },
  { value: 4, label: "4+", note: "a large pot" }
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
