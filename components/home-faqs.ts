import {
  CHAI_MAX_DAILY_SERVINGS,
  CHAI_SERVING_GRAMS,
  CHAI_SERVING_SPOON
} from "@/components/shop/chai-data";
import {
  MAX_DAILY_SERVINGS,
  SERVING_GRAMS
} from "@/components/shop/nutrition-data";

export const HOME_FAQS = [
  {
    question: "Do I need more protein?",
    answer:
      "You may not. Protein contributes to the maintenance of muscle mass. Muscle mass tends to decline gradually from your 30s onwards. A typical home-cooked vegetarian day delivers 35 to 45g, while the target used here for an active adult is 75g or more. These are broad examples. Your own intake and needs depend on what you eat, your body size and your level of activity."
  },
  {
    question: "Is whey protein vegetarian?",
    answer:
      "Yes. Whey is the pale liquid separated from milk during cheese or paneer making. The whey used in Heldi is made without animal rennet, then filtered to concentrate the protein and dried into a fine powder. It is suitable for lacto-vegetarians, but it is not vegan."
  },
  {
    question: "Is Heldi halal?",
    answer:
      "Heldi contains no meat, alcohol or animal rennet. Its whey is a dairy ingredient, in the same family as milk and paneer. Heldi does not yet hold formal halal certification. If certification matters to you, email info@heldi.co.uk and we will give you the current position plainly."
  },
  {
    question: "I am lactose intolerant. Can I have Heldi?",
    answer:
      "Lactose intolerance varies from person to person. Heldi Khana uses whey protein isolate that is 98% lactose-free. A spoonful contains roughly 0.3g of lactose, far less than traditional whey concentrate and a fraction of the amount in a glass of milk. That figure cannot predict how an individual will respond, so ask your GP or dietitian if you are unsure. Heldi Chai has a different milk-protein blend and no published lactose-free claim. A confirmed milk allergy is different: both products contain milk and are not suitable for someone with that allergy."
  },
  {
    question: "Why not just drink a protein shake?",
    answer:
      "A protein shake is one option. Heldi Khana is for people who would rather add protein to food they already eat, such as dal or raita. One spoonful adds 10g of protein to the dish, without requiring a separate drink."
  },
  {
    question: "Will my food taste different?",
    answer:
      "Heldi Khana is designed to blend into savoury dishes rather than sit on top of their flavour. In the intended amount, its spices settle into dal, curry and raita without the chalky film or sweet aftertaste associated with many protein powders. The result will still depend on the dish and how much you add."
  },
  {
    question: "How do I use it?",
    answer:
      `Dish up your dal, curry or sabzi as usual, then stir one spoonful of Heldi Khana into your own bowl or plate as you sit down to eat. One serving is ${SERVING_GRAMS}g, about one heaped tablespoon. The recommended daily intake is ${SERVING_GRAMS}g to ${SERVING_GRAMS * MAX_DAILY_SERVINGS}g, which is 1 to ${MAX_DAILY_SERVINGS} servings; do not exceed it. Cooking for everyone? Take the pot off the heat and let it cool a little, add one spoonful for each person eating it, then mix the pot thoroughly so the powder is shared across those portions. Heldi Chai is different: its serving is ${CHAI_SERVING_GRAMS}g, about one ${CHAI_SERVING_SPOON}, stirred into a hot drink once it is cool enough to drink, and its recommended daily intake is ${CHAI_SERVING_GRAMS}g to ${CHAI_SERVING_GRAMS * CHAI_MAX_DAILY_SERVINGS}g.`
  },
  {
    question: "Can I use it in dishes that are not on the pouch?",
    answer:
      "Yes. Heldi Khana is made for dishes with a gravy, dal or yoghurt base, including sambar, kadhi, korma, bhindi in gravy and chaat with dahi. It can also be stirred into chicken curry, keema or egg bhurji. Let the food cool a little first, then mix the spoonful through evenly."
  },
  {
    question: "Is there a Heldi for chai?",
    answer:
      "Yes. Heldi Chai is a whey protein and milk protein concentrate blend with real chai spices. It is made for chai, tea, coffee and hot chocolate, stirred in once the cup is cool enough to drink. Contains milk (whey and milk protein concentrate). It is still in development, so it has a page but no price yet, and the waitlist hears first when it is ready. Khana is the savoury blend for the bowl."
  },
  {
    question: "Can I put Khana in my chai?",
    answer:
      "Khana is the savoury blend, made with warm spices for dal, curry, sabzi and raita, so it is not intended for chai. Heldi Chai is the blend for hot drinks: whey protein and milk protein concentrate with cardamom, ginger, cinnamon and clove, stirred in once the cup is cool enough to drink. Contains milk."
  },
  {
    question: "Can children have Heldi?",
    answer:
      "Both Heldi products contain milk. Heldi Khana has no sweeteners or caffeine. Heldi Chai contains coconut sugar, and the Chai blend itself is caffeine free, but tea and coffee usually are not, so the drink it goes into is the thing to check. Adding either product to shared food or drink means every person at the table receives some. Growing children usually get the protein they need from ordinary meals, so there may be no reason to add a food supplement. Ask a GP or dietitian who knows the child before doing so."
  },
  {
    question: "Can older adults have Heldi?",
    answer:
      "Heldi is designed to be shared at the table. Protein contributes to the maintenance of muscle mass. Heldi Khana is 98% lactose-free and 100% vegetarian. It has no added sugar; it contains naturally occurring sugars. It is free from preservatives and gluten, and it contains milk. Heldi Chai has a different formula and serving, contains coconut sugar and has no published lactose-free or gluten claim. Those facts do not establish whether either product suits one person, so anyone with a medical condition or a prescribed diet should show the specific label to their GP or dietitian."
  },
  {
    question: "Can I use Heldi if I have diabetes?",
    answer:
      "For Heldi Khana, there is no added sugar; it contains naturally occurring sugars. Khana contains under 1g of carbohydrate per spoonful. Heldi Chai is different: it contains coconut sugar and has its own nutrition table. Those facts do not determine whether either product fits an individual's diabetes care. Show the specific ingredients and nutrition label to your GP or dietitian before adding it to your meals."
  }
];

