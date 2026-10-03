// The single source for the /faq page. Questions that already live on the
// homepage or the truth page are pulled in from there so the copy never
// drifts apart; questions unique to the FAQ page are defined here.
//
// The groups are built per commerce mode: waitlist hides every question
// that names a price (delivery costs) and the shipping-policy link, live
// hides the what-does-the-waitlist-do question. Both the page list and the
// FAQ JSON-LD go through siteFaqGroupsForMode so they never disagree.
//
// The launch question states the waitlist offer, so its offer sentences come
// from lib/waitlist-offer.ts like every other surface (BRAND.md §11.9), in the
// form that matches `pairsOpen`: whether the free sample pairs are still open
// to a new joiner (lib/waitlist-count.ts).

import { HOME_FAQS } from "@/components/home-faqs";
import { SERVINGS_PER_POUCH } from "@/lib/commerce/catalog";
import { TRUTH_FAQS } from "@/components/truth-faqs";
import { SHIPPING } from "@/lib/pricing";
import { formatPence } from "@/lib/commerce/money";
import type { CommerceMode } from "@/lib/commerce/types";
import { siteWaitlistOfferCopy } from "@/lib/waitlist-offer-site";

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

export function siteFaqGroupsForMode(
  mode: CommerceMode,
  pairsOpen = true
): SiteFaqGroup[] {
  const offer = siteWaitlistOfferCopy(pairsOpen);
  return [
  {
    title: "Using Heldi",
    faqs: [
      pick(HOME_FAQS, "How do I use it?"),
      pick(HOME_FAQS, "Will my food taste different?"),
      pick(HOME_FAQS, "Can I use it in dishes that are not on the pouch?"),
      pick(HOME_FAQS, "Can I put Khana in my chai?"),
      pick(HOME_FAQS, "Why not just drink a protein shake?"),
      {
        question: "Does cooking destroy the protein?",
        answer:
          "No. Heat changes a protein's shape, a process called denaturing, and digestion changes it too. The amino acids remain. Stir Heldi Khana into your own bowl once the food is served, or into the pot once it is off the heat and has cooled a little, because a rolling boil can make milk protein clump. Heldi Chai waits longer: its milk protein clumps into little white specks well before the boil, so it goes in once the cup is cool enough to drink."
      },
      {
        question: "How do I add more protein to Indian food?",
        answer:
          "Start with the food already on the table. Use dahi and paneer more often, and make dal thicker rather than soupy so each bowl contains more dal. Eggs and chicken add protein in non-vegetarian homes. If there is still a gap, a 12g serving of Heldi Khana, about one heaped tablespoon, adds 10.1g of protein to a gravy, dal or yoghurt dish."
      },
      {
        question: "When is the best time to eat protein?",
        answer:
          "There is no single required time. A practical approach is to spread protein across meals, with roughly 20 to 30g at a time, rather than leaving most of it for dinner. The daily total matters more than an exact post-workout window. In many desi households, breakfast and lunch are the two meals worth checking first."
      }
    ]
  },
  {
    title: "The protein numbers",
    faqs: [
      {
        question: "How much protein does one spoonful add?",
        answer:
          "For Heldi Khana, a 12g serving, about one heaped tablespoon, provides 10.1g of protein with all nine essential amino acids. A bowl of dal has around 6g on its own, so the same bowl contains about 16g after Khana is added. Heldi Chai is different: an 8g serving, about one level tablespoon, provides 5.1g of protein, marketed as 5g per mug."
      },
      pick(HOME_FAQS, "Do I need more protein?"),
      pick(TRUTH_FAQS, "How much protein is in a bowl of dal?"),
      pick(TRUTH_FAQS, "How much protein do I need a day?"),
      {
        question: "Which Indian foods are high in protein?",
        answer:
          "For everyday portions, 100g of paneer provides around 18g of protein and 100g of dahi provides 3 to 4g. A standard bowl of cooked dal has 5 to 7g, with chana and rajma in a similar range, while two rotis have about 6g. Eggs and chicken add more on non-vegetarian days. The useful step is to add up the portions you actually eat rather than compare dry ingredients.",
        more: { href: "/truth", label: "Read the full honest truth" }
      },
      {
        question: "Can your body only absorb 30g of protein in one meal?",
        answer:
          "No. The body digests and absorbs nearly all the protein in a meal, although a larger meal takes longer to digest. The 30g idea comes from research on the response to roughly 20 to 40g of protein at a meal, not from a hard limit on absorption. Spreading protein through the day is a practical way to cover several meals."
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
          "No. Both Heldi Khana and Heldi Chai contain milk, so they are suitable for lacto-vegetarians but are not vegan. Khana contains whey; Chai contains whey and milk protein concentrate."
      },
      pick(HOME_FAQS, "Is Heldi halal?"),
      pick(HOME_FAQS, "I am lactose intolerant. Can I have Heldi?"),
      pick(HOME_FAQS, "Can children have Heldi?"),
      pick(HOME_FAQS, "Can older adults have Heldi?"),
      pick(HOME_FAQS, "Can I use Heldi if I have diabetes?"),
      {
        question: "I am pregnant or breastfeeding. Can I use it?",
        answer:
          "Protein needs rise during pregnancy and breastfeeding, but a food supplement is not automatically suitable for every person. Speak to your GP or midwife before adding Heldi to your meals. They can assess the label alongside your individual needs."
      },
      {
        question: "Will protein make me bulky?",
        answer:
          "Protein intake alone does not determine visible muscle size. Across whey protein trials in women, the average lean mass gain was 0.37kg, less than 1% of total lean mass. Larger visible changes also depend on sustained, deliberate training over time.",
        more: {
          href: "/heldi-living/will-i-get-bulky-if-i-have-too-much-protein",
          label: "Read the full piece on the bulky myth"
        }
      },
      {
        question: "Is too much protein bad for my kidneys?",
        answer:
          "Reviews of controlled trials comparing higher-protein with lower-protein diets in adults with healthy kidney function have not found impaired kidney function over the periods studied. Those trials do not establish a universally safe amount or lifetime safety. They also do not apply to someone who already has kidney disease, where a doctor sets the protein target. Speak to your GP or renal dietitian before changing your intake."
      },
      {
        question: "Is whey protein ultra-processed?",
        answer:
          "The answer depends on which definition of ultra-processed food is being used. The process itself is straightforward: milk protein is filtered from liquid whey and dried. Heldi Khana then adds sunflower lecithin, sea salt and five familiar spices. It contains no sweeteners, separate flavourings or thickeners. The full ingredients list is published so you can judge the product by what is actually in it."
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
          "Heldi Khana and Heldi Chai are food supplements, not medicines, and both contain milk. Khana has no sweeteners; Chai contains coconut sugar. Those facts do not establish whether either product is suitable alongside a prescription medicine. Ask your prescriber, GP or dietitian first, and show them the specific ingredients list and nutrition table."
      },
      {
        question: "Why does protein matter when taking a GLP-1 medicine?",
        answer:
          "GLP-1 medicines can reduce appetite and the amount of food a person eats. Clinical guidance therefore considers dietary protein and resistance training where lean mass is a concern. Protein contributes to the maintenance of muscle mass. This applies as part of a varied and balanced diet and a healthy lifestyle."
      },
      {
        question: "How can Heldi fit into smaller portions?",
        answer:
          "Half a bowl of dal contains about 3g of protein. One spoonful of Heldi Khana adds 10g, taking that portion to about 13g without requiring a full second portion or a separate drink. Heldi Chai is a hot-drink blend with a separate 8g serving, about one level tablespoon, and a 5g-per-mug marketing figure, so this bowl calculation does not apply to it. Whether either product is appropriate for you is a question for the clinician supporting your GLP-1 treatment."
      },
      {
        question: "What does this mean for Indian food on a GLP-1?",
        answer:
          "A typical home-cooked vegetarian day delivers 35 to 45g of protein at full appetite. If every portion becomes smaller, that total can fall to 20g or less. Guidance often uses 1.2 to 1.6g per kilo of body weight, but a GP or dietitian should set a personal target for someone taking a prescription medicine. If they advise prioritising protein, familiar options include eating the highest-protein part of the meal first or stirring Heldi Khana into dal, kadhi or raita."
      }
    ]
  },
  {
    title: "Inside the pouch",
    faqs: [
      {
        question: "What are the ingredients?",
        answer:
          "Heldi Khana has eight ingredients, listed from most to least: whey protein isolate (MILK) (94%), cumin, sunflower lecithin, coriander, fine sea salt, garam masala, Kashmiri chilli and turmeric. Six are familiar kitchen spices. The order and the whey percentage are published as required; the exact spice proportions are the recipe. No added sugar, sweeteners, preservatives or fillers. Contains naturally occurring sugars. Contains milk (whey).",
        more: { href: "/inside-the-pouch", label: "See the full breakdown" }
      },
      {
        question: "Where do the ingredients come from?",
        answer:
          "The whey protein isolate comes from Arla, the farmer-owned dairy cooperative, and every incoming batch has a supplier certificate of analysis. That certificate covers the whey ingredient; it is not finished-product analysis or product certification. The single spices come from the British spice house Spice Entice. The garam masala comes from Buy Whole Foods Online because it is a blend, and the sunflower lecithin comes from the UK supplier Special Ingredients. Heldi Khana is blended and packed in the UK.",
        more: { href: "/inside-the-pouch", label: "Read where it all comes from" }
      }
    ]
  },
  {
    title: "Orders and delivery",
    faqs: [
      // Delivery rates are prices, so the question only exists in live mode.
      ...(mode === "live"
        ? [
            {
              question: "How much is delivery?",
              answer:
                `UK orders at or over ${formatPence(SHIPPING.freeOverPence)} ship free. Below that amount, Royal Mail Tracked 48 costs ${formatPence(SHIPPING.standardPence)}. A sachet ordered on its own also ships free.`
            }
          ]
        : []),
      {
        question: "How long does delivery take?",
        answer:
          "We pack each order and send it by Royal Mail Tracked 48. Delivery usually takes 2 to 3 working days after dispatch, and we send a tracking link.",
        // The shipping policy page is unpublished until launch (it lists rates).
        ...(mode === "live"
          ? { more: { href: "/legal/shipping", label: "Read the shipping policy" } }
          : {})
      },
      {
        question: "Can I return it?",
        answer:
          "Yes. You have 14 days after delivery to change your mind, provided the pouch is unopened. Email info@heldi.co.uk to start the return. We issue the refund within 14 days of receiving it. If an item arrives faulty or damaged, we replace it or refund it in full and cover the postage.",
        more: { href: "/legal/returns", label: "Read the returns policy" }
      },
      {
        question: "Do you deliver outside the UK?",
        answer:
          "Not yet. Heldi currently ships only within the UK, by Royal Mail. If you would like it sent elsewhere, email info@heldi.co.uk and tell us the country. We use those requests when deciding where to ship next."
      },
      {
        question: "How long does a pouch keep?",
        answer:
          `This answer is for Heldi Khana. Each pouch has an 18-month best-before date printed on the base. After opening, reseal it after each use, store it somewhere cool and dry, and use it within 3 months for the best taste and texture. Keep wet spoons out of the pouch. A 300g pouch provides about ${SERVINGS_PER_POUCH} meals, so many kitchens will finish it within that period. Heldi Chai has a different pouch and no published shelf-life figure yet.`
      },
      // Only makes sense before launch; live mode drops it.
      ...(mode === "waitlist"
        ? [
            {
              question: "When does Heldi launch, and what does the waitlist do?",
              answer:
                `Heldi launches in winter 2026. The shop is available to browse now, and checkout switches on at launch. ${offer.faqAnswer}`
            }
          ]
        : []),
      {
        question: "How do I reach a human?",
        answer:
          "Email info@heldi.co.uk and the founder answers, within two working days. It really is that small an operation right now, which is also why replies come with opinions about dal."
      }
    ]
  }
  ];
}
