"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { CopyHighlight } from "@/components/copy-highlight";

// The two-pouch band on the homepage: Khana for the pot, Chai for the mug.
//
// Deliberately number-free. Khana's 10g lives in the hero and the truth
// block already, and Chai publishes no protein figure at all until the
// finished blend is analysed (the reasoning is at the top of
// components/shop/chai-data.ts). Putting a figure on one card and not the
// other would invite the reader to assume the same number for both, so
// neither card carries one. The section's job is to say there are two
// pouches, what each one is for, and where to go next.
//
// The Chai card is honest about the stage Chai is at (BRAND.md §3, pillar 1):
// it has a page and no price, in either commerce mode.

type RangeProduct = {
  id: "khana" | "chai";
  tag: string;
  title: string;
  line: string;
  image: { src: string; alt: string };
  href: string;
};

const RANGE: RangeProduct[] = [
  {
    id: "khana",
    tag: "FOR THE POT",
    title: "Heldi Khana",
    line: "Dal, curry, sabzi, raita. Stirred into the pot once it is off the heat.",
    image: {
      // Cropped from the /shop gallery shot; masters in the gitignored
      // public/images/originals/pre-webp/shop/.
      src: "/images/range/khana.webp?v=4",
      alt: "The navy Heldi Khana pouch on a linen table"
    },
    href: "/shop/khana"
  },
  {
    id: "chai",
    tag: "FOR THE MUG",
    title: "Heldi Chai",
    line: "Chai, tea, coffee, hot chocolate. Stirred into the mug once it is off the boil.",
    image: {
      src: "/images/range/chai.webp?v=3",
      alt: "The terracotta Heldi Chai pouch on a linen table"
    },
    href: "/shop/chai"
  }
];

// The note and the link label follow the commerce mode, the way every CTA on
// the site does (BRAND.md §11.5). Khana is the product on sale; Chai is
// browsable in both modes and buyable in neither, so its link never says
// "Shop".
function cardCopy(id: RangeProduct["id"], mode: "waitlist" | "live") {
  if (id === "khana") {
    return mode === "live"
      ? { note: "In the shop now.", cta: "Shop Khana" }
      : { note: "The first one out of the kitchen.", cta: "Meet Khana" };
  }
  return mode === "live"
    ? { note: "Still on the stove. Not in the shop yet.", cta: "Meet Chai" }
    : { note: "Still on the stove. The waitlist hears first.", cta: "Meet Chai" };
}

export function RangeSection() {
  const { mode } = useCart();

  return (
    <section className="section section--gold section--bordered range" id="range">
      <div className="content">
        <div className="range__head">
          <p className="eyebrow">TWO POUCHES</p>
          <h2>One for the pot. One for the mug.</h2>
          <p className="range__lede">
            Khana goes into the food. Chai goes into the drink. A spoonful
            each, same rule:{" "}
            <CopyHighlight>nobody at the table can tell</CopyHighlight>.
          </p>
        </div>

        {/* role="list" because list-style: none drops list semantics in
            Safari/VoiceOver. */}
        <ul className="range__grid" role="list">
          {RANGE.map((product) => {
            const copy = cardCopy(product.id, mode);
            return (
              <li
                key={product.id}
                className={`range-card range-card--${product.id}`}
              >
                <div className="range-card__media">
                  <Image
                    src={product.image.src}
                    alt={product.image.alt}
                    width={900}
                    height={900}
                    sizes="(max-width: 899px) 45vw, 440px"
                  />
                </div>
                <div className="range-card__body">
                  <p className="range-card__tag">{product.tag}</p>
                  <h3 className="range-card__title">{product.title}</h3>
                  <p className="range-card__line">{product.line}</p>
                  <p className="range-card__note">{copy.note}</p>
                  <Link className="pill-link" href={product.href}>
                    {`${copy.cta} \u2192`}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
