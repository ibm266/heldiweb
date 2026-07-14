// Minimal client-side analytics. Events are pushed onto window.dataLayer
// (created if absent) so any tag manager picked up at launch can consume
// them without code changes. Server-side calls are no-ops.

type EventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: string, props: EventProps = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...props });
  if (process.env.NODE_ENV === "development") {
    console.debug(`[analytics] ${event}`, props);
  }
}
