"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { useCart } from "@/components/cart/cart-context";
import { useWaitlistPopup } from "@/components/waitlist-popup";
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
  FOUNDERS,
  isGiftingCode,
  tierSavingsPence,
  type TierId
} from "@/lib/pricing";
import { GiftingPopup } from "./gifting-popup";
import {
  KHANA_NUTRITION, SERVING_GRAMS } from "./nutrition-data";
import { NutritionModal } from "./nutrition-modal";
import { PdpReviewTeasers } from "./pdp-review-teasers";
import { ProductAccordions } from "./product-accordions";
import { StatutoryStatements } from "./statutory-statements";

// The family-discount popup shows after the first add-to-basket of a
// session, and never once a gifting code is already on the cart.
const GIFTING_POPUP_SEEN_KEY = "heldi_gifting_popup_seen";

const PDP_PILLS: { icon: string; label: string; width: number; height: number }[] = [
  { icon: "/images/pouch-badges/high-protein.png", label: "High protein", width: 256, height: 256 },
  { icon: "/images/pouch-badges/all-natural.png", label: "All natural", width: 256, height: 256 },
  { icon: "/images/pouch-badges/lactose-free.png", label: "98% lactose-free", width: 280, height: 377 },
  { icon: "/images/pouch-badges/no-sugar.png", label: "No added sugar", width: 386, height: 390 },
  { icon: "/images/pouch-badges/gluten-free.png", label: "Gluten free", width: 328, height: 225 },
  { icon: "/images/pouch-badges/vegetarian.png", label: "Vegetarian", width: 286, height: 367 }
];

// A struck-through price has to say what it is. £35 has never been charged:
// it is the recommended retail price, not a price Heldi previously sold at.
// Under the DMCC Act 2024 a bare strikethrough invites the reader to assume a
// former price and is a misleading action if it never was one. Labelling it
// RRP is the whole fix, and it must stay wherever a compare-at is shown.
function Rrp({ children }: { children: React.ReactNode }) {
  return (
    <s>
      <span className="price-rrp-label">RRP</span> {children}
    </s>
  );
}

