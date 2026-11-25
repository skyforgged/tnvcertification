/**
 * Gathers the published Indonesian routes that need an English fallback stub.
 * Route-shaping rules live in the pure lib/locale-fallback module.
 */
import { getCollection } from "astro:content";
import { buildEnglishFallbackPaths } from "../lib/locale-fallback";
import { getPublishedArticles } from "./articles";
import { routeOwnedPageSlugs } from "./pages";
import { getPublishedServices } from "./services";

export async function getEnglishFallbackPaths(): Promise<string[]> {
  const [pages, trainings, englishTrainings, services, englishServices] = await Promise.all([
    getCollection("pages", ({ data }) => data.draft !== true),
    getCollection("training", ({ data }) => data.draft !== true),
    getCollection("training", ({ data }) => data.draft !== true && data.lang === "en"),
    getPublishedServices("id"),
    getPublishedServices("en"),
  ]);
  const articles = getPublishedArticles("id");
  const englishArticles = getPublishedArticles("en");
  const englishArticlePages = Math.max(0, Math.ceil(englishArticles.length / 9) - 1);

  return buildEnglishFallbackPaths({
    pages: pages
      .filter((entry) => !routeOwnedPageSlugs.includes(entry.data.slug))
      .map((entry) => entry.data),
    services: services.map((entry) => entry.data),
    articles,
    trainings: trainings.map((entry) => entry.data),
    articlePageCount: Math.ceil(articles.length / 9),
    existingEnglishPaths: [
      "/en/services/",
      ...englishServices.map((entry) => `/en/services/${entry.data.slug}/`),
      ...pages
        .filter((entry) => entry.data.lang === "en")
        .map((entry) =>
          entry.data.slug === "home" ? "/en/" : `/en/${entry.data.slug}/`,
        ),
      ...englishTrainings.map((entry) => `/en/trainings/${entry.data.slug}/`),
      ...englishArticles.map((entry) => `/en/articles/${entry.slug}/`),
      ...Array.from(
        { length: englishArticlePages },
        (_, index) => `/en/articles/page/${index + 2}/`,
      ),
    ],
  });
}
