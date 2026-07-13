"use client";

import { useCart } from "./cart-context";

// Development-only switch between waitlist and live selling mode so both
// states can be previewed without restarting the dev server. Production
// stays controlled by NEXT_PUBLIC_COMMERCE_MODE.
export function DevModeToggle() {
  const { mode, setModeOverride } = useCart();

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <button
      className="dev-mode-toggle"
      type="button"
      onClick={() => setModeOverride(mode === "live" ? "waitlist" : "live")}
    >
      {mode === "live" ? "● Selling mode" : "○ Waitlist mode"} — tap to switch
    </button>
  );
}
