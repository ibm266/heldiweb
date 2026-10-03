import {
  CHAI_LACTOSE_PER_100G,
  CHAI_MAX_DAILY_SERVINGS,
  CHAI_SERVING_GRAMS,
  CHAI_SERVING_SPOON
} from "@/components/shop/chai-data";
import {
  MAX_DAILY_SERVINGS,
  NUTRITION_ROWS,
  SERVING_GRAMS
} from "@/components/shop/nutrition-data";

// Chai's lactose a mug, calculated (not tested) from CHAI_LACTOSE_PER_100G,
// so it is stated as a figure and never as "lactose-free".
const CHAI_LACTOSE_PER_MUG = ((CHAI_LACTOSE_PER_100G * CHAI_SERVING_GRAMS) / 100).toFixed(1);

// Khana's salt a spoonful, as the nutrition declaration states it.
const KHANA_SALT_PER_SERVING = NUTRITION_ROWS.find((row) => row.label === "Salt")!.perServing.replace(" ", "");

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
      `Lactose intolerance varies from person to person. Heldi Khana uses whey protein isolate that is 98% lactose-free. A spoonful contains roughly 0.3g of lactose, far less than traditional whey concentrate and a fraction of the amount in a glass of milk. That figure cannot predict how an individual will respond, so ask your GP or dietitian if you are unsure. Heldi Chai also contains milk protein concentrate, which carries a little more lactose than whey isolate, but its smaller serving comes to about ${CHAI_LACTOSE_PER_MUG}g a mug, calculated from its ingredients and still far less than a traditional whey concentrate shake. A confirmed milk allergy is different: both products contain milk and are not suitable for someone with that allergy.`
  },
  {
    question: "Why not just drink a protein shake?",
    answer:
      "You can, if you like them. Most of our parents don't. Heldi puts the protein into the meals you were going to eat anyway: same dal, same raita, ten more grams in each bowl. Nothing new to swallow, nothing to give up."
  },
  {
    question: "Will my food taste different?",
    answer:
      "No, not in the dishes it was made for. The spices are ones your masala dabba already holds (cumin, coriander, garam masala, Kashmiri chilli and turmeric), so in a dal, curry or raita they taste as if they were there all along. No chalky film, and none of that protein-shake aftertaste. The result will still depend on the dish and how much you add."
  },
  {
    question: "How do I use it?",
    answer:
      `Serve your dal, curry or sabzi as usual, stir one heaped tablespoon of Heldi Khana into your bowl, and keep the jar on the table for next time. One serving is ${SERVING_GRAMS}g, about one heaped tablespoon. The recommended daily intake is ${SERVING_GRAMS}g to ${SERVING_GRAMS * MAX_DAILY_SERVINGS}g, which is 1 to ${MAX_DAILY_SERVINGS} servings; do not exceed it. Cooking for everyone? Take the pot off the heat and let it cool a little, add one spoonful for each person eating it, then mix the pot thoroughly so the powder is shared across those portions. In something smooth, like a big pot of dal or a bowl of dahi, the powder can clump, so a whisk does a better job than a spoon. In a dish with pieces in it, like a sabzi or chana masala, the pieces break the clumps up as you stir, and a spoon is all you need. Heldi Chai is different: its serving is ${CHAI_SERVING_GRAMS}g, about one ${CHAI_SERVING_SPOON}, stirred into a hot drink once it is cool enough to drink, and its recommended daily intake is ${CHAI_SERVING_GRAMS}g to ${CHAI_SERVING_GRAMS * CHAI_MAX_DAILY_SERVINGS}g.`
  },
  {
    question: "Can I use it in dishes that are not on the pouch?",
    answer:
      "Yes. Heldi Khana is made for dishes with a gravy, dal or yoghurt base, including sambar, kadhi, korma, bhindi in gravy and chaat with dahi. It can also be stirred into chicken curry, keema or egg bhurji. Let the food cool a little first, then mix the spoonful through evenly. Found a dish it works brilliantly in? Email info@heldi.co.uk and we will pass it on to everyone else."
  },
  {
    question: "Can I put Khana in my chai?",
    answer:
      "Khana is the savoury blend, made with warm spices for dal, curry, sabzi and raita, so it is not intended for chai. Heldi Chai is the blend for hot drinks: whey protein and milk protein concentrate with ginger, cardamom, cinnamon, black pepper and clove, stirred in once the cup is cool enough to drink. Contains milk."
  },
  {
    question: "Can children have Heldi?",
    answer:
      "Heldi Khana is whey, a protein from milk, the same milk their dahi and paneer come from, with kitchen spices and no sweeteners or caffeine. Most children already get the protein they need from ordinary family meals, so Heldi is not something they have to have. If you would like to add it to a child's bowl, ask a GP or dietitian who knows them first. If Heldi is going into the family pot, everyone at the table gets some, so dish up the children's portions first if you would rather they did not. Heldi Chai contains coconut sugar, and the Chai blend itself is caffeine free, but tea and coffee usually are not, so the drink it goes into is the thing to check. Both blends contain milk."
  },
  {
    question: "Can older adults have Heldi?",
    answer:
      `Heldi is made for grown-ups of every age. The one rule: if they have a medical condition or a prescribed diet, show their GP or dietitian the label first. Heldi Khana is whey and the spices they have cooked with all their lives: cumin, coriander, garam masala, Kashmiri chilli and turmeric. It also has a pinch of fine sea salt, ${KHANA_SALT_PER_SERVING} of salt a spoonful in all, and sunflower lecithin. It contains milk, and it has no added sugar, though it contains naturally occurring sugars. Heldi Chai is its own recipe and contains coconut sugar.`
  },
  {
    question: "Can I use Heldi if I have diabetes?",
    answer:
      "Ask your GP or dietitian first, and take the label with you. What we can tell you is that Heldi Khana has no added sugar and under 1g of carbohydrate per spoonful, though it contains naturally occurring sugars. Heldi Chai contains coconut sugar, and its label shows how much."
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
