// Shared names for the consultant preview unlock (/preview): a password
// checked server-side mints the cookie, and the browser keeps a client
// flag so the mode switch works outside development. Neither grants
// anything a determined reader could not find in the bundle; the point is
// that ordinary visitors never stumble into selling mode.

/** httpOnly cookie set by /api/preview-unlock; read server-side (legal docs). */
export const PREVIEW_COOKIE = "heldi_preview";

/** localStorage flag read client-side (cart context, mode toggle). */
export const PREVIEW_UNLOCK_KEY = "heldi_preview_unlocked";
