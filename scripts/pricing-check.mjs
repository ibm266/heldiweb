// Asserts the agreed rate card against lib/pricing.ts.
//
// The module computes the numbers; this file states the ones that were agreed.
// If they disagree, either someone changed a parameter (and the rate card, the
// Price Book, BRAND.md §11.3 and the 27 Shopify variant prices all have to move
// with it) or something is wrong. Either way the build should stop.
//
// Run: npm run pricing-check
//
// There is no test runner in this repo, so this is a plain script that reads
// the real TypeScript source through Node's type stripping. It cannot drift
// from the site, because it imports exactly what the site imports.

import { readFileSync } from "node:fs";
import {
  RRP_PENCE,
  BUNDLE_DISCOUNT_PENCE,
  MAX_POUCHES,
  PAIR_PENCE,
  SAMPLE_PRICE_PENCE,
  SAMPLE_PAIR_DISCOUNT_PENCE,
  SHIPPING,
  GIFTING,
  FOUNDERS,
  WELCOME_POSTAGE,
  rrpPence,
  ladderPence,
  bundleSavingPence,
  perPouchPence,
  nextPouchPence,
  giftingDiscountPence,
  foundersDiscountPence,
  isGiftingCode,
  isFoundersCode,
  isWelcomeCode,
  isProductDiscountCode,
  samplePairPence,
  samplePairRrpPence,
  presentsForPouches,
  giftCountsForPouches
} from "../lib/pricing.ts";
import { SERVING_GRAMS } from "../components/shop/nutrition-data.ts";
import { CHAI_SERVING_GRAMS } from "../components/shop/chai-data.ts";

// Mirrors SAMPLE_GRAMS in lib/commerce/catalog.ts, which this script cannot
// import because that module resolves through the "@/" alias. Change both.
const SAMPLE_GRAMS = 30;

let failures = 0;
const f = (pence) => `£${(pence / 100).toFixed(2)}`;

function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  const shown = typeof expected === "number" ? f(expected) : expected;
  const got = typeof actual === "number" ? f(actual) : actual;
  console.log(`${ok ? "  ok  " : "  FAIL"} ${label}${ok ? "" : `  expected ${shown}, got ${got}`}`);
}

function throws(label, fn) {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) failures++;
  console.log(`${threw ? "  ok  " : "  FAIL"} ${label}${threw ? "" : "  did not throw"}`);
}

// --- The parameters ---------------------------------------------------------
console.log("\n== Parameters ==");
check("RRP, one pouch", RRP_PENCE, 3500);
check("bundle discount per extra pouch", BUNDLE_DISCOUNT_PENCE, 500);
check("basket ceiling", MAX_POUCHES, 24);
check("one sachet", SAMPLE_PRICE_PENCE, 500);
check("pair pack discount", SAMPLE_PAIR_DISCOUNT_PENCE, 200);

// --- The ladder -------------------------------------------------------------
// The agreed rate card. Khana and Chai priced identically, counted together.
// A basket is packed into pair variants plus at most one single, so the price
// is £65 a pair and £35 for an odd one. The old `RRP*n - discount*(n-1)`
// formula gave £95 at three, which no combination of the five variants Shopify
// holds can actually charge.
const CARD = [
  //  n    RRP     price   saving  per pouch
  [1, 3500, 3500, 0, 3500],
  [2, 7000, 6500, 500, 3250],
  [3, 10500, 10000, 500, 3333],
  [4, 14000, 13000, 1000, 3250],
  [5, 17500, 16500, 1000, 3300],
  [6, 21000, 19500, 1500, 3250],
  [24, 84000, 78000, 6000, 3250]
];

