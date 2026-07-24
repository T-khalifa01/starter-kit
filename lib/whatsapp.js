/**
 * lib/whatsapp.js
 * ------------------------------------------------------------------
 * Click-to-send WhatsApp link builders. No WhatsApp Business API, no
 * server-initiated sends — every function here returns a wa.me URL
 * with a pre-filled, URL-encoded message. The visitor's own WhatsApp
 * (app, web, or desktop) handles the rest.
 *
 * Pure functions only. No `window`, no navigation, no analytics —
 * those concerns belong to the components that consume this file.
 * ------------------------------------------------------------------
 */

/**
 * Strips a phone number down to digits only so it's safe to drop into
 * a wa.me URL, regardless of how it was formatted in config
 * (+20 100 000 0000, (20) 100-000-0000, etc). Not country-specific —
 * works for any international number as long as the country code is
 * included in the original value.
 *
 * @param {string} number
 * @returns {string} digits-only phone number
 */
export function sanitizePhoneNumber(number) {
  if (typeof number !== "string") return "";
  return number.replace(/\D/g, "");
}

/**
 * Basic sanity check that a sanitized number could plausibly be a
 * real international WhatsApp number. Not a full validation library —
 * just guards against obviously broken config values (empty string,
 * a local number missing its country code, a pasted-in placeholder).
 * E.164 numbers are 8-15 digits including country code.
 *
 * @param {string} sanitizedNumber - output of sanitizePhoneNumber()
 * @returns {boolean}
 */
export function isValidWhatsAppNumber(sanitizedNumber) {
  return /^\d{8,15}$/.test(sanitizedNumber);
}

/**
 * Core link builder. Every other function in this file funnels
 * through this one.
 *
 * @param {string} number - phone number, any format (will be sanitized)
 * @param {string} message - plain text message to pre-fill
 * @returns {string} full wa.me URL, or null if the number is invalid
 */
export function buildWhatsAppLink(number, message = "") {
  const sanitized = sanitizePhoneNumber(number);

  if (!isValidWhatsAppNumber(sanitized)) {
    // Invalid/missing number is a config problem, not a user problem —
    // surface it to Sentry via the caller rather than silently
    // returning a broken link. Returning null lets the caller decide
    // how to handle it (e.g. hide the button, log an error).
    return null;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${sanitized}?text=${encodedMessage}`;
}

/**
 * Builds the link for the CTA button and floating WhatsApp button —
 * general "I'm interested" enquiries, using the dealership's
 * customer-facing number and default message from site.config.js.
 *
 * @param {object} config - site.config.js siteConfig object
 * @returns {string|null}
 */
export function buildCtaLink(config) {
  const { ctaNumber, ctaDefaultMessage } = config.contact.whatsapp;
  return buildWhatsAppLink(ctaNumber, ctaDefaultMessage);
}

/**
 * Replaces {placeholder} tokens in a template string with values from
 * a data object. Generic on purpose — reusable for any future
 * templated message, not just the lead form.
 *
 * interpolateTemplate("Name: {name}", { name: "Ahmed" })
 *   -> "Name: Ahmed"
 *
 * Unmatched placeholders are left as-is rather than throwing, so a
 * missing optional field (e.g. no message provided) doesn't break
 * the whole string.
 *
 * @param {string} template
 * @param {object} data
 * @returns {string}
 */
export function interpolateTemplate(template, data = {}) {
  return template.replace(/{(\w+)}/g, (match, key) => {
    const value = data[key];
    return value !== undefined && value !== null && value !== ""
      ? String(value)
      : match;
  });
}

/**
 * Builds the link returned by /api/lead after a form submission —
 * sends the visitor into WhatsApp with their form details pre-filled
 * as a message to the dealership's sales/form number.
 *
 * @param {object} config - site.config.js siteConfig object
 * @param {object} formData - validated form fields (name, phone, message, etc)
 * @returns {string|null}
 */
export function buildFormLink(config, formData) {
  const { formNumber } = config.contact.whatsapp;
  const { formEnquiryMessageTemplate } = config.leadCapture;

  const message = interpolateTemplate(formEnquiryMessageTemplate, formData);
  return buildWhatsAppLink(formNumber, message);
}