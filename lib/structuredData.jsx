/**
 * lib/structuredData.js
 * ------------------------------------------------------------------
 * Builds JSON-LD structured data (schema.org AutomotiveBusiness) from
 * site.config.js — helps Google's local pack and rich results surface
 * this specific dealership. Purely additive infrastructure: built
 * entirely from fields already in config, zero per-project design or
 * content work needed once wired into layout.jsx.
 *
 * Fields not currently in site.config.js (e.g. business hours) are
 * simply omitted rather than guessed at — don't invent data schema.org
 * would treat as factual.
 * ------------------------------------------------------------------
 */

/**
 * @param {object} config - site.config.js siteConfig object
 * @returns {object} JSON-LD schema object, ready for JSON.stringify()
 */
export function buildLocalBusinessSchema(config) {
  const { dealership, contact, seo } = config;

  const schema = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    name: dealership.name,
    url: seo.siteUrl,
    image: `${seo.siteUrl}${seo.ogImage}`,
  };

  if (contact.phone) {
    schema.telephone = contact.phone;
  }

  if (contact.address?.line1) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: contact.address.line1,
      ...(contact.address.line2 && { addressLocality: contact.address.line2 }),
      ...(contact.address.country && {
        addressCountry: contact.address.country,
      }),
    };
  }

  if (contact.address?.lat && contact.address?.lng) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: contact.address.lat,
      longitude: contact.address.lng,
    };
  }

  return schema;
}