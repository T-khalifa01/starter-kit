/**
 * hooks/useLeadForm.js
 * ------------------------------------------------------------------
 * Shared logic for the dealership contact/lead form — the single
 * source of truth for form BEHAVIOR. Section components should only
 * handle how the fields are laid out visually; the validation,
 * honeypot handling, submission, WhatsApp redirect, and analytics
 * all live here and should never be reimplemented per project.
 *
 * PHONE NUMBER HANDLING: the visitor selects a country and types
 * only their local/national number; the country is tracked as
 * separate state, not a React Hook Form field. The two are combined
 * via libphonenumber-js's parsePhoneNumberFromString(), which
 * correctly handles per-country formatting rules (e.g. stripping a
 * leading national trunk prefix like the "0" in Egyptian or UK local
 * numbers) — a naive `dialCode + localNumber` string concatenation
 * would silently produce wrong numbers for exactly these countries.
 *
 * Because of this, leadFormSchema's phone validation (built for a
 * full E.164 string) can't run against the raw local-only RHF field
 * — it would be checking the wrong string. So:
 *   - Every other field is validated via the shared leadFormSchema
 *     (same rules the server re-checks)
 *   - Phone is parsed + validated separately, after combining
 *     country + local number, and only the resulting E.164 string is
 *     ever sent to the server
 * ------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { leadFormSchema } from "@/lib/validators";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";
import siteConfig from "@/config/site.config";

// Validates every field except phone — see file header for why phone
// is handled separately.
const clientSchema = leadFormSchema.omit({ phone: true });

/**
 * @param {object} [options]
 * @param {string} [options.defaultCountry] - ISO 3166-1 alpha-2, e.g. "EG"
 */
export function useLeadForm({ defaultCountry = "EG" } = {}) {
  const [submitError, setSubmitError] = useState(null);
  const [country, setCountry] = useState(defaultCountry);

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: "", phone: "", message: "", website: "" },
  });

  async function onSubmit(data) {
    setSubmitError(null);

    const parsedPhone = parsePhoneNumberFromString(data.phone, country);

    if (!parsedPhone || !parsedPhone.isValid()) {
      setError("phone", {
        type: "manual",
        message: "Enter a valid phone number",
      });
      return;
    }

    // E.164 format, e.g. "+201000000000" — leading trunk prefixes
    // already correctly stripped per the selected country's rules.
    const fullPhone = parsedPhone.number;

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, phone: fullPhone }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      // redirectUrl is null when the honeypot was tripped server-side
      // — the route deliberately responds as if nothing happened, so
      // this hook does the same: reset the form, no visible error, no
      // redirect. Never tip off whatever filled the hidden field.
      if (result.redirectUrl) {
        trackEvent(ANALYTICS_EVENTS.FORM_SUBMIT, {
          dealership: siteConfig.dealership.slug,
        });
        // window.location.assign() (a method call) rather than
        // window.location.href = ... (a property assignment) —
        // caught by a real dry-run build: the newer
        // react-hooks/immutability lint rule flags direct property
        // assignment on external objects as "modifying a variable
        // defined outside the hook," even for a completely standard
        // navigation side effect inside an event handler. Same
        // behavior, avoids the false-positive lint error.
        window.location.assign(result.redirectUrl);
      }

      reset();
    } catch (error) {
      trackEvent(ANALYTICS_EVENTS.FORM_SUBMIT_ERROR, {
        dealership: siteConfig.dealership.slug,
      });
      setSubmitError(
        "Something went wrong sending your message. Please try again, or reach out to us directly on WhatsApp."
      );
    }
  }

  return {
    register,
    handleSubmit: rhfHandleSubmit(onSubmit),
    errors,
    isSubmitting,
    submitError,
    country,
    setCountry,
  };
}