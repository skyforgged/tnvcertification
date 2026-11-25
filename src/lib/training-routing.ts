/** Shared path rules for training archive and detail routes. */
import { siteSettings } from "../site.ts";
import type { SeoAlternate } from "./seo.ts";

export type TrainingLang = "id" | "en";

export function trainingIndexPath(lang: TrainingLang): string {
  return lang === "en" ? "/en/trainings/" : "/trainings/";
}

export function trainingPath(training: { lang: string; slug: string }): string {
  return `${trainingIndexPath(training.lang === "en" ? "en" : "id").replace(/\/$/, "")}/${training.slug}/`;
}

export function trainingAlternates(slug: string): SeoAlternate[] {
  return (["id", "en"] as const).map((lang) => ({
    lang,
    href: new URL(`${trainingIndexPath(lang)}${slug}/`, siteSettings.url).toString(),
  }));
}
