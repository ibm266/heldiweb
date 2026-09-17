"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  FREE_PAIR_SKU,
  FREE_PAIR_VARIANT_ID,
  isGiftLine,
  isMixLine,
  mixLinesForCounts,
  pouchCounts,
  presentLinesForPouches
} from "@/lib/commerce/catalog";
import { CHAI_SELLABLE, COMMERCE_MODE } from "@/lib/commerce/config";
import { getCommerceProvider } from "@/lib/commerce/provider";
import type {
  Cart,
  CartLine,
  CartLineInput,
  CommerceMode
} from "@/lib/commerce/types";
import { PREVIEW_UNLOCK_KEY } from "@/lib/preview";
import {
  GIFTING,
  MAX_POUCHES,
  isGiftingCode,
  isProductDiscountCode,
  type GiftingAudience,
  type GiftingMethod,
  WELCOME_POSTAGE
} from "@/lib/pricing";
import { PAIRS_GONE_MESSAGE } from "@/lib/waitlist-offer-site";

/** What a basket holds, as the two numbers the pickers and the drawer edit. */
export type PouchCounts = { khana: number; chai: number };

// WHETHER A CLAIMED FREE SAMPLE PAIR BRINGS THE WELCOME CODE WITH IT.
//
// The waitlist offer (BRAND.md §11.9) is a free sample pair with Heldi paying
// its postage. It is NOT free postage on a pouch order: the owner took that
// out of the offer on 17 Sep 2026, and WELCOME now belongs to close friends,
// to the early joiners and to post-launch email sign-ups, and to nobody else.
//
// TRUE, which is today. The samples are not yet on a zero-rate "Heldi samples"
// shipping profile in Shopify, so a basket holding nothing but the free pair
// is quoted the standard rate at checkout. A thing the email calls free must
// not arrive with postage attached (§11.9, "We pay the postage"), so every
// claim carries WELCOME, a free shipping discount, to cancel it. The price of
// that safety net is that the same code also frees the postage on any pouch
// the claimer adds, which is exactly what was taken out of the offer.
//
// FALSE, as soon as that profile exists (docs/launch-runbook.md Step 4, a job
// done by hand in the Shopify admin). The pair then ships for nothing on its
// own profile and needs no code, so all the rider still does is give pouch
// postage away. From then on no claim link brings free postage. The early
// joiners, who were promised it on their first order, are given WELCOME by
// name in their launch email to type on their first POUCH order, and their
// link stays bare: the code is one use per customer, and a checkout holding
// only the free pair would spend it. That is also a reason to make the profile
// before launch, because while the rider is on it has exactly that effect.
//
// scripts/storefront-check.mjs reads this declaration as text. Once Shopify
// quotes no postage for the free sample pair it FAILS until this says false,
// and it fails the other way round too, so the flip can be neither forgotten
// nor made early. Keep the declaration on one line, in this form.
export const CLAIM_RIDES_WITH_WELCOME = true;

const CART_ID_KEY = "heldi_cart_id";
const MODE_OVERRIDE_KEY = "heldi_mode_override";
const GIFTING_METHOD_KEY = "heldi_gifting_method";

// One message for every cart failure. The shopper cannot act on the difference
// between a 502 and a 429, so it says what happened, what to do, and where to
// go if it keeps happening, rather than naming a status code.
const CART_ERROR =
  "We couldn’t update your basket. Try again in a moment. If it still won’t work, email info@heldi.co.uk.";

// A refusal is not a failure. Asking for a third pouch, or for Chai before it
// is on sale, means the basket is already right and nothing was written. Those
// get their own channel so the drawer can say so quietly, instead of the red
// "that did not go through" that belongs to a dropped request.
const OVER_CAP_NOTICE = `This basket can hold up to ${MAX_POUCHES} pouches. For a larger order, email info@heldi.co.uk.`;
const CHAI_NOT_YET_NOTICE =
  "Heldi Chai is not on sale yet. Please choose Heldi Khana for now.";
