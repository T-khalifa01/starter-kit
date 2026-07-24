/**
 * app/robots.js
 * ------------------------------------------------------------------
 * Next.js native robots.txt generation (this file, at this path, is
 * automatically served at /robots.txt — no manual route needed).
 *
 * DELIBERATELY NOT reading seo.robots.index/follow from
 * site.config.js. That flag controls the <meta name="robots"> tag
 * (see lib/seo.js buildMetadata) — a different mechanism with a
 * different job:
 *   - robots.txt controls whether a bot is ALLOWED TO CRAWL a URL
 *   - the meta robots tag controls whether a search engine should
 *     INDEX a page it has already crawled
 * Disallowing a page in robots.txt does NOT reliably keep it out of
 * search results — Google can still list a disallowed URL (with no
 * snippet) if it's linked from elsewhere, precisely because it was
 * never allowed to crawl the page and see the noindex tag. So "don't
 * index this" belongs in lib/seo.js, not here.
 *
 * This file stays permissive for real content and only blocks paths
 * that have no reason to be crawled at all.
 * ------------------------------------------------------------------
 */

import siteConfig from "@/config/site.config";

export default function robots() {
  const { seo } = siteConfig;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /api/ routes (the lead form handler) serve no purpose to a
      // crawler and cost real compute per hit — no reason to invite
      // bots to request them.
      disallow: "/api/",
    },
    sitemap: `${seo.siteUrl}/sitemap.xml`,
  };
}