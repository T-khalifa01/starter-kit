/**
 * app/global-error.jsx
 * ------------------------------------------------------------------
 * Catches errors thrown within the ROOT LAYOUT itself
 * (app/layout.jsx) — regular error.jsx boundaries can't catch these,
 * since they wrap layout's children, not the layout itself. This is
 * the very last line of defense: if this ever fires, something is
 * badly wrong (e.g. a malformed site.config.js breaking layout.jsx's
 * own render).
 *
 * MUST render its own <html>/<body> — this file fully REPLACES the
 * root layout when active. Deliberately plain, inline-styled, no
 * brand colors/fonts/Tailwind classes: those all come from
 * layout.jsx and site.config.js, which is exactly what may have just
 * failed. This page can't depend on anything that might be broken.
 * ------------------------------------------------------------------
 */

"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "4rem 1.5rem",
          color: "#1a1a1a",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
          Something Went Wrong
        </h1>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          We&apos;re sorry — please try again shortly.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "999px",
            border: "1px solid #999",
            background: "none",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}