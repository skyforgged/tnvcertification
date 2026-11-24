/**
 * Gathers published entries and fallback routes for the header language
 * switcher. All link decisions stay in the pure lib/locale-switch resolver.
 */
import { getCollection } from "astro:content";
import { getPublishedArticles } from "./articles";
import { getEnglishFallbackPaths } from "./locale-fallback";
import { getPublishedServices } from "./services";
import {
  resolveLanguageOptions,
  type LanguageOption,
} from "../lib/locale-switch";

export async function getLanguageOptions(
  pathname: string,
  currentLang: string,
): Promise<LanguageOption[]> {
  const [
    idServices,
    enServices,
    idArticles,
    enArticles,
    idTrainings,
    enTrainings,
    fallbackPaths,
    pages,
  ] = await Promise.all([
    getPublishedServices("id"),
    getPublishedServices("en"),
    Promise.resolve(getPublishedArticles("id")),
    Promise.resolve(getPublishedArticles("en")),
    getCollection("training", (entry) => entry.data.draft !== true && entry.data.lang === "id"),
    getCollection("training", (entry) => entry.data.draft !== true && entry.data.lang === "en"),
    getEnglishFallbackPaths(),
    getCollection("pages", (entry) => entry.data.draft !== true),
  ]);
  type LanguageFields = { lang: string; slug: string; translationKey: string };
  const fromCollection = (collection: ReadonlyArray<{ data: LanguageFields }>) =>
    collection.map((entry) => entry.data);
  const fromData = (items: ReadonlyArray<LanguageFields>) => items.map((entry) => ({
    lang: entry.lang,
    slug: entry.slug,
    translationKey: entry.translationKey,
  }));

  return resolveLanguageOptions({
    pathname,
    currentLang,
    services: [...fromCollection(idServices), ...fromCollection(enServices)],
    articles: [...fromData(idArticles), ...fromData(enArticles)],
    trainings: [...fromCollection(idTrainings), ...fromCollection(enTrainings)],
    pages: fromCollection(pages),
    fallbackPaths,
  });
}
