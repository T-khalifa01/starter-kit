import { describe, it, expect } from "vitest";
import { isAnalyticsEnabled, trackEvent, ANALYTICS_EVENTS } from "../../lib/analytics.js";

describe("isAnalyticsEnabled", () => {
  it("returns true when ga4MeasurementId is set", () => {
    expect(isAnalyticsEnabled({ analytics: { ga4MeasurementId: "G-ABC123" } })).toBe(
      true
    );
  });

  it("returns false when ga4MeasurementId is empty", () => {
    expect(isAnalyticsEnabled({ analytics: { ga4MeasurementId: "" } })).toBe(false);
  });

  it("returns false for a missing/malformed config rather than throwing", () => {
    expect(isAnalyticsEnabled({})).toBe(false);
    expect(isAnalyticsEnabled(undefined)).toBe(false);
  });
});

describe("trackEvent", () => {
  it("does not throw when window/gtag are unavailable (this test environment has neither)", () => {
    // This is the actual regression this test guards against: a
    // tracking call should never be able to crash the app, whether
    // that's because GA4 is disabled, blocked by an ad blocker, or
    // (as here) simply not loaded yet.
    expect(() => {
      trackEvent(ANALYTICS_EVENTS.WHATSAPP_CTA_CLICK, { dealership: "test" });
    }).not.toThrow();
  });
});