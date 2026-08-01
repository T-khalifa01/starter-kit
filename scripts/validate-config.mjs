#!/usr/bin/env node
/**
 * scripts/validate-config.mjs
 * ------------------------------------------------------------------
 * Pre-deploy sanity check. Run before deploying any real dealership
 * site — catches the failure mode that actually matters for this
 * project: not "is the shared code broken" (it's stable, shared,
 * already tested across every clone) but "did THIS specific project
 * get properly filled in."
 *
 * Checks: leftover starter-kit placeholder values, malformed WhatsApp
 * numbers, invalid hex colors, WCAG contrast ratio for the accent
 * color against white text, missing referenced public files
 * (favicon/OG image), and required environment variables.
 *
 * USAGE:
 *   node --env-file=.env.local scripts/validate-config.mjs
 *
 * --env-file requires Node 20.6+. On an older Node version, use
 * dotenv instead:
 *   npx dotenv -e .env.local -- node scripts/validate-config.mjs
 *
 * Exits with code 1 if any hard errors are found (suitable for wiring
 * into a CI/deploy pipeline as a blocking step) — warnings alone exit
 * 0, since those are things worth checking, not necessarily mistakes.
 * ------------------------------------------------------------------
 */

import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import siteConfig from "../config/site.config.js";
import { sanitizePhoneNumber, isValidWhatsAppNumber } from "../lib/whatsapp.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, "../public");

const errors = [];
const warnings = [];

function checkError(condition, message) {
  if (!condition) errors.push(message);
}

function checkWarning(condition, message) {
  if (!condition) warnings.push(message);
}

// ------------------------------------------------------------------
// Dealership identity — starter-kit placeholder values left in place
// ------------------------------------------------------------------
checkError(
  siteConfig.dealership.name !== "Dealership Name",
  'dealership.name is still the starter-kit placeholder ("Dealership Name")'
);
checkError(
  siteConfig.dealership.legalName !== "Dealership Legal Name LLC",
  "dealership.legalName is still the starter-kit placeholder"
);
checkError(
  siteConfig.dealership.slug !== "dealership-slug",
  "dealership.slug is still the starter-kit placeholder"
);
checkError(
  /^[a-z0-9-]+$/.test(siteConfig.dealership.slug),
  "dealership.slug should be lowercase letters, numbers, and hyphens only"
);

// ------------------------------------------------------------------
// WhatsApp numbers — placeholder check + real validity check
// ------------------------------------------------------------------
const PLACEHOLDER_NUMBER = "201000000000";
const { ctaNumber, formNumber } = siteConfig.contact.whatsapp;

checkError(
  ctaNumber !== PLACEHOLDER_NUMBER,
  "contact.whatsapp.ctaNumber is still the starter-kit placeholder number"
);
checkError(
  isValidWhatsAppNumber(sanitizePhoneNumber(ctaNumber)),
  `contact.whatsapp.ctaNumber ("${ctaNumber}") is not a valid international number`
);
checkError(
  formNumber !== PLACEHOLDER_NUMBER,
  "contact.whatsapp.formNumber is still the starter-kit placeholder number"
);
checkError(
  isValidWhatsAppNumber(sanitizePhoneNumber(formNumber)),
  `contact.whatsapp.formNumber ("${formNumber}") is not a valid international number`
);

// ------------------------------------------------------------------
// Contact info — optional fields, so these are warnings, not errors
// ------------------------------------------------------------------
checkWarning(
  siteConfig.contact.phone !== "+20 100 000 0000",
  "contact.phone still looks like the starter-kit placeholder"
);
checkWarning(
  siteConfig.contact.email !== "info@dealership.com",
  "contact.email still looks like the starter-kit placeholder"
);
checkWarning(
  siteConfig.contact.address.line1 !== "Showroom address line 1",
  "contact.address.line1 still looks like the starter-kit placeholder"
);

// ------------------------------------------------------------------
// Brand colors — must be valid hex colors
// ------------------------------------------------------------------
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
for (const [key, value] of Object.entries(siteConfig.brand.colors)) {
  checkError(HEX_COLOR.test(value), `brand.colors.${key} ("${value}") is not a valid 6-digit hex color`);
}

checkError(
  Boolean(siteConfig.brand.logo.wordmarkText || siteConfig.brand.logo.imageSrc),
  "brand.logo needs either wordmarkText or imageSrc set — currently both are empty"
);

