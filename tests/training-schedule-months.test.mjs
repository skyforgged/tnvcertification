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

test("every schedule element exposes a stable semantic class", () => {
  const classes = [
    "training-schedule-months", "training-schedule-month-list",
    "training-schedule-month-button", "training-schedule-month-count",
    "training-schedule-summary", "training-schedule-show-past",
    "training-schedule-month-group", "training-schedule-month-heading",
    "training-schedule-item", "training-schedule-date",
    "training-schedule-location", "training-schedule-venue",
    "training-schedule-status", "training-schedule-price",
    "training-schedule-quota", "training-schedule-register",
    "training-schedule-empty", "training-schedule-note",
  ];
  for (const className of classes) {
    assert.match(component, new RegExp(`\\b${className}\\b`), className);
  }
});

test("conditional fields keep their semantic class inside the right branch", () => {
  for (const [condition, className] of [
    ["data.venue || data.city", "training-schedule-venue"],
    ["data.price !== undefined", "training-schedule-price"],
    ["data.quota !== undefined", "training-schedule-quota"],
    ["data.registrationUrl && data.registrationStatus === \"open\"", "training-schedule-register"],
  ]) {
    const start = component.indexOf(condition);
    assert.notEqual(start, -1, condition);
    assert.ok(component.slice(start, start + 400).includes(className), className);
  }
});

test("semantic classes do not displace data hooks or audited block semantics", () => {
  for (const marker of ["data-schedule-item", "data-month-filter", "data-status-label", "inline-flex", "min-h-11", "grid"]) {
    assert.ok(component.includes(marker), marker);
  }
  assert.doesNotMatch(component, /block-section/);
  assert.doesNotMatch(component, /#[0-9a-fA-F]{3,8}\b/);
});
