"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  giftLinesForPouchCount,
  isGiftLine,
  khanaPouchCount,
  linesForPouchCount,
  tierForSku
} from "@/lib/commerce/catalog";
import { COMMERCE_MODE } from "@/lib/commerce/config";
import { getCommerceProvider } from "@/lib/commerce/provider";
import type { Cart, CartLineInput, CommerceMode } from "@/lib/commerce/types";
import { PREVIEW_UNLOCK_KEY } from "@/lib/preview";
import {
  GIFTING,
  isGiftingCode,
  type GiftingAudience,
  type GiftingMethod
} from "@/lib/pricing";

const CART_ID_KEY = "heldi_cart_id";
const MODE_OVERRIDE_KEY = "heldi_mode_override";
const GIFTING_METHOD_KEY = "heldi_gifting_method";

type CartContextValue = {
  cart: Cart | null;
  isOpen: boolean;
  isPending: boolean;
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
  applyGifting: (method: GiftingMethod, audience?: GiftingAudience) => Promise<void>;
  removeGifting: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity: number) => Promise<void>;
  // Pouch-level cart ops: the drawer steps pouches one at a time and the
  // buy box adds a tier's worth; both repack the underlying bundle lines
  // to the cheapest packing for the new total (see packPouches).
  addPouches: (count: number) => Promise<void>;
  setPouchCount: (pouches: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  clearDiscounts: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

// Bring a cart's gift lines to the capped target for its pouch count, once.
// Heals carts persisted before gifts existed, or mutated outside the site
// (leftover gifts, wrong quantities, gifts with no pouches). Returns the
// corrected cart, or null when nothing needed changing. Callers run this at
// most once and swallow errors: it must never block hydration.
async function reconcileGiftLines(cart: Cart): Promise<Cart | null> {
  const target = giftLinesForPouchCount(khanaPouchCount(cart.lines));
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
    if (!cartId) return;
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
      });
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

  const runMutation = useCallback(
    async (mutate: (cartId: string) => Promise<Cart>) => {
      setIsPending(true);
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
      } finally {
        setIsPending(false);
      }
    },
    [cart?.id]
  );

  const addItem = useCallback(
    async (merchandiseId: string, quantity: number) => {
      await runMutation((cartId) =>
        getCommerceProvider().addLines(cartId, [{ merchandiseId, quantity }])
      );
      setIsOpen(true);
    },
    [runMutation]
  );

  const setPouchCount = useCallback(
    async (pouches: number) => {
      // The pouch bundle lines and the free gift lines both derive from the
      // pouch count, so they repack together: tier lines to the cheapest mix,
      // gift lines to the capped jar/dabba counts.
      const managedLines = (cart?.lines ?? []).filter(
        (line) => tierForSku(line.merchandise.sku) !== null || isGiftLine(line)
      );
      const currentByVariant = new Map(
        managedLines.map((line) => [line.merchandise.id, line])
      );
      const target = [
        ...linesForPouchCount(pouches),
        ...giftLinesForPouchCount(pouches)
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
      if (additions.length === 0 && updates.length === 0 && removals.length === 0) {
        return;
      }

      await runMutation(async (cartId) => {
        const provider = getCommerceProvider();
        let next: Cart | null = null;
        if (updates.length > 0) next = await provider.updateLines(cartId, updates);
        if (additions.length > 0) next = await provider.addLines(cartId, additions);
        if (removals.length > 0) next = await provider.removeLines(cartId, removals);
        return next!;
      });
    },
    [runMutation, cart?.lines]
  );

  const addPouches = useCallback(
    async (count: number) => {
      await setPouchCount(khanaPouchCount(cart?.lines ?? []) + count);
      setIsOpen(true);
    },
    [setPouchCount, cart?.lines]
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
      await runMutation((cartId) => {
        const existing = cart?.discountCodes.map((entry) => entry.code) ?? [];
        return getCommerceProvider().updateDiscountCodes(cartId, [
          ...existing.filter((entry) => !isGiftingCode(entry)),
          GIFTING.codes[audience]
        ]);
      });
      setGiftingMethod(method);
    },
    [runMutation, cart?.discountCodes, setGiftingMethod]
  );

  const removeGifting = useCallback(async () => {
    await runMutation((cartId) => {
      const remaining = (cart?.discountCodes.map((entry) => entry.code) ?? []).filter(
        (entry) => !isGiftingCode(entry)
      );
      return getCommerceProvider().updateDiscountCodes(cartId, remaining);
    });
    setGiftingMethod(null);
  }, [runMutation, cart?.discountCodes, setGiftingMethod]);

  const clearDiscounts = useCallback(async () => {
    await runMutation((cartId) =>
      getCommerceProvider().updateDiscountCodes(cartId, [])
    );
    setGiftingMethod(null);
  }, [runMutation, setGiftingMethod]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isOpen,
      isPending,
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
      setPouchCount,
      updateQuantity,
      removeItem,
      applyDiscount,
      clearDiscounts
    }),
    [
      cart,
      isOpen,
      isPending,
      mode,
      setModeOverride,
      previewUnlocked,
      setPreviewUnlocked,
      giftingMethod,
      applyGifting,
      removeGifting,
      addItem,
      addPouches,
      setPouchCount,
      updateQuantity,
      removeItem,
      applyDiscount,
      clearDiscounts
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
