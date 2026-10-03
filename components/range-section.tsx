"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { CopyHighlight } from "@/components/copy-highlight";
import { CHAI_SELLABLE } from "@/lib/commerce/config";

// The two-pouch band on the homepage: Khana for the bowl, Chai for the mug.
//
// Deliberately number-free. Khana's 10g lives in the hero and the truth
// block already, and Chai publishes no protein figure at all until the
// finished blend is analysed (the reasoning is at the top of
// components/shop/chai-data.ts). Putting a figure on one card and not the
// other would invite the reader to assume the same number for both, so
// neither card carries one. The section's job is to say there are two
// pouches, what each one is for, and where to go next.
//
// The Chai card is honest about the stage Chai is at (BRAND.md §3, pillar 1).
// Chai launches with Khana (Mihir, 3 Oct 2026), so once CHAI_SELLABLE is on in
// live mode its card reads like Khana's.

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
    tag: "FOR THE BOWL",
    title: "Heldi Khana",
    line: "Khana literally means food, and food is life. We want to bring something new to the table: whey protein and warm spices that stir straight into the dal, curry, sabzi and raita already in your week.",
    image: {
      // Cropped from the /shop gallery shot; masters in the gitignored
      // public/images/originals/pre-webp/shop/.
      src: "/images/range/khana.webp?v=6",
      alt: "The navy Heldi Khana pouch on a linen table"
    },
    href: "/shop/khana"
  },
  {
    id: "chai",
    tag: "FOR THE MUG",
    title: "Heldi Chai",
    // The five spices of CHAI_INGREDIENT_NAMES (components/shop/chai-data.ts),
    // in the same order. Change both together.
    line: "Made with the spices we love in our chai: ginger, cardamom, cinnamon, black pepper and clove. Stir it into chai, tea, coffee or hot chocolate once the cup is cool enough to drink.",
    image: {
      src: "/images/range/chai.webp?v=5",
      alt: "The terracotta Heldi Chai pouch on a linen table"
    },
    href: "/shop/chai"
  }
];

// The note and the link label follow the commerce mode, the way every CTA on
// the site does (BRAND.md §11.5). Chai's link says "Shop" only once
// CHAI_SELLABLE puts it in the shop.
function cardCopy(id: RangeProduct["id"], mode: "waitlist" | "live") {
  if (id === "khana") {
    return mode === "live"
      ? { note: "Khana is in the shop now.", cta: "Shop Khana" }
      : { note: "Khana will be ready on launch day.", cta: "Meet Khana" };
  }
  if (mode === "live") {
    return CHAI_SELLABLE
      ? { note: "Chai is in the shop now.", cta: "Shop Chai" }
      : { note: "Chai is not in the shop yet.", cta: "Meet Chai" };
  }
  return { note: "Chai is just about ready, and it launches with Khana.", cta: "Meet Chai" };
}

export function RangeSection() {
  const { mode } = useCart();

  return (
    <section className="section section--gold section--bordered range" id="range">
      <div className="content">
        <div className="range__head">
          <p className="eyebrow">TWO POUCHES</p>
          <h2>One for the bowl. One for the mug.</h2>
          <p className="range__lede">
            Pick the pouch that matches what your family is making:{" "}
            <CopyHighlight>
              Khana for food, Chai for drinks
            </CopyHighlight>.
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
