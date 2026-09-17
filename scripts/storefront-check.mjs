// Reads the LIVE Shopify Storefront API and reports whether the store is set
// up the way lib/pricing.ts says it is. Written because the admin screen lies
// by omission: a product can be ACTIVE and still invisible to the Storefront,
// a variant can look stocked and still be untracked, and a shipping profile
// only tells you the truth once a real address is on a real cart.
//
//   node scripts/storefront-check.mjs
//
// Creates carts, which is free and places no order. Needs SHOPIFY_STORE_DOMAIN
// and SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local.
//
// Run it after every step of docs/launch-runbook.md Phase 1b.

import fs from "node:fs";
import {
  GIFTING,
  SHIPPING,
  SAMPLE_PRICE_PENCE,
  ladderPence,
  samplePairPence
} from "../lib/pricing.ts";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const DOMAIN = env.SHOPIFY_STORE_DOMAIN;
const TOKEN = env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
if (!DOMAIN || !TOKEN) {
  console.error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local");
  process.exit(1);
}
const URL = `https://${DOMAIN}/api/2026-01/graphql.json`;

let failures = 0;
const pass = (m) => console.log(`  ok   ${m}`);
const fail = (m) => { failures++; console.log(`  FAIL ${m}`); };
const money = (p) => `£${(p / 100).toFixed(2)}`;

async function gql(query, variables) {
  const r = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables })
  });
  const j = await r.json();
  if (j.errors) console.log("   graphql:", JSON.stringify(j.errors.map((e) => e.message)));
  return j.data;
}

const V = {
  "HELDI-K1C0": "gid://shopify/ProductVariant/58361529893247",
  "HELDI-K0C1": "gid://shopify/ProductVariant/58361529926015",
  "HELDI-K2C0": "gid://shopify/ProductVariant/58361529958783",
  "HELDI-K0C2": "gid://shopify/ProductVariant/58361529991551",
  "HELDI-K1C1": "gid://shopify/ProductVariant/58361530024319",
  "HELDI-SAMPLE": "gid://shopify/ProductVariant/58361530188159",
  "HELDI-SAMPLE-CHAI": "gid://shopify/ProductVariant/58361530220927",
  "HELDI-SAMPLE-PAIR": "gid://shopify/ProductVariant/58361530253695",
  "HELDI-SAMPLE-PAIR-FREE": "gid://shopify/ProductVariant/58361566790015",
  "HELDI-JAR": "gid://shopify/ProductVariant/58012531130751",
  "HELDI-TOTE": "gid://shopify/ProductVariant/58362101268863"
};
const ADDRESS = {
  address1: "10 Downing Street", city: "London", country: "United Kingdom",
  province: "England", zip: "SW1A 2AA", firstName: "Test", lastName: "Buyer"
};

// --- 1. Can the Storefront see everything, and does it have a picture? -------
console.log("\n== Visible to the Headless channel ==");
const names = Object.keys(V);
const seen = await gql(
  `query($ids:[ID!]!){ nodes(ids:$ids){ ... on ProductVariant {
     sku availableForSale image{url} price{amount} } } }`,
  { ids: Object.values(V) }
);
(seen?.nodes ?? []).forEach((n, i) => {
  const name = names[i];
  if (!n) return fail(`${name} is NOT published to this channel`);
  if (!n.availableForSale) return fail(`${name} is published but not sellable (tracked and out of stock?)`);
  if (!n.image) return fail(`${name} has no image`);
  pass(`${name.padEnd(24)} £${n.price.amount}`);
});

