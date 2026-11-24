import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("homepage hero is rendered outside the landing container", async () => {
  const layout = await read("../src/layouts/Layout.astro");
  assert.match(layout, /<main[^>]*flex-col[^>]*>/);
  assert.match(layout, /<slot name="fullBleed" \/>/);

  const homepage = await read("../src/pages/index.astro");
  assert.match(homepage, /<PageHero[^>]*slot="fullBleed"[^>]*\/>/);
});
