"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";

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
  legalName: string;
  line: string;
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
    tag: "FOR THE POT",
    title: "Heldi Khana",
    legalName: "Whey protein isolate blend with warm spices. Food supplement.",
    line: "Dal, curry, sabzi, raita. A heaped tablespoon stirred into the pot once it is off the heat, and nobody at the table can tell.",
    image: {
      src: "/images/range/khana.webp?v=5",
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
    legalName:
      "Whey protein and casein blend with chai spices and coconut sugar. Food supplement.",
    line: "Chai, tea, coffee, hot chocolate. A level tablespoon stirred into the mug once it is off the boil, and the cup still tastes like your cup.",
    image: {
      src: "/images/range/chai.webp?v=4",
      alt: "The terracotta Heldi Chai pouch on a linen table"
    },
    pills: [
      { icon: `${BADGES}/high-protein.png`, label: "High protein", width: 256, height: 256 },
      { icon: `${BADGES}/vegetarian.png`, label: "Vegetarian", width: 286, height: 367 }
    ],
    href: "/shop/chai"
  }
];

function status(id: Pouch["id"], mode: "waitlist" | "live") {
  if (id === "khana") {
    return mode === "live"
      ? { note: "In the shop now.", cta: "Shop Khana" }
      : { note: "First to the table. On sale at launch.", cta: "See Khana" };
  }
  return mode === "live"
    ? { note: "Still on the stove. Not in the shop yet, no price yet.", cta: "See Chai" }
    : { note: "Still on the stove. No price yet; the waitlist hears first.", cta: "See Chai" };
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
              <h2 className="range-card__title">{pouch.title}</h2>
              <p className="range-card__legal">{pouch.legalName}</p>
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
