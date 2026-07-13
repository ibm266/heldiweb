"use client";

import { useCart } from "./cart-context";

// Development-only switch between waitlist and live selling mode so both
// states can be previewed without restarting the dev server. Production
// stays controlled by NEXT_PUBLIC_COMMERCE_MODE.
export function DevModeToggle({ variant = "floating" }: { variant?: "floating" | "menu" }) {
  const { mode, setModeOverride } = useCart();

  if (process.env.NODE_ENV !== "development") return null;

  const label =
    mode === "live" ? "● Selling mode" : "○ Waitlist mode";

  return (
    <button
      className={
        variant === "menu" ? "dev-mode-toggle dev-mode-toggle--menu" : "dev-mode-toggle"
      }
      type="button"
      onClick={() => setModeOverride(mode === "live" ? "waitlist" : "live")}
      title="Dev only: switch between waitlist and selling mode"
    >
      {variant === "menu" ? label : `${label} — tap to switch`}
    </button>
  );
}
