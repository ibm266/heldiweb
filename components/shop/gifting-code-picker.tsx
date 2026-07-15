"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { GIFTING, type GiftingAudience } from "@/lib/pricing";

const OPTIONS: { audience: GiftingAudience; label: string }[] = [
  { audience: "beta", label: "I'm buying for my parents" },
  { audience: "rishta", label: "I'm buying for uncle and aunty" },
  { audience: "elder", label: "I'm the auntie or uncle" }
];

const COPIED_LABELS: Record<GiftingAudience, string> = {
  beta: "Copied. Good beta.",
  rishta: "Copied. Rishta sorted.",
  elder: "Copied. Shabash."
};

// Who's-buying toggle plus the tear-off code chip, shared by the gifting
// band and the added-to-basket popup. Each audience gets its own code —
// same discount, but the code someone types tells us who they are.
export function GiftingCodePicker({
  defaultAudience = null,
  surface,
  onApply
}: {
  defaultAudience?: GiftingAudience | null;
  /** Analytics label for where the picker is rendered. */
  surface: string;
  /** When set, adds an apply-to-basket shortcut under the chip. */
  onApply?: (audience: GiftingAudience) => void;
}) {
  const [audience, setAudience] = useState<GiftingAudience | null>(defaultAudience);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    },
    []
  );

  function selectAudience(next: GiftingAudience) {
    setAudience(next);
    setCopied(false);
    track("gifting_audience_selected", { audience: next, surface });
  }

  async function copyCode() {
    if (!audience) return;
    try {
      await navigator.clipboard.writeText(GIFTING.codes[audience]);
    } catch {
      // Clipboard can be unavailable (permissions, http); the visible code
      // itself is still there to type out.
    }
    track("gifting_code_copied", { audience, surface });
    setCopied(true);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="gifting-picker">
      <div
        className="gifting-picker__options"
        role="group"
        aria-label="Who's buying?"
      >
        {OPTIONS.map((option) => (
          <button
            key={option.audience}
            type="button"
            className={`gifting-picker__option${
              audience === option.audience ? " is-selected" : ""
            }`}
            aria-pressed={audience === option.audience}
            onClick={() => selectAudience(option.audience)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {audience ? (
        <>
          <button
            type="button"
            className="gifting__chip"
            onClick={copyCode}
            aria-label={`Copy discount code ${GIFTING.codes[audience]}`}
          >
            <span aria-live="polite">
              {copied ? COPIED_LABELS[audience] : GIFTING.codes[audience]}
            </span>
          </button>
          {onApply ? (
            <button
              type="button"
              className="gifting-picker__apply"
              onClick={() => onApply(audience)}
            >
              Or apply it straight to your basket
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