// --- 2. A real cart, and the family code on it ------------------------------
console.log("\n== A real cart, and the family rate ==");
const made = await gql(
  `mutation($l:[CartLineInput!]!){ cartCreate(input:{lines:$l}){
     cart{ id checkoutUrl cost{ totalAmount{amount} } } userErrors{message} } }`,
  { l: [
      { merchandiseId: V["HELDI-K1C1"], quantity: 1 },
      { merchandiseId: V["HELDI-JAR"], quantity: 1 },
      { merchandiseId: V["HELDI-TOTE"], quantity: 1 }
  ] }
);
const cart = made?.cartCreate?.cart;
if (!cart) {
  fail(`cartCreate refused: ${JSON.stringify(made?.cartCreate?.userErrors)}`);
} else {
  const total = Math.round(Number(cart.cost.totalAmount.amount) * 100);
  total === ladderPence(2)
    ? pass(`a pair plus both presents is ${money(total)}`)
    : fail(`a pair plus both presents is ${money(total)}, expected ${money(ladderPence(2))}`);
  cart.checkoutUrl ? pass("checkout URL issued") : fail("no checkout URL");

  for (const code of [GIFTING.codes.elder, "WELCOME"]) {
    const d = await gql(
      `mutation($id:ID!,$c:[String!]!){ cartDiscountCodesUpdate(cartId:$id,discountCodes:$c){
         cart{ discountCodes{ code applicable } cost{ totalAmount{amount} } } } }`,
      { id: cart.id, c: [code] }
    );
    const entry = d?.cartDiscountCodesUpdate?.cart?.discountCodes?.find((e) => e.code === code);
    const now = Math.round(Number(d?.cartDiscountCodesUpdate?.cart?.cost?.totalAmount?.amount ?? 0) * 100);
    if (!entry) fail(`${code} does not exist in the store`);
    else if (!entry.applicable) fail(`${code} exists but is NOT applicable to a pair`);
    else if (code === GIFTING.codes.elder) {
      const want = ladderPence(2) - Math.round((ladderPence(2) * GIFTING.percent) / 100);
      now === want ? pass(`${code} takes ${GIFTING.percent}% off: ${money(now)}`)
                   : fail(`${code} gives ${money(now)}, expected ${money(want)}`);
    } else pass(`${code} is applicable`);
  }
}

// --- 3. What postage does Shopify actually quote? ---------------------------
console.log("\n== Real delivery quotes, UK address ==");
async function quote(label, lines, expectPence) {
  const d = await gql(
    `mutation($l:[CartLineInput!]!,$a:MailingAddressInput!){ cartCreate(input:{lines:$l,
       buyerIdentity:{countryCode:GB, deliveryAddressPreferences:[{deliveryAddress:$a}]}}){
       cart{ cost{ subtotalAmount{amount} }
         deliveryGroups(first:3){ nodes{ deliveryOptions{ title estimatedCost{amount} } } } } } }`,
    { l: lines, a: ADDRESS }
  );
  const c = d?.cartCreate?.cart;
  if (!c) { fail(`${label}: no cart`); return null; }
  const opts = c.deliveryGroups.nodes.flatMap((g) => g.deliveryOptions);
  const cheapest = opts.length ? Math.min(...opts.map((o) => Math.round(Number(o.estimatedCost.amount) * 100))) : null;
  const sub = money(Math.round(Number(c.cost.subtotalAmount.amount) * 100));
  if (cheapest === null) { fail(`${label} (${sub}): no delivery options`); return null; }
  cheapest === expectPence
    ? pass(`${label} (${sub}) ships ${money(cheapest)}`)
    : fail(`${label} (${sub}) ships ${money(cheapest)}, expected ${money(expectPence)}`);
  // The cheapest rate in pence, or null when there was nothing to quote, for
  // the one check below that needs the figure as well as the verdict.
  return cheapest;
}
const L = (id, q = 1) => ({ merchandiseId: V[id], quantity: q });
await quote("one pouch", [L("HELDI-K1C0")], SHIPPING.standardPence);
await quote("a pair", [L("HELDI-K2C0")], 0);
await quote("a sachet alone", [L("HELDI-SAMPLE")], 0);
await quote("the pair pack alone", [L("HELDI-SAMPLE-PAIR")], 0);
const freePairPostage = await quote("the free sample pair", [L("HELDI-SAMPLE-PAIR-FREE")], 0);
// The mixed case: a sachet must never ADD postage to a basket that has some.
await quote("one pouch plus a sachet", [L("HELDI-K1C0"), L("HELDI-SAMPLE")], SHIPPING.standardPence);
await quote("a pair plus a sachet", [L("HELDI-K2C0"), L("HELDI-SAMPLE")], 0);

