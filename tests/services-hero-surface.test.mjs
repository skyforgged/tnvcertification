import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/components/MainMenuHero.astro", import.meta.url),
  "utf8",
);
const servicesPage = await readFile(
  new URL("../src/pages/services/index.astro", import.meta.url),
  "utf8",
);

test("services hero uses the same navy surface as the homepage hero", () => {
  assert.match(source, /const isElevated = isHome \|\| isServices \|\| isCsms \|\| isTrainings;/);
  assert.doesNotMatch(source, /bg-\[#f1f5ff\]/);
  assert.doesNotMatch(source, /border-\[#dce7fb\]/);
  assert.match(source, /isElevated[\s\S]*?bg-\[#102b55\]/);
});

test("elevated heroes keep readable light text and the shared content container", () => {
  assert.match(source, /isElevated[\s\S]*?text-white/);
  assert.match(source, /isElevated[\s\S]*?text-blue-100\/90/);
  assert.match(source, /max-w-\[var\(--content-wide\)\]/);
  assert.match(source, /px-\[var\(--page-gutter\)\]/);
});

test("services hero is a direct child of the layout fullBleed slot", () => {
  const layoutStart = servicesPage.indexOf("<WidePageLayout");
  const heroStart = servicesPage.indexOf('<PageHero slot="fullBleed"', layoutStart);
  const contentStart = servicesPage.indexOf('<div class="w-full">', layoutStart);
  assert.ok(layoutStart >= 0, "WidePageLayout is missing");
  assert.ok(heroStart > layoutStart, "hero is missing from the layout");
  assert.ok(contentStart > heroStart, "hero must render before the landing content container");
});
