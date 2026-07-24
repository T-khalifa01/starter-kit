/**
 * components/ui/FloatingWhatsApp.jsx
 * ------------------------------------------------------------------
 * Shared primitive — persistent floating WhatsApp button, fixed
 * bottom-right, visible across the whole single-page scroll. Same
 * link + analytics logic as WhatsAppButton, different treatment
 * (icon-only, fixed position, pulse effect for visibility).
 *
 * Deliberately fixed bottom-right regardless of i18n.dir (LTR/RTL) —
 * floating chat buttons are a universal UX convention, not something
 * that should flip with text direction the way content layout does.
 * ------------------------------------------------------------------
 */

"use client";

import { MessageCircle } from "lucide-react";
import siteConfig from "@/config/site.config";
import { buildCtaLink } from "@/lib/whatsapp";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";

const WHATSAPP_GREEN = "#25D366";

export default function FloatingWhatsApp() {
  const href = buildCtaLink(siteConfig);

  // Same reasoning as WhatsAppButton: no valid number means no
  // button, rather than a dead link left visible to visitors.
  if (!href) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "FloatingWhatsApp: no valid CTA link — check contact.whatsapp.ctaNumber in site.config.js"
      );
    }
    return null;
  }

  function handleClick() {
    trackEvent(ANALYTICS_EVENTS.WHATSAPP_FLOATING_CLICK, {
      dealership: siteConfig.dealership.slug,
    });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
      style={{ backgroundColor: WHATSAPP_GREEN }}
    >
      <span
        aria-hidden="true"
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-30"
        style={{ backgroundColor: WHATSAPP_GREEN }}
      />
      <MessageCircle className="relative" size={28} color="#FFFFFF" />
    </a>
  );
}