import type { ReactNode } from "react";
import { CopyHighlight } from "@/components/copy-highlight";
import type { ComicStrip, Serving } from "@/components/ways-comic-strip";

/**
 * The seven ways to stir Heldi in (six for Khana, one for Chai). One source
 * of truth: the /ways-to-use page renders every method with its full copy,
 * and the homepage "how it works" gallery reuses four of them (pot, dahi,
 * table, mug) as animated cards. Editing a method here updates both surfaces.
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
        A heaped tablespoon adds 10g of protein. Finish cooking and take the
        pot off the boil. Then{" "}
        <CopyHighlight>scatter Heldi across the whole surface</CopyHighlight>{" "}
        so it wets evenly when you stir.
      </>
    ),
    steps: [
      <>Finish cooking your dal, curry or sabzi, then take the pot off the boil.</>,
      <>Scatter a heaped tablespoon per person across the surface.</>,
      <>Stir through for about ten seconds, check for dry pockets, and serve.</>
    ],
    serving: { start: "1 tsp per person", upto: "1 heaped tbsp per person" },
    strip: {
      video: "/videos/ways-to-use/pot-strip.mp4",
      poster: "/images/ways-to-use/pot-strip.webp",
      width: 1920,
      height: 1080,
      label: "In the pot",
      captions: ["Finish\ncooking.", "Take it off\nthe boil.", "Scatter and\nstir."],
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
        Dahi is already cool, so you can add Heldi as soon as the bowl is
        ready. Start with a teaspoon per person, whether it is going into one
        bowl or a shared raita. For a shared bowl, total the spoonfuls for
        everyone eating.{" "}
        <CopyHighlight>Work up to a tablespoon per person</CopyHighlight>,
        adding it in passes and stirring between them.
      </>
    ),
    steps: [
      <>Spoon out your dahi or finish mixing the raita.</>,
      <>Measure one teaspoon per person to start, up to one tablespoon per person.</>,
      <>Stir through the middle and around the edge until smooth.</>
    ],
    serving: { start: "1 tsp per person", upto: "1 tbsp per person" },
    note: "For a thick raita, add it in two passes and stir between them.",
    strip: {
      video: "/videos/ways-to-use/dahi-strip.mp4",
      poster: "/images/ways-to-use/dahi-strip.webp",
      width: 1920,
      height: 1080,
      label: "In the bowl",
      captions: ["Ready the\nbowl.", "Sprinkle\nevenly.", "Stir until\nsmooth."],
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
        Set the jar beside the achaar and let each person choose their amount.
        A tablespoon can go into papa&apos;s dal and a teaspoon into
        nani&apos;s raita.{" "}
        <CopyHighlight>Everyone stirs their own bowl</CopyHighlight>, then
        passes the jar along.
      </>
    ),
    steps: [
      <>Put the jar in the middle of the table, within everyone&apos;s reach.</>,
      <>Everyone adds their own. Start with a teaspoon, work up to a heaped tablespoon.</>,
      <>Stir it into your bowl and pass the jar along.</>
    ],
    serving: { start: "1 tsp each", upto: "1 heaped tbsp each" },
    note: "This is why the jar belongs between the dishes.",
    strip: {
      video: "/videos/ways-to-use/table-strip.mp4",
      poster: "/images/ways-to-use/table-strip.webp",
      width: 1920,
      height: 1080,
      label: "On the table",
      captions: ["Fill the\njar.", "Set it by\nthe achaar.", "Stir your\nown bowl."],
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
        For a korma or another takeaway curry, work with one portion at a time.
        Plate it before adding Heldi so you can spread the powder evenly and
        stir right to the bottom.{" "}
        <CopyHighlight>
          Add it whilst the curry is still hot
        </CopyHighlight>
        , then eat as soon as it is mixed through.
      </>
    ),
    steps: [
      <>Order the curry you want. Friday is Friday. Plate up your portion.</>,
      <>Sprinkle a tablespoon evenly over it whilst it is still hot.</>,
      <>Stir right to the bottom of the bowl, then eat.</>
    ],
    serving: "1 tbsp per portion",
    strip: {
      video: "/videos/ways-to-use/takeaway-strip.mp4",
      poster: "/images/ways-to-use/takeaway-strip.webp",
      width: 1920,
      height: 1080,
      label: "The takeaway",
      captions: ["Plate your\nportion.", "Sprinkle\nevenly.", "Stir to the\nbottom."],
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
        If there is a dabba of your mum&apos;s dal in the freezer, reheat it
        fully before you reach for Heldi. Take it off the heat, wait for the
        steam to settle, then stir in a spoonful just before serving.{" "}
        <CopyHighlight>The recipe stays hers.</CopyHighlight>
      </>
    ),
    steps: [
      <>Defrost the food and heat it all the way through.</>,
      <>Take it off the heat and give it a minute to stop steaming.</>,
      <>Stir in a spoonful just before serving.</>
    ],
    serving: "1 tbsp per portion",
    strip: {
      video: "/videos/ways-to-use/freezer-strip.mp4",
      poster: "/images/ways-to-use/freezer-strip.webp",
      width: 1920,
      height: 1080,
      label: "Home away from home",
      captions: ["Defrost\nfully.", "Heat it\nthrough.", "Rest, then\nstir."],
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
        Mix Heldi through the dry atta before adding any water. This spreads
        it evenly through the dough. Then{" "}
        <CopyHighlight>knead with cold water</CopyHighlight>. Cold matters:
        warm water can make the whey clump. The dough takes a little more
        water than plain atta, so add an extra splash if it feels tight and
        rest it before rolling.
      </>
    ),
    steps: [
      <>Stir one to two tablespoons of Heldi through each cup of dry atta.</>,
      <>Knead with cold water, a splash more than usual, and rest the dough for 15 minutes.</>,
      <>Roll and cook like always on a medium tawa. Protein browns a touch faster, so watch the first one.</>
    ],
    serving: "1 to 2 tbsp per cup of atta",
    note: "Watch the first roti. If it browns quickly, turn the tawa down a little.",
    strip: {
      video: "/videos/ways-to-use/roti-strip.mp4",
      poster: "/images/ways-to-use/roti-strip.webp",
      width: 1920,
      height: 1080,
      label: "In the atta",
      captions: ["Mix through\ndry atta.", "Knead cold.\nRest 15 min.", "Roll. Cook\non medium."],
      anchors: [19, 51, 80],
      alt: "Engraved roti-making in the Heldi pouch style, shown three times: a pouch pouring Heldi into a plate of atta flour, two bangled hands kneading the dough, and a roti puffing up on a tawa over a flame."
    }
  },
  {
    id: "mug",
    chip: "In the mug",
    eyebrow: "THE MUG",
    title: "How do you use it in chai?",
    ground: "ink",
    intro: (
      <>
        Use Heldi Chai here. It combines whey protein isolate, milk protein
        concentrate and chai spices for the mug. Finish brewing, then{" "}
        <CopyHighlight>take the drink off the boil</CopyHighlight> before you
        stir in a level tablespoon.
      </>
    ),
    steps: [
      <>Make your chai the way you usually do. Tea, coffee and hot chocolate count too.</>,
      <>When the drink is ready, take it off the heat if needed and let it come off the boil. If you add milk at the end, add it now.</>,
      <>Stir in a level tablespoon just before you drink, until the mug is smooth.</>
    ],
    serving: "1 level tbsp per mug",
    note: "This guide rounds the calculated 5.1g per 8g serving down to 5g. The figures come from the recipe and supplier data, not finished-product analysis.",
    strip: {
      video: "/videos/ways-to-use/mug-strip.mp4",
      poster: "/images/ways-to-use/mug-strip.webp",
      width: 1920,
      height: 1080,
      label: "In the mug",
      captions: ["Finish\nbrewing.", "Take it off\nthe boil.", "Stir until\nsmooth."],
      anchors: [18, 50, 82],
      alt: "Engraved brass chai pan and tumbler in the Heldi pouch style, shown three times: brewing over a flame, off the heat beside a steaming cup, and with a bangled hand stirring a spoonful into the cup."
    }
  }
];
