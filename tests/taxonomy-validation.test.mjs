import assert from "node:assert/strict";
import test from "node:test";
import { validateTaxonomy } from "../src/lib/taxonomy-validation.ts";

const category = (slug, lang, translationKey, id = `${slug}-${lang}.md`, status = "planned") => ({
  id,
  path: `src/content/categories/${id}`,
  data: { slug, lang, translationKey, status },
});

const entry = (categoryIds) => ({
  id: "sample.md",
  path: "src/content/articles/sample.md",
  collection: "articles",
  data: { categoryIds },
});

test("accepts complete Indonesian and English category pairs", () => {
  const diagnostics = validateTaxonomy(
    [
      category("quality-management", "id", "quality-management"),
      category("quality-management", "en", "quality-management"),
    ],
    [entry(["quality-management"])],
  );
  assert.deepEqual(diagnostics, []);
});

test("rejects missing translation counterpart", () => {
  const diagnostics = validateTaxonomy(
    [category("quality-management", "id", "quality-management")],
    [],
  );
  assert.ok(diagnostics.some((item) => item.rule === "TAXONOMY-006"));
});

test("rejects translated categories with different stable slugs", () => {
  const diagnostics = validateTaxonomy(
    [
      category("quality-management", "id", "quality-management"),
      category("quality", "en", "quality-management"),
    ],
    [],
  );
  assert.ok(diagnostics.some((item) => item.rule === "TAXONOMY-007"));
});

test("rejects translated pairs with inconsistent status", () => {
  const diagnostics = validateTaxonomy(
    [
      category("quality-management", "id", "quality-management", "quality-management-id.md", "planned"),
      category("quality-management", "en", "quality-management", "quality-management-en.md", "active"),
    ],
    [],
  );
  assert.ok(diagnostics.some((item) => item.rule === "TAXONOMY-014"));
});

test("rejects malformed category slugs", () => {
  const diagnostics = validateTaxonomy(
    [
      category("Quality_Management", "id", "quality-management"),
      category("Quality_Management", "en", "quality-management"),
    ],
    [],
  );
  assert.ok(diagnostics.some((item) => item.rule === "TAXONOMY-012"));
});

test("rejects dangling and duplicate category references", () => {
  const diagnostics = validateTaxonomy(
    [
      category("quality-management", "id", "quality-management"),
      category("quality-management", "en", "quality-management"),
    ],
    [entry(["quality-management", "quality-management", "unknown-category"])],
  );
  assert.ok(diagnostics.some((item) => item.rule === "TAXONOMY-010"));
  assert.ok(diagnostics.some((item) => item.rule === "TAXONOMY-011"));
});
