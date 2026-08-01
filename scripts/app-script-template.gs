/**
 * scripts/apps-script-template.gs
 * ------------------------------------------------------------------
 * NOT run by Node/Next.js — this is Google Apps Script (runs inside
 * Google's own environment). Copy this into the Apps Script editor
 * bound to each dealership's leads Google Sheet, once per new client.
 *
 * SETUP, per dealership:
 *   1. Create/open the dealership's leads Google Sheet
 *   2. Add column headers matching the row order below: Timestamp,
 *      Name, Phone, Interested In, Message — appendRow() writes by
 *      POSITION, not by matching header names, so the Sheet's actual
 *      column order must match this file's appendRow() call exactly
 *   3. Extensions → Apps Script
 *   4. Paste this file's contents in, replacing the default Code.gs
 *   5. Project Settings (gear icon) → Script Properties → add a
 *      property named SHARED_SECRET with a long random value (e.g.
 *      generate one with `openssl rand -hex 32` locally) — this is
 *      why the secret isn't hardcoded in this file: Script Properties
 *      aren't visible to anyone who only has view access to the code
 *   6. Deploy → New deployment → type: Web app → Execute as: Me →
 *      Who has access: Anyone → Deploy
 *   7. Copy the resulting Web App URL into that project's
 *      .env.local as GOOGLE_SHEETS_ENDPOINT
 *   8. Copy the SAME secret value from step 5 into .env.local as
 *      GOOGLE_SHEETS_SECRET — these two values must match exactly
 *
 * WHY THE SECRET IS IN THE REQUEST BODY, NOT A HEADER: Apps Script's
 * doPost(e) event object does not expose incoming HTTP headers at
 * all — only e.postData.contents (the raw body) and e.parameter
 * (query string / form params). A header-based secret would silently
 * never be checked. See lib/sheets.js for the Next.js side sending
 * the secret this way.
 * ------------------------------------------------------------------
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var expectedSecret = PropertiesService.getScriptProperties().getProperty(
    "SHARED_SECRET"
  );

  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: "invalid_body" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Reject anything without a matching secret. Returns the same
  // generic error whether the secret was missing or wrong — no need
  // to help a probing request figure out which.
  if (!expectedSecret || data.secret !== expectedSecret) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: "unauthorized" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Only write the actual lead fields — `secret` itself never gets
  // written into the Sheet as a spurious column. Order here MUST
  // match the Sheet's actual column headers — see setup step 2 above.
  sheet.appendRow([
    new Date(),
    data.name || "",
    data.phone || "",
    data.interestedIn || "",
    data.message || "",
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ success: true })
  ).setMimeType(ContentService.MimeType.JSON);
}