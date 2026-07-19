"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";

// The interactive half of /preview. Locked: a password field that posts to
// /api/preview-unlock; the server checks it and mints the cookie, and on
// success this browser flips its localStorage flag. Unlocked: a mode chooser
// that drives the same override the dev toggle uses, plus a lock button that
// clears everything. Nothing here changes what real visitors see.
export function PreviewModePanel() {
  const { mode, previewUnlocked, setPreviewUnlocked, setModeOverride } = useCart();
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function unlock(event: React.FormEvent) {
    event.preventDefault();
    if (checking || password.trim() === "") return;
    setChecking(true);
    setError(null);
    try {
      const response = await fetch("/api/preview-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (response.ok) {
        setPreviewUnlocked(true);
        setPassword("");
      } else {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setChecking(false);
    }
  }

  async function lock() {
    await fetch("/api/preview-unlock", { method: "DELETE" }).catch(() => {});
    setPreviewUnlocked(false);
  }

  if (!previewUnlocked) {
    return (
      <div className="preview-panel">
        <form className="preview-panel__form" onSubmit={unlock}>
          <label className="sr-only" htmlFor="preview-password">
            Password
          </label>
          <input
            id="preview-password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            className="button button--pill"
            type="submit"
            disabled={checking || password.trim() === ""}
          >
            {checking ? "Checking…" : "Unlock"}
          </button>
        </form>
        {error ? (
          <p className="preview-panel__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="preview-panel">
      <p className="preview-panel__status">This browser is unlocked.</p>
      <div className="option-grid option-grid--size preview-panel__modes">
        <label
          className={`option-card option-card--slim${
            mode === "waitlist" ? " is-selected" : ""
          }`}
        >
          <input
            type="radio"
            name="preview-mode"
            value="waitlist"
            checked={mode === "waitlist"}
            onChange={() => setModeOverride("waitlist")}
          />
          <span className="option-card__name">Waitlist mode</span>
          <span className="option-card__meta">Browse only, join-waitlist CTAs</span>
        </label>
        <label
          className={`option-card option-card--slim${
            mode === "live" ? " is-selected" : ""
          }`}
        >
          <input
            type="radio"
            name="preview-mode"
            value="live"
            checked={mode === "live"}
            onChange={() => setModeOverride("live")}
          />
          <span className="option-card__name">Selling mode</span>
          <span className="option-card__meta">Prices, basket and checkout</span>
        </label>
      </div>
      <p className="preview-panel__note">
        Only this browser changes. What visitors see is set by the launch flag
        at deploy time. The mode pill in the nav shows which storefront you are
        looking at.
      </p>
      <button className="button button--pill preview-panel__lock" type="button" onClick={lock}>
        Lock preview
      </button>
    </div>
  );
}
