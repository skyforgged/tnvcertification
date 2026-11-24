/** Reciprocal hreflang alternates for main-menu pages backed by page entries. */
import { siteSettings } from "../site";
import type { SeoAlternate } from "./seo";

const LOCALIZED_PAGES = ["home", "services", "csms", "about-us"] as const;

type LocalizedPageSlug = (typeof LOCALIZED_PAGES)[number];

function localPagePath(slug: LocalizedPageSlug, lang: "id" | "en"): string {
  if (slug === "home") return lang === "en" ? "/en/" : "/";
  return lang === "en" ? `/en/${slug}/` : `/${slug}/`;
}

export function pageAlternates(slug: string): SeoAlternate[] {
  if (!LOCALIZED_PAGES.includes(slug as LocalizedPageSlug)) return [];
  const page = slug as LocalizedPageSlug;
  return (["id", "en"] as const).map((lang) => ({
    lang,
    href: new URL(localPagePath(page, lang), siteSettings.url).toString(),
  }));
}