console.log("\n== The ladder ==");
for (const [n, rrp, price, saving, perPouch] of CARD) {
  check(`${n} pouch${n === 1 ? "" : "es"}: RRP`, rrpPence(n), rrp);
  check(`${n} pouch${n === 1 ? "" : "es"}: price`, ladderPence(n), price);
  check(`${n} pouch${n === 1 ? "" : "es"}: bundle saving`, bundleSavingPence(n), saving);
  check(`${n} pouch${n === 1 ? "" : "es"}: per pouch`, perPouchPence(n), perPouch);
}
check("empty basket is free", ladderPence(0), 0);
check("first pouch costs RRP", nextPouchPence(0), 3500);
// Adding one alternates, because pouches are sold in pairs: £30 completes a
// pair, £35 opens the next one.
for (let n = 1; n < MAX_POUCHES; n++) {
  const expected = n % 2 === 1 ? 3000 : 3500;
  check(`pouch ${n + 1} costs ${expected === 3000 ? "£30" : "£35"}`, nextPouchPence(n), expected);
}
// The price must never be something the five Shopify variants cannot add up to.
for (let n = 1; n <= MAX_POUCHES; n++) {
  const pairs = Math.floor(n / 2);
  const singles = n % 2;
  check(
    `${n} pouches is ${pairs} pair line(s) plus ${singles} single`,
    ladderPence(n),
    PAIR_PENCE * pairs + RRP_PENCE * singles
  );
}

console.log("\n== The ceiling refuses, it does not clamp ==");
throws(`${MAX_POUCHES + 1} pouches has no price`, () => ladderPence(MAX_POUCHES + 1));
throws("a negative basket has no price", () => ladderPence(-1));
throws("half a pouch has no price", () => ladderPence(1.5));
throws(`no pouch after ${MAX_POUCHES}`, () => nextPouchPence(MAX_POUCHES));

// --- Discount codes ---------------------------------------------------------
console.log("\n== Discount codes ==");
check("family rate", GIFTING.percent, 15);
check("founders rate", FOUNDERS.percent, 25);
check("founders offered to the first N joiners", FOUNDERS.firstJoiners, 100);

// Every step lands on a whole penny at both rates, so nothing rounds away.
const FAMILY = { 1: 2975, 2: 5525, 3: 8500, 4: 11050 };
const FOUNDERS_CARD = { 1: 2625, 2: 4875, 3: 7500, 4: 9750 };
for (let n = 1; n <= MAX_POUCHES; n++) {
  const price = ladderPence(n);
  if (FAMILY[n]) check(`${n} at 15%`, price - giftingDiscountPence(price), FAMILY[n]);
  if (FOUNDERS_CARD[n]) check(`${n} at 25%`, price - foundersDiscountPence(price), FOUNDERS_CARD[n]);
  check(`${n} at 15% is a whole penny`, Number.isInteger(price * 0.85), true);
  check(`${n} at 25% is a whole penny`, Number.isInteger(price * 0.75), true);
}

console.log("\n== Code classification ==");
for (const code of ["ACHABETA", "RISHTA", "SHABASH"]) {
  check(`${code} is a family code`, isGiftingCode(code), true);
  check(`${code} is a product discount`, isProductDiscountCode(code), true);
  check(`${code} is not a shipping discount`, isWelcomeCode(code), false);
}
check("a founders code is recognised", isFoundersCode(`${FOUNDERS.friendPrefix}MIHIR`), true);
check("a founders code is a product discount", isProductDiscountCode(`${FOUNDERS.friendPrefix}MIHIR`), true);
check("the welcome code is not a product discount", isProductDiscountCode(WELCOME_POSTAGE.code), false);
check("the welcome code is a shipping discount", isWelcomeCode(WELCOME_POSTAGE.code), true);
check("codes are case insensitive", isGiftingCode("achabeta"), true);
check("PEHLEAAP is not a live code", isProductDiscountCode("PEHLEAAP"), false);

// --- Shipping ---------------------------------------------------------------
console.log("\n== Shipping ==");
// These two must equal the live Shopify shipping profile. Verified 4 Sep 2026
// against real Storefront delivery quotes: £45 is charged, £50 is not.
check("free-postage threshold", SHIPPING.freeOverPence, 5000);
check("Tracked 48", SHIPPING.standardPence, 499);
check("one pouch pays postage", ladderPence(1) < SHIPPING.freeOverPence, true);

