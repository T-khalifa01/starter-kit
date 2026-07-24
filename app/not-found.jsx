/**
 * app/not-found.jsx
 * ------------------------------------------------------------------
 * Next.js native 404 page — rendered automatically for any unmatched
 * route, no wiring needed beyond this file existing. Fully
 * config-driven, works unchanged for any dealership.
 * ------------------------------------------------------------------
 */

import Link from "next/link";
import siteConfig from "@/config/site.config";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-text-primary">
      <h1 className="font-display text-4xl font-semibold">Page Not Found</h1>
      <p className="max-w-md text-text-muted">
        The page you&apos;re looking for doesn&apos;t exist. Head back to{" "}
        {siteConfig.dealership.name}&apos;s homepage, or reach out directly.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-full border border-accent px-6 py-3 font-medium text-accent transition-opacity hover:opacity-90"
        >
          Back to Homepage
        </Link>
        <WhatsAppButton label="Message Us" />
      </div>
    </div>
  );
}