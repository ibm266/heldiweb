"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { useCart } from "@/components/cart/cart-context";
import {
  POUCH_THUMB,
  SAMPLE_VARIANT_ID,
  SERVINGS_PER_POUCH,
  SERVINGS_PER_SAMPLE,
  TIER_VARIANT_IDS,
  displayPrice,
  includedItemsForQuantity
} from "@/lib/commerce/catalog";
import { formatMoney, formatPence, moneyToPence } from "@/lib/commerce/money";
import type { IncludedItem, Product, ProductVariant } from "@/lib/commerce/types";
import {
  FEATURED_TIER,
  SHIPPING,
  TIERS,
  TIER_ORDER,
  isGiftingCode,
  tierSavingsPence,
  type TierId
} from "@/lib/pricing";
import { GiftingPopup } from "./gifting-popup";
import { NutritionModal } from "./nutrition-modal";
import { PdpReviewTeasers } from "./pdp-review-teasers";
import { ProductAccordions } from "./product-accordions";

// The family-discount popup shows after the first add-to-basket of a
// session, and never once a gifting code is already on the cart.
const GIFTING_POPUP_SEEN_KEY = "heldi_gifting_popup_seen";

const PDP_PILLS: { icon: string; label: string; width: number; height: number }[] = [
  { icon: "/images/pouch-badges/high-protein.png", label: "High protein", width: 256, height: 256 },
  { icon: "/images/pouch-badges/all-natural.png", label: "All natural", width: 256, height: 256 },
  { icon: "/images/pouch-badges/lactose-free.png", label: "99% lactose-free", width: 280, height: 377 },
  { icon: "/images/pouch-badges/no-sugar.png", label: "No added sugar", width: 386, height: 390 },
  { icon: "/images/pouch-badges/gluten-free.png", label: "Gluten free", width: 328, height: 225 },
  { icon: "/images/pouch-badges/vegetarian.png", label: "Vegetarian", width: 286, height: 367 }
];

