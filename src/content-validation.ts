/**
 * Build-time content editorial and taxonomy validation integration.
 *
 * Editorial entries are checked against CONTENT-001..011. Category records
 * are loaded separately because categories are taxonomy records, not
 * publishable editorial pages. Cross-collection taxonomy checks validate
 * bilingual category pairs and explicit categoryIds references.
 */
import { globSync } from "tinyglobby";
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { validateAllEntries, type ContentEntryLike } from "./lib/content-validation";
import { validateTaxonomy, type TaxonomyRecordLike } from "./lib/taxonomy-validation";
import { collectionRegistry, editorialCollections } from "./data/collections";

function readFrontmatter(filePath: string): FrontmatterPayload | null {
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

interface FrontmatterPayload {
  data: Record<string, unknown>;
  body: string;
}

function loadContentEntries(): ContentEntryLike[] {
  const entries: ContentEntryLike[] = [];
  for (const col of editorialCollections) {
    const files = globSync(`${col.dir}/**/*.{md,mdx}`, { onlyFiles: true });
    for (const file of files) {
      const payload = readFrontmatter(file);
      if (payload === null) continue;
      entries.push({
        id: file,
        collection: col.name,
        path: file,
        data: payload.data,
        body: payload.body,
      });
    }
  }
  return entries;
}

function loadCategoryEntries(): TaxonomyRecordLike[] {
  const files = globSync(`${collectionRegistry.categories.dir}/**/*.{md,mdx}`, { onlyFiles: true });
  return files.flatMap((file) => {
    const payload = readFrontmatter(file);
    return payload
      ? [{ id: file, path: file, data: payload.data }]
      : [];
  });
}

export const contentValidationIntegration = {
  name: "validate-content",
  hooks: {
    "astro:build:done": async () => {
      const contentEntries = loadContentEntries();
      const diagnostics = [
        ...validateAllEntries(contentEntries),
        ...validateTaxonomy(loadCategoryEntries(), contentEntries),
      ];
      if (diagnostics.length > 0) {
        const lines = [
          `Content validation failed with ${diagnostics.length} issue(s):`,
          ...diagnostics.map((d) => `  [${d.rule}] ${d.path} → ${d.field}: ${d.reason}`),
          "",
          "Fix the content and taxonomy references before building again.",
        ];
        throw new Error(lines.join("\n"));
      }
    },
  },
};