// --- 3b. Does the claim link still need its WELCOME rider? ------------------
// components/cart/cart-context.tsx puts WELCOME on every claimed basket while
// CLAIM_RIDES_WITH_WELCOME is true, because until the samples sit on a £0
// shipping profile (launch-runbook Step 4) the free sample pair is charged
// postage, and a thing called free must not arrive with postage attached. Once
// the profile exists the rider does nothing for the pair and only gives away
// the postage on any pouch the claimer adds, which the waitlist offer no longer
// includes (BRAND.md §11.9). The flag is one line of code that nobody will
// think of on the day the profile is made, so it is checked here, against the
// quote above, in both directions. Read as text, like pricing-check reads the
// catalog: the file is a client component and cannot be imported from Node.
console.log("\n== The claim link's WELCOME rider ==");
const contextSrc = fs.readFileSync(
  new URL("../components/cart/cart-context.tsx", import.meta.url),
  "utf8"
);
const rider =
  /export const CLAIM_RIDES_WITH_WELCOME(?::\s*boolean)?\s*=\s*(true|false)\s*;/.exec(contextSrc)?.[1] ?? null;
if (rider === null) {
  fail("cannot find `export const CLAIM_RIDES_WITH_WELCOME = true;` (or false) in components/cart/cart-context.tsx");
} else if (freePairPostage === null) {
  fail("no postage quote for the free sample pair, so the WELCOME rider cannot be judged");
} else if (freePairPostage === 0 && rider === "true") {
  fail("the free sample pair now ships £0.00 on its own, so the rider only gives away pouch postage: set CLAIM_RIDES_WITH_WELCOME to false in components/cart/cart-context.tsx");
} else if (freePairPostage > 0 && rider === "false") {
  fail(`CLAIM_RIDES_WITH_WELCOME is false but the free sample pair is still charged ${money(freePairPostage)} postage: finish launch-runbook Step 4, or set it back to true until you have`);
} else if (rider === "true") {
  pass(`the free sample pair is still charged ${money(freePairPostage)} on its own, so CLAIM_RIDES_WITH_WELCOME = true is right for now`);
} else {
  pass("the free sample pair ships £0.00 on its own and CLAIM_RIDES_WITH_WELCOME is false");
}

// --- 4. Is the free sample pair really capped at the first 100 on the list? -
// Stock on this one variant is the only thing that stops claims after the
// first 100 on the list, so it has to be tracked. Asking for 250 in one cart
// shows whether it is. Untracked, Shopify hands back all 250. Tracked, it
// either refuses the line or cuts it down to what is in stock: since
// Storefront API 2024-10 a stock problem is a warning on a successful
// mutation, not a userError, so both count as proof.
console.log("\n== The free sample pair: stock is the only cap ==");
const ASKED = 250;
const over = await gql(
  `mutation($l:[CartLineInput!]!){ cartCreate(input:{lines:$l}){
     cart{ lines(first:1){ nodes{ quantity } } } userErrors{message} } }`,
  { l: [{ merchandiseId: V["HELDI-SAMPLE-PAIR-FREE"], quantity: ASKED }] }
);
const got = over?.cartCreate?.cart?.lines?.nodes?.[0]?.quantity ?? null;
if (got === null) {
  pass(`Shopify refuses ${ASKED} free sample pairs, so the variant is tracked`);
} else if (got < ASKED) {
  pass(`Shopify cut ${ASKED} free sample pairs down to ${got}, so the variant is tracked`);
} else {
  fail(`Shopify allowed ${got} free sample pairs: tracking is OFF, so nothing stops claims after the first 100 on the list`);
}

console.log(
  failures === 0
    ? "\nThe store matches lib/pricing.ts.\n"
    : `\n${failures} thing(s) still to do. See docs/launch-runbook.md Phase 1b.\n`
);
process.exit(failures === 0 ? 0 : 1);
