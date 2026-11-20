/**
 * SEO metadata builder. All absolute URLs resolve against the canonical site
 * URL from site.ts. No page component hardcodes domain, title or description.
 */
import { siteSettings } from "../site";

export interface SeoAlternate {
  lang: string;
  href: string;
}

/** Props accepted by the base layout. Kept here so libraries can consume it. */
export interface LayoutProps {
  title?: string;
  description?: string;
  lang?: string;
  canonical?: string;
  ogImage?: string;
  path?: string;
  alternates?: SeoAlternate[];
}

export interface SeoMeta {
  title: string;
  description: string;
  lang: string;
  locale: string;
  canonical: string;
  robots: string;
  openGraph: {
    type: "website";
    siteName: string;
    locale: string;
    title: string;
    description: string;
    url: string;
    images: Array<{ url: string }>;
  };
  twitter: {
    card: "summary" | "summary_large_image";
    title: string;
    description: string;
    images: string[];
  };
  hreflang: SeoAlternate[];
}

function absoluteUrl(value: string): string {
  return new URL(value, siteSettings.url).toString();
}

function toLocale(lang: string): string {
  return lang === "en" ? "en_US" : lang === "id" ? "id_ID" : lang.replace("-", "_");
}

export function buildSeo(props: LayoutProps = {}): SeoMeta {
  const title = props.title ?? siteSettings.title;
  const description = props.description ?? siteSettings.description;
  const lang = props.lang ?? siteSettings.defaultLanguage;
  const locale = toLocale(lang);
  const canonical = props.canonical
    ? absoluteUrl(props.canonical)
    : absoluteUrl(props.path ?? "/");
  const images = props.ogImage ? [{ url: absoluteUrl(props.ogImage) }] : [];

  return {
    title,
    description,
    lang,
    locale,
    canonical,
    robots: "index, follow",
    openGraph: {
      type: "website",
      siteName: siteSettings.title,
      locale,
      title,
      description,
      url: canonical,
      images,
    },
    twitter: {
      card: images.length > 0 ? "summary_large_image" : "summary",
      title,
      description,
      images: images.map((image) => image.url),
    },
    hreflang: props.alternates ?? [],
  };
}
