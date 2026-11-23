import assert from "node:assert/strict";
import test from "node:test";
import { scheduleDateLabel, sortSchedulesByStartDate } from "../src/lib/schedule-display.ts";

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

test("schedule sorting places date-less records after dated records", () => {
  const items = [
    { data: { slug: "pending", startDate: undefined } },
    { data: { slug: "later", startDate: "2027-05-01" } },
    { data: { slug: "earlier", startDate: "2027-04-01" } },
  ];

  const sorted = sortSchedulesByStartDate(items).map((item) => item.data.slug);

  assert.deepEqual(sorted, ["earlier", "later", "pending"]);
});
