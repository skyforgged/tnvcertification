import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = async (path) => {
  try {
    return await readFile(new URL(`../${path}`, import.meta.url), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
};

const component = await read("src/components/page/TrainingScheduleMonths.astro");
const page = await read("src/pages/trainings/[slug].astro");

test("component renders accessible month controls", () => {
  for (const marker of [
    "data-schedule-months", "data-month-filter", "data-month-count",
    "aria-pressed=", "data-show-past", "data-schedule-summary",
    'aria-live="polite"', "data-schedule-empty",
  ]) assert.ok(component.includes(marker), marker);
});

test("component keeps only the default month visible on the server", () => {
  assert.match(component, /hidden=\{/);
  assert.match(component, /data-month-group/);
  assert.match(component, /data-schedule-item/);
});

test("component script recomputes status from schedule dates", () => {
  for (const marker of ["data-start-date", "data-end-date", "data-timezone", "data-registration-status"]) {
    assert.ok(component.includes(marker), marker);
  }
  assert.match(component, /querySelectorAll\(\s*["']\[data-schedule-months\]/);
});

test("component uses design tokens, not hardcoded colors", () => {
  assert.doesNotMatch(component, /#[0-9a-fA-F]{3,8}\b/);
});

test("detail page delegates schedule rendering and excludes unusable records", () => {
  assert.match(page, /TrainingScheduleMonths/);
  assert.doesNotMatch(page, /schedules\.map\(\(schedule\)/);
  assert.match(page, /data\.startDate/);
  assert.match(page, /registrationStatus\s*!==\s*"cancelled"/);
});
