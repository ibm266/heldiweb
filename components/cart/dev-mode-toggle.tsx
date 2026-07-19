"use client";

import { useCart } from "./cart-context";

// Switch between waitlist and live selling mode so both states can be
// previewed without restarting the dev server. Shows in dev builds and in
// preview-unlocked browsers (see /preview); production visitors otherwise
// stay controlled by NEXT_PUBLIC_COMMERCE_MODE.
export function DevModeToggle({ variant = "floating" }: { variant?: "floating" | "menu" }) {
  const { mode, setModeOverride, previewUnlocked } = useCart();

  if (process.env.NODE_ENV !== "development" && !previewUnlocked) return null;

  const label =
    mode === "live" ? "● Selling mode" : "○ Waitlist mode";

  return (
    <button
      className={
        variant === "menu" ? "dev-mode-toggle dev-mode-toggle--menu" : "dev-mode-toggle"
      }
      type="button"
      onClick={() => setModeOverride(mode === "live" ? "waitlist" : "live")}
      title="Preview: switch between waitlist and selling mode"
    >
      {variant === "menu" ? label : `${label} — tap to switch`}
    </button>
  );
}
