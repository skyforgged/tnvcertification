/**
 * Pure resolver for the header language switcher. Collection access and
 * fallback-route discovery belong in the data layer; no Astro imports here.
 */
import { siteSettings } from "../site.ts";
import { articlePath } from "./article-routing.ts";
import { servicePath, type ServiceLang } from "./service-routing.ts";
import { trainingPath } from "./training-routing.ts";

export interface LanguageEntry {
  lang: string;
  slug: string;
  translationKey: string;
}

export interface LanguageSwitchInput {
  pathname: string;
  currentLang: string;
  services: readonly LanguageEntry[];
  articles: readonly LanguageEntry[];
  trainings: readonly LanguageEntry[];
  pages: readonly LanguageEntry[];
  /** Indonesian paths whose /en/ variant is a redirect stub. */
  fallbackPaths: readonly string[];
}

export interface LanguageOption {
  lang: string;
  label: string;
  href: string;
  active: boolean;
  available: boolean;
}

const SERVICE_DETAIL_PATH = /^\/(?:en\/)?services\/[^/]+\/$/;
const ARTICLE_DETAIL_PATH = /^\/(?:en\/)?articles\/[^/]+\/$/;
const TRAINING_DETAIL_PATH = /^\/(?:en\/)?trainings\/[^/]+\/$/;
const ARTICLE_PAGINATION_PATH = /^\/(en\/)?articles\/page\/(\d+)\/$/;

function withTrailingSlash(pathname: string): string {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function pagePath(entry: LanguageEntry): string {
  if (entry.slug === "home") return entry.lang === "id" ? "/" : "/en/";
  return entry.lang === "id" ? `/${entry.slug}/` : `/en/${entry.slug}/`;
}

/** English service routes are /en + the Indonesian route; stub paths never carry /en. */
function isFallbackStub(candidate: string, fallbackPaths: readonly string[]): boolean {
  if (!candidate.startsWith("/en/")) return false;
  const indonesianPath = candidate.slice(3);
  return fallbackPaths.some((path) => withTrailingSlash(path) === indonesianPath);
}

function findCounterpart(
  entries: readonly LanguageEntry[],
  source: LanguageEntry,
  lang: string,
  toPath: (entry: LanguageEntry) => string,
): string {
  const target = entries.find(
    (entry) => entry.lang === lang && entry.translationKey === source.translationKey,
  );
  return target ? toPath(target) : "";
}

function counterpartHref(
  lang: ServiceLang,
  input: LanguageSwitchInput,
  pathname: string,
): string {
  const { currentLang, services, articles, trainings, pages } = input;
  if (lang === currentLang) return "";

  const pageSource = pages.find(
    (entry) => entry.lang === currentLang && pagePath(entry) === pathname,
  );
  if (pageSource) return findCounterpart(pages, pageSource, lang, pagePath);

  if (SERVICE_DETAIL_PATH.test(pathname)) {
    const source = services.find(
      (entry) => entry.lang === currentLang && servicePath(entry) === pathname,
    );
    return source ? findCounterpart(services, source, lang, servicePath) : "";
  }

  if (TRAINING_DETAIL_PATH.test(pathname)) {
    const source = trainings.find(
      (entry) => entry.lang === currentLang && trainingPath(entry) === pathname,
    );
    return source ? findCounterpart(trainings, source, lang, trainingPath) : "";
  }

  const pagination = pathname.match(ARTICLE_PAGINATION_PATH);
  if (pagination) {
    const english = pagination[1] !== undefined;
    if ((lang === "en") === english) return "";
    const page = pagination[2];
    return english ? `/articles/page/${page}/` : `/en/articles/page/${page}/`;
  }

  if (ARTICLE_DETAIL_PATH.test(pathname)) {
    const source = articles.find(
      (entry) => entry.lang === currentLang && articlePath(entry) === pathname,
    );
    return source ? findCounterpart(articles, source, lang, articlePath) : "";
  }

  const plainIndex = pathname.replace(/^\/en\//, "/");
  const indexRoutes = ["/services/", "/trainings/", "/schedules/", "/articles/"];
  if (indexRoutes.includes(plainIndex)) {
    return lang === "en" ? `/en${plainIndex}` : plainIndex;
  }

  return "";
}

export function resolveLanguageOptions(input: LanguageSwitchInput): LanguageOption[] {
  const pathname = withTrailingSlash(input.pathname);

  return siteSettings.languages.map(({ code, label }) => {
    if (code === input.currentLang) {
      return { lang: code, label, href: pathname, active: true, available: true };
    }

    const candidate = counterpartHref(code, input, pathname);
    const available = candidate !== "" && !isFallbackStub(candidate, input.fallbackPaths);
    return { lang: code, label, href: available ? candidate : "", active: false, available };
  });
}
