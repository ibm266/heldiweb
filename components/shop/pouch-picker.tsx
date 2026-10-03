"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCart } from "@/components/cart/cart-context";
import { CopyHighlight } from "@/components/copy-highlight";
import { CHAI_LEGAL_NAME, CHAI_SERVING_SPOON } from "@/components/shop/chai-data";

// The two product tiles on /shop. Same card family as the homepage range
// band (`.range-card`), grown into a full product tile: pack shot, the FIC
// legal name so a shopper knows what each pouch actually is, what it goes
// into, the attribute pills each product can stand up, and a status line
// that follows the commerce mode. Number-free for the same reason the band
// is: Chai publishes no protein figure until the finished blend is analysed
// (components/shop/chai-data.ts), and a figure on one tile only would be read
// as both.
//
// Mobile (<=899px): the tiles stack full width, one product per screen.
// Wide (>=900px): two tiles side by side, capped at 1000px.

type Pill = { icon: string; label: string; width: number; height: number };

type Pouch = {
  id: "khana" | "chai";
  tag: string;
  title: string;
  /** The legal name. It sits in the page's small print (PouchSmallPrint),
   *  tied to the card title by an asterisk, not in the card itself. */
  legalName: string;
  line: ReactNode;
  image: { src: string; alt: string };
  pills: Pill[];
  href: string;
};

// A subset of each product's own badge set, with the same substantiation
// rules as the product pages: nothing here that its page does not carry.
const BADGES = "/images/pouch-badges";

const POUCHES: Pouch[] = [
  {
    id: "khana",
    tag: "FOR THE BOWL",
    title: "Heldi Khana",
    legalName: "Whey protein isolate blend with warm spices. Food supplement.",
    line: (
      <>
        Khana literally means food, and food is life. We want to bring
        something new to the table without moving anything already on it.{" "}
        <CopyHighlight>Serve your dal, curry or sabzi just as always</CopyHighlight>,
        stir a heaped tablespoon into your bowl, and{" "}
        <CopyHighlight>the recipe stays exactly as your family makes it</CopyHighlight>.
      </>
    ),
    image: {
      src: "/images/range/khana.webp?v=6",
      alt: "The navy Heldi Khana pouch on a linen table"
    },
    pills: [
      { icon: `${BADGES}/high-protein.png`, label: "High protein", width: 256, height: 256 },
      { icon: `${BADGES}/lactose-free.png`, label: "98% lactose-free", width: 280, height: 377 },
      { icon: `${BADGES}/no-sugar.png`, label: "No added sugar", width: 386, height: 390 },
      { icon: `${BADGES}/vegetarian.png`, label: "Vegetarian", width: 286, height: 367 }
    ],
    href: "/shop/khana"
  },
  {
    id: "chai",
    tag: "FOR THE MUG",
    title: "Heldi Chai",
    legalName: CHAI_LEGAL_NAME,
    line: (
      <>
        Chai is more than just a drink: it&apos;s a daily ritual and a reason
        to sit together.{" "}
        <CopyHighlight>Make your chai, tea or coffee exactly how you always do</CopyHighlight>,
        let it cool a little, then stir in a {CHAI_SERVING_SPOON} just before
        you drink.{" "}
        <CopyHighlight>Your cup still tastes like your cup.</CopyHighlight>
      </>
    ),
    image: {
      src: "/images/range/chai.webp?v=5",
      alt: "The terracotta Heldi Chai pouch on a linen table"
    },
    pills: [
      { icon: `${BADGES}/high-protein.png`, label: "High protein", width: 256, height: 256 },
      { icon: `${BADGES}/caffeine-free.webp`, label: "Caffeine free", width: 256, height: 256 },
      { icon: `${BADGES}/vegetarian.png`, label: "Vegetarian", width: 286, height: 367 }
    ],
    href: "/shop/chai"
  }
];

function status(id: Pouch["id"], mode: "waitlist" | "live") {
  if (id === "khana") {
    return mode === "live"
      ? { note: "Ready for the next bowl.", cta: "Shop Khana" }
      : { note: "Ready on launch day.", cta: "See Khana" };
  }
  return mode === "live"
    ? { note: "Read the method now. Chai is not on sale yet.", cta: "See Chai" }
    : { note: "Read the method now. Chai launches with Khana.", cta: "See Chai" };
}

export function PouchPicker() {
  const { mode } = useCart();

  return (
    <ul className="pouch-picker" role="list">
      {POUCHES.map((pouch) => {
        const copy = status(pouch.id, mode);
        return (
          <li
            key={pouch.id}
            className={`range-card range-card--page range-card--${pouch.id}`}
          >
            <Link
              className="range-card__media range-card__media--link"
              href={pouch.href}
              aria-label={`${copy.cta}: ${pouch.title}`}
            >
              <Image
                src={pouch.image.src}
                alt={pouch.image.alt}
                width={900}
                height={900}
                sizes="(max-width: 899px) calc(100vw - 3.5rem), 440px"
              />
            </Link>
            <div className="range-card__body">
              <p className="range-card__tag">{pouch.tag}</p>
              <h2 className="range-card__title">
                {pouch.title}
                <a
                  className="range-card__mark"
                  href="#small-print"
                  aria-label="See the small print"
                >
                  *
                </a>
              </h2>
              <p className="range-card__line">{pouch.line}</p>
              <ul className="range-card__pills" aria-label="Product attributes">
                {pouch.pills.map((pill) => (
                  <li key={pill.label} className="range-card__pill">
                    <Image
                      className="range-card__pill-icon"
                      src={pill.icon}
                      alt=""
                      width={pill.width}
                      height={pill.height}
                      sizes="28px"
                      aria-hidden="true"
                    />
                    {pill.label}
                  </li>
                ))}
              </ul>
              <p className="range-card__note">{copy.note}</p>
              <Link className="button button--pill range-card__cta" href={pouch.href}>
                {copy.cta}
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// The compliance lines for both cards, at the foot of /shop: each pouch's
// legal name, the allergen and the not-a-substitute statement. The cards
// point here with an asterisk (Mihir, 3 Oct 2026: compliance text belongs in
// the small print, not in the selling copy). The product pages keep their
// own full statements by the buy button.
export function PouchSmallPrint() {
  return (
    <p className="heldi-disclaimer" id="small-print">
      * {POUCHES.map((pouch) => `${pouch.title}: ${pouch.legalName}`).join(" ")}{" "}
      Both contain milk. Food supplements are not a substitute for a varied and
      balanced diet and a healthy lifestyle.
    </p>
  );
}
