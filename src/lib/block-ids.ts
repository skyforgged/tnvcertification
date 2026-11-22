/**
 * Stable anchor IDs for content blocks.
 *
 * An explicit `id` from the content entry always wins so editors can rename a
 * heading without breaking a link. Blocks without one get a deterministic id
 * derived from their own text, never from their position alone.
 */
export interface BlockAnchorSource {
  id?: string;
  type: string;
  title?: string;
  eyebrow?: string;
}

export interface BlockIdDiagnostic {
  entry: string;
  path: string;
  field: string;
  rule: string;
  reason: string;
}

interface BlockIdEntry {
  path: string;
  data: Record<string, unknown>;
}

function nonEmpty(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function slugifyBlockId(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function blockAnchorId(block: BlockAnchorSource, index: number): string {
  if (nonEmpty(block.id)) return block.id.trim();
  const candidate = [block.title, block.eyebrow].find(nonEmpty) ?? `${block.type}-${index + 1}`;
  return slugifyBlockId(candidate);
}

export function findDuplicateBlockIdIndexes(blocks: readonly BlockAnchorSource[]): number[] {
  const seen = new Set<string>();
  const duplicates: number[] = [];
  blocks.forEach((block, index) => {
    if (!nonEmpty(block.id)) return;
    const id = block.id.trim();
    if (seen.has(id)) duplicates.push(index);
    else seen.add(id);
  });
  return duplicates;
}

export function validateBlockIds(entries: readonly BlockIdEntry[]): BlockIdDiagnostic[] {
  const diagnostics: BlockIdDiagnostic[] = [];
  for (const entry of entries) {
    const blocks = entry.data?.blocks;
    if (!Array.isArray(blocks)) continue;
    const sources = blocks.filter(
      (block): block is BlockAnchorSource => typeof block === "object" && block !== null,
    );
    for (const index of findDuplicateBlockIdIndexes(sources)) {
      const id = sources[index]?.id?.trim() ?? "";
      diagnostics.push({
        entry: entry.path,
        path: entry.path,
        field: `blocks[${index}].id`,
        rule: "CONTENT-014",
        reason: `Duplicate block id "${id}" in this entry; block ids must be unique.`,
      });
    }
  }
  return diagnostics;
}
