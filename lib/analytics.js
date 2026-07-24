// GA4 event wrapper
/**
 * lib/analytics.js
 * ------------------------------------------------------------------
 * Thin wrapper around GA4's gtag. This file does NOT load the GA4
 * script itself — that's a layout concern (next/script tags in
 * app/layout.jsx, gated on config.analytics.ga4MeasurementId being
 * set). This file only knows how to safely fire events once gtag
 * exists, and stays a no-op if it doesn't.
 *
 * Never throws. A tracking miss (GA4 disabled, blocked by an ad
 * blocker, script not loaded yet) should never break the page or a
 * user's action — it should just silently not track.
 * ------------------------------------------------------------------
 */

/**
 * Centralized event names. Every dealership site should emit the
 * same vocabulary so cross-client reporting stays comparable —
 * components should import from here rather than passing raw
 * strings, so a typo in one project doesn't silently fragment the
 * data (e.g. "whatsapp_click" vs "whatsapp_cta_click").
 */
export const ANALYTICS_EVENTS = {
  WHATSAPP_CTA_CLICK: "whatsapp_cta_click",
  WHATSAPP_FLOATING_CLICK: "whatsapp_floating_click",
  FORM_SUBMIT: "form_submit",
  FORM_SUBMIT_ERROR: "form_submit_error",
};

/**
 * Single source of truth for "is GA4 configured for this deploy."
 * Used by app/layout.jsx to decide whether to render the GA4 script
 * tags at all, and internally here as a fast-path check.
 *
 * @param {object} config - site.config.js siteConfig object
 * @returns {boolean}
 */
export function isAnalyticsEnabled(config) {
  return Boolean(config?.analytics?.ga4MeasurementId);
}

/**
 * Fires a GA4 event. Safe to call unconditionally from any client
 * component — if gtag isn't available for any reason, this quietly
 * does nothing rather than erroring.
 *
 * @param {string} eventName - use ANALYTICS_EVENTS, not a raw string
 * @param {object} [params] - additional event parameters, e.g. { dealership: config.dealership.slug }
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}