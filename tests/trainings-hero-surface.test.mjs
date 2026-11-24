import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const hero = await read("../src/components/MainMenuHero.astro");
const pageHero = await read("../src/components/page/PageHero.astro");
const indexRoute = await read("../src/pages/trainings/index.astro");
const trainingLayout = await read("../src/layouts/TrainingLayout.astro");

test("trainings hero uses the elevated navy surface", () => {
  assert.match(hero, /const isTrainings = variant === "trainings";/);
  assert.match(hero, /const isElevated = isHome \|\| isServices \|\| isCsms \|\| isTrainings \|\| isSchedules;/);
  assert.match(hero, /isServices \|\| isCsms \|\| isTrainings/);
});

test("page hero forwards the trainings variant without extra CTA", () => {
  assert.match(pageHero, /isTrainings = false/);
  assert.match(pageHero, /isTrainings \? "trainings"/);
  assert.doesNotMatch(pageHero, /\{isTrainings[\s\S]*?ButtonLink/);
});

test("trainings index renders its hero in the layout fullBleed slot", () => {
  assert.match(indexRoute, /<PageHero slot="fullBleed"[\s\S]*?isTrainings \/>/);
});

test("training detail keeps breadcrumbs above a fullBleed hero", () => {
  const fragmentStart = trainingLayout.indexOf('<Fragment slot="fullBleed">');
  const breadcrumbStart = trainingLayout.indexOf("<Breadcrumbs", fragmentStart);
  const heroStart = trainingLayout.indexOf("<PageHero", fragmentStart);
  const articleStart = trainingLayout.indexOf("<Container as=\"article\"", fragmentStart);
  assert.ok(fragmentStart >= 0, "fullBleed slot is missing");
  assert.ok(breadcrumbStart > fragmentStart, "breadcrumbs are missing from the fullBleed slot");
  assert.ok(heroStart > breadcrumbStart, "hero must follow breadcrumbs");
  assert.ok(articleStart > heroStart, "hero must render before the article content");
});