// At the old £40 threshold a pouch plus a sachet cleared it exactly and every
// pair cleared it however it was discounted. Neither is true at £50, and these
// assert the new shape rather than the one we wish were true. If the threshold
// moves back down, these are the lines that should fail first.
check(
  "one pouch plus a Sample now PAYS postage",
  ladderPence(1) + SAMPLE_PRICE_PENCE < SHIPPING.freeOverPence,
  true
);
check(
  "one pouch plus the pair pack now PAYS postage",
  ladderPence(1) + samplePairPence() < SHIPPING.freeOverPence,
  true
);
for (let n = 2; n <= MAX_POUCHES; n++) {
  check(`${n} pouches at full price ship free`, ladderPence(n) >= SHIPPING.freeOverPence, true);
  const family = ladderPence(n) - giftingDiscountPence(ladderPence(n));
  check(`${n} pouches ship free at the family ${GIFTING.percent}%`, family >= SHIPPING.freeOverPence, true);
}
// The one that costs money, and the reason a founders code should be issued
// with a WELCOME beside it: £48.75 falls under the £50 threshold.
{
  const price = ladderPence(2);
  const founders = price - foundersDiscountPence(price);
  check(
    `a pair at the founders ${FOUNDERS.percent}% falls UNDER the threshold`,
    founders < SHIPPING.freeOverPence,
    true
  );
}

// --- Presents ---------------------------------------------------------------
// One set per order: a jar with a single, a jar and a tote with a pair.
console.log("\n== Presents ==");
const set = (jars, totes) => JSON.stringify({ jars, totes });
check("no pouches, no presents", JSON.stringify(presentsForPouches(0)), set(0, 0));
check("a single earns the jar", JSON.stringify(presentsForPouches(1)), set(1, 0));
check("a pair earns the jar and the tote", JSON.stringify(presentsForPouches(2)), set(1, 1));
check("presents never multiply past one set", presentsForPouches(2).jars, 1);
check("a basket of twelve still earns ONE set", JSON.stringify(presentsForPouches(12)), set(1, 1));
throws("presents refuse a basket that cannot exist", () => presentsForPouches(MAX_POUCHES + 1));

// The retired jar/dabba path the cart still runs on must never give more than
// the agreed set: the jar, and never the withdrawn dabba.
console.log("\n== Presents (retired wiring, must under-give not over-give) ==");
for (let n = 0; n <= MAX_POUCHES; n++) {
  const retired = giftCountsForPouches(n);
  const agreed = presentsForPouches(n);
  check(`${n}: retired jars do not exceed agreed`, retired.jars <= agreed.jars, true);
  check(`${n}: the dabba is withdrawn`, retired.dabbas, 0);
}

// --- Every pair shows the RRP and the same saving -----------------------------
// Whatever the mix, a pair is £65 against a £70 RRP and saves £5. The buy box
// and the drawer show that on all three, so assert it per SKU rather than once.
console.log("\n== Every pair saves £5 against the RRP ==");
for (const [khana, chai] of [[2, 0], [1, 1], [0, 2]]) {
  const sku = `HELDI-K${khana}C${chai}`;
  check(`${sku}: RRP`, rrpPence(khana + chai), 7000);
  check(`${sku}: price`, ladderPence(khana + chai), 6500);
  check(`${sku}: saves`, bundleSavingPence(khana + chai), 500);
}
check("a single has no saving, so nothing to strike through", bundleSavingPence(1), 0);

// --- Samples ----------------------------------------------------------------
// A Khana sachet, a Chai sachet, or the pair pack with one of each.
console.log("\n== Samples ==");
check("pair pack RRP", samplePairRrpPence(), 1000);
check("pair pack price", samplePairPence(), 800);
check("pair pack saving", samplePairRrpPence() - samplePairPence(), SAMPLE_PAIR_DISCOUNT_PENCE);
check("the pair beats two singles", samplePairPence() < SAMPLE_PRICE_PENCE * 2, true);
check("a sachet alone is under the free-postage threshold", SAMPLE_PRICE_PENCE < SHIPPING.freeOverPence, true);
check("the pair alone is under it too", samplePairPence() < SHIPPING.freeOverPence, true);
// Asserted in the Shipping section above, where the £50 threshold is explained.
check("the pair pack saves against its RRP", samplePairRrpPence() - samplePairPence(), 200);

