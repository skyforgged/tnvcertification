/** Pure selectors for site navigation labels. */
export type UiLang = "id" | "en";

export function uiLang(lang: string): UiLang {
  return lang === "en" || lang.startsWith("en-") ? "en" : "id";
}

export function navigationLabel(
  entry: { label: string; labelEn: string },
  lang: string,
): string {
  return uiLang(lang) === "en" ? entry.labelEn : entry.label;
}
