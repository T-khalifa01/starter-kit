/**
 * app/error.jsx
 * ------------------------------------------------------------------
 * Catches runtime errors thrown anywhere within this route segment's
 * children. Does NOT catch errors thrown in the root layout itself
 * (app/layout.jsx) — see app/global-error.jsx for that case, since
 * error boundaries only wrap what's inside them, not their own parent.
 *
 * Must be a Client Component — Next.js error boundaries require this.
 *
 * Reports to Sentry automatically so a production crash is never
 * silent, and gives the visitor a way forward (retry, or fall back to
 * WhatsApp) instead of a dead end.
 * ------------------------------------------------------------------
 */

"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import siteConfig from "@/config/site.config";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import Button from "@/components/ui/Button";

export default function Error({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-text-primary">
      <h1 className="font-display text-4xl font-semibold">
        Something Went Wrong
      </h1>
      <p className="max-w-md text-text-muted">
        We&apos;re sorry — something went wrong loading this page. You can try
        again, or reach {siteConfig.dealership.name} directly on WhatsApp.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
        <WhatsAppButton label="Message Us Instead" />
      </div>
    </div>
  );
}