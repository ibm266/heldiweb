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
check("basket ceiling", MAX_POUCHES, 2);
check("one sachet", SAMPLE_PRICE_PENCE, 500);
check("pair pack discount", SAMPLE_PAIR_DISCOUNT_PENCE, 200);

// --- The ladder -------------------------------------------------------------
// The agreed rate card. Khana and Chai priced identically, counted together.
const CARD = [
  //  n   RRP     price   saving  per pouch
  [1, 3500, 3500, 0, 3500],
  [2, 7000, 6500, 500, 3250]
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
for (let n = 1; n < MAX_POUCHES; n++) {
  check(`pouch ${n + 1} costs RRP minus the bundle discount`, nextPouchPence(n), 3000);
}

console.log("\n== The ceiling refuses, it does not clamp ==");
throws(`${MAX_POUCHES + 1} pouches has no price`, () => ladderPence(MAX_POUCHES + 1));
throws("a basket of six has no price", () => ladderPence(6));
throws("a negative basket has no price", () => ladderPence(-1));
throws("half a pouch has no price", () => ladderPence(1.5));
throws(`no pouch after ${MAX_POUCHES}`, () => nextPouchPence(MAX_POUCHES));

// --- Discount codes ---------------------------------------------------------
console.log("\n== Discount codes ==");
check("family rate", GIFTING.percent, 15);
check("founders rate", FOUNDERS.percent, 25);
check("founders offered to the first N joiners", FOUNDERS.firstJoiners, 100);

// Every step lands on a whole penny at both rates, so nothing rounds away.
const FAMILY = [2975, 5525];
const FOUNDERS_CARD = [2625, 4875];
for (let n = 1; n <= MAX_POUCHES; n++) {
  const price = ladderPence(n);
  check(`${n} at 15%`, price - giftingDiscountPence(price), FAMILY[n - 1]);
  check(`${n} at 25%`, price - foundersDiscountPence(price), FOUNDERS_CARD[n - 1]);
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
check("free-postage threshold", SHIPPING.freeOverPence, 4000);
check("Tracked 48", SHIPPING.standardPence, 355);
check("one pouch pays postage", ladderPence(1) < SHIPPING.freeOverPence, true);
check("one pouch plus a Sample ships free", ladderPence(1) + SAMPLE_PRICE_PENCE >= SHIPPING.freeOverPence, true);
for (let n = 2; n <= MAX_POUCHES; n++) {
  const price = ladderPence(n);
  const worstCase = price - foundersDiscountPence(price);
  check(`${n} pouches ship free even at 25%`, worstCase >= SHIPPING.freeOverPence, true);
}

// --- Presents ---------------------------------------------------------------
// One set per order: a jar with a single, a jar and a tote with a pair.
console.log("\n== Presents ==");
const set = (jars, totes) => JSON.stringify({ jars, totes });
check("no pouches, no presents", JSON.stringify(presentsForPouches(0)), set(0, 0));
check("a single earns the jar", JSON.stringify(presentsForPouches(1)), set(1, 0));
check("a pair earns the jar and the tote", JSON.stringify(presentsForPouches(2)), set(1, 1));
check("presents never multiply past one set", presentsForPouches(2).jars, 1);
throws("presents refuse a basket that cannot exist", () => presentsForPouches(3));

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
check("a pouch plus a sachet ships free", ladderPence(1) + SAMPLE_PRICE_PENCE >= SHIPPING.freeOverPence, true);
check("a pouch plus the pair ships free", ladderPence(1) + samplePairPence() >= SHIPPING.freeOverPence, true);
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
const mixes = [];
for (let khana = 0; khana <= MAX_POUCHES; khana++) {
  for (let chai = 0; chai <= MAX_POUCHES; chai++) {
    const n = khana + chai;
    if (n < 1 || n > MAX_POUCHES) continue;
    mixes.push({ sku: `HELDI-K${khana}C${chai}`, pouches: n, pence: ladderPence(n) });
  }
}
check("five pouch things a customer can buy", mixes.length, 5);
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
