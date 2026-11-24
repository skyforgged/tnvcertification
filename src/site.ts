/**
 * PT. Intiprima Sertifikasi — single source of truth for company identity
 * and shared site settings. Company-wide data must not be hardcoded elsewhere.
 */
const SITE_URL = "https://tnv-certification.com";

export const organization = {
  id: "organization",
  name: "PT. Intiprima Sertifikasi",
  groupName: "TNV Group",
  slug: "pt-intiprima-sertifikasi",
  shortName: "Intiprima Sertifikasi",
  description:
    "PT. Intiprima Sertifikasi merupakan bagian dari TNV Group yang berfokus pada layanan sertifikasi dengan komitmen terhadap kredibilitas dan hasil yang bernilai bagi klien.",
  url: SITE_URL,
  logo: {
    url: "/logo.svg",
    width: 480,
    height: 128,
    format: "svg",
  },
  contact: {
    email: "tnvcertification25@gmail.com",
    phone: "+62 822-2721-7776",
    whatsapp: "+62 822-2721-7776",
    address: {
      street: "WTC 3, Lantai 20 R30, Jl. Jendral Sudirman Kav. 29–31",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      countryCode: "ID",
      postalCode: "12920",
    },
    addressLabels: {
      country: "Indonesia",
    },
  },
  sameAs: [],
} as const;

export const siteSettings = {
  url: SITE_URL,
  title: "PT. Intiprima Sertifikasi",
  description:
    "PT. Intiprima Sertifikasi — bagian dari TNV Group. Informasi layanan sertifikasi dan standar sistem manajemen.",
  tagline: "Bagian dari TNV Group",
  defaultLanguage: "id",
  languages: [
    { code: "id", label: "Bahasa Indonesia" },
    { code: "en", label: "English" },
  ],
  languageSwitcher: {
    ariaLabel: { id: "Pilih bahasa", en: "Language" },
    unavailable: {
      id: "Terjemahan belum tersedia",
      en: "Translation not available",
    },
  },
  ui: {
    skipToContent: { id: "Lewati ke konten utama", en: "Skip to main content" },
    mainNavigation: { id: "Navigasi utama", en: "Main navigation" },
    logoHome: { id: "beranda", en: "home" },
    backToTop: { id: "Kembali ke atas ↑", en: "Back to top ↑" },
  },
  footer: {
    serviceDescription: (title: string) =>
      `${organization.name} menyediakan jasa sertifikasi ${title.replace(/^Sertifikasi\s+/i, "")}.`,
    trainingDescription: (title: string) =>
      `${organization.name} melayani pelatihan ${title.replace(/^(?:Pelatihan|Training)\s+/i, "")}.`,
  },
} as const;

export const primaryNavigation = [
  { label: "Beranda", labelEn: "Home", href: "/" },
  { label: "Layanan", labelEn: "Services", href: "/services/" },
  { label: "CSMS", labelEn: "CSMS", href: "/csms/" },
  { label: "Tentang", labelEn: "About", href: "/about-us/" },
  { label: "Pelatihan", labelEn: "Trainings", href: "/trainings/" },
  { label: "Jadwal", labelEn: "Schedules", href: "/schedules/" },
  { label: "Artikel", labelEn: "Articles", href: "/articles/" },
] as const;

/** Localized breadcrumb labels and hrefs for routes with an English surface. */
export const localizedCrumbs = {
  en: {
    "/": { label: "Home", href: "/" },
    "/services/": { label: "Services", href: "/en/services/" },
    "/articles/": { label: "Articles", href: "/articles/" },
  },
} as const;

export const footerNavigation = [
  {
    title: "Mulai",
    titleEn: "Get started",
    links: [
      { label: "Beranda", labelEn: "Home", href: "/" },
      { label: "Layanan", labelEn: "Services", href: "/services/" },
      { label: "CSMS", labelEn: "CSMS", href: "/csms/" },
      { label: "Tentang", labelEn: "About", href: "/about-us/" },
      { label: "Pelatihan", labelEn: "Trainings", href: "/trainings/" },
      { label: "Jadwal pelatihan", labelEn: "Training schedules", href: "/schedules/" },
    ],
  },
  {
    title: "Baca",
    titleEn: "Read",
    links: [{ label: "Artikel dan panduan", labelEn: "Articles and guides", href: "/articles/" }],
  },
] as const;
