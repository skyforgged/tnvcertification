import assert from "node:assert/strict";
import test from "node:test";
import {
  scheduleDateLabel,
  selectUpcomingSchedules,
  sortSchedulesByStartDate,
} from "../src/lib/schedule-display.ts";
import {
  monthKeyFromStartDate,
  selectDefaultScheduleMonth,
} from "../src/lib/schedule-display.ts";

test("schedule date label uses a pending message when dates are absent", () => {
  assert.equal(scheduleDateLabel(undefined, undefined), "Jadwal akan diumumkan");
});

test("date-less label never exposes invalid or placeholder date text", () => {
  const label = scheduleDateLabel(undefined, undefined);
  assert.doesNotMatch(label, /invalid|nan|undefined|null|\d{4}/i);
});

test("schedule date label formats a complete date range", () => {
  const label = scheduleDateLabel("2027-03-01", "2027-03-03");
  assert.match(label, /2027/);
  assert.match(label, /Maret/);
  assert.ok(label.includes("–"));
});

test("same-day schedule date label renders one date without a range dash", () => {
  const label = scheduleDateLabel("2027-01-13", "2027-01-13");
  assert.equal((label.match(/2027/g) ?? []).length, 1);
  assert.ok(!label.includes("–"));
});

test("upcoming selector includes today and excludes past, date-less and cancelled sessions", () => {
  const items = [
    { data: { slug: "today", startDate: "2027-01-13" } },
    { data: { slug: "past", startDate: "2027-01-12" } },
    { data: { slug: "pending" } },
    { data: { slug: "cancelled", startDate: "2027-02-10", registrationStatus: "cancelled" } },
  ];

  assert.deepEqual(
    selectUpcomingSchedules(items, "2027-01-13", 3).map((item) => item.data.slug),
    ["today"],
  );
});

test("upcoming selector keeps the nearest sessions and displays them in descending order", () => {
  const items = [
    { data: { slug: "mar24", startDate: "2027-03-24" } },
    { data: { slug: "jan13", startDate: "2027-01-13" } },
    { data: { slug: "feb10", startDate: "2027-02-10" } },
    { data: { slug: "jan27", startDate: "2027-01-27" } },
    { data: { slug: "feb24", startDate: "2027-02-24" } },
    { data: { slug: "mar10", startDate: "2027-03-10" } },
  ];

  assert.deepEqual(
    selectUpcomingSchedules(items, "2027-01-13", 3).map((item) => item.data.slug),
    ["feb10", "jan27", "jan13"],
  );
});

test("upcoming selector breaks same-date ties by slug ascending", () => {
  const items = [
    { data: { slug: "c", startDate: "2027-01-13" } },
    { data: { slug: "a", startDate: "2027-01-13" } },
    { data: { slug: "b", startDate: "2027-01-13" } },
  ];

  assert.deepEqual(
    selectUpcomingSchedules(items, "2027-01-13", 3).map((item) => item.data.slug),
    ["a", "b", "c"],
  );
});

test("upcoming selector returns every eligible item when the limit exceeds the input", () => {
  const items = [
    { data: { slug: "a", startDate: "2027-01-13" } },
    { data: { slug: "b", startDate: "2027-01-27" } },
  ];

  assert.equal(selectUpcomingSchedules(items, "2027-01-13", 10).length, 2);
});

test("schedule sorting places date-less records after dated records", () => {
  const items = [
    { data: { slug: "pending", startDate: undefined } },
    { data: { slug: "later", startDate: "2027-05-01" } },
    { data: { slug: "earlier", startDate: "2027-04-01" } },
  ];

  const sorted = sortSchedulesByStartDate(items).map((item) => item.data.slug);

  assert.deepEqual(sorted, ["earlier", "later", "pending"]);
});

test("month key is derived from a calendar date", () => {
  assert.equal(monthKeyFromStartDate("2027-01-13"), "2027-01");
  assert.equal(monthKeyFromStartDate(undefined), undefined);
});

test("default month is the first month containing an upcoming session", () => {
  const items = [
    { data: { startDate: "2027-03-10" } },
    { data: { startDate: "2027-01-13" } },
    { data: { startDate: "2027-02-24" } },
  ];
  assert.equal(selectDefaultScheduleMonth(items, "2026-11-23"), "2027-01");
});

test("default month falls back to the earliest available month when all are past", () => {
  const items = [
    { data: { startDate: "2027-05-12" } },
    { data: { startDate: "2027-02-10" } },
  ];
  assert.equal(selectDefaultScheduleMonth(items, "2028-01-01"), "2027-02");
});
