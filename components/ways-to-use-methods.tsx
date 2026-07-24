import type { ReactNode } from "react";
import { CopyHighlight } from "@/components/copy-highlight";
import type { ComicStrip, Serving } from "@/components/ways-comic-strip";

/**
 * The six ways to stir Heldi in. One source of truth: the /ways-to-use page
 * renders every method with its full copy, and the homepage "how it works"
 * gallery reuses three of them (pot, dahi, table) as animated cards. Editing a
 * method here updates both surfaces.
 */
export type Method = {
  id: string;
  chip: string;
  eyebrow: string;
  title: string;
  ground: "ink" | "cream" | "gold";
  intro: ReactNode;
  steps: [ReactNode, ReactNode, ReactNode];
  serving: Serving;
  note?: string;
  strip?: ComicStrip;
};

export const METHODS: Method[] = [
  {
    id: "pot",
    chip: "In the pot",
    eyebrow: "THE POT",
    title: "How do you add it to dal or curry?",
    ground: "ink",
    intro: (
      <>
        A heaped tablespoon adds 10g of protein. The only trick is the
        spread: <CopyHighlight>sprinkle it all around the surface</CopyHighlight>,
        not one heap in the middle, then stir. The pot will deny everything.
      </>
    ),
    steps: [
      <>Cook your dal, curry or sabzi like always, then take the pot off the boil.</>,
      <>Sprinkle a heaped tablespoon per person all around the surface.</>,
      <>Stir until it disappears, about ten seconds, and serve.</>
    ],
    serving: { start: "1 tsp per person", upto: "1 heaped tbsp per person" },
    strip: {
      video: "/videos/ways-to-use/pot-strip.mp4",
      poster: "/images/ways-to-use/pot-strip.webp",
      width: 1920,
      height: 1080,
      label: "In the pot",
      captions: ["Cook like always.", "Heat off.", "Stir one in.\nGone."],
      anchors: [18, 48, 80],
      alt: "Engraved brass pot in the Heldi pouch style, shown three times: cooking over a flame, off the heat with its lid set aside, and with a bangled hand stirring in a spoonful."
    }
  },
  {
    id: "dahi",
    chip: "Dahi and raita",
    eyebrow: "COLD BOWLS",
    title: "What about dahi and raita?",
    ground: "cream",
    intro: (
      <>
        The same moves as the pot, minus the waiting: dahi is already cool,
        so there is <CopyHighlight>no cooling-off period</CopyHighlight>. A
        teaspoon does its bit in your own bowl; a tablespoon suits a raita
        made for the table. Stir it smooth and it is gone.
      </>
    ),
    steps: [
      <>Spoon out your dahi or mix your raita like always.</>,
      <>Sprinkle a teaspoon to a tablespoon across the bowl.</>,
      <>Stir until smooth. Cold bowls take it the fastest.</>
    ],
    serving: { start: "1 tsp per person", upto: "1 tbsp per person" },
    note: "Yes, those are the same steps as the pot. That is rather the point.",
    strip: {
      video: "/videos/ways-to-use/dahi-strip.mp4",
      poster: "/images/ways-to-use/dahi-strip.webp",
      width: 1920,
      height: 1080,
      label: "In the bowl",
      captions: ["Dahi like\nalways.", "Sprinkle\nacross.", "Stir until\nsmooth."],
      anchors: [21, 50, 80],
      alt: "Engraved metal bowls of dahi in the Heldi pouch style, shown three times: a full bowl with a spoon resting beside it, a bangled hand sprinkling a spoonful across the surface, and another hand stirring it smooth with a spoon."
    }
  },
  {
    id: "table",
    chip: "On the table",
    eyebrow: "THE WHOLE TABLE",
    title: "Why does the jar live on the table?",
    ground: "ink",
    intro: (
      <>
        Because that is where the food is. Set it in the middle, next to the
        achaar, and <CopyHighlight>everyone sorts their own plate</CopyHighlight>:
        a tablespoon in papa&apos;s dal, a teaspoon in nani&apos;s raita, and
        nobody&apos;s dinner is anybody else&apos;s business.
      </>
    ),
    steps: [
      <>Put the jar in the middle of the table. Not the cupboard.</>,
      <>Everyone adds their own. Start with a teaspoon, work up to a heaped tablespoon.</>,
      <>Stir it into your bowl and pass the jar along.</>
    ],
    serving: { start: "1 tsp each", upto: "1 heaped tbsp each" },
    note: "This is the job the jar was made for.",
    strip: {
      video: "/videos/ways-to-use/table-strip.mp4",
      poster: "/images/ways-to-use/table-strip.webp",
      width: 1920,
      height: 1080,
      label: "On the table",
      captions: ["Fill\nthe jar.", "Park it by\nthe achaar.", "Everyone adds\ntheir own."],
      anchors: [20, 50, 80],
      alt: "Engraved table jar in the Heldi pouch style, shown three times: a plain pouch pouring powder into the open jar, the closed jar parked beside a little achaar pot, and two bangled hands lifting spoonfuls toward their own bowls."
    }
  },
  {
    id: "takeaway",
    chip: "Take away",
    eyebrow: "FRIDAY NIGHT",
    title: "Does it work in a takeaway?",
    ground: "cream",
    intro: (
      <>
        Beautifully. A takeaway curry is still a curry: hot, saucy and very
        stir-able. Plate up your own portion, sprinkle, stir, enjoy.{" "}
        <CopyHighlight>
          What happens between you and your korma stays between you and your
          korma.
        </CopyHighlight>
      </>
    ),
    steps: [
      <>Order like always. Friday is Friday.</>,
      <>Plate up your portion and sprinkle a tablespoon over it whilst it&apos;s hot.</>,
      <>Stir, serve, enjoy.</>
    ],
    serving: "1 tbsp per portion",
    strip: {
      video: "/videos/ways-to-use/takeaway-strip.mp4",
      poster: "/images/ways-to-use/takeaway-strip.webp",
      width: 1920,
      height: 1080,
      label: "The takeaway",
      captions: ["Order like always.", "Sprinkle over it.", "Stir and enjoy."],
      anchors: [20, 50, 77],
      alt: "Engraved takeaway curry in the Heldi pouch style, shown three times: a steaming foil container, a plated bowl with a bangled hand sprinkling a spoonful over it, and another hand stirring the bowl smooth."
    }
  },
  {
    id: "freezer",
    chip: "The freezer stash",
    eyebrow: "THE FREEZER STASH",
    title: "What about the food mum sent you home with?",
    ground: "ink",
    intro: (
      <>
        Half the freezers in this country hold a dabba of somebody&apos;s
        mum&apos;s dal. Heldi goes in at the end of its journey, not the
        beginning: defrost, heat it through, take it off the heat, and stir
        in a spoonful just before you eat.{" "}
        <CopyHighlight>The recipe stays hers.</CopyHighlight>
      </>
    ),
    steps: [
      <>Defrost and heat it through like always.</>,
      <>Off the heat. Give it a minute to stop steaming.</>,
      <>Stir in a spoonful just before serving. Aunty never needs to know.</>
    ],
    serving: "1 tbsp per portion",
    strip: {
      video: "/videos/ways-to-use/freezer-strip.mp4",
      poster: "/images/ways-to-use/freezer-strip.webp",
      width: 1920,
      height: 1080,
      label: "Home away from home",
      captions: ["Defrost.", "Heat it up.", "Then Heldi."],
      anchors: [19, 49, 77],
      alt: "Engraved leftovers in the Heldi pouch style, shown three times: a frosted freezer tub of dal, a brass pot reheating over a flame, and a bangled hand stirring in a spoonful off the heat."
    }
  },
  {
    id: "roti",
    chip: "Rotis",
    eyebrow: "THE ATTA",
    title: "How do you make protein rotis?",
    ground: "cream",
    intro: (
      <>
        The one method where Heldi goes in before the cooking. Mix it into
        the dry atta first so it spreads evenly, then{" "}
        <CopyHighlight>knead with cold water</CopyHighlight>. Cold matters:
        warm water turns whey clumpy, cold keeps the dough smooth. The dough
        drinks a little more water than plain atta, so add a splash extra if
        it feels tight, and let it rest before rolling.
      </>
    ),
    steps: [
      <>Stir one to two tablespoons of Heldi through each cup of dry atta.</>,
      <>Knead with cold water, a splash more than usual, and rest the dough for 15 minutes.</>,
      <>Roll and cook like always on a medium tawa. Protein browns a touch faster, so watch the first one.</>
    ],
    serving: "1 to 2 tbsp per cup of atta",
    note: "Same soft rotis. Just carrying more.",
    strip: {
      video: "/videos/ways-to-use/roti-strip.mp4",
      poster: "/images/ways-to-use/roti-strip.webp",
      width: 1920,
      height: 1080,
      label: "In the atta",
      captions: ["Into the atta.", "Knead and rest.", "Roll and cook."],
      anchors: [19, 51, 80],
      alt: "Engraved roti-making in the Heldi pouch style, shown three times: a pouch pouring Heldi into a plate of atta flour, two bangled hands kneading the dough, and a roti puffing up on a tawa over a flame."
    }
  }
];
