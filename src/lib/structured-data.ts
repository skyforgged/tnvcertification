/**
 * Canonical JSON-LD entities. Organization is defined once from site.ts and
 * referenced by @id from other entity graphs (for example service pages).
 */
import { organization, siteSettings } from "../site.ts";

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

export interface ServiceStructuredDataInput {
  name: string;
  description: string;
  path: string;
  image?: string;
  serviceType?: string;
  category?: string;
}

/**
 * JSON-LD graph for a visible, published service page.
 * Only supplied, content-backed optional fields are emitted.
 */
export function servicePageJsonLd(input: ServiceStructuredDataInput) {
  const url = new URL(input.path, siteSettings.url).toString();
  const serviceId = `${url}#service`;
  const breadcrumbId = `${url}#breadcrumb`;
  const pageId = `${url}#webpage`;

  const service: Record<string, unknown> = {
    "@type": "Service",
    "@id": serviceId,
    name: input.name,
    description: input.description,
    url,
    provider: { "@id": ORGANIZATION_ID },
  };
  if (input.image) service.image = new URL(input.image, siteSettings.url).toString();
  if (input.serviceType) service.serviceType = input.serviceType;
  if (input.category) service.category = input.category;

  return [
    {
      "@type": "WebPage",
      "@id": pageId,
      url,
      name: input.name,
      description: input.description,
      mainEntity: { "@id": serviceId },
      breadcrumb: { "@id": breadcrumbId },
    },
    service,
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteSettings.url },
        { "@type": "ListItem", position: 2, name: "Layanan", item: `${siteSettings.url}/services/` },
        { "@type": "ListItem", position: 3, name: input.name, item: url },
      ],
    },
  ];
}

/** CollectionPage graph for the service directory, using only visible entries. */
export function serviceIndexJsonLd(
  services: Array<{ name: string; path: string; description: string }>,
) {
  const url = new URL("/services/", siteSettings.url).toString();
  return [
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name: "Layanan",
      description: "Daftar layanan yang tersedia.",
      mainEntity: { "@id": `${url}#itemlist` },
    },
    {
      "@type": "ItemList",
      "@id": `${url}#itemlist`,
      itemListElement: services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: service.name,
          description: service.description,
          url: new URL(service.path, siteSettings.url).toString(),
          provider: { "@id": ORGANIZATION_ID },
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteSettings.url },
        { "@type": "ListItem", position: 2, name: "Layanan", item: url },
      ],
    },
  ];
}

/** One valid JSON-LD document containing the canonical organization and page graph. */
export function pageJsonLdGraph(additionalEntities: unknown[] = []) {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationJsonLd(), ...additionalEntities],
  };
}
