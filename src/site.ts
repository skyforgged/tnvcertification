/**
 * PT. Intiprima Sertifikasi — single source of truth for company identity
 * and shared site settings. All components, pages, layouts, navigation,
 * footers, SEO metadata, CTAs, and contact sections must read identity
 * values from this module; nothing company-wide is hardcoded.
 */

/** Canonical Organization entity. Referenced by @id from structured data. */
export const organization = {
  id: "organization",
  name: "PT. Intiprima Sertifikasi",
  slug: "pt-intiprima-sertifikasi",
  shortName: "Intiprima Sertifikasi",
  description:
    "Sertifikasi, pelatihan, dan penilaian kepatuhan profesional untuk industri manufaktur, konstruksi, dan energi.",
  url: "https://www.intiprima-sertifikasi.dev",
  logo: {
    url: "/logo.svg",
    width: 200,
    height: 58,
    format: "svg",
  },
  contact: {
    email: "sertifikasi@intiprima.example",
    phone: "+62-21-5555-0000",
    address: {
      street: "Jalan Pahlawan No. 123",
      city: "Jakarta",
      province: "DKI Jakarta",
      countryCode: "ID",
      postalCode: "10110",
    },
    addressLabels: {
      country: "Indonesia",
    },
  },
  sameAs: [
    "https://www.linkedin.com/company/pt-intiprima-sertifikasi",
    "https://www.instagram.com/intiprima.sertifikasi",
  ],
} as const;

/** Shared site settings. */
export const siteSettings = {
  title: "PT. Intiprima Sertifikasi",
  description:
    "Sertifikasi, pelatihan kepattuhan, dan penilaian risiko profesional bagi industri manufaktur, konstruksi, dan energi.",
  defaultLanguage: "id",
  languages: [
    { code: "id", label: "Bahasa Indonesia" },
    { code: "en", label: "English" },
  ],
} as const;
