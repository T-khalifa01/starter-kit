// Google Sheets POST helper
/**
 * lib/sheets.js
 * ------------------------------------------------------------------
 * Posts lead form data to a dealership-specific Google Apps Script
 * Web App endpoint, read server-side from
 * process.env.GOOGLE_SHEETS_ENDPOINT (see .env.example — this is a
 * per-deploy value, not a design/brand value, so it does not live in
 * site.config.js).
 *
 * AUTH: Apps Script Web Apps deployed as "Anyone" accept requests
 * from anyone who has the URL — there's no built-in request
 * authentication. A shared secret closes that gap, but it has to
 * travel INSIDE the JSON body, not as a custom HTTP header — Apps
 * Script's doPost(e) handler doesn't expose incoming request headers
 * at all (only e.postData.contents and e.parameter), so a header-based
 * secret would silently never be checked. See
 * scripts/apps-script-template.gs for the counterpart code that
 * validates this on the Apps Script side.
 *
 * Server-only. This file is imported by app/api/lead/route.js, never
 * by client components.
 *
 * Design: Sheets is a record-keeping backup, not the primary
 * conversion path — WhatsApp is. So this function never throws in a
 * way that should block the user's WhatsApp redirect. It retries a
 * couple of times to absorb transient network blips, and if it still
 * fails, logs to Sentry for manual follow-up and resolves with a
 * failure flag instead of throwing. The caller (the API route)
 * decides what to do with that flag — which, per our design, is
 * "nothing user-facing."
 * ------------------------------------------------------------------
 */

import * as Sentry from "@sentry/nextjs";

const MAX_ATTEMPTS = 3; // 1 initial attempt + 2 retries
const RETRY_DELAY_MS = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Submits a lead payload to the dealership's Google Sheets endpoint.
 * Never throws — always resolves with a result object so callers
 * don't need try/catch to stay safe.
 *
 * @param {object} payload - lead data (name, phone, message, etc)
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function submitLeadToSheet(payload) {
  const endpoint = process.env.GOOGLE_SHEETS_ENDPOINT;
  const secret = process.env.GOOGLE_SHEETS_SECRET;

  if (!endpoint || !secret) {
    // Missing config is worth knowing about, but there's nothing to
    // retry here — fail fast without burning attempts on a request
    // that can never succeed (and would just get rejected by the
    // Apps Script's own secret check anyway, per
    // scripts/apps-script-template.gs).
    Sentry.captureMessage(
      "GOOGLE_SHEETS_ENDPOINT or GOOGLE_SHEETS_SECRET is not set — lead was not logged to Sheets",
      "warning"
    );
    return { success: false, error: "missing_config" };
  }

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // `secret` travels in the body, not a header — see file
        // header comment for why. The Apps Script template strips
        // this field out before writing the row to the Sheet.
        body: JSON.stringify({ ...payload, secret }),
      });

      if (!response.ok) {
        throw new Error(`Sheets endpoint responded with ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === MAX_ATTEMPTS;
      if (!isLastAttempt) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  // Exhausted all retries — log for manual recovery, but don't throw.
  // The lead itself is not lost: the same payload is what gets
  // formatted into the WhatsApp message the visitor sends, so the
  // dealership still receives it either way. This is only the backup
  // record failing.
  Sentry.captureException(lastError, {
    extra: { payload },
    tags: { source: "lib/sheets.js" },
  });

  return { success: false, error: "submit_failed" };
}