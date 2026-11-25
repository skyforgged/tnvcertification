/** Stable content-collection ID for page entries. */
export interface PageEntryIdData {
  id?: unknown;
}

/**
 * Astro's glob loader requires a string entry ID. Page frontmatter owns the
 * canonical numeric `id`; the string passed to Astro is that number, never a
 * label or slug. Each language variant owns a distinct numeric id.
 */
export function pageEntryId(data: PageEntryIdData): string {
  const { id } = data;
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
    throw new Error("Page entry requires a positive numeric id.");
  }
  return String(id);
}
