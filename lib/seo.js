// builds Metadata object from config
/**
 * lib/seo.js
 * ------------------------------------------------------------------
 * Builds a Next.js Metadata object from site.config.js so every
 * dealership site gets consistent title/description/OG/robots tags
 * without repeating boilerplate in app/layout.jsx.
 *
 * Single-page site, so this is static — call once and export the
 * result as `export const metadata` in app/layout.jsx, no
 * generateMetadata() function needed.
 *
 * PREVIEW-DEPLOYMENT SAFETY: every Vercel branch/PR gets its own live
 * URL. If Google ever crawls one before a site is ready, an
 * unfinished or test version of a client's site could end up in
 * search results — a real risk this site's own seo.robots config
 * can't prevent, since that value is fixed at deploy time regardless
 * of which deployment (production vs. preview) is serving it. Vercel
 * sets VERCEL_ENV automatically to 'production', 'preview', or
 * 'development' — this function forces noindex/nofollow on anything
 * that isn't exactly 'production', overriding whatever
 * site.config.js says. This can't be configured away per project;
 * it's a safety default, not a design choice.
 * ------------------------------------------------------------------
 */

/**
 * @param {object} config - site.config.js siteConfig object
 * @returns {import('next').Metadata}
 */
export function buildMetadata(config) {
  const { dealership, seo, brand } = config;
  const isProduction = process.env.VERCEL_ENV === "production";

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,

    // Required for relative OG/icon paths (e.g. "/og-image.jpg") to
    // resolve to absolute URLs in the actual <meta> tags.
    metadataBase: new URL(seo.siteUrl),

    alternates: {
      canonical: seo.siteUrl,
    },

    icons: {
      icon: brand.logo.faviconSrc,
    },

    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.siteUrl,
      siteName: dealership.name,
      images: [
        {
          url: seo.ogImage,
          width: 1200,
          height: 630,
          alt: dealership.name,
        },
      ],
      locale: seo.locale,
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },

    robots: isProduction
      ? {
          index: seo.robots.index,
          follow: seo.robots.follow,
        }
      : {
          // Overrides site.config.js entirely on preview/dev deploys —
          // see file header comment for why this isn't configurable.
          index: false,
          follow: false,
        },
  };
}