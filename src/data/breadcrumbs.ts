import { localizedCrumbs, primaryNavigation } from "../site";

export interface SiteCrumb {
  label: string;
  href: string;
}

/** Resolve a breadcrumb label from the central navigation in site.ts. */
export function siteCrumb(href: string, lang = "id"): SiteCrumb {
  if (lang === "en") {
    const localized = localizedCrumbs.en[href as keyof typeof localizedCrumbs.en];
    if (localized) return { label: localized.label, href: localized.href };
  }
  const item = primaryNavigation.find((entry) => entry.href === href);
  if (!item) {
    throw new Error(`No primaryNavigation entry found for "${href}".`);
  }
  return { label: item.label, href: item.href };
}
