/**
 * next.config.mjs
 * ------------------------------------------------------------------
 * MERGED file: the Sentry wizard's own generated output (org,
 * project, tunnelRoute, webpack options) is preserved exactly as
 * generated — do not remove or "clean up" any of it, even parts that
 * look redundant. Only the `headers()` function and
 * `poweredByHeader: false` inside the inner `nextConfig` object below
 * were added on top of the wizard's output.
 *
 * IMPORTANT: this file is loaded directly by Node, NOT run through
 * Next's own bundler/alias resolution — the "@/" import alias used
 * everywhere else in the app does NOT work here. Imports below use
 * relative paths instead.
 *
 * WHY NO NONCE-BASED SCRIPT-SRC: a real per-request CSP nonce
 * requires middleware generating a fresh value on every request,
 * which forces the whole site out of static rendering (Next.js
 * treats reading per-request data as a signal the page can't be
 * pre-rendered at build time). That trade — giving up the
 * "static page, no compute cost, resilient to scraping" property
 * this project deliberately chose (see scripts/setup-firewall.sh and
 * README section 8) — isn't worth it for THIS specific app: there is
 * no page anywhere that renders back untrusted/user-submitted content
 * (the lead form's data only ever goes to Google Sheets and into a
 * WhatsApp message string, never back into a rendered page), and the
 * only inline script on the entire site is the GA4 init snippet we
 * wrote ourselves in app/layout.jsx. Nonces earn their cost on sites
 * that render untrusted data back to users; this one doesn't. So
 * script-src below uses 'unsafe-inline' and the site stays static.
 *
 * COMPENSATING FOR 'unsafe-inline': since script-src can't be as
 * strict as a nonce-based policy, every OTHER directive below is
 * tightened as much as this app allows — object-src fully blocked,
 * base-uri/form-action restricted to self, framing blocked entirely,
 * connect-src/script-src only ever widened for GA4's specific domains
 * and only when analytics is actually on.
 *
 * NO CHANGE NEEDED FOR THE SENTRY TUNNEL: tunnelRoute below sends
 * client-side Sentry traffic to this site's own /monitoring path —
 * same-origin, already covered by connect-src 'self' in the CSP. No
 * separate Sentry domain needs allowlisting.
 * ------------------------------------------------------------------
 */

import { withSentryConfig } from '@sentry/nextjs';
import siteConfig from './config/site.config.js';
import { isAnalyticsEnabled } from './lib/analytics.js';

const gaEnabled = isAnalyticsEnabled(siteConfig);
const isDev = process.env.NODE_ENV !== 'production';

// Vercel Speed Insights loads its script from THIS deployment's own
// domain in production (already covered by 'self' below — no change
// needed there), but from an external Vercel domain in local
// development only. Without this dev-only exception, `npm run dev`
// would show CSP violations in the console for Speed Insights
// specifically — cosmetic in dev, but worth avoiding the noise.
const speedInsightsDevScriptSrc = isDev ? ' https://va.vercel-scripts.com' : '';
const speedInsightsDevConnectSrc = isDev
  ? ' https://vitals.vercel-insights.com'
  : '';

const scriptSrc = gaEnabled
  ? `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${speedInsightsDevScriptSrc}`
  : `script-src 'self' 'unsafe-inline'${speedInsightsDevScriptSrc}`;

const connectSrc = gaEnabled
  ? `connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com${speedInsightsDevConnectSrc}`
  : `connect-src 'self'${speedInsightsDevConnectSrc}`;

// style-src uses 'unsafe-inline' for a different, unrelated reason:
// app/layout.jsx sets brand colors as inline `style` CSS custom
// properties on <body>. Inline style ATTRIBUTES (as opposed to
// <style> blocks) don't support nonce-based allowlisting the way
// scripts do, and inline style injection is a much narrower attack
// surface than inline script injection (can't execute arbitrary JS
// via a style attribute) — this is the standard, accepted trade-off
// in real-world CSP setups regardless of the script-src decision above.
const csp = [
  `default-src 'self'`,
  scriptSrc,
  `style-src 'self' 'unsafe-inline'`,
  `font-src 'self'`, // self-hosted via next/font — no external font CDN needed
  `img-src 'self' data: https:`,
  connectSrc,
  `object-src 'none'`, // blocks Flash/plugin-based content entirely, no legitimate use here
  `base-uri 'self'`, // prevents <base> tag injection attacks
  `form-action 'self'`, // the lead form only ever submits to this site's own /api/lead
  `frame-ancestors 'none'`, // this site should never be embedded in an iframe anywhere
  `upgrade-insecure-requests`,
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removes the "X-Powered-By: Next.js" response header — minor
  // information disclosure, trivial to turn off, no reason not to.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            // Stops browsers from trying to "helpfully" guess a
            // different content type than what the server declared —
            // closes a class of MIME-sniffing based attacks.
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // No one should be able to embed this site in an iframe
            // (clickjacking protection). CSP's frame-ancestors above
            // does the same job for modern browsers; this covers
            // older ones that don't respect that directive.
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Sends the full URL as referrer for same-origin requests,
            // only the origin (no path) for cross-origin — balances
            // analytics usefulness against leaking full page URLs to
            // third parties.
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Forces HTTPS for 2 years, including subdomains. Vercel
            // already enforces HTTPS by default, so this mostly
            // protects against a specific downgrade-attack window
            // rather than changing normal behavior. `preload` alone
            // doesn't add the domain to browsers' built-in preload
            // list — that requires manually submitting the domain at
            // hstspreload.org, an optional per-project step, not
            // required for the header itself to work.
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // A single-page dealership brochure site has no
            // legitimate use for any of these. If a future design
            // genuinely needs one (e.g. a "find us" feature using
            // geolocation), update this per-project rather than
            // loosening the shared default.
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

// --- Everything below this line is the Sentry wizard's own generated
// output, preserved as-is. ---
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "no-org-os",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  }
});