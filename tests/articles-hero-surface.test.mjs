import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const hero = await readFile(new URL("../src/components/MainMenuHero.astro", import.meta.url), "utf8");
const pageHero = await readFile(new URL("../src/components/page/PageHero.astro", import.meta.url), "utf8");
const indexRoute = await readFile(new URL("../src/pages/articles/index.astro", import.meta.url), "utf8");
const articleLayout = await readFile(new URL("../src/layouts/ArticleLayout.astro", import.meta.url), "utf8");

test("articles hero uses the elevated navy surface", () => {
  assert.match(hero, /const isArticles = variant === "articles";/);
  assert.match(hero, /const isElevated = isHome \|\| isServices \|\| isCsms \|\| isTrainings \|\| isSchedules \|\| isArticles \|\| isAbout;/);
  assert.match(hero, /isServices \|\| isCsms \|\| isTrainings \|\| isSchedules \|\| isArticles/);
});

test("page hero forwards the articles variant without extra CTA", () => {
  assert.match(pageHero, /isArticles = false/);
  assert.match(pageHero, /isArticles \? "articles"/);
  assert.doesNotMatch(pageHero, /\{isArticles[\s\S]*?ButtonLink/);
});

test("articles index renders its hero in the layout fullBleed slot", () => {
  assert.match(indexRoute, /<PageHero slot="fullBleed"[\s\S]*?isArticles \/>/);
});

test("article detail keeps breadcrumbs above a fullBleed hero", () => {
  const fragmentStart = articleLayout.indexOf('<Fragment slot="fullBleed">');
  const breadcrumbStart = articleLayout.indexOf("<Breadcrumbs", fragmentStart);
  const heroStart = articleLayout.indexOf("<PageHero", fragmentStart);
  const articleStart = articleLayout.indexOf('<Container as="article"', fragmentStart);
  assert.ok(fragmentStart >= 0, "fullBleed slot is missing");
  assert.ok(breadcrumbStart > fragmentStart, "breadcrumbs are missing from the fullBleed slot");
  assert.ok(heroStart > breadcrumbStart, "hero must follow breadcrumbs");
  assert.ok(articleStart > heroStart, "hero must render before the article content");
  assert.match(articleLayout, /<PageHero[\s\S]*?isArticles \/>/);
});
