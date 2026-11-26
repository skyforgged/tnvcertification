/**
 * Shared article query logic. Homepage, service index, service detail and the
 * archive all consume this module so sort and filter rules are defined once.
 */
import { globSync } from "tinyglobby";
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { siteSettings } from "../site";
import type { SeoAlternate } from "../lib/seo";

export interface Article {
  id: string;
  slug: string;
  title: string;
  intro: string;
  metaDescription: string;
  pubDate: Date;
  updatedDate?: Date;
  effectiveDate: Date;
  lang: string;
  translationKey: string;
  featuredImage: { src: string; alt: string; caption?: string };
  categoryIds: string[];
  serviceId?: number;
  body: string;
}

function readFrontmatter(filePath: string): { data: Record<string, unknown>; body: string } | null {
  const raw = readFileSync(filePath, "utf8");
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith("---")) return null;

  const parts = trimmed.slice(3).split(/\r?\n---/);
  const frontmatterPart = parts[0];
  if (frontmatterPart === undefined) return null;

  let data: unknown;
  try {
    data = parseYaml(frontmatterPart);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;

  const body = parts.length > 1 ? parts.slice(1).join("\n").trimStart() : "";
  return { data: data as Record<string, unknown>, body };
}

function asDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

function toArticle(id: string, data: Record<string, unknown>, body: string): Article | null {
  const pubDate = asDate(data.pubDate);
  if (
    data.draft === true ||
    typeof data.title !== "string" ||
    typeof data.slug !== "string" ||
    typeof data.intro !== "string" ||
    typeof data.metaDescription !== "string" ||
    typeof data.lang !== "string" ||
    typeof data.translationKey !== "string" ||
    pubDate === undefined ||
    typeof data.featuredImage !== "object" ||
    data.featuredImage === null
  ) {
    return null;
  }

  const image = data.featuredImage as Record<string, unknown>;
  if (typeof image.src !== "string" || typeof image.alt !== "string") return null;

  const updatedDate = asDate(data.updatedDate);
  return {
    id,
    slug: data.slug,
    title: data.title,
    intro: data.intro,
    metaDescription: data.metaDescription,
    pubDate,
    updatedDate,
    effectiveDate: updatedDate ?? pubDate,
    lang: data.lang,
    translationKey: data.translationKey,
    featuredImage: {
      src: image.src,
      alt: image.alt,
      ...(typeof image.caption === "string" ? { caption: image.caption } : {}),
    },
    categoryIds: Array.isArray(data.categoryIds)
      ? data.categoryIds.filter((value): value is string => typeof value === "string")
      : [],
    ...(typeof data.serviceId === "number" ? { serviceId: data.serviceId } : {}),
    body,
  };
}

function compareArticles(a: Article, b: Article): number {
  const byEffective = b.effectiveDate.getTime() - a.effectiveDate.getTime();
  if (byEffective !== 0) return byEffective;
  const byPub = b.pubDate.getTime() - a.pubDate.getTime();
  if (byPub !== 0) return byPub;
  const byId = a.id.localeCompare(b.id);
  return byId !== 0 ? byId : a.slug.localeCompare(b.slug);
}

/** Stable canonical ordering used by every article listing. */
export function sortArticles(articles: Article[]): Article[] {
  return [...articles].sort(compareArticles);
}

/** Published articles in canonical order. Invalid entries are skipped. */
export function getPublishedArticles(): Article[] {
  const files = globSync("src/content/articles/**/*.{md,mdx}", { onlyFiles: true });
  const articles: Article[] = [];
  for (const file of files) {
    const payload = readFrontmatter(file);
    if (payload === null) continue;
    const article = toArticle(file, payload.data, payload.body);
    if (article !== null) articles.push(article);
  }
  return sortArticles(articles);
}

/** Global ranks 1–3. */
export function getHomepageArticles(articles: Article[]): Article[] {
  return articles.slice(0, 3);
}

/** Global ranks 4–6, never repeating homepage ranks. */
export function getServiceIndexArticles(articles: Article[]): Article[] {
  return articles.slice(3, 6);
}

/** Contextual section: only an explicit serviceId match counts. */
export function getRelatedArticles(articles: Article[], serviceId: number): Article[] {
  return articles.filter((article) => article.serviceId === serviceId);
}

/** Reciprocal alternates derived from an explicit translationKey group. */
export function hreflangAlternates(
  translations: Array<{ lang: string; path: string }>,
): SeoAlternate[] {
  return translations.map(({ lang, path }) => ({
    lang,
    href: new URL(path, siteSettings.url).toString(),
  }));
}
