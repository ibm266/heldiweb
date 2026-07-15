"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { khanaPouchCount, linesForPouchCount, tierForSku } from "@/lib/commerce/catalog";
import { COMMERCE_MODE } from "@/lib/commerce/config";
import { getCommerceProvider } from "@/lib/commerce/provider";
import type { Cart, CartLineInput, CommerceMode } from "@/lib/commerce/types";
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
  // Dev-only runtime override of the env flag; null follows the env.
  setModeOverride: (mode: CommerceMode | null) => void;
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
  const [giftingMethod, setGiftingMethodState] = useState<GiftingMethod | null>(null);

  const mode = modeOverride ?? COMMERCE_MODE;

  // Hydrate cart + dev mode override + gifting method from storage after mount.
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
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
      .then((existing) => {
        if (existing) setCart(existing);
        else window.localStorage.removeItem(CART_ID_KEY);
      })
      .catch(() => {
        window.localStorage.removeItem(CART_ID_KEY);
      });
  }, []);

  const setModeOverride = useCallback((next: CommerceMode | null) => {
    setModeOverrideState(next);
    if (next) window.localStorage.setItem(MODE_OVERRIDE_KEY, next);
    else window.localStorage.removeItem(MODE_OVERRIDE_KEY);
    setIsOpen(false);
  }, []);

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
      const tierLines = (cart?.lines ?? []).filter(
        (line) => tierForSku(line.merchandise.sku) !== null
      );
      const currentByVariant = new Map(
        tierLines.map((line) => [line.merchandise.id, line])
      );
      const target = linesForPouchCount(pouches);
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
      const removals = tierLines
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
