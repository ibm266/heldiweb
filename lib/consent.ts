// Categorised analytics consent, stored client-side. Three categories rather
// than a yes/no so future ad pixels slot in without reworking the banner:
//   statistics - anonymous, cookieless visit counting. Defaults to ON under
//                the UK DUAA 2025 statistical-purposes exemption; the cookies
//                page offers the required free opt-out.
//   analytics  - persistent identity, session replay, heatmaps. Opt-in only,
//                via the consent banner.
//   marketing  - future Meta/Google pixels. No consumer yet; any future pixel
//                loader MUST check hasConsent("marketing") before injecting.
// Storing the record itself is consent-preference storage (PECR strictly
// necessary), so it needs no consent of its own.

export type ConsentCategory = "statistics" | "analytics" | "marketing";

export type ConsentRecord = {
  statistics: boolean;
  analytics: boolean;
  marketing: boolean;
  version: number;
  ts: number;
};

export type ConsentChoices = Pick<
  ConsentRecord,
  "statistics" | "analytics" | "marketing"
>;

export const CONSENT_KEY = "heldi_consent_v1";
// Bump when the meaning of a choice changes (e.g. when marketing pixels gain
// a consumer): stored records with an older version read as null, so the
// banner re-prompts.
export const CONSENT_VERSION = 1;
export const CONSENT_CHANGE_EVENT = "heldi:consent-change";

const DEFAULTS: ConsentChoices = {
  statistics: true,
  analytics: false,
  marketing: false
};

// null means "never answered", which is the banner's show condition.
export function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(choices: ConsentChoices): ConsentRecord {
  const record: ConsentRecord = {
    ...choices,
    version: CONSENT_VERSION,
    ts: Date.now()
  };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    // Storage blocked: the choice still applies for this page load.
  }
  window.dispatchEvent(
    new CustomEvent<ConsentRecord>(CONSENT_CHANGE_EVENT, { detail: record })
  );
  return record;
}

export function hasConsent(category: ConsentCategory): boolean {
  const record = readConsent();
  return record ? record[category] : DEFAULTS[category];
}
