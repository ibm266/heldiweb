"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { useWaitlistPopup } from "@/components/waitlist-popup";
import { track } from "@/lib/analytics";
import { WAITLIST_OFFER } from "@/lib/pricing";
import { ChaiAccordions } from "./chai-accordions";
import {
  CHAI_ALLERGENS,
  CHAI_DRINKS,
  CHAI_IMAGES,
  CHAI_LEGAL_NAME,
  CHAI_METHOD,
  CHAI_MUGS_PER_POUCH,
  CHAI_NUTRITION,
  CHAI_PILLS,
  CHAI_POUCH_GRAMS,
  CHAI_PROTEIN_MARKETING_GRAMS,
  CHAI_SERVING_GRAMS,
  CHAI_SERVING_SPOON
} from "./chai-data";
import { NutritionModal } from "./nutrition-modal";
import { StatutoryStatements } from "./statutory-statements";

// The Chai product page's gallery and buy column.
//
// This is deliberately NOT the Khana <BuyBox />. That component resolves its
// variants through TIER_VARIANT_IDS and SAMPLE_VARIANT_ID, which are single
// Khana constants in lib/commerce/catalog.ts, and it renders null for any
// product that does not carry those four Shopify GIDs. Chai has no price
// ladder, no SKUs and no Shopify product yet (NEXT_STEPS.md §1b), so there is
// nothing to select and nothing to add to a basket. Forcing Chai into the
// tier model early would be worse than duplicating a layout: the cart repacks
// pouch counts with packPouches(), which has no product dimension, so one
// Khana plus one Chai would repack into a pair of Khana.
//
// When Chai does get a price ladder, the two buy boxes merge into one
// product-driven component. Until then the shared pieces (the accordion
// shell, the statutory block, the CSS) are shared and only the selectors,
// which Chai does not have, are not.
export function ChaiBuyBox() {
  const [shownIndex, setShownIndex] = useState(0);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const { mode } = useCart();
  const { open: openWaitlist } = useWaitlistPopup();
  const viewTracked = useRef(false);

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    track("view_item", { product: "chai", mode });
  }, [mode]);

  const mainImage = CHAI_IMAGES[shownIndex] ?? CHAI_IMAGES[0];

  return (
    <div className="pdp">
      <div className="pdp__gallery">
        <div className="pdp__hero-image">
          <Image
            src={mainImage.url}
            alt={mainImage.altText}
            width={800}
            height={800}
            priority
            sizes="(max-width: 899px) 100vw, 480px"
          />
        </div>
        <div className="pdp__thumbs">
          {CHAI_IMAGES.map((image, index) => (
            <button
              key={image.url}
              type="button"
              className={`pdp__thumb${index === shownIndex ? " is-active" : ""}`}
              aria-label={`View image ${index + 1}`}
              onClick={() => setShownIndex(index)}
            >
              <Image src={image.url} alt="" width={68} height={68} sizes="68px" />
            </button>
          ))}
        </div>
      </div>

      <div className="pdp__buy">
        <p className="eyebrow">THE CHAI POUCH</p>
        <h1 className="pdp__title">Heldi Chai</h1>
        {/* The descriptive legal name, which FIC Reg 1169/2011 requires next
            to the brand name so a shopper knows what the product actually is.
            It also discharges the "food supplement" designation at the top of
            the page rather than only in the block at the bottom. */}
        <p className="pdp__legal-name">{CHAI_LEGAL_NAME}</p>
        <p className="pdp__lede">Protein that disappears into your chai.</p>

        <button
          type="button"
          className="pdp__nutrition-link"
          onClick={() => setNutritionOpen(true)}
        >
          Nutrition &amp; amino acids <b aria-hidden="true">→</b>
        </button>
        {nutritionOpen ? (
          <NutritionModal onClose={() => setNutritionOpen(false)} product={CHAI_NUTRITION} />
        ) : null}

        <ul className="pdp__pills" aria-label="Product attributes">
          {CHAI_PILLS.map((pill) => (
            <li key={pill.label} className="pdp__pill">
              <Image
                className="pdp__pill-icon"
                src={pill.icon}
                alt=""
                width={pill.width}
                height={pill.height}
                sizes="34px"
                aria-hidden="true"
              />
              {pill.label}
            </li>
          ))}
        </ul>

        <p className="pdp__group-label">
          HOW IT GOES IN: <strong>THREE STEPS</strong>
        </p>
        {/* role="list" because list-style:none drops list semantics in
            Safari/VoiceOver. No step numbers: the pack has none either, the
            drawings and the eyebrow carry the sequence. The art is decorative
            (its title sits beside it), so alt is empty. */}
        <ol className="pdp__method" role="list">
          {CHAI_METHOD.map((step) => (
            <li key={step.title} className="pdp__method-step">
              <span className="pdp__method-art" aria-hidden="true">
                <Image
                  src={step.art.src}
                  alt=""
                  width={step.art.width}
                  height={step.art.height}
                  sizes="(max-width: 899px) 64px, 200px"
                />
              </span>
              <span className="pdp__method-text">
                <span className="pdp__method-title">{step.title}</span>
                <span className="pdp__method-body">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="pdp__includes">
          <p className="pdp__includes-title">In the pouch:</p>
          <div className="pdp__includes-row">
            <Image
              className="pdp__includes-img"
              src="/images/shop/chai-pouch-solo.webp?v=2"
              alt=""
              width={28}
              height={28}
              sizes="28px"
            />
            <span>
              1 × {CHAI_POUCH_GRAMS}g pouch, about {CHAI_MUGS_PER_POUCH} mugs
            </span>
          </div>
          <p className="pdp__includes-note">
            One {CHAI_SERVING_SPOON} ({CHAI_SERVING_GRAMS}g) a mug,{" "}
            {CHAI_PROTEIN_MARKETING_GRAMS}g of protein. Good in{" "}
            {CHAI_DRINKS.slice(0, -1).join(", ").toLowerCase()} and{" "}
            {CHAI_DRINKS[CHAI_DRINKS.length - 1].toLowerCase()}.
          </p>
        </div>

        {/* Chai is not in the catalogue in either mode, so there is no
            add-to-basket path. In waitlist mode the CTA joins the list; once
            the shop is live the popup is a no-op by design, so the button
            becomes a link to the product that is actually on sale. */}
        {mode === "live" ? (
          <Link className="pdp__cta" href="/shop">
            Shop Heldi Khana
          </Link>
        ) : (
          <button
            type="button"
            className="pdp__cta"
            data-floating-cta-suppress
            onClick={() => openWaitlist("popup-shop-chai")}
          >
            Join waitlist
          </button>
        )}

        <p className="pdp__promise">
          {mode === "live"
            ? "Chai is not in the shop yet. Khana is, and it is the same spoonful for the food rather than the drink."
            : `Chai comes after Khana. The waitlist hears first, with ${WAITLIST_OFFER.percent}% off the first order.`}
        </p>

        <StatutoryStatements
          servingGrams={CHAI_SERVING_GRAMS}
          spoon={CHAI_SERVING_SPOON}
          allergens={CHAI_ALLERGENS}
          className="pdp__disclaimer"
        />

        <div className="pdp__desc">
          <p>
            <strong>One spoonful, stirred in at the end.</strong> Heldi Chai
            is a high-protein blend made for the hot drinks you already make.
            Stir it into <strong>chai, tea, coffee or hot chocolate</strong>{" "}
            once the pot is off the boil, and the cup still tastes like your
            cup: no chalk, no aftertaste, no shaker on the draining board.{" "}
            <strong>High in protein</strong>: {CHAI_PROTEIN_MARKETING_GRAMS}g
            in every mug, and protein contributes to the
            maintenance of muscle mass. Contains{" "}
            <strong>milk</strong> (whey and casein). New to Heldi?{" "}
            <a href="/truth">Start with the honest truth about protein</a>, or{" "}
            <a href="/shop">meet Khana</a>, the blend for the food rather than
            the drink.
          </p>
        </div>

        <ChaiAccordions />
      </div>
    </div>
  );
}
