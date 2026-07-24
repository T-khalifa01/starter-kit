/**
 * app/api/lead/route.js
 * ------------------------------------------------------------------
 * POST handler for the contact form.
 *
 * Flow:
 *   1. Reject requests whose Origin/Referer clearly points elsewhere
 *   2. Reject oversized requests before parsing (cheap guard against
 *      being handed huge payloads — a real form submission is a few
 *      hundred bytes, never megabytes)
 *   3. Parse + validate the payload (lib/validators.js — same schema
 *      the client form already checked, re-checked here because
 *      client-side validation is never trustworthy on its own)
 *   4. Reject silently if the honeypot field was filled (bot)
 *   5. Submit to Google Sheets for record-keeping (lib/sheets.js —
 *      retries internally, never throws, failure here does NOT
 *      block the response)
 *   6. Build the WhatsApp redirect link (lib/whatsapp.js) using the
 *      dealership's form/sales number — THIS is allowed to fail the
 *      request, because a missing/invalid number means the visitor
 *      has no way to actually reach the dealership, which defeats
 *      the entire point of the form
 *   7. Return the redirect link to the client; the client performs
 *      the actual navigation into WhatsApp
 *
 * RESILIENCE: the whole handler body runs inside a single try/catch.
 * This route should never be able to crash with an unhandled 500 and
 * no logging — every code path returns valid JSON, and any genuinely
 * unexpected error still gets captured in Sentry so it's visible
 * instead of silently failing.
 *
 * ORIGIN CHECK: rejects requests whose Origin/Referer header clearly
 * points to a different site (e.g. a script on someone else's page
 * POSTing directly to this endpoint). Does NOT block requests where
 * both headers are simply absent — some privacy-focused browsers and
 * extensions strip these even for legitimate same-site submissions,
 * and wrongly blocking a real customer is worse for a lead-gen
 * business than a marginally higher spam rate. This is one layer
 * among several (honeypot, schema validation, firewall rate limiting)
 * — not relied on alone.
 *
 * Volume/abuse protection (rate limiting, bot challenges) happens one
 * layer up, at the Vercel Firewall edge — see scripts/setup-firewall.sh.
 * Requests that get rate-limited or challenged there never reach this
 * function at all, which is the cheapest possible defense. This file
 * only handles hardening for requests that DO arrive.
 *
 * This route never sends WhatsApp messages server-side — it only
 * logs to Sheets and hands back the click-to-send link.
 * ------------------------------------------------------------------
 */

import * as Sentry from "@sentry/nextjs";
import { leadFormSchema } from "@/lib/validators";
import { submitLeadToSheet } from "@/lib/sheets";
import { buildFormLink } from "@/lib/whatsapp";
import siteConfig from "@/config/site.config";

// A real lead form submission (name + phone + short message) is a
// few hundred bytes. 5KB is generous headroom, not a tight limit.
const MAX_BODY_BYTES = 5_000;

/**
 * @param {Request} request
 * @param {object} config - site.config.js siteConfig object
 * @returns {boolean}
 */
function isRequestFromOwnSite(request, config) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowedOrigin = config.seo.siteUrl;

  if (origin) return origin === allowedOrigin;
  if (referer) return referer.startsWith(allowedOrigin);
  // Neither header present — allow through. See file header comment
  // for why this isn't treated as suspicious on its own.
  return true;
}

export async function POST(request) {
  try {
    if (!isRequestFromOwnSite(request, siteConfig)) {
      Sentry.captureMessage(
        "Lead form submission blocked: Origin/Referer mismatch",
        "warning"
      );
      return Response.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const contentLength = Number(request.headers.get("content-length"));

    // Content-Length can be absent or spoofed by a malicious client,
    // so this isn't a complete guard on its own — Vercel's own
    // platform-level body size limit is the hard backstop. This is
    // just a cheap, fast rejection for the common case, before we
    // spend any time parsing.
    if (contentLength && contentLength > MAX_BODY_BYTES) {
      return Response.json({ error: "Payload too large" }, { status: 413 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const parsed = leadFormSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, phone, message, website } = parsed.data;

    // `website` is the disguised honeypot field (see lib/validators.js
    // for why it's not literally called "honeypot"). Bots that
    // auto-fill every visible-looking field trip it. Respond as if
    // nothing happened rather than a 400 — no need to teach a bot
    // that this field is being checked, or that it exists at all.
    if (website) {
      return Response.json({ success: true, redirectUrl: null });
    }

    const leadPayload = { name, phone, message: message || "" };

    // Fire-and-await, not fire-and-block: we need this to finish
    // before the serverless function exits, but its result never
    // blocks the WhatsApp redirect — Sheets is a backup record, not
    // the primary path.
    const sheetsResult = await submitLeadToSheet(leadPayload);

    const redirectUrl = buildFormLink(siteConfig, leadPayload);

    if (!redirectUrl) {
      // Unlike a Sheets failure, this is a real dead end — the
      // visitor would have no way to reach the dealership. Worth
      // failing loudly and logging, since it almost certainly means
      // a misconfigured contact.whatsapp.formNumber in site.config.js.
      Sentry.captureMessage(
        "buildFormLink returned null — check contact.whatsapp.formNumber in site.config.js",
        "error"
      );
      return Response.json(
        { error: "Unable to generate WhatsApp link. Please try again later." },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      redirectUrl,
      sheetsLogged: sheetsResult.success,
    });
  } catch (error) {
    // Catch-all: anything unexpected (a bug, a malformed config field
    // we didn't anticipate, whatever) lands here instead of crashing
    // the function unhandled. Always log it, always return valid JSON.
    Sentry.captureException(error, { tags: { source: "app/api/lead" } });
    return Response.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}