/**
 * PT. Intiprima Sertifikasi — single source of truth for company identity
 * and shared site settings. All components, pages, layouts, navigation,
 * footers, SEO metadata, CTAs, and contact sections must read identity
 * values from this module; nothing company-wide is hardcoded.
 */
/** Canonical deployed URL. The only place the production domain is written. */
const SITE_URL = "https://www.intiprima-sertifikasi.dev";
/** Canonical Organization entity. Referenced by @id from structured data. */
export const organization = {
  id: "organization",
  name: "PT. Intiprima Sertifikasi",
  slug: "pt-intiprima-sertifikasi",
  shortName: "Intiprima Sertifikasi",
  description:
    "Sertifikasi, pelatihan, dan penilaian kepatuhan profesional untuk industri manufaktur, konstruksi, dan energi.",
  url: SITE_URL,
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
  url: SITE_URL,
  title: "PT. Intiprima Sertifikasi",
  description:
    "Sertifikasi, pelatihan kepatuhan, dan penilaian risiko profesional bagi industri manufaktur, konstruksi, dan energi.",
  tagline: "Informasi sertifikasi dan kepatuhan",
  defaultLanguage: "id",
  languages: [
    { code: "id", label: "Bahasa Indonesia" },
    { code: "en", label: "English" },
  ],
} as const;
/** Primary links used by the sitewide header. Keep routes centralized here. */
export const primaryNavigation = [
  { label: "Beranda", href: "/" },
  { label: "Layanan", href: "/services/" },
  { label: "CSMS", href: "/csms/" },
  { label: "Pelatihan", href: "/trainings/" },
  { label: "Jadwal", href: "/schedule/" },
  { label: "Artikel", href: "/articles/" },
] as const;
/** Footer navigation grouped by visitor intent; no unverified contact details. */
export const footerNavigation = [
  {
    title: "Mulai",
    links: [
      { label: "Beranda", href: "/" },
      { label: "Layanan", href: "/services/" },
      { label: "CSMS", href: "/csms/" },
      { label: "Pelatihan", href: "/trainings/" },
      { label: "Jadwal pelatihan", href: "/schedule/" },
    ],
  },
  {
    title: "Baca",
    links: [
      { label: "Artikel dan panduan", href: "/articles/" },
    ],
  },
] as const;