// The same gate, met from the claim link. The free sample pair holds a Chai
// sachet, so while Chai cannot be sold the pair cannot be posted either. The
// claimer has lost nothing: the link in their email works once it can.
const PAIR_NOT_READY_NOTICE =
  "The free sample pairs are not ready to post yet. Keep the email: the link will work as soon as they are.";

type CartContextValue = {
  cart: Cart | null;
  isOpen: boolean;
  isPending: boolean;
  // User-facing message for the last failed cart write; null when the cart is
  // healthy. Rendered by the drawer, cleared on the next attempt.
  error: string | null;
  dismissError: () => void;
  // A refusal the shopper caused and can act on, as opposed to `error`, which
  // is something that went wrong. Cleared on the next attempt.
  notice: string | null;
  dismissNotice: () => void;
  mode: CommerceMode;
  // Runtime override of the env flag; null follows the env. Honoured in
  // development and in preview-unlocked browsers (see /preview).
  setModeOverride: (mode: CommerceMode | null) => void;
  // True once the /preview password has been entered in this browser; the
  // mode override and the nav mode pill work outside development only then.
  previewUnlocked: boolean;
  setPreviewUnlocked: (unlocked: boolean) => void;
  // How the gifting discount was applied — the code field and the checkout
  // checkbox never stack, so whichever applied first locks the other out.
  giftingMethod: GiftingMethod | null;
  // Every cart write resolves to whether it landed. Callers that fire an
  // analytics event or record local state must check it rather than assuming
  // success; `error` carries the message the shopper sees.
  applyGifting: (method: GiftingMethod, audience?: GiftingAudience) => Promise<boolean>;
  removeGifting: () => Promise<boolean>;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity: number) => Promise<boolean>;
  // Pouch-level cart ops. The basket is described by two numbers, and both of
  // these resolve them to the single mix variant that encodes the pair, plus
  // the present lines that come with it.
  addPouches: (add: Partial<PouchCounts>) => Promise<boolean>;
  setPouchCounts: (counts: PouchCounts) => Promise<boolean>;
  // What the basket currently holds, for pickers and steppers to read.
  counts: PouchCounts & { pouches: number };
  // Adds the free sample pair, for the link in the launch email. Idempotent:
  // a refresh or a second click will not add a second one. Resolves to whether
  // the basket now holds the pair, which is not the same as whether the write
  // landed: once the pairs have gone the link's code is still applied, and the
  // shopper is told through `notice`.
  claimFreePair: (code?: string) => Promise<boolean>;
  updateQuantity: (lineId: string, quantity: number) => Promise<boolean>;
  removeItem: (lineId: string) => Promise<boolean>;
  applyDiscount: (code: string) => Promise<boolean>;
  clearDiscounts: () => Promise<boolean>;
};

const CartContext = createContext<CartContextValue | null>(null);

// Bring a cart's present lines to the target for its pouch count, once. Heals
// carts persisted before the tote existed, or mutated outside the site
// (leftover dabbas, wrong quantities, presents with no pouches). Returns the
// corrected cart, or null when nothing needed changing. Callers run this at
// most once and swallow errors: it must never block hydration.
async function reconcileGiftLines(cart: Cart): Promise<Cart | null> {
  const target = presentLinesForPouches(pouchCounts(cart.lines).pouches);
  const targetIds = new Set(target.map((input) => input.merchandiseId));
  const giftLines = cart.lines.filter(isGiftLine);
  const currentByVariant = new Map(
    giftLines.map((line) => [line.merchandise.id, line])
  );

  const additions: CartLineInput[] = [];
  const updates: { id: string; quantity: number }[] = [];
  for (const input of target) {
    const line = currentByVariant.get(input.merchandiseId);
    if (!line) additions.push(input);
    else if (line.quantity !== input.quantity) {
      updates.push({ id: line.id, quantity: input.quantity });
    }
  }
  const removals = giftLines
    .filter((line) => !targetIds.has(line.merchandise.id))
    .map((line) => line.id);
  if (additions.length === 0 && updates.length === 0 && removals.length === 0) {
    return null;
  }

  const provider = getCommerceProvider();
  let next: Cart | null = null;
  if (updates.length > 0) next = await provider.updateLines(cart.id, updates);
  if (additions.length > 0) next = await provider.addLines(cart.id, additions);
  if (removals.length > 0) next = await provider.removeLines(cart.id, removals);
  return next;
}

