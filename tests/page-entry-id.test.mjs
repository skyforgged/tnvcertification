import assert from "node:assert/strict";
import test from "node:test";
import { pageEntryId } from "../src/lib/page-entry-id.ts";

test("pageEntryId derives the Astro entry ID from a numeric frontmatter id", () => {
  assert.equal(pageEntryId({ id: 20, slug: "home", lang: "id" }), "20");
  assert.equal(pageEntryId({ id: 35, slug: "home", lang: "en" }), "35");
  assert.equal(pageEntryId({ id: 22, slug: "csms", lang: "id" }), "22");
});

test("pageEntryId rejects missing or non-positive ids", () => {
  assert.throws(() => pageEntryId({ slug: "home" }), /positive numeric id/);
  assert.throws(() => pageEntryId({ id: 0, slug: "home" }), /positive numeric id/);
});
