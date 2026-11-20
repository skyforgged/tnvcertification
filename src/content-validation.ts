/**
 * Build-time content editorial validation integration.
 *
 * Runs after the build completes (`astro:build:done`) and validates every
 * publishable entry against the mandatory editorial rules documented in
 * docs/project-capabilities-roadmap.md (CONTENT-001 .. CONTENT-011) that the
 * Zod collection schema cannot express:
 *
 *   - CONTENT-001: H1 exists.
 *   - CONTENT-002: exactly one intro paragraph immediately after H1.
 *   - CONTENT-003: intro begins with the page title followed by "adalah".
 *   - CONTENT-004: intro text is not generic/reused across entries.
 *   - CONTENT-005: metaDescription is present and non-empty.
 *   - CONTENT-006: metaDescription is unique and not the intro / image alt.
 *   - CONTENT-007: exactly one featuredImage object.
 *   - CONTENT-008: featuredImage.alt explains the title with "adalah".
 *   - CONTENT-009: featuredImage.alt is shorter than the intro.
 *   - CONTENT-010: optional `images`, when supplied, is a valid array.
 *   - CONTENT-011: semantic heading hierarchy must not skip levels.
 *
 * Each violation is reported as an actionable diagnostic:
 *   [RULE] path → field: reason
 * and the build fails.
 *
 * Unlike the Zod collection schema (which validates at content-sync time) and
 * unlike `getCollection()` (whose content store may not be ready inside the
 * `astro:build:done` hook), this reads the published .md files straight off the
 * filesystem so the editorial rules are enforced deterministically at build time.
 */
import { globSync } from "tinyglobby";
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { validateAllEntries, type ContentEntryLike } from "./lib/content-validation";

// Canonical content dirs backing each collection. The Zod `defineCollection`
// config already maps these; this array mirrors them so the build gate knows
// where to read frontmatter.
const COLLECTIONS = [
  { name: "articles", dir: "src/content/articles" },
  { name: "certifications", dir: "src/content/certifications" },
  { name: "training", dir: "src/content/training" },
  { name: "trainingSchedules", dir: "src/content/training-schedules" },
  { name: "pages", dir: "src/content/pages" },
] as const;

function loadContentEntries(): ContentEntryLike[] {
  const entries: ContentEntryLike[] = [];
  for (const col of COLLECTIONS) {
    const files = globSync(`${col.dir}/**/*.md`, { onlyFiles: true });
    for (const file of files) {
      const payload = readFrontmatter(file);
      if (payload === null) continue;
      entries.push({ id: file, collection: col.name, data: payload.data, body: payload.body });
    }
  }
  return entries;
}

interface FrontmatterPayload {
  data: Record<string, unknown>;
  body: string;
}

function readFrontmatter(filePath: string): FrontmatterPayload | null {
  const raw = readFileSync(filePath, "utf8");
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith("---")) return null;

  // Split on the first "---" (frontmatter) boundary.
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

  // The remainder after the closing "---" is the markdown body.
  const body = parts.length > 1 ? parts.slice(1).join("\n").trimStart() : "";
  return { data: data as Record<string, unknown>, body };
}

export const contentValidationIntegration = {
  name: "validate-content",
  hooks: {
    "astro:build:done": async () => {
      const diagnostics = validateAllEntries(loadContentEntries());
      if (diagnostics.length > 0) {
        const lines = [
          `Content editorial validation failed with ${diagnostics.length} issue(s):`,
          ...diagnostics.map((d) => {
            return `  [${d.rule}] ${d.path} → ${d.field}: ${d.reason}`;
          }),
          "",
          "Fix the frontmatter/body per docs/project-capabilities-roadmap.md (CONTENT-001 .. CONTENT-011).",
        ];
        throw new Error(lines.join("\n"));
      }
    },
  },
};
