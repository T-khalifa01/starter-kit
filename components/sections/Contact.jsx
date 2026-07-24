/**
 * components/sections/Contact.jsx
 * ------------------------------------------------------------------
 * LIBRARY REFERENCE — a real, working foundation for the lead form
 * section, not a generic config-driven component. Copy this into a
 * dealership project and restyle freely (layout, spacing, copy,
 * single-column vs two-column, dark vs light, etc) — but keep using
 * useLeadForm() for the actual submit behavior rather than
 * reimplementing validation/honeypot/redirect logic per project.
 *
 * COUNTRY LIST: built dynamically from libphonenumber-js's supported
 * country list + the browser/Node Intl.DisplayNames API for human-
 * readable names — no hardcoded country data file to maintain, and
 * it covers every country libphonenumber-js supports rather than a
 * curated subset. Computed once at module load, not per render.
 * ------------------------------------------------------------------
 */

"use client";

import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import { useLeadForm } from "@/hooks/useLeadForm";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const COUNTRY_OPTIONS = getCountries()
  .map((iso) => ({
    iso,
    name: regionNames.of(iso) ?? iso,
    dialCode: getCountryCallingCode(iso),
  }))
  .sort((a, b) => {
    // Egypt first (primary market), then alphabetical by name.
    if (a.iso === "EG") return -1;
    if (b.iso === "EG") return 1;
    return a.name.localeCompare(b.name);
  });

export default function Contact() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    submitError,
    country,
    setCountry,
  } = useLeadForm();

  return (
    <section className="bg-background px-6 py-20 text-text-primary">
      <div className="mx-auto max-w-lg">
        <h2 className="font-display text-3xl font-semibold">Get in Touch</h2>
        <p className="mt-2 text-text-muted">
          Send us a message and we&apos;ll reach out on WhatsApp.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <Input
            label="Name"
            placeholder="Your name"
            {...register("name")}
            error={errors.name?.message}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">
              Phone
            </label>
            <div className="flex gap-2">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-md border border-secondary bg-surface px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.iso} value={c.iso}>
                    +{c.dialCode} {c.name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="100 000 0000"
                className="flex-1"
                {...register("phone")}
                error={errors.phone?.message}
              />
            </div>
          </div>

          <TextArea
            label="Message (optional)"
            placeholder="Tell us what you're looking for"
            {...register("message")}
            error={errors.message?.message}
          />

          {/* Honeypot — visually hidden, never shown to real visitors.
              Named "website", not "honeypot" — see lib/validators.js
              for why. Positioned off-screen rather than display:none,
              since some bots specifically skip display:none fields. */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register("website")}
            />
          </div>

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}

          <Button type="submit" loading={isSubmitting} className="mt-2">
            Send Message
          </Button>
        </form>
      </div>
    </section>
  );
}