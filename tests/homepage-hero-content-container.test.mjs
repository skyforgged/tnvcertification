import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/components/MainMenuHero.astro", import.meta.url),
  "utf8",
);

test("homepage hero content aligns to the footer container instead of fixed side padding", () => {
  assert.match(source, /max-w-\[var\(--content-wide\)\]/);
  assert.match(source, /px-\[var\(--page-gutter\)\]/);
  assert.doesNotMatch(source, /px-5 sm:px-9 lg:px-12/);
});
