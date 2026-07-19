"use client";

import { useEffect, useState, type FormEvent } from "react";
import { updateConsent } from "@/lib/analytics";
import { CONSENT_CHANGE_EVENT, readConsent } from "@/lib/consent";

// The measurement control on /legal/cookies: the free opt-out the DUAA
// statistical-purposes posture requires, and the place to change an earlier
// banner answer. Stays in sync with the banner via the consent change event.

type Level = "full" | "anonymous" | "off";

const OPTIONS: { level: Level; name: string; meta: string }[] = [
  {
    level: "full",
    name: "Full measurement",
    meta: "Remembers your browser between visits and records session replays with typed text hidden. Helps us the most."
  },
  {
    level: "anonymous",
    name: "Anonymous counting only",
    meta: "Counts visits with no cookies and no way to recognise you. The default."
  },
  {
    level: "off",
    name: "No measurement at all",
    meta: "Not even anonymous counting."
  }
];

function currentLevel(): Level {
  const record = readConsent();
  if (!record) return "anonymous";
  if (!record.statistics) return "off";
  return record.analytics ? "full" : "anonymous";
}

export function AnalyticsChoices() {
  const [level, setLevel] = useState<Level>("anonymous");
  const [saved, setSaved] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLevel(currentLevel());
    function sync() {
      setLevel(currentLevel());
    }
    window.addEventListener(CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, sync);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateConsent({
      statistics: level !== "off",
      analytics: level === "full",
      marketing: false
    });
    setSaved(true);
  }

  return (
    <form className="analytics-choices" id="analytics-choices" onSubmit={apply}>
      <h2 className="analytics-choices__title">Your analytics choices</h2>
      <p className="analytics-choices__lede">
        Pick how much we measure. It applies straight away and you can change
        it here whenever you like.
      </p>
      <div
        className="analytics-choices__options"
        role="radiogroup"
        aria-label="Measurement level"
      >
        {OPTIONS.map((option) => (
          <label
            key={option.level}
            className={`option-card option-card--row${level === option.level ? " is-selected" : ""}`}
          >
            <input
              type="radio"
              name="analytics-level"
              value={option.level}
              checked={level === option.level}
              onChange={() => {
                setLevel(option.level);
                setSaved(false);
              }}
            />
            <span className="option-card__name">{option.name}</span>
            <span className="option-card__meta">{option.meta}</span>
          </label>
        ))}
      </div>
      <button className="button button--square" type="submit">
        Apply
      </button>
      {saved ? (
        <p className="analytics-choices__saved" role="status">
          Saved. It took effect immediately.
        </p>
      ) : null}
    </form>
  );
}
