import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const hero = await readFile(new URL("../src/components/MainMenuHero.astro", import.meta.url), "utf8");
const archiveLayout = await readFile(
  new URL("../src/layouts/ScheduleArchiveLayout.astro", import.meta.url),
  "utf8",
);

test("schedules hero uses the elevated navy surface", () => {
  assert.match(hero, /const isSchedules = variant === "schedules";/);
  assert.match(hero, /const isElevated = isHome \|\| isServices \|\| isCsms \|\| isTrainings \|\| isSchedules \|\| isArticles;/);
  assert.match(hero, /isServices \|\| isCsms \|\| isTrainings \|\| isSchedules/);
});

test("schedule archive renders its hero in the layout fullBleed slot", () => {
  const fragmentStart = archiveLayout.indexOf('<Fragment slot="fullBleed">');
  const heroStart = archiveLayout.indexOf("<MainMenuHero", fragmentStart);
  const containerStart = archiveLayout.indexOf("<Container", fragmentStart);
  assert.ok(fragmentStart >= 0, "fullBleed slot is missing");
  assert.ok(heroStart > fragmentStart, "hero is missing from the fullBleed slot");
  assert.ok(heroStart < containerStart, "hero must render before the archive content container");
  assert.match(archiveLayout, /variant="schedules"/);
});
