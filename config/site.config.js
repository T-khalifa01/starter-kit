/**
 * site.config.js
 * ------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH for INFRASTRUCTURE VALUES — identity,
 * contact numbers, socials, brand tokens, SEO, analytics/monitoring.
 *
 * This file does NOT control page content or section layout.
 * Every dealership site is hand-built: real JSX, real custom
 * sections, written to fit that dealership's design and tone.
 * The `components/sections` library is a reference/foundation —
 * a starting point you pick from and modify per project, not a
 * runtime switch driven by config.
 *
 * What belongs here: anything that's a genuine cross-cutting value
 * used by multiple parts of the app (a phone number used by both
 * the CTA button and the footer, a color used across several
 * components, an analytics ID). What doesn't belong here: headline
 * copy, about text, layout choices — that lives directly in each
 * dealership's JSX.
 * ------------------------------------------------------------------
 */

const siteConfig = {
  // ==================================================================
  // 1. DEALERSHIP IDENTITY
  // ==================================================================
  dealership: {
    name: "Dealership Name", // Public-facing display name
    legalName: "Dealership Legal Name LLC", // Footer copyright line
    slug: "dealership-slug", // URLs, file naming, analytics labels
  },

  // ==================================================================
  // 2. CONTACT — WhatsApp numbers are intentionally split.
  //    ctaNumber   -> hero CTA + floating WhatsApp button
  //                   (general "I'm interested" enquiries)
  //    formNumber  -> contact/enquiry form ONLY
  //                   (dealership's "sales desk" line; can equal
  //                   ctaNumber if they only have one line)
  // ==================================================================
  contact: {
    whatsapp: {
      ctaNumber: "201000000000", // Full international format, no + or spaces
      formNumber: "201000000000",
      ctaDefaultMessage: "Hi, I'd like to enquire about your vehicles.",
    },
    phone: "+20 100 000 0000", // Optional, omit from UI if not provided
    email: "info@dealership.com", // Optional, omit from UI if not provided
    address: {
      line1: "Showroom address line 1",
      line2: "District, City",
      country: "Egypt",
      mapEmbedUrl: "", // Google Maps iframe src
      lat: null,
      lng: null,
    },
  },

  // ==================================================================
  // 3. SOCIAL LINKS — only render icons/links for non-empty values
  // ==================================================================
  social: {
    instagram: "",
    tiktok: "",
    facebook: "",
    whatsappChannel: "",
  },

  // ==================================================================
  // 4. BRAND TOKENS — colors used as a consistent foundation across
  //    custom components. Individual components can still deviate —
  //    these are defaults, not constraints.
  //
  //    Fonts are NOT here. Font family/weight is a design decision,
  //    hand-set per project in app/layout.jsx via next/font/google or
  //    next/font/local — see that file's top comment block. This
  //    keeps fonts self-hosted, correctly weighted for whichever
  //    specific font is chosen, and unconstrained by a generic
  //    two-slot config system.
  // ==================================================================
  brand: {
    colors: {
      primary: "#0A0A0A",
      secondary: "#1A1A1A",
      accent: "#8A6D14", // Chosen deliberately: 4.91:1 contrast against
      // white (WCAG AA needs 4.5:1) — the original placeholder
      // (#C9A227) actually FAILED this at 2.42:1, caught by
      // scripts/validate-config.mjs during a real dry-run build. Real
      // projects will replace this anyway, but the starter kit's own
      // example should demonstrate a value that actually passes.
      background: "#0A0A0A",
      surface: "#141414",
      textPrimary: "#F5F5F5",
      textMuted: "#A0A0A0",
    },
    logo: {
      wordmarkText: "", // If no logo image, render as styled text using brand fonts
      imageSrc: "", // Path in /public, takes priority over wordmarkText if set
      faviconSrc: "/favicon.ico",
    },
  },

  // ==================================================================
  // 5. SEO / METADATA — feeds the Next.js Metadata API, OG tags,
  //    robots.js and sitemap.js
  // ==================================================================
  seo: {
    title: "Dealership Name | Premium Cars in Egypt",
    description: "Short SEO meta description, 150-160 characters ideally.",
    keywords: ["luxury cars Egypt", "premium dealership Cairo"],
    siteUrl: "https://www.dealership-domain.com", // No trailing slash
    ogImage: "/og-image.jpg", // Path in /public, 1200x630 recommended
    locale: "en_EG",
    robots: {
      index: true,
      follow: true,
    },
  },

  // ==================================================================
  // 6. LANGUAGE — bilingual EN/AR, English-dominant
  // ==================================================================
  i18n: {
    defaultLocale: "en",
    supportedLocales: ["en", "ar"],
    dir: "ltr",
  },

  // ==================================================================
  // 7. SERVICE MODEL — Model 1 = presence + trust + WhatsApp CTA only
  //                     Model 2 = adds inventory/pricing functionality
  //    Purely informational flag (e.g. for internal notes or
  //    conditionally rendering an Inventory section import) — does
  //    NOT drive a generic component the way earlier drafts assumed.
  // ==================================================================
  serviceModel: "model-1", // "model-1" | "model-2"

  // ==================================================================
  // 8. LEAD FORM MESSAGE TEMPLATE — the WhatsApp message format used
  //    when a form submission redirects to the dealership's sales
  //    number. Functional string consumed by lib/whatsapp.js, not
  //    page content.
  //    NOTE: The Google Sheets endpoint itself is NOT here — it's a
  //    per-deploy value that lives in .env.local as
  //    GOOGLE_SHEETS_ENDPOINT (see .env.example).
  // ==================================================================
  leadCapture: {
    formEnquiryMessageTemplate:
      "New website enquiry:\nName: {name}\nPhone: {phone}\nMessage: {message}",
  },

  // ==================================================================
  // 9. ANALYTICS & MONITORING
  // ==================================================================
  analytics: {
    ga4MeasurementId: "", // e.g. "G-XXXXXXXXXX", leave empty to disable GA4
  },

  monitoring: {
    sentryDsn: "", // Leave empty to disable Sentry entirely
    sentryEnvironment: "production",
  },
};

export default siteConfig;