import assert from "node:assert/strict";
import test from "node:test";
import { validateArticleServiceRelations } from "../src/lib/article-service-relations.ts";

const service = (id, draft = false) => ({
  id: `service-${id}`,
  path: `src/content/services/service-${id}.md`,
  collection: "services",
  data: { id, slug: `service-${id}`, draft },
});

const article = (serviceId, draft = false) => ({
  id: "article-1",
  path: "src/content/articles/article-1.md",
  collection: "articles",
  data: { serviceId, draft },
});

test("accepts an explicit reference to an existing published service", () => {
  assert.deepEqual(
    validateArticleServiceRelations([service(1), article(1)]),
    [],
  );
});

test("allows an article without a service association", () => {
  assert.deepEqual(
    validateArticleServiceRelations([service(1), { ...article(undefined), data: {} }]),
    [],
  );
});

test("rejects references to missing services", () => {
  const diagnostics = validateArticleServiceRelations([article(99)]);
  assert.ok(diagnostics.some((item) => item.rule === "RELATION-004"));
});

test("rejects published articles linking to draft services", () => {
  const diagnostics = validateArticleServiceRelations([service(1, true), article(1)]);
  assert.ok(diagnostics.some((item) => item.rule === "RELATION-005"));
});

test("allows draft articles to reference draft services", () => {
  assert.deepEqual(
    validateArticleServiceRelations([service(1, true), article(1, true)]),
    [],
  );
});

test("rejects duplicate service ids", () => {
  const diagnostics = validateArticleServiceRelations([service(1), service(1)]);
  assert.ok(diagnostics.some((item) => item.rule === "RELATION-002"));
});

test("rejects invalid service ids and references", () => {
  const diagnostics = validateArticleServiceRelations([
    service(0),
    article("1"),
  ]);
  assert.ok(diagnostics.some((item) => item.rule === "RELATION-001"));
  assert.ok(diagnostics.some((item) => item.rule === "RELATION-003"));
});
