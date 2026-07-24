/**
 * app/sitemap.js
 * ------------------------------------------------------------------
 * Next.js native sitemap.xml generation (this file, at this path, is
 * automatically served at /sitemap.xml).
 *
 * Single-page site (Model 1 and Model 2 both, per current scope), so
 * this is a single entry. If a future project adds real separate
 * routes (e.g. individual inventory/vehicle detail pages for a
 * larger Model 2 build), this file is where those entries get added
 * — one object per URL in the returned array.
 * ------------------------------------------------------------------
 */

import siteConfig from "@/config/site.config";

export default function sitemap() {
  const { seo } = siteConfig;

  return [
    {
      url: seo.siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}