// One 30g fill, two serving counts, because the declared portions differ.
// Rounded down: 30g is two and a half Khana portions and the pack may only
// promise what it can certainly deliver.
check("sachet fill", SAMPLE_GRAMS, 30);
check("Khana portion", SERVING_GRAMS, 12);
check("Chai portion", CHAI_SERVING_GRAMS, 8);
check("a Khana sachet is 2 meals", Math.floor(SAMPLE_GRAMS / SERVING_GRAMS), 2);
check("a Chai sachet is 3 mugs", Math.floor(SAMPLE_GRAMS / CHAI_SERVING_GRAMS), 3);

// --- What can actually be bought --------------------------------------------
// The ceiling and the two products together define the Shopify variant list.
console.log("\n== The buyable set ==");
// Five VARIANTS, not one per basket size. A basket bigger than a pair is more
// of these lines, which is the whole reason the ceiling could be raised to
// MAX_POUCHES without adding a single Shopify variant.
const mixes = [];
for (const [khana, chai] of [[1, 0], [0, 1], [2, 0], [0, 2], [1, 1]]) {
  const n = khana + chai;
  mixes.push({ sku: `HELDI-K${khana}C${chai}`, pouches: n, pence: ladderPence(n) });
}
check("five pouch variants in the store", mixes.length, 5);
check("pouch SKUs are unique", new Set(mixes.map((m) => m.sku)).size, 5);
for (const m of mixes) console.log(`       ${m.sku}       ${m.pouches} pouch${m.pouches === 1 ? " " : "es"}  ${f(m.pence)}`);
const samples = [
  { sku: "HELDI-SAMPLE", pence: SAMPLE_PRICE_PENCE },
  { sku: "HELDI-SAMPLE-CHAI", pence: SAMPLE_PRICE_PENCE },
  { sku: "HELDI-SAMPLE-PAIR", pence: samplePairPence() }
];
check("three sample things a customer can buy", samples.length, 3);
for (const m of samples) console.log(`       ${m.sku.padEnd(18)} sachet     ${f(m.pence)}`);
check("eight sellable things in total", mixes.length + samples.length, 8);

// --- Shopify variant coverage -----------------------------------------------
// lib/commerce/catalog.ts resolves through the "@/" alias, which this script
// cannot import, so the GID map is read as text. That still catches the failure
// that matters: a mix a customer can pick with no variant behind it.
console.log("\n== Shopify variant coverage ==");
const catalogSrc = readFileSync(new URL("../lib/commerce/catalog.ts", import.meta.url), "utf8");
const gidFor = (sku) => {
  const m = new RegExp(`"${sku}":\\s*"(gid://shopify/ProductVariant/\\d+)"`).exec(catalogSrc);
  return m ? m[1] : null;
};
let missing = 0;
for (const m of mixes) {
  const gid = gidFor(m.sku);
  if (!gid) missing++;
  check(`${m.sku} has a variant id`, gid !== null, true);
}
for (const sku of ["HELDI-SAMPLE", "HELDI-SAMPLE-CHAI", "HELDI-SAMPLE-PAIR"]) {
  check(`${sku} has a variant id`, gidFor(sku) !== null, true);
}
const gids = [...catalogSrc.matchAll(/gid:\/\/shopify\/ProductVariant\/(\d+)/g)].map((m) => m[1]);
check("no variant id is reused", new Set(gids).size, gids.length);
if (missing > 0) console.log(`       ${missing} mix(es) a customer can pick with nothing behind them`);

// --- Result -----------------------------------------------------------------
console.log("");
if (failures > 0) {
  console.log(`FAILED: ${failures} assertion${failures === 1 ? "" : "s"} disagree with the agreed rate card.`);
  console.log("If a parameter changed on purpose, update this script, BRAND.md §10,");
  console.log("the Price Book, and the Shopify variant prices in the same commit.");
  process.exit(1);
}
console.log("The rate card matches lib/pricing.ts.");
