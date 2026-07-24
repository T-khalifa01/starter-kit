/**
 * components/ui/WhatsAppButton.jsx
 * ------------------------------------------------------------------
 * Shared primitive — the CTA WhatsApp button used across sections
 * (Hero, Contact, etc). Unlike components/sections, this is NOT
 * copied-and-customized per project: the link-building and analytics
 * logic never changes. Both variants use `accent`-based Tailwind
 * utilities (bg-accent, border-accent, text-accent) — this button is
 * meant to blend into each dealership's palette, unlike
 * FloatingWhatsApp, which is deliberately hardcoded to WhatsApp's
 * brand green for universal recognizability as a persistent,
 * always-visible element.
 *
 * These utility classes resolve to the real per-dealership accent
 * color via globals.css's @theme inline block + the CSS custom
 * properties set on <body> in app/layout.jsx — no inline `style`
 * needed here. See globals.css for why that works in Tailwind v4.
 * ------------------------------------------------------------------
 */

"use client";

import { MessageCircle } from "lucide-react";
import siteConfig from "@/config/site.config";
import { buildCtaLink } from "@/lib/whatsapp";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";

/**
 * @param {object} props
 * @param {string} [props.label] - button text
 * @param {"solid"|"outline"} [props.variant]
 * @param {string} [props.className] - additional classes for per-project layout tweaks
 */
export default function WhatsAppButton({
  label = "Chat on WhatsApp",
  variant = "solid",
  className = "",
}) {
  const href = buildCtaLink(siteConfig);

  // buildCtaLink returns null if contact.whatsapp.ctaNumber is
  // missing/invalid in site.config.js. A dead CTA link is worse than
  // no button at all — this almost always means a config mistake
  // that should get caught during setup, not shipped to a visitor.
  if (!href) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "WhatsAppButton: no valid CTA link — check contact.whatsapp.ctaNumber in site.config.js"
      );
    }
    return null;
  }

  function handleClick() {
    // Fires before the browser's native <a href> navigation — no
    // preventDefault, this never blocks or delays the redirect.
    trackEvent(ANALYTICS_EVENTS.WHATSAPP_CTA_CLICK, {
      dealership: siteConfig.dealership.slug,
    });
  }

  const isOutline = variant === "outline";

  // Solid variant assumes the accent color is dark/saturated enough
  // for white text to read clearly — true for most "quiet luxury"
  // gold/black palettes, but not guaranteed for every possible
  // accent color. If a project's accent is light, override via the
  // className prop rather than editing this component.
  const variantClasses = isOutline
    ? "border border-accent text-accent bg-transparent"
    : "bg-accent text-white";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-opacity hover:opacity-90 ${variantClasses} ${className}`}
    >
      <MessageCircle size={20} />
      {label}
    </a>
  );
}