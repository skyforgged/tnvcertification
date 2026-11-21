/**
 * Pure builder for English-locale fallback routes. Every published Indonesian
 * path that has no real English page gets an /en/<path>/ redirect stub.
 */
export interface FallbackRoute {
  slug: string;
  draft?: boolean;
  lang?: string;
}

export interface FallbackRouteSet {
  pages: readonly FallbackRoute[];
  services: readonly FallbackRoute[];
  articles: readonly FallbackRoute[];
  trainings: readonly FallbackRoute[];
  articlePageCount: number;
  existingEnglishPaths: readonly string[];
}

const INDEX_PATHS = [
  "/services/",
  "/trainings/",
  "/schedules/",
  "/articles/",
  "/csms/",
] as const;

export function buildEnglishFallbackPaths(data: FallbackRouteSet): string[] {
  const paths: string[] = [...INDEX_PATHS];

  const addEntries = (entries: readonly FallbackRoute[], prefix: string) => {
    for (const entry of entries) {
      if (entry.draft === true || entry.lang === "en") continue;
      paths.push(`${prefix}${entry.slug}/`);
    }
  };

  addEntries(data.pages, "/");
  addEntries(data.services, "/services/");
  addEntries(data.articles, "/articles/");
  addEntries(data.trainings, "/trainings/");

  for (let page = 2; page <= data.articlePageCount; page += 1) {
    paths.push(`/articles/page/${page}/`);
  }

  const existingEnglish = new Set(data.existingEnglishPaths);
  return [...new Set(paths)]
    .filter((path) => !existingEnglish.has(`/en${path}`))
    .sort();
}
