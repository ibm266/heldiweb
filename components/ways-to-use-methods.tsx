import type { ReactNode } from "react";
import { CopyHighlight } from "@/components/copy-highlight";
import type { ComicStrip, Serving } from "@/components/ways-comic-strip";

/**
 * The seven ways to stir Heldi in (six for Khana, one for Chai). One source
 * of truth: the /ways-to-use page renders every method with its full copy,
 * and the homepage "how it works" gallery reuses four of them (table, pot,
 * dahi, mug) as animated cards. Editing a method here updates both surfaces.
 *
 * THE ORDER IS THE PACK'S. The Khana pouch (round 16) teaches one method:
 * serve your food, stir a heaped tablespoon into your own bowl, keep the jar
 * on the table. So `table` leads and `pot` comes second (Mihir, 3 Oct 2026).
 * The grounds alternate ink and cream down the page (BRAND.md §8.3), so a
 * reorder also means re-pairing them.
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
    id: "table",
    chip: "On the table",
    eyebrow: "AT THE TABLE",
    title: "How do you add it to your own bowl?",
    ground: "ink",
    intro: (
      <>
        Dish up your dal, curry or sabzi just as always. Then, as you sit down
        to eat,{" "}
        <CopyHighlight>stir a heaped tablespoon into your own bowl</CopyHighlight>.
        The pot stays as it is. Keep the jar on the table beside the achaar
        and pass it along, so a tablespoon can go into papa&apos;s dal and a
        teaspoon into nani&apos;s raita.
      </>
    ),
    steps: [
      <>Dish up your dal, curry or sabzi just as always.</>,
      <>Stir a heaped tablespoon into your own bowl. Start with a teaspoon if it is your first time.</>,
      <>Keep the jar on the table and pass it along, ready for next time.</>
    ],
    serving: { start: "1 tsp each", upto: "1 heaped tbsp each" },
    note: "This is why the jar belongs between the dishes.",
    strip: {
      // Redrawn 3 Oct 2026 in the pack's order: serve, stir, store.
      video: "/videos/ways-to-use/table-strip.mp4?v=2",
      poster: "/images/ways-to-use/table-strip.webp?v=2",
      width: 1920,
      height: 1080,
      label: "On the table",
      captions: ["Serve\nyour food.", "Stir\nthrough.", "Store in\na jar."],
      anchors: [21, 50, 83],
      alt: "Engraved table strip in the Heldi pouch style, in three scenes: a bangled hand ladling dal from a brass pot into a bowl, a hand stirring a cream swirl through that bowl, and a plain pouch tipping powder into the paisley table jar, its lid resting beside it."
    }
  },
  {
    id: "pot",
    chip: "In the pot",
    eyebrow: "THE POT",
    title: "What if you are cooking for everyone?",
    ground: "cream",
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
      captions: ["Cook just\nas always.", "Take it off\nthe heat.", "Stir, then\nserve."],
      anchors: [18, 48, 80],
      alt: "Engraved brass pot in the Heldi pouch style, shown three times: cooking over a flame, off the heat with its lid set aside, and with a bangled hand stirring in a spoonful."
    }
  },
  {
    id: "dahi",
    chip: "Dahi and raita",
    eyebrow: "COLD BOWLS",
    title: "What about dahi and raita?",
    ground: "ink",
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
      captions: ["Serve your\ndahi.", "Sprinkle\nevenly.", "Stir until\nsmooth."],
      anchors: [21, 50, 80],
      alt: "Engraved metal bowls of dahi in the Heldi pouch style, shown three times: a full bowl with a spoon resting beside it, a bangled hand sprinkling a spoonful across the surface, and another hand stirring it smooth with a spoon."
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
      captions: ["Serve your\nportion.", "Sprinkle\nevenly.", "Stir to the\nbottom."],
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
        This one is Heldi Chai, not Khana: whey and milk protein concentrate
        with real chai spices, made for the mug rather than the pot. The mug&apos;s rule
        is stricter than the pot&apos;s: <CopyHighlight>if it is cool enough
        to drink, you can stir Heldi in</CopyHighlight>. Any hotter and the
        milk protein clumps into little white specks. If it does, the tea
        strainer catches them.
      </>
    ),
    steps: [
      <>Brew your chai the way you always make it. Tea, coffee and hot chocolate count too.</>,
      <>Pour your cup and let it cool until you could drink it. A splash of cold milk gets it there sooner.</>,
      <>Stir in a level tablespoon, gone in a few turns of the spoon. Spot white specks? It was still too hot: pour it through the tea strainer.</>
    ],
    serving: "1 level tbsp per mug",
    note: "This guide rounds the calculated 5.1g per 8g serving down to 5g. The figures come from the recipe and supplier data, not finished-product analysis.",
    strip: {
      video: "/videos/ways-to-use/mug-strip.mp4",
      poster: "/images/ways-to-use/mug-strip.webp",
      width: 1920,
      height: 1080,
      label: "In the mug",
      captions: ["Make your\ntea.", "Let it\ncool.", "Stir one in.\nGone."],
      anchors: [18, 50, 82],
      alt: "Engraved brass chai pan and tumbler in the Heldi pouch style, shown three times: brewing over a flame, off the heat beside a steaming cup, and with a bangled hand stirring a spoonful into the cup."
    }
  }
];
