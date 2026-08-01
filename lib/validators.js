/**
 * lib/validators.js
 * ------------------------------------------------------------------
 * Zod schemas for form validation. Imported by both the contact form
 * hook (client-side, via @hookform/resolvers/zod) and
 * app/api/lead/route.js (server-side) — one schema, validated twice,
 * so a request that somehow bypasses the client form still can't
 * reach Sheets/WhatsApp with garbage data.
 *
 * NOTE: this file is imported by hooks/useLeadForm.js on the client
 * (to build clientSchema via .omit({ phone: true })). Even though
 * the client never actually runs the phone validator below, the
 * import is static, so whatever's imported here still ships to the
 * browser. That's why this uses libphonenumber-js/min (smaller
 * metadata) rather than the full package — the extra accuracy of the
 * full variant would only ever be used server-side, but its larger
 * bundle would ship to every visitor regardless.
 *
 * `website` is the honeypot field — deliberately NOT named
 * "honeypot". A field literally called that is a giveaway a bot can
 * pattern-match and skip. "website" reads as a normal, temptingly
 * fillable field (real spam bots often auto-fill anything that looks
 * like a company/website field), while a real dealership customer
 * form never legitimately needs it. It must stay visually hidden in
 * the UI (off-screen CSS, not display:none, tabIndex={-1},
 * autoComplete="off") — that's the form component's job, not this
 * schema's. If it's non-empty on submit, treat it as spam.
 * ------------------------------------------------------------------
 */

import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js/min";

export const leadFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is too short")
    .max(100, "Name is too long"),

  // Expected as a full E.164 string (leading "+", country code
  // included) — that's what hooks/useLeadForm.js sends after
  // combining the selected country + typed local number via
  // libphonenumber-js's parsePhoneNumberFromString(). Without the
  // "+" prefix, isValidPhoneNumber can't determine a country and
  // will always return false — that's intentional, not a bug: an
  // ambiguous number without country info shouldn't pass.
  phone: z
    .string()
    .trim()
    .refine((value) => isValidPhoneNumber(value), {
      message: "Enter a valid phone number",
    }),

  message: z
    .string()
    .trim()
    .max(500, "Message is too long")
    .optional()
    .or(z.literal("")),

  // Required — deliberately generic validation (any non-empty string
  // up to a sane length), not a strict enum matched against
  // site.config.js's leadCapture.services list. Keeping this schema
  // free of config coupling means it stays pure/testable regardless
  // of which dealership project it's running in. The real constraint
  // is the <select> dropdown in Contact.jsx only ever offering the
  // configured options — a visitor can't submit something outside
  // that list through the real form.
  interestedIn: z
    .string()
    .trim()
    .min(1, "Please select what you're interested in")
    .max(100, "Selection is too long"),

  website: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});