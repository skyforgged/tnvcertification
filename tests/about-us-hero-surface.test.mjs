import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const hero = await readFile(new URL("../src/components/MainMenuHero.astro", import.meta.url), "utf8");
const pageHero = await readFile(new URL("../src/components/page/PageHero.astro", import.meta.url), "utf8");
const route = await readFile(new URL("../src/pages/[slug].astro", import.meta.url), "utf8");

test("about hero uses the elevated navy surface", () => {
  assert.match(hero, /const isAbout = variant === "about";/);
  assert.match(hero, /const isElevated = isHome \|\| isServices \|\| isCsms \|\| isTrainings \|\| isSchedules \|\| isArticles \|\| isAbout;/);
  assert.match(hero, /isServices \|\| isCsms \|\| isTrainings \|\| isSchedules \|\| isArticles \|\| isAbout/);
});

test("page hero forwards the about variant without extra CTA", () => {
  assert.match(pageHero, /isAbout = false/);
  assert.match(pageHero, /isAbout \? "about"/);
  assert.doesNotMatch(pageHero, /\{isAbout[\s\S]*?ButtonLink/);
});

test("generic page route keeps breadcrumbs above a fullBleed hero", () => {
  const fragmentStart = route.indexOf('<Fragment slot="fullBleed">');
  const breadcrumbStart = route.indexOf("<Breadcrumbs", fragmentStart);
  const heroStart = route.indexOf("<PageHero", fragmentStart);
  const articleStart = route.indexOf("<article", fragmentStart);
  assert.ok(fragmentStart >= 0, "fullBleed slot is missing");
  assert.ok(breadcrumbStart > fragmentStart, "breadcrumbs are missing from the fullBleed slot");
  assert.ok(heroStart > breadcrumbStart, "hero must follow breadcrumbs");
  assert.ok(articleStart > heroStart, "hero must render before the article content");
  assert.match(route, /<PageHero[\s\S]*?isAbout \/>/);
});
