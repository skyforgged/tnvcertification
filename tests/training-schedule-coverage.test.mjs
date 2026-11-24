import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { globSync } from "tinyglobby";
import { parse as parseYaml } from "yaml";

const scheduleRoot = new URL("../src/content/training-schedules/2027/", import.meta.url);
const relativeFiles = globSync("**/*.md", { cwd: scheduleRoot }).sort();
const entries = relativeFiles.map((file) => {
  const raw = readFileSync(new URL(file, scheduleRoot), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  return { file, raw, data: match ? parseYaml(match[1]) : {} };
});

const trainingSlugs = globSync("*.md", {
  cwd: new URL("../src/content/training/", import.meta.url),
}).filter((file) => !file.endsWith("-en.md"));
const serviceSlugs = globSync("*.md", {
  cwd: new URL("../src/content/services/", import.meta.url),
}).map((file) => {
  const raw = readFileSync(
    new URL(`../src/content/services/${file}`, import.meta.url),
    "utf8",
  );
  return raw.match(/^slug:\s*"([^"]+)"/m)?.[1];
}).filter(Boolean);

const dates = [
  "2027-01-13", "2027-01-27",
  "2027-02-10", "2027-02-24",
  "2027-03-10", "2027-03-24",
  "2027-04-14", "2027-04-28",
  "2027-05-12", "2027-05-26",
  "2027-06-09", "2027-06-23",
  "2027-07-14", "2027-07-28",
  "2027-08-11", "2027-08-25",
  "2027-09-08", "2027-09-22",
  "2027-10-13", "2027-10-27",
  "2027-11-10", "2027-11-24",
  "2027-12-08", "2027-12-22",
];

test("2027 schedule archive has exactly 336 date-only entries", () => {
  assert.equal(entries.length, 336);
});

test("each of the 14 canonical Indonesian training slugs has 24 files in its own directory", () => {
  for (const file of trainingSlugs) {
    const slug = file.replace(/\.md$/, "");
    const count = entries.filter((entry) => entry.file.startsWith(`${slug}/`)).length;
    assert.equal(count, 24, `${slug}: expected 24 schedule files, found ${count}`);
  }
  const directories = new Set(entries.map((entry) => entry.file.split("/")[0]));
  assert.deepEqual([...directories].sort(), trainingSlugs.map((file) => file.replace(/\.md$/, "")).sort());
});

test("every schedule uses a listed 2nd/4th Wednesday with a same-day range", () => {
  for (const { file, data } of entries) {
    assert.ok(dates.includes(data.startDate), `${file}: unexpected startDate ${data.startDate}`);
    assert.equal(data.endDate, data.startDate, `${file}: endDate must equal startDate`);
    assert.equal(
      data.slug,
      `jadwal-${data.trainingSlug}-${data.startDate}`,
      `${file}: slug must encode training and date`,
    );
  }
});

test("schedule slugs are unique", () => {
  const slugs = entries.map((entry) => entry.data.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("every schedule references a published training", () => {
  for (const { file, data } of entries) {
    assert.ok(trainingSlugs.includes(`${data.trainingSlug}.md`), `${file}: unknown trainingSlug ${data.trainingSlug}`);
  }
});

test("every serviceSlug references an existing service", () => {
  for (const { file, data } of entries) {
    if (data.serviceSlug) {
      assert.ok(serviceSlugs.includes(data.serviceSlug), `${file}: unknown serviceSlug ${data.serviceSlug}`);
    }
  }
});

test("no schedule uses consultation wording", () => {
  for (const { file, raw } of entries) {
    assert.doesNotMatch(raw, /konsult|consult/i, `${file}: prohibited terminology`);
  }
});
