/**
 * app/layout.jsx
 * ------------------------------------------------------------------
 * Root layout. Structure (GA4 wiring, html/body shell) is shared and
 * shouldn't need edits per dealership — but the FONT IMPORTS BELOW
 * ARE THE ONE EXCEPTION. Edit them per project.
 *
 * FONTS — HAND-SET PER PROJECT, NOT CONFIG-DRIVEN:
 * Font choice is a design decision, not infrastructure, so it's
 * intentionally not read from site.config.js. Using next/font here
 * (rather than a dynamic Google Fonts <link>) gets you real
 * self-hosting and zero layout shift, but next/font requires the
 * font name and weights to be literal, static values — it can't read
 * a variable. So:
 *
 *   1. Pick the actual font(s) this dealership needs — any Google
 *      Font, any weight/style it actually offers, or a custom font
 *      file via next/font/local. Not limited to a "display + body"
 *      pair — add a third accent font if the design calls for it.
 *   2. Import it below, replacing the placeholder.
 *   3. Set only the weights that font actually ships (check the font
 *      on fonts.google.com first) — requesting a weight it doesn't
 *      have won't error, it just silently drops that weight and the
 *      browser falls back/synthesizes, which is a worse failure mode
 *      than just checking first.
 *   4. The `variable` names below (--next-font-display /
 *      --next-font-body) are intentionally NOT the same as the
 *      Tailwind-facing names (--font-display / --font-body) declared
 *      in globals.css's @theme inline block. Tailwind maps its own
 *      names to these via var() indirection — see globals.css for
 *      why they're kept distinct.
 *
 * Example below uses Playfair Display + Inter as placeholders —
 * replace before shipping a real dealership site.
 *
 * BRAND COLORS: injected as CSS custom properties on <body>
 * (--brand-*), read from site.config.js. globals.css's @theme inline
 * block maps these to real Tailwind utilities (bg-accent, text-accent,
 * etc) — components use those utility classes directly, never inline
 * style, for anything color-related.
 *
 * ANALYTICS: GA4 loading is gated behind visitor consent (see
 * lib/consent.js, components/ui/AnalyticsLoader.jsx,
 * components/ui/CookieConsentBanner.jsx). Even when
 * config.analytics.ga4MeasurementId is set, the actual GA4 script
 * doesn't load until the visitor explicitly accepts — this file only
 * decides WHETHER analytics is configured for this project at all
 * (isAnalyticsEnabled), not whether it's allowed to run for a given
 * visitor.
 *
 * SENTRY: no manual init here — the @sentry/nextjs wizard generates
 * its own instrumentation files (instrumentation.js,
 * instrumentation-client.js/ts) that handle this automatically.
 *
 * CSP: deliberately NOT nonce-based, on purpose — see next.config.mjs
 * for the reasoning. This file stays fully static (no headers()/
 * cookies() calls), which is what keeps the page pre-rendered at
 * build time rather than dynamically rendered per request. The
 * consent check itself happens inside AnalyticsLoader/
 * CookieConsentBanner, both client components — that's what lets this
 * file stay static while still gating something that needs
 * localStorage.
 *
 * STRUCTURED DATA: the JSON-LD <script> below is a
 * type="application/ld+json" block, not executable JavaScript, but
 * CSP's script-src directive still governs whether the browser
 * allows it to render at all — already covered by the 'unsafe-inline'
 * already present in script-src (see next.config.mjs), no separate
 * CSP change needed for this specifically.
 *
 * SPEED INSIGHTS: <SpeedInsights /> loads its script from this same
 * deployment's own domain in production (covered by CSP's 'self'),
 * but from an external Vercel domain in local development only — see
 * next.config.mjs for the dev-only CSP exception this requires.
 * ------------------------------------------------------------------
 */

import { Playfair_Display, Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import siteConfig from "@/config/site.config";
import { isAnalyticsEnabled } from "@/lib/analytics";
import { buildMetadata } from "@/lib/seo";
import { buildLocalBusinessSchema } from "@/lib/structuredData";
import AnalyticsLoader from "@/components/ui/AnalyticsLoader";
import CookieConsentBanner from "@/components/ui/CookieConsentBanner";
import "./globals.css";

export const metadata = buildMetadata(siteConfig);

// --- REPLACE PER PROJECT: real font choice + real available weights ---
const displayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // only weights this font actually has
  variable: "--next-font-display",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--next-font-body",
});
// -----------------------------------------------------------------

export default function RootLayout({ children }) {
  const { i18n, analytics, brand } = siteConfig;
  const gaEnabled = isAnalyticsEnabled(siteConfig);
  const { colors } = brand;
  const structuredData = buildLocalBusinessSchema(siteConfig);

  return (
    <html lang={i18n.defaultLocale} dir={i18n.dir}>
      <body
        className={`${displayFont.variable} ${bodyFont.variable}`}
        style={{
          "--brand-primary": colors.primary,
          "--brand-secondary": colors.secondary,
          "--brand-accent": colors.accent,
          "--brand-background": colors.background,
          "--brand-surface": colors.surface,
          "--brand-text-primary": colors.textPrimary,
          "--brand-text-muted": colors.textMuted,
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {children}

        {gaEnabled && (
          <>
            <AnalyticsLoader measurementId={analytics.ga4MeasurementId} />
            <CookieConsentBanner />
          </>
        )}

        <SpeedInsights />
      </body>
    </html>
  );
}