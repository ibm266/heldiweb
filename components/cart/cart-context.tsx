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
  FREE_PAIR_VARIANT_ID,
  isGiftLine,
  isMixLine,
  mixLineForCounts,
  pouchCounts,
  presentLinesForPouches
} from "@/lib/commerce/catalog";
import { CHAI_SELLABLE, COMMERCE_MODE } from "@/lib/commerce/config";
import { getCommerceProvider } from "@/lib/commerce/provider";
import type { Cart, CartLineInput, CommerceMode } from "@/lib/commerce/types";
import { PREVIEW_UNLOCK_KEY } from "@/lib/preview";
import {
  GIFTING,
  MAX_POUCHES,
  isGiftingCode,
  type GiftingAudience,
  type GiftingMethod
} from "@/lib/pricing";

/** What a basket holds, as the two numbers the pickers and the drawer edit. */
export type PouchCounts = { khana: number; chai: number };

const CART_ID_KEY = "heldi_cart_id";
const MODE_OVERRIDE_KEY = "heldi_mode_override";
const GIFTING_METHOD_KEY = "heldi_gifting_method";

// One message for every cart failure. The shopper cannot act on the difference
// between a 502 and a 429, so it says what happened, what to do, and where to
// go if it keeps happening, rather than naming a status code.
const CART_ERROR =
  "That did not go through. Give it another go in a moment, and email info@heldi.co.uk if it keeps happening.";

// A refusal is not a failure. Asking for a third pouch, or for Chai before it
// is on sale, means the basket is already right and nothing was written. Those
// get their own channel so the drawer can say so quietly, instead of the red
// "that did not go through" that belongs to a dropped request.
const OVER_CAP_NOTICE = `Two pouches is the most one order can carry. Email us if you want more.`;
const CHAI_NOT_YET_NOTICE =
  "Chai is not on sale yet. Join the list and you will hear the day it is.";

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
  // Adds the free trial pair, for the link in the launch email. Idempotent:
  // a refresh or a second click will not add a second one.
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
      if (chai > 0 && !CHAI_SELLABLE) {
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
      const mixLine = mixLineForCounts(khana, chai);
      const target = [
        ...(mixLine ? [mixLine] : []),
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
        // Add the new mix variant BEFORE removing the old one. Changing a
        // count swaps variants rather than editing a quantity, so one of the
        // two orders is always momentarily wrong. This way a failed removal
        // leaves two pouch lines, which the server-side clamp collapses on the
        // next request; the other way round, a failed addition would empty the
        // basket the shopper just built. Losing their order is worse.
        if (updates.length > 0) next = await provider.updateLines(cartId, updates);
        if (additions.length > 0) next = await provider.addLines(cartId, additions);
        if (removals.length > 0) next = await provider.removeLines(cartId, removals);
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

  // The launch email links straight here with the trial pair already chosen,
  // so the first thing a claimer sees is a basket with it in, not a shop they
  // have to navigate. Idempotent, because a refresh must not claim twice and
  // React runs mount effects twice in development.
  const claimFreePair = useCallback(
    async (code?: string) => {
      const alreadyHas = (cart?.lines ?? []).some(
        (line) => line.merchandise.id === FREE_PAIR_VARIANT_ID
      );
      const existingCodes = cart?.discountCodes.map((entry) => entry.code) ?? [];

      // Both writes go through ONE runMutation, because runMutation resolves
      // the cart id from the `cart` state it closed over. Two calls in a row
      // would both see the pre-claim value, so the second would create a
      // SECOND cart and the first one's lines would be silently orphaned.
      const claimed = await runMutation(async (cartId) => {
        const provider = getCommerceProvider();
        let next = alreadyHas
          ? null
          : await provider.addLines(cartId, [
              { merchandiseId: FREE_PAIR_VARIANT_ID, quantity: 1 }
            ]);
        // The code rides the same link so the shopper never types it. Applied
        // after the pair, so a dead or spent code still leaves them holding
        // the free pair rather than an empty basket and no explanation.
        if (code) {
          next = await provider.updateDiscountCodes(cartId, [
            ...existingCodes.filter(
              (entry) => entry.toUpperCase() !== code.toUpperCase()
            ),
            code
          ]);
        }
        // Nothing to do means the basket already says what the link asked for.
        return next ?? (await provider.getCart(cartId))!;
      });
      setIsOpen(true);
      return claimed;
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
        return getCommerceProvider().updateDiscountCodes(cartId, [
          ...existing.filter((entry) => entry.toUpperCase() !== code.toUpperCase()),
          code
        ]);
      }),
    [runMutation, cart?.discountCodes]
  );

  const applyGifting = useCallback(
    async (method: GiftingMethod, audience: GiftingAudience = "beta") => {
      const applied = await runMutation((cartId) => {
        const existing = cart?.discountCodes.map((entry) => entry.code) ?? [];
        return getCommerceProvider().updateDiscountCodes(cartId, [
          ...existing.filter((entry) => !isGiftingCode(entry)),
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

  // ?claim=pair&code=XXX, the link in the launch email. It fills the basket
  // and opens the drawer, so the first thing a claimer sees is their free pair
  // and their discount already applied, not a shop to navigate.
  //
  // Both params are stripped from the address bar as soon as they are read.
  // The code is personal and single-use: leaving it in the URL would put it in
  // the browser history, in the next screenshot, and in any link they share.
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
