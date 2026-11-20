/**
 * Canonical JSON-LD entities. Organization is defined once from site.ts and
 * referenced by @id from other entity graphs (for example service pages).
 */
import { organization, siteSettings } from "../site";

export const ORGANIZATION_ID = `${siteSettings.url}/#organization`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: organization.name,
    alternateName: organization.shortName,
    url: organization.url,
    description: organization.description,
    logo: {
      "@type": "ImageObject",
      url: new URL(organization.logo.url, siteSettings.url).toString(),
      width: organization.logo.width,
      height: organization.logo.height,
    },
    email: organization.contact.email,
    telephone: organization.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: organization.contact.address.street,
      addressLocality: organization.contact.address.city,
      addressRegion: organization.contact.address.province,
      postalCode: organization.contact.address.postalCode,
      addressCountry: organization.contact.address.countryCode,
    },
    sameAs: [...organization.sameAs],
  };
}

/** Escape `<` so a JSON-LD script block cannot be closed by injected data. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
