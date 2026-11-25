/** Stable content-collection ID for entries with an authored numeric id. */
export interface NumericEntryIdData {
  id?: unknown;
}

/**
 * Astro's glob loader requires a string entry ID. Article and training
 * frontmatter owns the canonical numeric `id`; the string passed to Astro is
 * that number, never a label or slug.
 */
export function numericEntryId(data: NumericEntryIdData): string {
  const { id } = data;
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
    throw new Error("Entry requires a positive numeric id.");
  }
  return String(id);
}
