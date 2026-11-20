/**
 * Content editorial validation (build-time gate).
 *
 * Enforces the mandatory editorial rules from docs/project-capabilities-roadmap.md
 * (CONTENT-001 .. CONTENT-011) that the collection Zod schema cannot express.
 *
 * NOTE: this module is Astro-import-free so it stays plainly testable. The Astro
 * integration (src/content-validation.ts) loads entries via
 * `astro/content/runtime` and throws the final error to fail the build.
 */

export interface Diagnostic {
  collection: string;
  entryId: string;
  field: string;
  ruleId: string;
  reason: string;
}

export interface ParsedContent {
  headings: Array<{ level: number; text: string }>;
  intro: string | null;
}

export interface ContentEntryLike {
  id: string;
  collection: string;
  data: Record<string, unknown>;
  body: string;
}

export function parseHeadingsAndIntro(body: string): ParsedContent {
  const headings: Array<{ level: number; text: string }> = [];
  let introLines: string[] = [];
  let inIntro = false;

  const lines = body.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;

    const hashMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (hashMatch) {
      const level = (hashMatch[1]?.length ?? 0);
      headings.push({ level, text: hashMatch[2] ?? "" });
      if (level === 1) {
        inIntro = true;
        introLines = [];
      } else if (inIntro) {
        break; // deeper heading ends the intro paragraph block
      }
      continue;
    }

    if (line.startsWith(">") || line.startsWith("```")) {
      if (inIntro) break; // blockquote / code ends the intro paragraph
      continue;
    }

    if (inIntro) {
      introLines.push(line);
    }
  }

  return {
    headings,
    intro: inIntro ? introLines.join(" ").trim() : null,
  };
}

function toStr(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function validateEntry(entry: ContentEntryLike): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const data = entry.data;
  const title = toStr(data.title);
  const metaDescription = toStr(data.metaDescription);
  const { headings, intro } = parseHeadingsAndIntro(entry.body);

  // CONTENT-001 / 002 / 003
  if (!headings.some((h) => h.level === 1)) {
    diagnostics.push({
      collection: entry.collection,
      entryId: entry.id,
      field: "body",
      ruleId: "CONTENT-001",
      reason: "Missing H1. The page must start with an H1 heading.",
    });
  }
  if (headings.some((h) => h.level === 1) && !intro) {
    diagnostics.push({
      collection: entry.collection,
      entryId: entry.id,
      field: "body",
      ruleId: "CONTENT-002",
      reason: "No introductory paragraph immediately after H1.",
    });
  }
  if (title && intro && !intro.startsWith(title + " adalah")) {
    diagnostics.push({
      collection: entry.collection,
      entryId: entry.id,
      field: "body",
      ruleId: "CONTENT-003",
      reason: `Intro must begin with the title followed by "adalah" (expected: "${title} adalah ...", got: "${intro.slice(0, 40)}...").`,
    });
  }

  // CONTENT-005
  if (!metaDescription) {
    diagnostics.push({
      collection: entry.collection,
      entryId: entry.id,
      field: "metaDescription",
      ruleId: "CONTENT-005",
      reason: "metaDescription is required and must be non-empty.",
    });
  }

  // CONTENT-007 / 008 / 009
  const image = data.featuredImage as
    | { src?: unknown; alt?: unknown }
    | undefined;
  if (!image || typeof image !== "object" || Array.isArray(image)) {
    diagnostics.push({
      collection: entry.collection,
      entryId: entry.id,
      field: "featuredImage",
      ruleId: "CONTENT-007",
      reason: "featuredImage must be a single image object.",
    });
  } else {
    const src = toStr(image.src);
    const alt = toStr(image.alt);
    if (!src) {
      diagnostics.push({
        collection: entry.collection,
        entryId: entry.id,
        field: "featuredImage",
        ruleId: "CONTENT-007",
        reason: "featuredImage.src is required.",
      });
    }
    if (!alt) {
      diagnostics.push({
        collection: entry.collection,
        entryId: entry.id,
        field: "featuredImage",
        ruleId: "CONTENT-008",
        reason: "featuredImage.alt is required.",
      });
    } else {
      if (!alt.includes("adalah")) {
        diagnostics.push({
          collection: entry.collection,
          entryId: entry.id,
          field: "featuredImage.alt",
          ruleId: "CONTENT-008",
          reason: `featuredImage.alt must include "adalah" (got: "${alt}").`,
        });
      } else if (!alt.toLowerCase().includes(title.toLowerCase())) {
        diagnostics.push({
          collection: entry.collection,
          entryId: entry.id,
          field: "featuredImage.alt",
          ruleId: "CONTENT-008",
          reason: `featuredImage.alt must be title-relevant (title: "${title}").`,
        });
      }
      if (intro && alt.length >= intro.length) {
        diagnostics.push({
          collection: entry.collection,
          entryId: entry.id,
          field: "featuredImage.alt",
          ruleId: "CONTENT-009",
          reason: "featuredImage.alt must be shorter than the intro.",
        });
      }
    }
  }

  // CONTENT-010
  const imagesVal = data.images;
  if (imagesVal !== undefined) {
    if (!Array.isArray(imagesVal)) {
      diagnostics.push({
        collection: entry.collection,
        entryId: entry.id,
        field: "images",
        ruleId: "CONTENT-010",
        reason: "Optional `images` must be an array when supplied.",
      });
    } else {
      for (let i = 0; i < imagesVal.length; i += 1) {
        const img = imagesVal[i];
        if (typeof img !== "object" || img === null || Array.isArray(img)) {
          diagnostics.push({
            collection: entry.collection,
            entryId: entry.id,
            field: `images[${i}]`,
            ruleId: "CONTENT-010",
            reason: "Each item in `images` must be an image object.",
          });
        }
      }
    }
  }

  // CONTENT-011
  const levels = headings.map((h) => h.level);
  for (let i = 1; i < levels.length; i += 1) {
    const prev = levels[i - 1];
    const next = levels[i];
    if (prev === undefined || next === undefined) continue;
    if (next > prev && next - prev !== 1) {
      diagnostics.push({
        collection: entry.collection,
        entryId: entry.id,
        field: "body",
        ruleId: "CONTENT-011",
        reason: `Heading level skipped: H${prev} cannot be followed directly by H${next}.`,
      });
    }
  }

  return diagnostics;
}

