/**
 * Cross-collection taxonomy validation.
 *
 * Category references use stable category slugs, never localized labels or
 * filenames. Each translationKey must have exactly one Indonesian and one
 * English record with the same stable slug and publication-planning status.
 */
export interface TaxonomyRecordLike {
  id: string;
  path: string;
  data: Record<string, unknown>;
}

export interface TaxonomyDiagnostic {
  entry: string;
  path: string;
  field: string;
  rule: string;
  reason: string;
}

export interface TaxonomyContentLike {
  id: string;
  path?: string;
  collection: string;
  data: Record<string, unknown>;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function diagnostic(
  entry: string,
  path: string,
  field: string,
  rule: string,
  reason: string,
): TaxonomyDiagnostic {
  return { entry, path, field, rule, reason };
}

export function validateTaxonomy(
  categories: TaxonomyRecordLike[],
  contentEntries: TaxonomyContentLike[],
): TaxonomyDiagnostic[] {
  const diagnostics: TaxonomyDiagnostic[] = [];
  const translationGroups = new Map<string, TaxonomyRecordLike[]>();
  const slugLanguageOwners = new Map<string, TaxonomyRecordLike>();
  const knownSlugs = new Set<string>();

  for (const category of categories) {
    const slug = text(category.data.slug);
    const lang = text(category.data.lang);
    const translationKey = text(category.data.translationKey);
    const status = text(category.data.status) || "planned";

    if (!slug) {
      diagnostics.push(diagnostic(category.id, category.path, "slug", "TAXONOMY-001", "Category slug is required."));
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      diagnostics.push(diagnostic(category.id, category.path, "slug", "TAXONOMY-012", "Category slug must use lowercase kebab-case."));
    }
    if (lang !== "id" && lang !== "en") {
      diagnostics.push(diagnostic(category.id, category.path, "lang", "TAXONOMY-002", 'Category language must be "id" or "en".'));
    }
    if (!translationKey) {
      diagnostics.push(diagnostic(category.id, category.path, "translationKey", "TAXONOMY-003", "Category translationKey is required."));
    }
    if (status !== "planned" && status !== "active") {
      diagnostics.push(diagnostic(category.id, category.path, "status", "TAXONOMY-013", 'Category status must be "planned" or "active".'));
    }

    if (slug && lang) {
      knownSlugs.add(slug);
      const key = `${slug.toLowerCase()}:${lang}`;
      const owner = slugLanguageOwners.get(key);
      if (owner) {
        diagnostics.push(diagnostic(category.id, category.path, "slug", "TAXONOMY-004", `Category slug/language duplicates ${owner.path}.`));
      } else {
        slugLanguageOwners.set(key, category);
      }
    }

    if (translationKey) {
      const group = translationGroups.get(translationKey) ?? [];
      group.push(category);
      translationGroups.set(translationKey, group);
    }
  }

  for (const [translationKey, group] of translationGroups) {
    const byLanguage = new Map<string, TaxonomyRecordLike>();
    for (const category of group) {
      const lang = text(category.data.lang);
      if (byLanguage.has(lang)) {
        diagnostics.push(diagnostic(category.id, category.path, "translationKey", "TAXONOMY-005", `translationKey "${translationKey}" has more than one "${lang}" record.`));
      } else {
        byLanguage.set(lang, category);
      }
    }

    const idRecord = byLanguage.get("id");
    const enRecord = byLanguage.get("en");
    if (!idRecord || !enRecord) {
      const record = group[0];
      if (record) {
        diagnostics.push(diagnostic(record.id, record.path, "translationKey", "TAXONOMY-006", `translationKey "${translationKey}" must have both id and en records.`));
      }
    } else {
      if (text(idRecord.data.slug) !== text(enRecord.data.slug)) {
        diagnostics.push(diagnostic(enRecord.id, enRecord.path, "slug", "TAXONOMY-007", `Translated category records for "${translationKey}" must share the same stable slug.`));
      }
      const idStatus = text(idRecord.data.status) || "planned";
      const enStatus = text(enRecord.data.status) || "planned";
      if (idStatus !== enStatus) {
        diagnostics.push(diagnostic(enRecord.id, enRecord.path, "status", "TAXONOMY-014", `Translated category records for "${translationKey}" must share the same status.`));
      }
    }
  }

  for (const entry of contentEntries) {
    const rawCategoryIds = entry.data.categoryIds;
    if (rawCategoryIds === undefined) continue;
    const path = entry.path ?? entry.id;

    if (!Array.isArray(rawCategoryIds)) {
      diagnostics.push(diagnostic(entry.id, path, "categoryIds", "TAXONOMY-008", "categoryIds must be an array of stable category slugs."));
      continue;
    }

    const seen = new Set<string>();
    for (const [index, rawId] of rawCategoryIds.entries()) {
      const categoryId = text(rawId);
      if (!categoryId) {
        diagnostics.push(diagnostic(entry.id, path, `categoryIds[${index}]`, "TAXONOMY-009", "Category reference must be a non-empty slug."));
        continue;
      }
      if (seen.has(categoryId)) {
        diagnostics.push(diagnostic(entry.id, path, `categoryIds[${index}]`, "TAXONOMY-010", `Category reference "${categoryId}" is duplicated.`));
        continue;
      }
      seen.add(categoryId);
      if (!knownSlugs.has(categoryId)) {
        diagnostics.push(diagnostic(entry.id, path, `categoryIds[${index}]`, "TAXONOMY-011", `Category slug "${categoryId}" does not exist in the categories collection.`));
      }
    }
  }

  return diagnostics;
}
