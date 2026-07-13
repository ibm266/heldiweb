"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { COMMERCE_MODE } from "@/lib/commerce/config";
import { getCommerceProvider } from "@/lib/commerce/provider";
import type { Cart, CommerceMode } from "@/lib/commerce/types";

const CART_ID_KEY = "heldi_cart_id";
const MODE_OVERRIDE_KEY = "heldi_mode_override";

type CartContextValue = {
  cart: Cart | null;
  isOpen: boolean;
  isPending: boolean;
  mode: CommerceMode;
  // Dev-only runtime override of the env flag; null follows the env.
  setModeOverride: (mode: CommerceMode | null) => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity: number) => Promise<void>;
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

  const mode = modeOverride ?? COMMERCE_MODE;

  // Hydrate cart + dev mode override from storage after mount.
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const stored = window.localStorage.getItem(MODE_OVERRIDE_KEY);
      if (stored === "waitlist" || stored === "live") {
        setModeOverrideState(stored);
      }
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

  const clearDiscounts = useCallback(
    () =>
      runMutation((cartId) =>
        getCommerceProvider().updateDiscountCodes(cartId, [])
      ),
    [runMutation]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isOpen,
      isPending,
      mode,
      setModeOverride,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
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
      addItem,
      updateQuantity,
      removeItem,
      applyDiscount,
      clearDiscounts
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