export function validateAllEntries(entries: ContentEntryLike[]): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const intros = new Map<string, { collection: string; entryId: string }>();
  const metaDescriptions = new Map<string, string>();

  for (const entry of entries) {
    for (const d of validateEntry({ ...entry, body: entry.body ?? "" })) {
      diagnostics.push(d);
    }

    // CONTENT-004: intro text must not be reused across entries.
    const parsed = parseHeadingsAndIntro(entry.body);
    if (parsed.intro) {
      const key = parsed.intro.trim();
      if (intros.has(key)) {
        const prev = intros.get(key)!;
        diagnostics.push({
          collection: entry.collection,
          entryId: entry.id,
          field: "body",
          ruleId: "CONTENT-004",
          reason: `Intro text is reused from "${prev.collection} → ${prev.entryId}".`,
        });
      } else {
        intros.set(key, { collection: entry.collection, entryId: entry.id });
      }
    }

    // CONTENT-005 and CONTENT-006: metaDescription uniqueness + no intro dup.
    const metaDescription = toStr(entry.data.metaDescription);
    if (metaDescription) {
      if (metaDescriptions.has(metaDescription)) {
        diagnostics.push({
          collection: entry.collection,
          entryId: entry.id,
          field: "metaDescription",
          ruleId: "CONTENT-006",
          reason: `metaDescription is duplicated on "${metaDescriptions.get(metaDescription)}".`,
        });
      } else {
        metaDescriptions.set(metaDescription, entry.id);
      }
      if (parsed.intro && metaDescription === parsed.intro.trim()) {
        diagnostics.push({
          collection: entry.collection,
          entryId: entry.id,
          field: "metaDescription",
          ruleId: "CONTENT-006",
          reason: "metaDescription must not duplicate the intro text.",
        });
      }
    }
  }

  return diagnostics;
}
