import assert from "node:assert/strict";
import test from "node:test";
import { categoryEntryId } from "../src/lib/category-entry-id.ts";

test("translated category files receive distinct collection ids while keeping shared slugs", () => {
  const id = categoryEntryId("quality-management.id.md");
  const en = categoryEntryId("quality-management.en.md");
  assert.equal(id, "quality-management.id");
  assert.equal(en, "quality-management.en");
  assert.notEqual(id, en);
});
