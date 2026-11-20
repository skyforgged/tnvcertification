/**
 * Explicit article-to-service relationship validation.
 *
 * Articles may reference a service by its stable numeric frontmatter id.
 * References are never inferred from titles, slugs or category labels.
 */
export interface RelationEntryLike {
  id: string;
  path?: string;
  collection: string;
  data: Record<string, unknown>;
}

export interface RelationDiagnostic {
  entry: string;
  path: string;
  field: string;
  rule: string;
  reason: string;
}

function positiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function validateArticleServiceRelations(
  entries: readonly RelationEntryLike[],
): RelationDiagnostic[] {
  const diagnostics: RelationDiagnostic[] = [];
  const services = entries.filter((entry) => entry.collection === "services");
  const articles = entries.filter((entry) => entry.collection === "articles");
  const serviceById = new Map<number, RelationEntryLike>();

  for (const service of services) {
    const id = service.data.id;
    if (!positiveInteger(id)) {
      diagnostics.push({
        entry: service.id,
        path: service.path ?? service.id,
        field: "id",
        rule: "RELATION-001",
        reason: "Every service must have a unique positive integer id.",
      });
      continue;
    }

    const existing = serviceById.get(id);
    if (existing) {
      diagnostics.push({
        entry: service.id,
        path: service.path ?? service.id,
        field: "id",
        rule: "RELATION-002",
        reason: `Service id ${id} is already used by ${existing.path ?? existing.id}.`,
      });
    } else {
      serviceById.set(id, service);
    }
  }

  for (const article of articles) {
    const rawServiceId = article.data.serviceId;
    if (rawServiceId === undefined) continue;

    const path = article.path ?? article.id;
    if (!positiveInteger(rawServiceId)) {
      diagnostics.push({
        entry: article.id,
        path,
        field: "serviceId",
        rule: "RELATION-003",
        reason: "serviceId must be a positive integer matching a service id.",
      });
      continue;
    }

    const target = serviceById.get(rawServiceId);
    if (!target) {
      diagnostics.push({
        entry: article.id,
        path,
        field: "serviceId",
        rule: "RELATION-004",
        reason: `Referenced service id ${rawServiceId} does not exist.`,
      });
      continue;
    }

    if (article.data.draft !== true && target.data.draft === true) {
      diagnostics.push({
        entry: article.id,
        path,
        field: "serviceId",
        rule: "RELATION-005",
        reason: `Published article cannot link to draft service "${target.data.slug ?? target.id}".`,
      });
    }
  }

  return diagnostics;
}
