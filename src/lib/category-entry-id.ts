/** Generate a unique Astro collection entry id for each translated category file. */
export function categoryEntryId(entry: string): string {
  return entry.replace(/\.(?:md|mdx)$/i, "");
}
