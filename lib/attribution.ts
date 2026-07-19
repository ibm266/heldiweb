// First-touch attribution: where a visitor originally came from, captured on
// their first page load and never overwritten (first touch means first). It
// rides on every analytics event as first_touch_* properties and reaches
// Shopify orders through the _heldi_utm cart attribute, so revenue can be
// tied back to a channel. sessionStorage is the default home, consistent
// with anonymous-mode tracking; the localStorage copy exists only after
// full-measurement consent (lib/consent.ts).

export type FirstTouch = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  referrer?: string;
  landing_path: string;
  ts: number;
};

const SESSION_KEY = "heldi_touch_v1";
const PERSIST_KEY = "heldi_first_touch_v1";

const UTM_FIELDS = [
  ["utm_source", "source"],
  ["utm_medium", "medium"],
  ["utm_campaign", "campaign"],
  ["utm_term", "term"],
  ["utm_content", "content"]
] as const;

function readFrom(storage: Storage, key: string): FirstTouch | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FirstTouch;
    if (typeof parsed.landing_path !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getFirstTouch(): FirstTouch | null {
  if (typeof window === "undefined") return null;
  return (
    readFrom(window.localStorage, PERSIST_KEY) ??
    readFrom(window.sessionStorage, SESSION_KEY)
  );
}

export function captureFirstTouch(): void {
  if (typeof window === "undefined") return;
  if (getFirstTouch()) return;

  const params = new URLSearchParams(window.location.search);
  const touch: FirstTouch = {
    landing_path: window.location.pathname,
    ts: Date.now()
  };
  for (const [param, field] of UTM_FIELDS) {
    const value = params.get(param);
    if (value) touch[field] = value;
  }
  if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
    touch.referrer = document.referrer;
  }

  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(touch));
  } catch {
    // Storage blocked: attribution is best-effort.
  }
}

// On full-measurement consent the tab-scoped touch becomes durable.
export function promoteFirstTouch(): void {
  if (typeof window === "undefined") return;
  if (readFrom(window.localStorage, PERSIST_KEY)) return;
  const touch = readFrom(window.sessionStorage, SESSION_KEY);
  if (!touch) return;
  try {
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify(touch));
  } catch {
    // Best-effort.
  }
}

export function clearPersistedFirstTouch(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PERSIST_KEY);
  } catch {
    // Best-effort.
  }
}

// Serialised for the _heldi_utm cart attribute on the checkout handoff.
export function firstTouchForCart(): string {
  return JSON.stringify(getFirstTouch() ?? {});
}

export function firstTouchSuperProps(): Record<string, string | number> {
  const touch = getFirstTouch();
  if (!touch) return {};
  const props: Record<string, string | number> = {
    first_touch_landing_path: touch.landing_path,
    first_touch_ts: touch.ts
  };
  if (touch.source) props.first_touch_source = touch.source;
  if (touch.medium) props.first_touch_medium = touch.medium;
  if (touch.campaign) props.first_touch_campaign = touch.campaign;
  if (touch.term) props.first_touch_term = touch.term;
  if (touch.content) props.first_touch_content = touch.content;
  if (touch.referrer) props.first_touch_referrer = touch.referrer;
  return props;
}
