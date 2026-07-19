// Server-side clamp on the free gift lines: defence in depth behind the cart's
// own sync (components/cart/cart-context.tsx). Stops a hand-crafted request
// from parking more free jars or dabbas in a cart than the per-order caps
// allow, or leaving gift lines on a cart with no pouches. It only ever reduces
// or removes gift lines, never adds them (the storefront owns additions, so
// adding here would double them), and it must never fail a legitimate request:
// on any error the un-clamped cart is returned.

import { giftCountsForPouches } from "@/lib/pricing";
import {
  isDabbaGiftLine,
  isGiftLine,
  isJarGiftLine,
  khanaPouchCount
} from "../catalog";
import type { Cart } from "../types";
import { removeLines, updateLines } from "./cart-actions";

export async function enforceGiftPolicy(cart: Cart): Promise<Cart> {
  try {
    const { jars, dabbas } = giftCountsForPouches(khanaPouchCount(cart.lines));

    const updates: { id: string; quantity: number }[] = [];
    const removals: string[] = [];
    for (const line of cart.lines) {
      if (!isGiftLine(line)) continue;
      const cap = isJarGiftLine(line) ? jars : isDabbaGiftLine(line) ? dabbas : 0;
      if (cap <= 0) removals.push(line.id);
      else if (line.quantity > cap) updates.push({ id: line.id, quantity: cap });
    }
    if (updates.length === 0 && removals.length === 0) return cart;

    let next = cart;
    if (updates.length > 0) next = await updateLines(cart.id, updates);
    if (removals.length > 0) next = await removeLines(cart.id, removals);
    return next;
  } catch {
    // Defence in depth, not a gate: never turn a valid cart mutation into an
    // error because the clamp hiccuped.
    return cart;
  }
}
