/**
 * Shared page-entry lookups for the development-mode combined page pattern.
 * Editorial copy lives in `src/content/pages/`; routes only resolve and render it.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import { selectPageEntry } from "../lib/page-selection";

export type PageEntry = CollectionEntry<"pages">;
type PageBlockUnion = NonNullable<PageEntry["data"]["blocks"]>[number];

export type PageBlock = PageBlockUnion;
export type HeroBlock = Extract<PageBlockUnion, { type: "hero" }>;
export type LinkGridBlock = Extract<PageBlockUnion, { type: "link-grid" }>;
export type ListingBlock = Extract<PageBlockUnion, { type: "listing" }>;
export type UpcomingSchedulesBlock = Extract<PageBlockUnion, { type: "upcoming-schedules" }>;
export type ContactBlock = Extract<PageBlockUnion, { type: "contact" }>;

/** Prefix that identifies editorial topic pages owned by the /csms/[slug] route. */
export const CSMS_TOPIC_PREFIX = "csms/";

/** Slugs owned by a dedicated route; the generic [slug].astro must skip them. */
export const routeOwnedPageSlugs: readonly string[] = [
  "home",
  "services",
  "csms",
  "trainings",
  "schedules",
  "articles",
];

export async function getPageEntry(slug: string, lang = "id"): Promise<PageEntry> {
  const entries = await getCollection(
    "pages",
    (entry) =>
      entry.data.slug === slug &&
      entry.data.lang === lang &&
      entry.data.draft !== true,
  );
  return selectPageEntry(entries, slug, lang);
}

export function getPageHero(entry: PageEntry): HeroBlock | undefined {
  return entry.data.blocks?.find((block): block is HeroBlock => block.type === "hero");
}

export function getPageBlocks(entry: PageEntry): PageBlock[] {
  return entry.data.blocks ?? [];
}

/** Published editorial topics rendered by the dedicated /csms/[slug] route. */
export async function getCsmsTopicEntries(): Promise<PageEntry[]> {
  const entries = await getCollection(
    "pages",
    (entry) =>
      entry.data.draft !== true &&
      entry.data.lang === "id" &&
      entry.data.slug.startsWith(CSMS_TOPIC_PREFIX),
  );
  return entries.sort((a, b) => a.data.slug.localeCompare(b.data.slug));
}