// The homepage shows HOME_FAQS in these four groups, one group at a time
// behind chips (components/heldi-homepage.tsx). Every answer stays in the
// HTML, so search engines and AI crawlers still read all of them, and the
// FAQPage JSON-LD in app/page.tsx keeps listing all of them. Questions are
// matched by exact text, like pick() in site-faqs.ts: the check below fails
// the build if one is renamed, missing from every group, or in two.
const HOME_FAQ_GROUP_SPEC = [
  {
    id: "why",
    label: "Why Heldi",
    questions: [
      "Do I need more protein?",
      "Why not just drink a protein shake?",
      "Will my food taste different?"
    ]
  },
  {
    id: "using",
    label: "Using it",
    questions: [
      "How do I use it?",
      "Can I use it in dishes that are not on the pouch?",
      "Is there a Heldi for chai?",
      "Can I put Khana in my chai?"
    ]
  },
  {
    id: "diet",
    label: "Diet",
    questions: [
      "Is whey protein vegetarian?",
      "Is Heldi halal?",
      "I am lactose intolerant. Can I have Heldi?"
    ]
  },
  {
    id: "who",
    label: "Who can have it",
    questions: [
      "Can children have Heldi?",
      "Can older adults have Heldi?",
      "Can I use Heldi if I have diabetes?"
    ]
  }
] as const;

export type HomeFaq = (typeof HOME_FAQS)[number];

export type HomeFaqGroup = {
  id: string;
  label: string;
  faqs: { faq: HomeFaq; index: number }[];
};

function buildHomeFaqGroups(): HomeFaqGroup[] {
  const placed = new Set<string>();
  const groups = HOME_FAQ_GROUP_SPEC.map((group) => ({
    id: group.id,
    label: group.label,
    faqs: group.questions.map((question) => {
      const index = HOME_FAQS.findIndex((faq) => faq.question === question);
      if (index === -1) {
        throw new Error(`HOME_FAQ_GROUPS names "${question}", which is not in HOME_FAQS.`);
      }
      if (placed.has(question)) {
        throw new Error(`HOME_FAQ_GROUPS lists "${question}" twice.`);
      }
      placed.add(question);
      return { faq: HOME_FAQS[index], index };
    })
  }));
  const missing = HOME_FAQS.filter((faq) => !placed.has(faq.question));
  if (missing.length) {
    throw new Error(
      `HOME_FAQ_GROUPS leaves out: ${missing.map((faq) => `"${faq.question}"`).join(", ")}.`
    );
  }
  return groups;
}

export const HOME_FAQ_GROUPS = buildHomeFaqGroups();