export function BuyBox({ product }: { product: Product }) {
  const [isPouch, setIsPouch] = useState(true);
  const [tierId, setTierId] = useState<TierId>("single");
  const [imageOverride, setImageOverride] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [giftingPopupOpen, setGiftingPopupOpen] = useState(false);
  const { cart, mode, addItem, isPending } = useCart();

  const tierVariants = new Map<TierId, ProductVariant>();
  for (const id of TIER_ORDER) {
    const variant = product.variants.find((entry) => entry.id === TIER_VARIANT_IDS[id]);
    if (variant) tierVariants.set(id, variant);
  }
  const sampleVariant = product.variants.find((variant) => variant.id === SAMPLE_VARIANT_ID);
  if (tierVariants.size !== TIER_ORDER.length || !sampleVariant) return null;

  const tier = TIERS[tierId];
  const selectedVariant = isPouch ? tierVariants.get(tierId)! : sampleVariant;

  function selectSize(pouch: boolean) {
    setIsPouch(pouch);
    setImageOverride(null);
  }

  function selectTier(id: TierId) {
    setTierId(id);
    setImageOverride(null);
    track("tier_selected", { tier: id });
  }

  // Gallery indexes 0-2 are the single/pair/full-table bundles, index 3 is
  // the Sample Trio; the image follows the selection unless a thumb was
  // clicked.
  const autoImageIndex = isPouch ? TIER_ORDER.indexOf(tierId) : product.images.length - 1;
  const shownIndex = imageOverride ?? autoImageIndex;
  const mainImage = product.images[shownIndex] ?? product.images[0];

  const pouchSingle = displayPrice(tierVariants.get("single")!, 1);
  const sampleSingle = displayPrice(sampleVariant, 1);
  const selected = displayPrice(selectedVariant, 1);
  const included: IncludedItem[] = isPouch
    ? includedItemsForQuantity(selectedVariant, 1)
    : [];

  // The price callout describes whichever image is on screen; prices always
  // come from the catalog (launch price with the RRP struck).
  const annoTier = shownIndex < 3 ? TIER_ORDER[shownIndex] : null;
  const annoPrice = annoTier
    ? displayPrice(tierVariants.get(annoTier)!, 1)
    : sampleSingle;

  // "Orders under £40 ship for £3.55." only applies to One pouch; every
  // other selection clears the threshold or ships free anyway.
  const shippingNote =
    isPouch && tierId === "single"
      ? `Orders under ${formatPence(SHIPPING.freeOverPence)} ship for ${formatPence(SHIPPING.standardPence)}.`
      : "Ships free.";

  async function handleAdd() {
    const giftingApplied = (cart?.discountCodes ?? []).some(
      (entry) => entry.applicable && isGiftingCode(entry.code)
    );
    await addItem(selectedVariant.id, 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
    if (!giftingApplied && !window.sessionStorage.getItem(GIFTING_POPUP_SEEN_KEY)) {
      window.sessionStorage.setItem(GIFTING_POPUP_SEEN_KEY, "1");
      setGiftingPopupOpen(true);
    }
  }

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
          <div className="pdp__annos" aria-hidden="true">
            <span className="pdp__anno pdp__anno--price">
              {annoPrice.compareAt ? <s>{formatMoney(annoPrice.compareAt)}</s> : null}
              {formatMoney(annoPrice.current)}
            </span>
          </div>
        </div>
        <div className="pdp__thumbs">
          {product.images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              className={`pdp__thumb${index === shownIndex ? " is-active" : ""}`}
              aria-label={`View image ${index + 1}`}
              onClick={() => setImageOverride(index)}
            >
              <img src={image.url} alt="" />
            </button>
          ))}
        </div>
      </div>

      <div className="pdp__buy">
        <p className="eyebrow">THE HELDI POUCH</p>
        <h1 className="pdp__title">Heldi Khana</h1>
        <p className="pdp__lede">{product.shortDescription}</p>

        <button
          type="button"
          className="pdp__nutrition-link"
          onClick={() => setNutritionOpen(true)}
        >
          Nutrition &amp; amino acids <b aria-hidden="true">→</b>
        </button>
        {nutritionOpen ? (
          <NutritionModal onClose={() => setNutritionOpen(false)} />
        ) : null}
        {giftingPopupOpen ? (
          <GiftingPopup onClose={() => setGiftingPopupOpen(false)} />
        ) : null}

        <ul className="pdp__pills" aria-label="Product attributes">
          {PDP_PILLS.map((pill) => (
            <li key={pill.label} className="pdp__pill">
              <Image
                className="pdp__pill-icon"
                src={pill.icon}
                alt=""
                width={pill.width}
                height={pill.height}
                aria-hidden="true"
              />
              {pill.label}
            </li>
          ))}
        </ul>

        <div className="pdp__launch">
          <p className="eyebrow">LAUNCH PRICES</p>
          <p className="pdp__launch-title">Launch prices. Not forever prices.</p>
        </div>

        <p className="pdp__group-label">
          SIZE: <strong>{isPouch ? "300G POUCH" : "SAMPLE TRIO"}</strong>
        </p>
        <div className="option-grid option-grid--size">
          <label className={`option-card option-card--slim${isPouch ? " is-selected" : ""}`}>
            <input
              type="radio"
              name="size"
              value="pouch"
              checked={isPouch}
              onChange={() => selectSize(true)}
            />
            <span className="option-card__name">300g pouch</span>
            <span className="option-card__meta">{SERVINGS_PER_POUCH} meals</span>
            <span className="option-card__price">
              {pouchSingle.compareAt ? <s>{formatMoney(pouchSingle.compareAt)}</s> : null}
              {formatMoney(pouchSingle.current)}
            </span>
          </label>
          <label className={`option-card option-card--slim${!isPouch ? " is-selected" : ""}`}>
            <input
              type="radio"
              name="size"
              value="sample"
              checked={!isPouch}
              onChange={() => selectSize(false)}
            />
            <span className="option-card__name">Sample Trio</span>
            <span className="option-card__meta">{SERVINGS_PER_SAMPLE} servings</span>
            <span className="option-card__price">
              {sampleSingle.compareAt ? <s>{formatMoney(sampleSingle.compareAt)}</s> : null}
              {formatMoney(sampleSingle.current)}
            </span>
          </label>
        </div>

        {isPouch ? (
          <>
            <p className="pdp__group-label">
              BUNDLE: <strong>{tier.name.toUpperCase()}</strong>
            </p>
            <div className="option-grid">
              {TIER_ORDER.map((id) => {
                const option = TIERS[id];
                const price = displayPrice(tierVariants.get(id)!, 1);
                const perMealPence = Math.round(
                  moneyToPence(price.current) / (option.pouches * SERVINGS_PER_POUCH)
                );
                return (
                  <label key={id} className={`option-card${tierId === id ? " is-selected" : ""}`}>
                    {id === FEATURED_TIER ? (
                      <span className="option-card__flag option-card__flag--gold">
                        MOST POPULAR
                      </span>
                    ) : null}
                    <input
                      type="radio"
                      name="bundle"
                      value={id}
                      checked={tierId === id}
                      onChange={() => selectTier(id)}
                    />
                    <img
                      className="option-card__img"
                      src={product.images[TIER_ORDER.indexOf(id)].url}
                      alt=""
                    />
                    <span className="option-card__name">{option.name}</span>
                    <span className="option-card__meta">
                      {formatPence(perMealPence)} per meal
                    </span>
                    <span className="option-card__price">
                      {price.compareAt ? <s>{formatMoney(price.compareAt)}</s> : null}
                      {formatMoney(price.current)}
                    </span>
                    <span className="option-card__save">
                      Save {formatPence(tierSavingsPence(id))}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="pdp__includes">
              <p className="pdp__includes-title">Includes:</p>
              <div className="pdp__includes-row">
                <img className="pdp__includes-img" src={POUCH_THUMB} alt="" />
                <span>{tier.pouches} × 300g pouch{tier.pouches > 1 ? "es" : ""}</span>
              </div>
              {included.map((item) => (
                <div className="pdp__includes-row" key={item.title}>
                  <img className="pdp__includes-img" src={item.image} alt="" />
                  <span>{item.title}</span>
                  <s>{formatPence(item.valuePence)}</s>
                  <strong>Free</strong>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {mode === "live" ? (
          <button type="button" className="pdp__cta" onClick={handleAdd} disabled={isPending}>
            {justAdded ? "Added" : isPending ? "Adding…" : `Add to basket — ${formatMoney(selected.current)}`}
          </button>
        ) : (
          <Link className="pdp__cta" href="/#join">
            Join waitlist
          </Link>
        )}

        <p className="pdp__promise">{shippingNote}</p>

        <PdpReviewTeasers />

        <div className="pdp__desc">
          <p>
            <strong>One pouch for the whole table.</strong> Heldi Khana is a
            high-protein blend made to disappear into the food you already
            cook. Stir it into <strong>dal, curry, sabzi or raita</strong> and
            the taste stays exactly where your family left it.{" "}
            <strong>High in protein</strong>, and protein contributes to the
            maintenance of muscle mass. Contains <strong>milk</strong> (whey).
            New to Heldi? <a href="/truth">Start with the honest truth about protein</a>.
          </p>
        </div>

        <ProductAccordions />
      </div>
    </div>
  );
}