export function BuyBox({ product }: { product: Product }) {
  const [isPouch, setIsPouch] = useState(true);
  const [tierId, setTierId] = useState<TierId>("single");
  const [imageOverride, setImageOverride] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [giftingPopupOpen, setGiftingPopupOpen] = useState(false);
  const { cart, mode, addItem, addPouches, isPending } = useCart();
  const { open: openWaitlist } = useWaitlistPopup();
  const viewTracked = useRef(false);

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    track("view_item", { product: product.handle, mode });
  }, [mode, product.handle]);

  const tierVariants = new Map<TierId, ProductVariant>();
  for (const id of TIER_ORDER) {
    const variant = product.variants.find((entry) => entry.id === TIER_VARIANT_IDS[id]);
    if (variant) tierVariants.set(id, variant);
  }
  const sampleVariant = product.variants.find((variant) => variant.id === SAMPLE_VARIANT_ID);
  if (tierVariants.size !== TIER_ORDER.length || !sampleVariant) return null;

  const tier = TIERS[tierId];
  const selectedVariant = isPouch ? tierVariants.get(tierId)! : sampleVariant;
  // Waitlist mode keeps the whole PDP browsable but shows no money at all:
  // no prices, no strikethroughs, no savings, no shipping rates.
  const showPrices = mode === "live";

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
  // the Sample; the image follows the selection unless a thumb was
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
  // other selection clears the threshold or ships free anyway. Waitlist
  // mode says why there is no price on the page instead.
  const shippingNote = !showPrices
    ? `Prices arrive when the shop opens. The waitlist hears first, and the first ${FOUNDERS.firstJoiners} on it get ${FOUNDERS.percent}% off.`
    : isPouch && tierId === "single"
      ? `Orders under ${formatPence(SHIPPING.freeOverPence)} ship for ${formatPence(SHIPPING.standardPence)}.`
      : "Ships free.";

  async function handleAdd() {
    const giftingApplied = (cart?.discountCodes ?? []).some(
      (entry) => entry.applicable && isGiftingCode(entry.code)
    );
    // Pouch tiers add pouches, not lines: the cart repacks the running
    // total into the cheapest bundle mix, so a pouch on top of a pair
    // becomes the full table rather than two awkward lines.
    const added = isPouch
      ? await addPouches(tier.pouches)
      : await addItem(selectedVariant.id, 1);

    // Everything below is contingent on the write landing. Previously the
    // event fired before the mutation and the button flashed "Added"
    // regardless, so a failed add was counted as a conversion in PostHog and
    // confirmed to the shopper. The drawer shows the error instead.
    if (!added) return;

    track("add_to_cart", {
      product: product.handle,
      format: isPouch ? "pouch" : "sample",
      ...(isPouch ? { tier: tierId, pouches_added: tier.pouches } : {}),
      value: moneyToPence(selected.current) / 100,
      currency: "GBP"
    });
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
          {showPrices ? (
            <div className="pdp__annos" aria-hidden="true">
              <span className="pdp__anno pdp__anno--price">
                {annoPrice.compareAt ? <Rrp>{formatMoney(annoPrice.compareAt)}</Rrp> : null}
                {formatMoney(annoPrice.current)}
              </span>
            </div>
          ) : null}
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
              <Image src={image.url} alt="" width={68} height={68} sizes="68px" />
            </button>
          ))}
        </div>
      </div>

      <div className="pdp__buy">
        <p className="eyebrow">THE HELDI POUCH</p>
        <h1 className="pdp__title">Heldi Khana</h1>
        {/* The descriptive legal name, which FIC Reg 1169/2011 requires next to
            the brand name so a shopper knows what the product actually is. It
            also discharges the "food supplement" designation at the top of the
            page rather than only in the block at the bottom. */}
        <p className="pdp__legal-name">
          Whey protein isolate blend with warm spices. Food supplement.
        </p>
        <p className="pdp__lede">{product.shortDescription}</p>

        <button
          type="button"
          className="pdp__nutrition-link"
          onClick={() => setNutritionOpen(true)}
        >
          Nutrition &amp; amino acids <b aria-hidden="true">→</b>
        </button>
        {nutritionOpen ? (
          <NutritionModal onClose={() => setNutritionOpen(false)} product={KHANA_NUTRITION} />
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
                sizes="34px"
                aria-hidden="true"
              />
              {pill.label}
            </li>
          ))}
        </ul>

        {showPrices ? (
          <div className="pdp__launch">
            <p className="eyebrow">LAUNCH PRICES</p>
            <p className="pdp__launch-title">Launch prices. Not forever prices.</p>
          </div>
        ) : null}

        <p className="pdp__group-label">
          SIZE: <strong>{isPouch ? "300G POUCH" : "SAMPLE"}</strong>
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
            {showPrices ? (
              <span className="option-card__price">
                {pouchSingle.compareAt ? <Rrp>{formatMoney(pouchSingle.compareAt)}</Rrp> : null}
                {formatMoney(pouchSingle.current)}
              </span>
            ) : null}
          </label>
          <label className={`option-card option-card--slim${!isPouch ? " is-selected" : ""}`}>
            <input
              type="radio"
              name="size"
              value="sample"
              checked={!isPouch}
              onChange={() => selectSize(false)}
            />
            <span className="option-card__name">Sample</span>
            <span className="option-card__meta">{SERVINGS_PER_SAMPLE} servings</span>
            {showPrices ? (
              <span className="option-card__price">
                {sampleSingle.compareAt ? <Rrp>{formatMoney(sampleSingle.compareAt)}</Rrp> : null}
                {formatMoney(sampleSingle.current)}
              </span>
            ) : null}
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
                    {/* "BEST VALUE" is a price fact anyone can check against the
                        per-serving figures. The old "MOST POPULAR" was a claim
                        about what other customers buy, which is not something we
                        can evidence with zero orders. */}
                    {id === FEATURED_TIER ? (
                      <span className="option-card__flag option-card__flag--gold">
                        BEST VALUE
                      </span>
                    ) : null}
                    <input
                      type="radio"
                      name="bundle"
                      value={id}
                      checked={tierId === id}
                      onChange={() => selectTier(id)}
                    />
                    <Image
                      className="option-card__img"
                      src={product.images[TIER_ORDER.indexOf(id)].url}
                      alt=""
                      width={56}
                      height={56}
                      sizes="56px"
                    />
                    <span className="option-card__name">{option.name}</span>
                    {showPrices ? (
                      <>
                        <span className="option-card__meta">
                          {formatPence(perMealPence)} per meal
                        </span>
                        <span className="option-card__price">
                          {price.compareAt ? <Rrp>{formatMoney(price.compareAt)}</Rrp> : null}
                          {formatMoney(price.current)}
                        </span>
                        <span className="option-card__save">
                          {formatPence(tierSavingsPence(id))} below RRP
                        </span>
                      </>
                    ) : (
                      <span className="option-card__meta">
                        {option.pouches * SERVINGS_PER_POUCH} meals
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            <div className="pdp__includes">
              <p className="pdp__includes-title">Includes:</p>
              <div className="pdp__includes-row">
                <Image className="pdp__includes-img" src={POUCH_THUMB} alt="" width={28} height={28} sizes="28px" />
                <span>{tier.pouches} × 300g pouch{tier.pouches > 1 ? "es" : ""}</span>
              </div>
              {included.map((item) => (
                <div className="pdp__includes-row" key={item.title}>
                  <Image className="pdp__includes-img" src={item.image} alt="" width={28} height={28} sizes="28px" />
                  <span>{item.title}</span>
                  {showPrices ? (
                    <>
                      {/* Same rule as the pouch prices: the jar and dabba have
                          never been sold at these figures, so the struck value
                          is an RRP and has to say so. */}
                      <Rrp>{formatPence(item.valuePence)}</Rrp>
                      <strong>Free</strong>
                    </>
                  ) : null}
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
          <button type="button" className="pdp__cta" data-floating-cta-suppress onClick={() => openWaitlist("popup-shop")}>
            Join waitlist
          </button>
        )}

        <p className="pdp__promise">{shippingNote}</p>

        <PdpReviewTeasers />

        <StatutoryStatements
          servingGrams={SERVING_GRAMS}
          allergens="Contains milk (whey)."
          className="pdp__disclaimer"
        />

        <div className="pdp__desc">
          <p>
            <strong>One pouch for the whole table.</strong> Heldi Khana is a
            high-protein blend made to disappear into the food you already
            cook. Stir it into <strong>dal, curry, sabzi or raita</strong> and
            the taste stays exactly where your family left it.{" "}
            <strong>High in protein</strong>, and protein contributes to the
            maintenance of muscle mass. Contains <strong>milk</strong> (whey).
            New to Heldi? <a href="/truth">Start with the honest truth about protein</a>.
            Making chai rather than dal? <a href="/shop/chai">Meet Heldi Chai</a>,
            the blend for the mug.
          </p>
        </div>

        <ProductAccordions />
      </div>
    </div>
  );
}