// ------------------------------------------------------------------
// Contrast check — WCAG relative luminance / contrast ratio formula.
// components/ui/WhatsAppButton.jsx's solid variant renders white text
// on brand.colors.accent — since accent is fully dealership-driven,
// nothing else stops a project from picking a color that fails
// contrast against white. This is the one thing an automated script
// CAN reliably catch about accessibility; broader practices (focus
// states, semantic structure, alt text, ARIA, keyboard nav) are a
// design-time discipline, not something a script can verify — see
// ACCESSIBILITY.md for that broader checklist.
// ------------------------------------------------------------------
function hexToRgb(hex) {
  const num = parseInt(hex.slice(1), 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function relativeLuminance({ r, g, b }) {
  const [rl, gl, bl] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

if (HEX_COLOR.test(siteConfig.brand.colors.accent)) {
  const accentVsWhite = contrastRatio(siteConfig.brand.colors.accent, "#FFFFFF");

  checkError(
    accentVsWhite >= 4.5,
    `brand.colors.accent ("${siteConfig.brand.colors.accent}") against white text has a contrast ratio of ${accentVsWhite.toFixed(2)}:1 — fails WCAG AA (needs 4.5:1). WhatsAppButton's solid variant renders white text on this color.`
  );
  checkWarning(
    accentVsWhite >= 7,
    `brand.colors.accent against white text is ${accentVsWhite.toFixed(2)}:1 — meets AA but not AAA (7:1). Not blocking, just worth knowing if AAA is a goal for this project.`
  );
}

// ------------------------------------------------------------------
// SEO — placeholder checks + real file existence checks
// ------------------------------------------------------------------
checkError(
  siteConfig.seo.title !== "Dealership Name | Premium Cars in Egypt",
  "seo.title is still the starter-kit placeholder"
);
checkError(
  siteConfig.seo.description !==
    "Short SEO meta description, 150-160 characters ideally.",
  "seo.description is still the starter-kit placeholder"
);
checkError(
  siteConfig.seo.siteUrl !== "https://www.dealership-domain.com",
  "seo.siteUrl is still the starter-kit placeholder"
);
checkError(
  /^https:\/\/.+/.test(siteConfig.seo.siteUrl),
  `seo.siteUrl ("${siteConfig.seo.siteUrl}") should start with https://`
);

const ogImagePath = resolve(PUBLIC_DIR, `.${siteConfig.seo.ogImage}`);
checkError(
  existsSync(ogImagePath),
  `seo.ogImage points to "${siteConfig.seo.ogImage}" but no file exists at public${siteConfig.seo.ogImage}`
);

const faviconPath = resolve(PUBLIC_DIR, `.${siteConfig.brand.logo.faviconSrc}`);
checkError(
  existsSync(faviconPath),
  `brand.logo.faviconSrc points to "${siteConfig.brand.logo.faviconSrc}" but no file exists at public${siteConfig.brand.logo.faviconSrc}`
);

// ------------------------------------------------------------------
// Lead form services list — the "Interested In" dropdown
// (components/sections/Contact.jsx) is broken with an empty list.
// ------------------------------------------------------------------
checkError(
  Array.isArray(siteConfig.leadCapture.services) &&
    siteConfig.leadCapture.services.length > 0,
  "leadCapture.services is empty — the Interested In dropdown needs at least one option"
);

// ------------------------------------------------------------------
// Lead form message template — must still contain the placeholders
// lib/whatsapp.js's interpolateTemplate() actually fills in. If these
// get edited out, the WhatsApp message silently loses that field.
// ------------------------------------------------------------------
const template = siteConfig.leadCapture.formEnquiryMessageTemplate;
checkWarning(
  template.includes("{name}"),
  "leadCapture.formEnquiryMessageTemplate no longer includes {name} — it won't appear in the WhatsApp message"
);
checkWarning(
  template.includes("{phone}"),
  "leadCapture.formEnquiryMessageTemplate no longer includes {phone} — it won't appear in the WhatsApp message"
);
checkWarning(
  template.includes("{interestedIn}"),
  "leadCapture.formEnquiryMessageTemplate no longer includes {interestedIn} — it won't appear in the WhatsApp message"
);

// ------------------------------------------------------------------
// Analytics — informational only, GA4 is genuinely optional
// ------------------------------------------------------------------
if (siteConfig.analytics.ga4MeasurementId) {
  checkWarning(
    /^G-[A-Z0-9]+$/.test(siteConfig.analytics.ga4MeasurementId),
    `analytics.ga4MeasurementId ("${siteConfig.analytics.ga4MeasurementId}") doesn't look like a valid GA4 ID (expected format: G-XXXXXXXXXX)`
  );
}

// ------------------------------------------------------------------
// Required environment variables — only checked if this script was
// run with --env-file (or dotenv); if .env.local wasn't loaded at
// all, every one of these will be "missing" and that's expected.
// ------------------------------------------------------------------
checkError(
  Boolean(process.env.GOOGLE_SHEETS_ENDPOINT),
  "GOOGLE_SHEETS_ENDPOINT is not set (check .env.local, and that this script was run with --env-file)"
);
checkError(
  Boolean(process.env.GOOGLE_SHEETS_SECRET),
  "GOOGLE_SHEETS_SECRET is not set — must match the SHARED_SECRET Script Property in this dealership's Apps Script project"
);
checkWarning(
  Boolean(process.env.SENTRY_AUTH_TOKEN),
  "SENTRY_AUTH_TOKEN is not set — production stack traces will be minified/unreadable without it"
);

// ------------------------------------------------------------------
// Report
// ------------------------------------------------------------------
console.log("\nConfig validation for:", siteConfig.dealership.name || "(unnamed)");
console.log("─".repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log("✅ All checks passed. Nothing to fix.");
} else {
  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} error(s) — must fix before deploying:\n`);
    errors.forEach((msg) => console.log(`   ✗ ${msg}`));
  }
  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} warning(s) — worth checking, not blocking:\n`);
    warnings.forEach((msg) => console.log(`   ! ${msg}`));
  }
}

console.log("");

if (errors.length > 0) {
  process.exit(1);
}