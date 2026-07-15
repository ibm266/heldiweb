// The single source for the /faq page. Questions that already live on the
// homepage or the truth page are pulled in from there so the copy never
// drifts apart; questions unique to the FAQ page are defined here.

import { HOME_FAQS } from "@/components/home-faqs";
import { TRUTH_FAQS } from "@/components/truth-faqs";

export type SiteFaq = {
  question: string;
  answer: string;
  /** Optional "read more" link rendered after the answer. */
  more?: { href: string; label: string };
};

export type SiteFaqGroup = {
  title: string;
  faqs: SiteFaq[];
};

function pick(
  source: { question: string; answer: string }[],
  question: string
): SiteFaq {
  const faq = source.find((entry) => entry.question === question);
  if (!faq) throw new Error(`FAQ not found: ${question}`);
  return faq;
}

export const SITE_FAQ_GROUPS: SiteFaqGroup[] = [
  {
    title: "Using Heldi",
    faqs: [
      pick(HOME_FAQS, "How do I use it?"),
      pick(HOME_FAQS, "Will my food taste different?"),
      pick(HOME_FAQS, "Can I use it in dishes that are not on the pouch?"),
      pick(HOME_FAQS, "Why not just drink a protein shake?"),
      {
        question: "Does cooking destroy the protein?",
        answer:
          "No. Heat changes the shape of the protein, which is harmless and happens during digestion anyway. The amino acids your body actually uses stay intact. We still suggest stirring Heldi in once the pot is off the heat and has cooled a little, simply because a rolling boil can make any milk protein clump."
      },
      {
        question: "How do I add more protein to Indian food?",
        answer:
          "Three moves cover most meals. Use more dahi and paneer across the week. Make dals thicker rather than soupy, which raises the dal in every bowl. And stir a clean whey isolate like Heldi into gravies, dals and yoghurt dishes: one heaped tablespoon adds 10.4g without changing the recipe. Eggs and chicken do the heavy lifting in non-veg homes."
      },
      {
        question: "When is the best time to eat protein?",
        answer:
          "Spread through the day beats any magic window. The body uses protein best when it arrives in decent amounts at each meal, roughly 20 to 30g at a time, rather than one big hit at dinner. The famous post-workout window matters far less than the daily total. For most desi households the practical fix is lifting breakfast and lunch, the two lowest-protein meals of the day."
      }
    ]
  },
  {
    title: "The protein numbers",
    faqs: [
      {
        question: "How much protein does one spoonful add?",
        answer:
          "One heaped tablespoon, a 12g serving, adds 10.4g of complete protein with all nine essential amino acids. A bowl of dal has around 6g on its own, so with Heldi that is about 16g in the same bowl, same taste."
      },
      pick(HOME_FAQS, "Why do I need more protein?"),
      pick(TRUTH_FAQS, "How much protein is in a bowl of dal?"),
      pick(TRUTH_FAQS, "How much protein do I need a day?"),
      {
        question: "Which Indian foods are high in protein?",
        answer:
          "Per realistic serving: paneer leads at around 18g per 100g, dahi gives 3 to 4g per 100g, a standard bowl of cooked dal 5 to 7g, chana and rajma much the same, and two rotis about 6g. Eggs and chicken lift non-veg days. The honest pattern: desi staples are decent but modest, which is why the daily totals fall short.",
        more: { href: "/truth", label: "Read the full honest truth" }
      },
      {
        question: "Can your body only absorb 30g of protein in one meal?",
        answer:
          "No, that is a myth. Your body absorbs nearly all the protein you eat; bigger meals just digest more slowly. The truth behind the number is that muscle building responds best to roughly 20 to 40g per meal, so spreading protein across the day works better than loading it all into one sitting."
      }
    ]
  },
  {
    title: "Dietary questions",
    faqs: [
      pick(HOME_FAQS, "Is whey protein vegetarian?"),
      {
        question: "Is Heldi vegan?",
        answer:
          "No. Whey comes from milk, so Heldi is vegetarian but not vegan. It sits in the same dietary family as paneer, dahi and chai, which is exactly why it belongs in the pot."
      },
      {
        question: "Is Heldi halal?",
        answer:
          "Heldi contains no meat, no alcohol and no animal rennet. The whey is a dairy ingredient, the same family as milk and paneer. We do not yet hold a formal halal certificate. If certification matters to your table, email info@heldi.co.uk and we will tell you exactly where things stand."
      },
      {
        question: "I am lactose intolerant. Can I have Heldi?",
        answer:
          "Usually, yes. Heldi is made with whey protein isolate, which is filtered to be 99% lactose-free, well below the level most lactose-intolerant people react to. A confirmed dairy allergy is different: Heldi contains milk, so it is not for you."
      },
      pick(HOME_FAQS, "Is it safe for kids?"),
      pick(HOME_FAQS, "Is it safe for parents and grandparents?"),
      pick(HOME_FAQS, "I have diabetes. Is it OK for me?"),
      {
        question: "I am pregnant or breastfeeding. Can I use it?",
        answer:
          "Protein needs rise during pregnancy and breastfeeding, but this is a time to be careful with any food supplement. Speak to your GP or midwife before adding Heldi to your meals. They know your situation; we do not."
      },
      {
        question: "Will protein make me bulky?",
        answer:
          "No. Visible muscle takes years of hard, deliberate training, and accidental bulk is close to impossible, especially for women. Across whey protein trials in women, the average lean mass gain was 0.37kg, less than 1% of body composition. Protein at normal intakes supports the muscle you already have; it does not inflate anyone.",
        more: {
          href: "/heldi-living/will-i-get-bulky-if-i-have-too-much-protein",
          label: "Read the full piece on the bulky myth"
        }
      },
      {
        question: "Is too much protein bad for my kidneys?",
        answer:
          "For healthy kidneys, no. Reviews of controlled trials in healthy adults keep failing to find harm from higher protein intakes at sensible levels. The caution is real for people who already have kidney disease, where protein targets are set by a doctor. If that is you, speak to your GP or renal dietitian before changing anything."
      },
      {
        question: "Is whey protein ultra-processed?",
        answer:
          "A powder is processed by definition, so the honest question is what is in it. Whey is milk protein filtered out of the same liquid your nani strains off when making paneer, then gently dried. Heldi adds sunflower lecithin, cumin and sea salt. No sweeteners, no flavourings, no thickeners, nothing you would need to look up. Read the label and judge it like you would any food."
      }
    ]
  },
  {
    title: "Heldi and GLP-1 medicines",
    faqs: [
      {
        question:
          "Can I use Heldi with a GLP-1 medicine like Ozempic, Wegovy or Mounjaro?",
        answer:
          "Heldi is a food, not a medicine: whey protein from milk, the same protein family as paneer and dahi, with no stimulants and no sweeteners. That said, anyone on a prescription medicine should run new supplements past their prescriber, GP or dietitian first. Show them the label and the nutrition table; everything is on this site."
      },
      {
        question: "Why does protein matter more on a GLP-1?",
        answer:
          "Because you eat much less, and the weight you lose is not all fat. Studies of GLP-1 medicines consistently show a meaningful share of the loss is lean mass, which is why clinical guidance pairs them with adequate protein and resistance training. Protein contributes to the maintenance of muscle mass, as part of a varied and balanced diet and a healthy lifestyle."
      },
      {
        question: "How does Heldi help when my appetite has shrunk?",
        answer:
          "By making small portions carry more. When half a bowl of dal is all you want, that half-bowl has about 3g of protein. One heaped tablespoon of Heldi stirred in takes it past 13g without adding volume, another drink, or anything new to swallow. On a small appetite, every bite has to earn its place."
      },
      {
        question: "What does this mean for Indian food on a GLP-1?",
        answer:
          "A typical home-cooked vegetarian day delivers 35 to 45g of protein at full appetite. Shrink every portion and it can drop to 20g or less, a long way from the 1.2 to 1.6g per kilo of body weight that guidance points to. The practical advice is protein first: eat the highest-protein part of the meal before anything else, and make the small amount you do eat work harder. Stirring Heldi into the dal, kadhi or raita does exactly that, without changing the food."
      }
    ]
  },
  {
    title: "Inside the pouch",
    faqs: [
      {
        question: "What are the ingredients?",
        answer:
          "Four things: whey protein isolate (94%), sunflower lecithin (4%), cumin (1.25%) and fine sea salt (0.6%). No added sugar, no sweeteners, no preservatives, no fillers. Contains milk (whey).",
        more: { href: "/inside-the-pouch", label: "See the full breakdown" }
      },
      {
        question: "Where do the ingredients come from?",
        answer:
          "The whey protein isolate comes from Arla, the farmer-owned dairy cooperative, and every batch arrives with a certificate of analysis. The spices come from Spice Entice, a British spice house, and the sunflower lecithin from Special Ingredients, a UK supplier. Everything is blended and packed in England.",
        more: { href: "/inside-the-pouch", label: "Read where it all comes from" }
      }
    ]
  },
  {
    title: "Orders and delivery",
    faqs: [
      {
        question: "How much is delivery?",
        answer:
          "UK orders over £40 ship free. Under that, Royal Mail Tracked 48 is £3.55. The Sample on its own always ships free, we cover the stamp."
      },
      {
        question: "How long does delivery take?",
        answer:
          "We pack every order ourselves and send it by Royal Mail Tracked 48, which usually delivers 2 to 3 working days after dispatch. You get a tracking link either way.",
        more: { href: "/legal/shipping", label: "Read the shipping policy" }
      },
      {
        question: "Can I return it?",
        answer:
          "Yes. You have 14 days after delivery to change your mind, as long as the pouch is unopened. Email info@heldi.co.uk to start a return and we refund within 14 days of receiving it back. If anything arrives faulty or damaged, we replace or refund it in full and cover the postage.",
        more: { href: "/legal/returns", label: "Read the returns policy" }
      },
      {
        question: "Do you deliver outside the UK?",
        answer:
          "Not yet. We are UK-only for now, sent by Royal Mail from our own packing table. If you want Heldi somewhere else, email info@heldi.co.uk and tell us where. The list of requests genuinely shapes where we ship next."
      },
      {
        question: "How do I reach a human?",
        answer:
          "Email info@heldi.co.uk and the founder answers. It really is that small an operation right now, which is also why replies come with opinions about dal."
      }
    ]
  }
];
