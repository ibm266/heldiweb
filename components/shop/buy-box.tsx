"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { useCart } from "@/components/cart/cart-context";
import { useWaitlistPopup } from "@/components/waitlist-popup";
import {
  POUCH_THUMB,
  SAMPLE_SKU,
  SAMPLE_VARIANT_ID,
  SAMPLE_VARIANT_IDS,
  SERVINGS_PER_POUCH,
  SERVINGS_PER_SAMPLE,
  TIER_VARIANT_IDS,
  displayPrice,
  imageForCounts,
  includedItemsForPouches,
  mixSku
} from "@/lib/commerce/catalog";
import {
  formatMoney,
  formatPence,
  moneyToPence,
  penceToMoney
} from "@/lib/commerce/money";
import type { IncludedItem, Product, ProductVariant } from "@/lib/commerce/types";
import {
  FOUNDERS,
  SHIPPING,
  TIER_ORDER,
  bundleSavingPence,
  isGiftingCode,
  ladderPence,
  rrpPence,
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
  const [pouchQty, setPouchQty] = useState(1);
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

  // The tier variants are only still read for the gallery and the Sample; the
  // pouch price now comes from the ladder, not from a variant.
  const selectedVariant = isPouch ? tierVariants.get("single")! : sampleVariant;
  // Waitlist mode keeps the whole PDP browsable but shows no money at all:
  // no prices, no strikethroughs, no savings, no shipping rates.
  const showPrices = mode === "live";

  function selectSize(pouch: boolean) {
    setIsPouch(pouch);
    setImageOverride(null);
  }

  function selectQty(qty: number) {
    setPouchQty(qty);
    setImageOverride(null);
    // The event name and its `tier` prop are load-bearing (PLAYBOOK §7): the
    // dashboard tile reads `tier`, so it keeps the name and carries the mix
    // SKU instead of a tier id.
    track("tier_selected", { tier: mixSku(qty, 0), pouches: qty });
  }

  // Gallery indexes 0-2 are the single/pair/full-table bundles, index 3 is
  // the Sample; the image follows the selection unless a thumb was
  // clicked.
  const autoImageIndex = isPouch ? pouchQty - 1 : product.images.length - 1;
  const shownIndex = imageOverride ?? autoImageIndex;
  const mainImage = product.images[shownIndex] ?? product.images[0];

  // Pouch money comes from the LADDER, never from a variant. The tier
  // variants are still in the store until launch day and are still priced at
  // the retired July launch prices, so reading them here quoted £30 on the
  // CTA for a pouch that now costs £35, and struck £35 through against it:
  // exactly the fabricated former price the Rrp helper above exists to
  // prevent. The variants survive only for the gallery and the Sample.
  const sampleSingle = displayPrice(sampleVariant, 1);
  const pouchPricePence = ladderPence(pouchQty);
  const selectedCurrent = isPouch
    ? penceToMoney(pouchPricePence)
    : sampleSingle.current;
  const included: IncludedItem[] = isPouch
    ? includedItemsForPouches(pouchQty)
    : [];

  // The price callout describes whichever image is on screen. Gallery slots 0
  // and 1 are one and two pouches; anything beyond is the Sample.
  const annoPouches = shownIndex < 2 ? shownIndex + 1 : null;

  // "Orders under £40 ship for £3.55." only applies to One pouch; every
  // other selection clears the threshold or ships free anyway. Waitlist
  // mode says why there is no price on the page instead.
  const shippingNote = !showPrices
    ? `Prices arrive when the shop opens. The waitlist hears first, and the first ${FOUNDERS.firstJoiners} on it get ${FOUNDERS.percent}% off.`
    : isPouch && ladderPence(pouchQty) < SHIPPING.freeOverPence
      ? `Orders under ${formatPence(SHIPPING.freeOverPence)} ship for ${formatPence(SHIPPING.standardPence)}.`
      : "Ships free.";

  async function handleAdd() {
    const giftingApplied = (cart?.discountCodes ?? []).some(
      (entry) => entry.applicable && isGiftingCode(entry.code)
    );
    // Pouches are counts, not lines: the cart resolves the running total to
    // the one mix variant that encodes it. A refusal (over the cap) returns
    // false and the drawer says why, so the event below does not fire.
    const added = isPouch
      ? await addPouches({ khana: pouchQty })
      // The NEW samples product, not the sachet variant on "Heldi Khana":
      // that product is archived on launch day and the add would start
      // failing with a generic cart error.
      : await addItem(SAMPLE_VARIANT_IDS[SAMPLE_SKU], 1);

    // Everything below is contingent on the write landing. Previously the
    // event fired before the mutation and the button flashed "Added"
    // regardless, so a failed add was counted as a conversion in PostHog and
    // confirmed to the shopper. The drawer shows the error instead.
    if (!added) return;

    track("add_to_cart", {
      product: product.handle,
      format: isPouch ? "pouch" : "sample",
      ...(isPouch
        ? { tier: mixSku(pouchQty, 0), pouches_added: pouchQty, khana: pouchQty, chai: 0 }
        : {}),
      value: (isPouch ? pouchPricePence : moneyToPence(sampleSingle.current)) / 100,
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
                {annoPouches !== null ? (
                  <>
                    {bundleSavingPence(annoPouches) > 0 ? (
                      <Rrp>{formatPence(rrpPence(annoPouches))}</Rrp>
                    ) : null}
                    {formatPence(ladderPence(annoPouches))}
                  </>
                ) : (
                  formatMoney(sampleSingle.current)
                )}
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

        {/* The launch-price block is gone with launch pricing (plan P2, revised
            4 Sep). The price is the price; the only thing struck through is the
            RRP on a pair, which is a real comparison because a single pouch
            genuinely sells at £35. */}

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
            {/* One pouch is £35 and £35 is the RRP, so there is nothing to
                strike. The saving lives on the two-pouch card below. */}
            {showPrices ? (
              <span className="option-card__price">{formatPence(ladderPence(1))}</span>
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
              HOW MANY: <strong>{pouchQty === 1 ? "ONE POUCH" : "TWO POUCHES"}</strong>
            </p>
            <div className="option-grid option-grid--pair">
              {[1, 2].map((qty) => {
                const price = ladderPence(qty);
                const rrp = rrpPence(qty);
                const saving = bundleSavingPence(qty);
                const perMealPence = Math.round(price / (qty * SERVINGS_PER_POUCH));
                return (
                  <label key={qty} className={`option-card${pouchQty === qty ? " is-selected" : ""}`}>
                    <input
                      type="radio"
                      name="bundle"
                      value={qty}
                      checked={pouchQty === qty}
                      onChange={() => selectQty(qty)}
                    />
                    <Image
                      className="option-card__img"
                      src={imageForCounts(qty, 0).url}
                      alt=""
                      width={56}
                      height={56}
                      sizes="56px"
                    />
                    <span className="option-card__name">
                      {qty === 1 ? "One pouch" : "Two pouches"}
                    </span>
                    {showPrices ? (
                      <>
                        <span className="option-card__meta">
                          {formatPence(perMealPence)} a meal
                        </span>
                        <span className="option-card__price">
                          {/* Struck through only where there is a real saving.
                              At one pouch the RRP IS the price, so striking it
                              would be inventing a discount. */}
                          {saving > 0 ? <Rrp>{formatPence(rrp)}</Rrp> : null}
                          {formatPence(price)}
                        </span>
                        {saving > 0 ? (
                          <span className="option-card__save">
                            Save {formatPence(saving)}
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="option-card__meta">
                        {qty * SERVINGS_PER_POUCH} meals
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
                <span>{pouchQty} × 300g pouch{pouchQty > 1 ? "es" : ""}</span>
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
            {justAdded ? "Added" : isPending ? "Adding…" : `Add to basket — ${formatMoney(selectedCurrent)}`}
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
