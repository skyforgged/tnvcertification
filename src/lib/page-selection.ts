/** Pure selector for language-specific page entries. */
export interface SelectablePageEntry {
  data: {
    slug: string;
    lang?: string;
    draft?: boolean;
  };
}

export function selectPageEntry<T extends SelectablePageEntry>(
  entries: readonly T[],
  slug: string,
  lang = "id",
): T {
  const entry = entries.find(
    (candidate) =>
      candidate.data.slug === slug &&
      (candidate.data.lang ?? "id") === lang &&
      candidate.data.draft !== true,
  );
  if (!entry) throw new Error(`Page entry "${slug}" not found or is a draft`);
  return entry;
}
