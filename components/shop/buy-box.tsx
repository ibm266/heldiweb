"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import {
  KHANA_VARIANT_ID,
  POUCH_THUMB,
  SAMPLE_VARIANT_ID,
  SERVINGS_PER_POUCH,
  SERVINGS_PER_SAMPLE,
  displayPrice,
  giftsForQuantity
} from "@/lib/commerce/catalog";
import { SALE } from "@/lib/commerce/config";
import { formatMoney, formatPence, moneyToPence, penceToMoney } from "@/lib/commerce/money";
import type { GiftItem, Product } from "@/lib/commerce/types";
import { NutritionModal } from "./nutrition-modal";
import { ProductAccordions } from "./product-accordions";

const PDP_PILLS: { icon: string; label: string; width: number; height: number }[] = [
  { icon: "/images/pouch-badges/high-protein.png", label: "High protein", width: 256, height: 256 },
  { icon: "/images/pouch-badges/all-natural.png", label: "All natural", width: 256, height: 256 },
  { icon: "/images/pouch-badges/lactose-free.png", label: "99% lactose-free", width: 280, height: 377 },
  { icon: "/images/pouch-badges/no-sugar.png", label: "No added sugar", width: 386, height: 390 },
  { icon: "/images/pouch-badges/gluten-free.png", label: "Gluten free", width: 328, height: 225 },
  { icon: "/images/pouch-badges/vegetarian.png", label: "Vegetarian", width: 286, height: 367 }
];

const QUANTITY_OPTIONS = [1, 2, 3] as const;

export function BuyBox({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(KHANA_VARIANT_ID);
  const [quantity, setQuantity] = useState(1);
  const [imageOverride, setImageOverride] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const { mode, addItem, isPending } = useCart();

  const pouchVariant = product.variants.find((variant) => variant.id === KHANA_VARIANT_ID);
  const sampleVariant = product.variants.find((variant) => variant.id === SAMPLE_VARIANT_ID);
  if (!pouchVariant || !sampleVariant) return null;

  const isPouch = variantId === KHANA_VARIANT_ID;
  const currentVariant = isPouch ? pouchVariant : sampleVariant;

  function selectVariant(id: string) {
    setVariantId(id);
    setImageOverride(null);
  }

  function selectQuantity(n: number) {
    setQuantity(n);
    setImageOverride(null);
  }

  const autoImageIndex = isPouch ? quantity - 1 : product.images.length - 1;
  const shownIndex = imageOverride ?? autoImageIndex;
  const mainImage = product.images[shownIndex] ?? product.images[0];

  const pouchSingle = displayPrice(pouchVariant, 1);
  const sampleSingle = displayPrice(sampleVariant, 1);
  const selected = displayPrice(currentVariant, isPouch ? quantity : 1);
  const gifts: GiftItem[] = isPouch ? giftsForQuantity(pouchVariant, quantity) : [];

  // Callouts describe whichever image is on screen: gallery indexes 0-2 are
  // the 1/2/3-pouch bundles, index 3 is the sample sachet.
  const annoQuantity = shownIndex < 3 ? shownIndex + 1 : null;
  const annoPrice = annoQuantity
    ? displayPrice(pouchVariant, annoQuantity)
    : sampleSingle;
  const annoGifts: GiftItem[] = annoQuantity
    ? giftsForQuantity(pouchVariant, annoQuantity)
    : [];

  async function handleAdd() {
    await addItem(variantId, isPouch ? quantity : 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
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
            {annoGifts.length > 0 ? (
              <span className="pdp__anno-stack">
                {annoGifts.map((gift) => (
                  <span className="pdp__anno" key={gift.title}>
                    {gift.title} <s>{formatPence(gift.valuePence)}</s>{" "}
                    <strong>Free</strong>
                  </span>
                ))}
              </span>
            ) : null}
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

        <p className="pdp__group-label">
          SIZE: <strong>{currentVariant.title}</strong>
        </p>
        <div className="option-grid option-grid--size">
          <label className={`option-card option-card--slim${isPouch ? " is-selected" : ""}`}>
            <input
              type="radio"
              name="size"
              value={KHANA_VARIANT_ID}
              checked={isPouch}
              onChange={() => selectVariant(KHANA_VARIANT_ID)}
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
              value={SAMPLE_VARIANT_ID}
              checked={!isPouch}
              onChange={() => selectVariant(SAMPLE_VARIANT_ID)}
            />
            <span className="option-card__name">Sample sachet</span>
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
              QUANTITY: <strong>{quantity} {quantity > 1 ? "POUCHES" : "POUCH"}</strong>
            </p>
            <div className="option-grid">
              {QUANTITY_OPTIONS.map((n) => {
                const price = displayPrice(pouchVariant, n);
                const perMealPence = Math.round(
                  moneyToPence(price.current) / (n * SERVINGS_PER_POUCH)
                );
                const savePence = price.compareAt
                  ? moneyToPence(price.compareAt) - moneyToPence(price.current)
                  : 0;
                return (
                  <label key={n} className={`option-card${quantity === n ? " is-selected" : ""}`}>
                    {savePence > 0 ? (
                      <span className="option-card__flag">SAVE {formatMoney(penceToMoney(savePence))}</span>
                    ) : null}
                    <input
                      type="radio"
                      name="quantity"
                      value={n}
                      checked={quantity === n}
                      onChange={() => selectQuantity(n)}
                    />
                    <img className="option-card__img" src={product.images[n - 1].url} alt="" />
                    <span className="option-card__name">{n} pouch{n > 1 ? "es" : ""}</span>
                    <span className="option-card__meta">{formatPence(perMealPence)} per meal</span>
                    <span className="option-card__price">
                      {price.compareAt ? <s>{formatMoney(price.compareAt)}</s> : null}
                      {formatMoney(price.current)}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="pdp__includes">
              <p className="pdp__includes-title">Includes:</p>
              <div className="pdp__includes-row">
                <img className="pdp__includes-img" src={POUCH_THUMB} alt="" />
                <span>{quantity} × 300g pouch{quantity > 1 ? "es" : ""}</span>
              </div>
              {gifts.map((gift) => (
                <div className="pdp__includes-row" key={gift.title}>
                  <img className="pdp__includes-img" src={gift.image} alt="" />
                  <span>
                    {gift.title}
                    {gift.note ? (
                      <>
                        {" "}
                        <span className="pdp__includes-note">({gift.note})</span>
                      </>
                    ) : null}
                  </span>
                  <s>{formatPence(gift.valuePence)}</s>
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
          <a className="pdp__cta" href="/#join">
            Join waitlist
          </a>
        )}

        {SALE.active ? (
          <p className="pdp__sale-note">
            {SALE.label}: {SALE.percent}% off everything
          </p>
        ) : null}

        <p className="pdp__promise">
          <strong>Free UK shipping</strong> over £40 · Royal Mail Tracked 48 · Free jar with your first order
        </p>

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
