import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const hero = await readFile(new URL("../src/components/MainMenuHero.astro", import.meta.url), "utf8");
const pageHero = await readFile(new URL("../src/components/page/PageHero.astro", import.meta.url), "utf8");
const indexRoute = await readFile(new URL("../src/pages/articles/index.astro", import.meta.url), "utf8");

test("articles hero uses the elevated navy surface", () => {
  assert.match(hero, /const isArticles = variant === "articles";/);
  assert.match(hero, /const isElevated = isHome \|\| isServices \|\| isCsms \|\| isTrainings \|\| isSchedules \|\| isArticles;/);
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
