import assert from "node:assert/strict";
import test from "node:test";
import { selectPageEntry } from "../src/lib/page-selection.ts";

const entry = (slug, lang, draft = false) => ({ data: { slug, lang, draft } });
const entries = [
  entry("about-us", "id"),
  entry("about-us", "en"),
  entry("home", "id", true),
];

test("selectPageEntry filters by slug, language and draft state", () => {
  assert.equal(selectPageEntry(entries, "about-us", "en").data.lang, "en");
  assert.equal(selectPageEntry(entries, "about-us").data.lang, "id");
});

test("selectPageEntry reports missing and draft entries", () => {
  assert.throws(() => selectPageEntry(entries, "missing", "id"), /not found/);
  assert.throws(() => selectPageEntry(entries, "home", "id"), /not found or is a draft/);
});