// Whether a cart really holds the free sample pair. Matched by variant id with
// the SKU as a fallback, and only at a quantity of one or more. The quantity
// matters: when a tracked variant has sold out, Shopify does not refuse the
// add. It accepts the request and either leaves the line out or leaves it in
// at quantity zero, so a line being present does not mean a pair is coming.
function holdsFreePair(lines: CartLine[] | undefined): boolean {
  return (lines ?? []).some(
    (line) =>
      line.quantity > 0 &&
      (line.merchandise.id === FREE_PAIR_VARIANT_ID ||
        line.merchandise.sku === FREE_PAIR_SKU)
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // The email claim link must not run until the saved cart has loaded, or it
  // would create a second cart and orphan the shopper's existing basket.
  const [hydrated, setHydrated] = useState(false);
  const claimAttempted = useRef(false);
  const [modeOverride, setModeOverrideState] = useState<CommerceMode | null>(null);
  const [previewUnlocked, setPreviewUnlockedState] = useState(false);
  const [giftingMethod, setGiftingMethodState] = useState<GiftingMethod | null>(null);

  const mode = modeOverride ?? COMMERCE_MODE;

  // Hydrate cart + mode override + gifting method from storage after mount.
  // localStorage is client-only, so this must run in an effect and set state;
  // the one extra render on mount is the cost of avoiding a hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const unlocked = window.localStorage.getItem(PREVIEW_UNLOCK_KEY) === "1";
    if (unlocked) setPreviewUnlockedState(true);

    // The override is dev tooling plus the consultant preview: outside
    // development it only counts once this browser is unlocked.
    if (process.env.NODE_ENV === "development" || unlocked) {
      const stored = window.localStorage.getItem(MODE_OVERRIDE_KEY);
      if (stored === "waitlist" || stored === "live") {
        setModeOverrideState(stored);
      }
    }

    const storedMethod = window.localStorage.getItem(GIFTING_METHOD_KEY);
    if (storedMethod === "code" || storedMethod === "checkbox") {
      setGiftingMethodState(storedMethod);
    }

    const cartId = window.localStorage.getItem(CART_ID_KEY);
    if (!cartId) {
      setHydrated(true);
      return;
    }
    getCommerceProvider()
      .getCart(cartId)
      .then(async (existing) => {
        if (!existing) {
          window.localStorage.removeItem(CART_ID_KEY);
          return;
        }
        setCart(existing);
        // Heal drifted gift lines once; never loop, never block hydration.
        try {
          const reconciled = await reconcileGiftLines(existing);
          if (reconciled) setCart(reconciled);
        } catch (error) {
          console.warn("[cart] gift line reconcile skipped", error);
        }
      })
      .catch(() => {
        window.localStorage.removeItem(CART_ID_KEY);
      })
      .finally(() => setHydrated(true));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setModeOverride = useCallback((next: CommerceMode | null) => {
    setModeOverrideState(next);
    if (next) window.localStorage.setItem(MODE_OVERRIDE_KEY, next);
    else window.localStorage.removeItem(MODE_OVERRIDE_KEY);
    setIsOpen(false);
  }, []);

  // Unlocking is done by the /preview page after the server has checked the
  // password. Locking also drops any mode override so the browser falls back
  // to what real visitors see.
  const setPreviewUnlocked = useCallback(
    (unlocked: boolean) => {
      setPreviewUnlockedState(unlocked);
      if (unlocked) window.localStorage.setItem(PREVIEW_UNLOCK_KEY, "1");
      else {
        window.localStorage.removeItem(PREVIEW_UNLOCK_KEY);
        setModeOverride(null);
      }
    },
    [setModeOverride]
  );

  const setGiftingMethod = useCallback((next: GiftingMethod | null) => {
    setGiftingMethodState(next);
    if (next) window.localStorage.setItem(GIFTING_METHOD_KEY, next);
    else window.localStorage.removeItem(GIFTING_METHOD_KEY);
  }, []);

  // Every cart write goes through here, so this is the one place a failure can
  // be caught. Without it a 502, a 429, a 503 from an unconfigured store or a
  // dropped connection all looked identical to success: the button flicked
  // back to its resting state and nothing else happened, no message and no
  // basket. Returns whether the write landed, because callers like applyGifting
  // must not record local state for a change the server never accepted.
  const runMutation = useCallback(
    async (mutate: (cartId: string) => Promise<Cart>): Promise<boolean> => {
      setIsPending(true);
      setError(null);
      setNotice(null);
      try {
        const provider = getCommerceProvider();
        let cartId = cart?.id;
        if (!cartId) {
          const created = await provider.createCart();
          cartId = created.id;
          window.localStorage.setItem(CART_ID_KEY, cartId);
        }
        const next = await mutate(cartId);
        setCart(next);
        return true;
      } catch (cause) {
        // The detail is for us, not the shopper: it names the provider and the
        // status, which is what makes a launch-day report actionable.
        console.error("[cart] mutation failed", cause);
        setError(CART_ERROR);
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [cart?.id]
  );

  const addItem = useCallback(
    async (merchandiseId: string, quantity: number) => {
      const added = await runMutation((cartId) =>
        getCommerceProvider().addLines(cartId, [{ merchandiseId, quantity }])
      );
      // Open either way: on success it shows the basket, on failure it is
      // where the error message lives, so the click is never silent.
      setIsOpen(true);
      return added;
    },
    [runMutation]
  );

  const counts = useMemo(() => pouchCounts(cart?.lines ?? []), [cart?.lines]);

  const setPouchCounts = useCallback(
    async ({ khana, chai }: PouchCounts) => {
      // Refuse before writing anything. Both of these mean the basket is
      // already correct, so they return false with a notice rather than an
      // error: nothing was attempted, so nothing failed. Decision D8 is that
      // the extra pouch is refused out loud, never silently clamped.
      if (khana < 0 || chai < 0) return false;
      if (khana + chai > MAX_POUCHES) {
        setNotice(OVER_CAP_NOTICE);
        return false;
      }
      // Refuse an INCREASE in Chai, not the mere presence of it. A basket that
      // already holds Chai (made while the flag was on, or healed by the
      // server) must still be reducible; gating on `chai > 0` trapped the
      // shopper, refusing even "remove the Khana" because the target still
      // mentioned Chai.
      const current = pouchCounts(cart?.lines ?? []);
      if (!CHAI_SELLABLE && chai > current.chai) {
        setNotice(CHAI_NOT_YET_NOTICE);
        return false;
      }

      // The pouch line and the present lines both derive from the counts, so
      // they move together: one mix variant encoding (khana, chai), plus the
      // jar and tote that come with it.
      const managedLines = (cart?.lines ?? []).filter(
        (line) => isMixLine(line) || isGiftLine(line)
      );
      const currentByVariant = new Map(
        managedLines.map((line) => [line.merchandise.id, line])
      );
      // A basket is now as many pair lines as it will make plus at most one
      // single, so this is a LIST, not one line. The diff below works line by
      // line against the variant id, which is what makes going from three
      // pouches to four a quantity change on one line rather than a rebuild.
      const target = [
        ...mixLinesForCounts(khana, chai),
        ...presentLinesForPouches(khana + chai)
      ];
      const targetIds = new Set(target.map((input) => input.merchandiseId));

      const additions: CartLineInput[] = [];
      const updates: { id: string; quantity: number }[] = [];
      for (const input of target) {
        const line = currentByVariant.get(input.merchandiseId);
        if (!line) additions.push(input);
        else if (line.quantity !== input.quantity) {
          updates.push({ id: line.id, quantity: input.quantity });
        }
      }
      const removals = managedLines
        .filter((line) => !targetIds.has(line.merchandise.id))
        .map((line) => line.id);
      // Nothing to change counts as success: the cart already says what the
      // caller asked for, so there is no failure to report.
      if (additions.length === 0 && updates.length === 0 && removals.length === 0) {
        return true;
      }

      return runMutation(async (cartId) => {
        const provider = getCommerceProvider();
        let next: Cart | null = null;
        // REMOVE the old mix variant BEFORE adding the new one. Changing a
        // count swaps variants rather than editing a quantity, so the basket
        // is momentarily wrong whichever order this runs in, and the two
        // orders fail very differently.
        //
        // Adding first looked safer (a failed removal just leaves a spare
        // line) until you follow it through the server clamp, which keeps the
        // LARGER pouch line. On a down-step the add-lines request lands with
        // both K2C0 and K1C0 present, the clamp keeps K2C0 and deletes the
        // line the shopper just asked for, and the removals computed before
        // the request then take K2C0 and the presents with it. The basket
        // empties itself, silently, on every step down.
        //
        // Removing first means the clamp never sees two pouch lines. The cost
        // is that a failed addition leaves the basket without its pouches,
        // which is bad but VISIBLE: runMutation surfaces the error. A silent
        // wrong answer is worse than a loud failure.
        if (removals.length > 0) next = await provider.removeLines(cartId, removals);
        if (updates.length > 0) next = await provider.updateLines(cartId, updates);
        if (additions.length > 0) next = await provider.addLines(cartId, additions);
        return next!;
      });
    },
    [runMutation, cart?.lines]
  );

  const addPouches = useCallback(
    async (add: Partial<PouchCounts>) => {
      const current = pouchCounts(cart?.lines ?? []);
      const changed = await setPouchCounts({
        khana: current.khana + (add.khana ?? 0),
        chai: current.chai + (add.chai ?? 0)
      });
      // Open either way, so a refusal or a failed add shows its message
      // instead of the button flicking back and nothing happening.
      setIsOpen(true);
      return changed;
    },
    [setPouchCounts, cart?.lines]
  );

  // The launch email links straight here with the free sample pair already
  // chosen, so the first thing a claimer sees is a basket with it in, not a
  // shop they have to navigate. Idempotent, because a refresh must not claim
  // twice and React runs mount effects twice in development.
  const claimFreePair = useCallback(
    async (code?: string) => {
      // The Chai gate. The pair holds a Chai sachet, so until Chai can be sold
      // there is nothing to post, and the claim writes nothing at all: not the
      // pair, and not the code either, because the link still works later and
      // brings the code with it then. The server clamp refuses the pair for
      // the same reason (lib/commerce/shopify/cart-policy.ts). This is a
      // refusal, not a failure, so it goes out as a notice.
      if (!CHAI_SELLABLE) {
        setNotice(PAIR_NOT_READY_NOTICE);
        setIsOpen(true);
        return false;
      }

      const alreadyHas = holdsFreePair(cart?.lines);
      const existingCodes = cart?.discountCodes.map((entry) => entry.code) ?? [];

      // The codes ride the same link so the shopper never types one. First the
      // WELCOME rider, for as long as CLAIM_RIDES_WITH_WELCOME says the pair
      // needs it. It is a shipping discount, the one class that combines with
      // a product code, so it never blocks the code that follows it. Then
      // whatever the link itself carried. A link can name WELCOME itself, so
      // the list is de-duplicated ignoring case, keeping the first spelling,
      // or Shopify would be handed the same code twice.
      const wanted = [
        ...(CLAIM_RIDES_WITH_WELCOME ? [WELCOME_POSTAGE.code] : []),
        ...(code ? [code] : [])
      ];
      const codes = wanted.filter(
        (entry, index) =>
          wanted.findIndex(
            (other) => other.toUpperCase() === entry.toUpperCase()
          ) === index
      );

      // Nothing to write means the basket already says what the link asked
      // for: a refresh or a second click, on a link that brought no code.
      if (alreadyHas && codes.length === 0) {
        setIsOpen(true);
        return true;
      }

      // What became of the pair. Written inside the mutation and read after
      // it, because runMutation only says whether the write landed. An object
      // rather than a `let`: TypeScript narrows a `let` to the value it starts
      // with and would call the checks below impossible.
      const outcome: { pair: "claimed" | "gone" | "failed" } = {
        pair: "claimed"
      };

      // Every write goes through ONE runMutation, because runMutation resolves
      // the cart id from the `cart` state it closed over. Two calls in a row
      // would both see the pre-claim value, so the second would create a
      // SECOND cart and the first one's lines would be silently orphaned.
      const written = await runMutation(async (cartId) => {
        const provider = getCommerceProvider();
        let next: Cart | null = null;
        let addThrew = false;
        let addCause: unknown;
        if (!alreadyHas) {
          // Caught, not left to throw. A throw here used to abort the whole
          // claim before the codes were written, so a claimer whose pair
          // could not be added lost their code as well. The codes below are
          // written whatever happens to the pair.
          try {
            next = await provider.addLines(cartId, [
              { merchandiseId: FREE_PAIR_VARIANT_ID, quantity: 1 }
            ]);
          } catch (cause) {
            console.error("[cart] free sample pair could not be added", cause);
            addThrew = true;
            addCause = cause;
          }
        }
        // Applied after the pair, so a dead or spent code still leaves them
        // holding the free pair rather than an empty basket and no
        // explanation. Skipped when the rider is off and the link brought no
        // code, because there is then nothing to apply.
        if (codes.length > 0) {
          next = await provider.updateDiscountCodes(cartId, [
            ...existingCodes.filter(
              (entry) =>
                !codes.some((c) => c.toUpperCase() === entry.toUpperCase())
            ),
            ...codes
          ]);
        }
        // Only reachable when the add threw and there was no code to write,
        // so nothing landed at all: hand the add's own failure to runMutation
        // to report the way it reports every failed write.
        if (!next) throw addCause;

        // Judged on the cart that came back rather than on the add request,
        // because that is the one honest signal the providers give.
        //
        //   The add was ACCEPTED and the pair is not there: gone. That is
        //   what a sold-out pair looks like. The variant is tracked and stops
        //   selling at zero, and since Storefront API 2024-10 a stock problem
        //   is a warning on a successful mutation, not a userError: Shopify
        //   takes the request and leaves the line out, or in at quantity
        //   zero. Our GraphQL documents do not select warnings, so the
        //   missing line is the evidence.
        //
        //   The add THREW and the pair is not there: failed. A 4xx, a 5xx, a
        //   rate limit and a dropped connection all reach us as one Error
        //   naming a status, and none of them means the pairs have run out.
        //   Telling a claimer they have, on the strength of a timeout, would
        //   cost them a pair that is still on the shelf, so this keeps the
        //   generic message.
        //
        //   The pair is there: claimed, even if the add request itself threw
        //   after it had landed.
        if (!holdsFreePair(next.lines)) {
          outcome.pair = addThrew ? "failed" : "gone";
        }
        return next;
      });

      // runMutation cleared both channels on its way in and, having landed,
      // set neither, so whatever is set here is the only message the drawer
      // shows. Gone is a refusal, so it is a notice. An add that failed is a
      // failure, so it gets the error every other failed write gets.
      if (written && outcome.pair === "gone") setNotice(PAIRS_GONE_MESSAGE);
      if (written && outcome.pair === "failed") setError(CART_ERROR);
      setIsOpen(true);
      return written && outcome.pair === "claimed";
    },
    [runMutation, cart?.lines, cart?.discountCodes]
  );

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) =>
      runMutation((cartId) =>
        quantity <= 0
          ? getCommerceProvider().removeLines(cartId, [lineId])
          : getCommerceProvider().updateLines(cartId, [{ id: lineId, quantity }])
      ),
    [runMutation]
  );

  const removeItem = useCallback(
    (lineId: string) =>
      runMutation((cartId) => getCommerceProvider().removeLines(cartId, [lineId])),
    [runMutation]
  );

  const applyDiscount = useCallback(
    (code: string) =>
      runMutation((cartId) => {
        const existing = cart?.discountCodes.map((entry) => entry.code) ?? [];
        // One product discount per order (P3). A new product code REPLACES any
        // product code already on the cart rather than joining it. Without
        // this both sat there reading "applied" while only the first actually
        // discounted, so a shopper who typed a better code was shown it as
        // accepted and still charged the old rate.
        //
        // A shipping code is a different class and survives: free postage is
        // the one thing that combines with a product discount.
        const keep = isProductDiscountCode(code)
          ? existing.filter((entry) => !isProductDiscountCode(entry))
          : existing.filter((entry) => entry.toUpperCase() !== code.toUpperCase());
        return getCommerceProvider().updateDiscountCodes(cartId, [...keep, code]);
      }),
    [runMutation, cart?.discountCodes]
  );

  const applyGifting = useCallback(
    async (method: GiftingMethod, audience: GiftingAudience = "beta") => {
      const applied = await runMutation((cartId) => {
        const existing = cart?.discountCodes.map((entry) => entry.code) ?? [];
        // Same rule from the checkbox side: it replaces whatever product code
        // is there, including a founders code, so the two routes cannot leave
        // the cart in a state the code field would refuse to create.
        return getCommerceProvider().updateDiscountCodes(cartId, [
          ...existing.filter((entry) => !isProductDiscountCode(entry)),
          GIFTING.codes[audience]
        ]);
      });
      // Only remember the method if Shopify actually took the code, or the
      // checkbox would lock the code field over a discount that is not applied.
      if (applied) setGiftingMethod(method);
      return applied;
    },
    [runMutation, cart?.discountCodes, setGiftingMethod]
  );

  const removeGifting = useCallback(async () => {
    const removed = await runMutation((cartId) => {
      const remaining = (cart?.discountCodes.map((entry) => entry.code) ?? []).filter(
        (entry) => !isGiftingCode(entry)
      );
      return getCommerceProvider().updateDiscountCodes(cartId, remaining);
    });
    if (removed) setGiftingMethod(null);
    return removed;
  }, [runMutation, cart?.discountCodes, setGiftingMethod]);

  const clearDiscounts = useCallback(async () => {
    const cleared = await runMutation((cartId) =>
      getCommerceProvider().updateDiscountCodes(cartId, [])
    );
    if (cleared) setGiftingMethod(null);
    return cleared;
  }, [runMutation, setGiftingMethod]);

  // ?claim=pair, the link in the launch email. It fills the basket and opens
  // the drawer, so the first thing a claimer sees is their free sample pair,
  // not a shop to navigate. The first 100 on the list and the early joiners
  // both get the bare link (BRAND.md §11.9). &code=XXX is still honoured, so a
  // link can carry a code if one is ever wanted, and it is applied with the
  // pair.
  //
  // Both params are stripped from the address bar as soon as they are read,
  // before anything below can refuse the claim. A code left in the URL would
  // sit in the browser history, in the next screenshot, and in any link they
  // share, and some codes are personal and single-use.
  useEffect(() => {
    if (!hydrated || claimAttempted.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("claim") !== "pair") return;
    claimAttempted.current = true;

    const code = params.get("code")?.trim() || undefined;
    params.delete("claim");
    params.delete("code");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (query ? `?${query}` : "") + window.location.hash
    );

    // Only in live mode: in waitlist mode there is no checkout to send them to,
    // and adding lines to a mock cart would teach them the wrong thing.
    if (mode !== "live") return;
    // claimFreePair does its own refusing while Chai cannot be sold. It sits
    // there rather than here so that nothing else can ever claim around it.
    void claimFreePair(code);
  }, [hydrated, mode, claimFreePair]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isOpen,
      isPending,
      error,
      dismissError: () => setError(null),
      notice,
      dismissNotice: () => setNotice(null),
      mode,
      setModeOverride,
      previewUnlocked,
      setPreviewUnlocked,
      giftingMethod,
      applyGifting,
      removeGifting,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      addPouches,
      setPouchCounts,
      counts,
      claimFreePair,
      updateQuantity,
      removeItem,
      applyDiscount,
      clearDiscounts
    }),
    [
      cart,
      isOpen,
      isPending,
      error,
      notice,
      mode,
      setModeOverride,
      previewUnlocked,
      setPreviewUnlocked,
      giftingMethod,
      applyGifting,
      removeGifting,
      addItem,
      addPouches,
      setPouchCounts,
      counts,
      claimFreePair,
      updateQuantity,
      removeItem,
      applyDiscount,
      clearDiscounts
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
