/**
 * lib/consent.js
 * ------------------------------------------------------------------
 * Minimal analytics consent state, stored in localStorage (not a
 * cookie) — the only thing gated by this is client-side GA4 script
 * loading, no server-side logic ever needs to read it, so localStorage
 * is simpler and sufficient.
 *
 * Values: "granted" | "denied" | null (null = no choice made yet,
 * the banner should show).
 *
 * KNOWN LIMITATION: if a visitor grants consent, GA4 loads, then they
 * later revoke it (via a future "cookie settings" link), this stops
 * FUTURE tracking but doesn't retroactively undo an already-loaded
 * gtag script or already-set cookies within that same page load — a
 * full page reload after revoking is what actually clears that
 * state. Standard behavior for this class of simple consent
 * implementation, not something this file tries to solve more deeply.
 * ------------------------------------------------------------------
 */

const CONSENT_KEY = "analytics-consent";
const CONSENT_UPDATED_EVENT = "consent-updated";

export function getConsent() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    // Storage can throw in some contexts (private browsing, disabled
    // storage) — treat as "no choice made" rather than crashing.
    return null;
  }
}

export function setConsent(value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new Event(CONSENT_UPDATED_EVENT));
  } catch {
    // Silently no-op — same reasoning as getConsent().
  }
}

/**
 * Clears the stored choice so the banner reappears. Intended for a
 * future "Cookie Settings" link (e.g. in Footer.jsx, once built) —
 * not wired to anything yet since Footer.jsx is still a stub.
 */
export function resetConsent() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CONSENT_KEY);
    window.dispatchEvent(new Event(CONSENT_UPDATED_EVENT));
  } catch {
    // no-op
  }
}

/**
 * Subscribes to consent changes. Returns an unsubscribe function.
 */
export function onConsentChange(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CONSENT_UPDATED_EVENT, callback);
  return () => window.removeEventListener(CONSENT_UPDATED_EVENT, callback);
}