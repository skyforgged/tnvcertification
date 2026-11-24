import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const hero = await read("../src/components/MainMenuHero.astro");
const pageHero = await read("../src/components/page/PageHero.astro");
const indexRoute = await read("../src/pages/csms/index.astro");
const detailRoute = await read("../src/pages/csms/[slug].astro");

test("csms hero uses the elevated navy surface", () => {
  assert.match(hero, /const isCsms = variant === "csms";/);
  assert.match(hero, /const isElevated = isHome \|\| isServices \|\| isCsms;/);
  assert.match(hero, /isHome \? "max-w-\[14ch\][\s\S]*?isServices \|\| isCsms/);
});

test("page hero forwards the csms variant without services CTA", () => {
  assert.match(pageHero, /isCsms = false/);
  assert.match(pageHero, /isCsms \? "csms"/);
  assert.doesNotMatch(pageHero, /isServices \|\| isCsms[\s\S]*?Lihat daftar layanan/);
});

test("csms index renders its hero in the layout fullBleed slot", () => {
  assert.match(indexRoute, /<PageHero slot="fullBleed"[\s\S]*?isCsms \/>/);
});

test("csms detail keeps breadcrumbs above a fullBleed hero", () => {
  const fragmentStart = detailRoute.indexOf('<Fragment slot="fullBleed">');
  const breadcrumbStart = detailRoute.indexOf("<Breadcrumbs", fragmentStart);
  const heroStart = detailRoute.indexOf("<PageHero", fragmentStart);
  const articleStart = detailRoute.indexOf("<article", fragmentStart);
  assert.ok(fragmentStart >= 0, "fullBleed slot is missing");
  assert.ok(breadcrumbStart > fragmentStart, "breadcrumbs are missing from the fullBleed slot");
  assert.ok(heroStart > breadcrumbStart, "hero must follow breadcrumbs");
  assert.ok(articleStart > heroStart, "hero must render before the article content");
});
