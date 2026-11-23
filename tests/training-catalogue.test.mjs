import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { parse as parseYaml } from "yaml";

const directory = new URL("../src/content/training/", import.meta.url);
const files = readdirSync(directory).filter((name) => name.endsWith(".md")).sort();
const entries = files.map((file) => {
  const raw = readFileSync(new URL(file, directory), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  return { file, raw, data: match ? parseYaml(match[1]) : {}, body: match ? match[2] : "" };
});

const expected = [
  ["Pelatihan Auditor Internal ISO 9001", "pelatihan-auditor-internal-iso-9001"],
  ["Pelatihan Auditor Internal ISO 14001", "pelatihan-auditor-internal-iso-14001"],
  ["Pelatihan Internal Auditor Migrasi ISO 14001", "pelatihan-internal-auditor-migrasi-iso-14001"],
  ["Pelatihan Auditor Internal ISO 50001", "pelatihan-auditor-internal-iso-50001"],
  ["Pelatihan Auditor Internal ISO 27001", "pelatihan-auditor-internal-iso-27001"],
  ["Pelatihan Auditor Internal ISO 22000", "pelatihan-auditor-internal-iso-22000"],
  ["Pelatihan Auditor Internal ISO 45001", "pelatihan-auditor-internal-iso-45001"],
  ["Pelatihan Auditor Internal ISO 13485", "pelatihan-auditor-internal-iso-13485"],
  ["Pelatihan Auditor Internal IATF 16949", "pelatihan-auditor-internal-iatf-16949"],
  ["Pelatihan Auditor Internal ISO 15189", "pelatihan-auditor-internal-iso-15189"],
  ["Pelatihan Auditor Internal ISO 22301", "pelatihan-auditor-internal-iso-22301"],
  ["Pelatihan Auditor Internal ISO 17025", "pelatihan-auditor-internal-iso-17025"],
  ["Pelatihan Auditor Internal FSSC 22000", "pelatihan-auditor-internal-fssc-22000"],
  ["Pelatihan Auditor Internal cGMP", "pelatihan-auditor-internal-cgmp"],
];

test("training collection contains exactly the 14 unique IAS internal auditor programs", () => {
  assert.equal(files.length, 14);
  assert.deepEqual(
    entries.map((entry) => entry.data.slug).sort(),
    expected.map(([, slug]) => slug).sort(),
  );
  assert.ok(!files.some((file) => file.startsWith("pelatihan-sertifikasi-")));
});

test("every training title is unique and starts with Pelatihan", () => {
  const titles = entries.map((entry) => entry.data.title);
  assert.equal(new Set(titles).size, 14);
  for (const title of titles) {
    assert.match(title, /^Pelatihan\b/);
  }
});

test("every training intro is one paragraph beginning with its title and adalah", () => {
  for (const { file, data } of entries) {
    const intro = String(data.intro ?? "");
    assert.equal(intro.split(/\n\s*\n/).length, 1, `${file}: intro must be one paragraph`);
    assert.match(intro, new RegExp(`^${data.title} adalah `), `${file}: intro must begin with title adalah`);
  }
});

test("every training has a unique metaDescription distinct from intro and image alt", () => {
  const descriptions = entries.map((entry) => entry.data.metaDescription);
  assert.equal(new Set(descriptions).size, 14);
  for (const { file, data } of entries) {
    assert.notEqual(data.metaDescription, data.intro, `${file}: metaDescription duplicates intro`);
    assert.notEqual(data.metaDescription, data.featuredImage?.alt, `${file}: metaDescription duplicates alt`);
  }
});

test("every training featured image alt explains the title with adalah", () => {
  for (const { file, data } of entries) {
    assert.match(String(data.featuredImage?.alt ?? ""), /adalah/, `${file}: alt must use adalah`);
  }
});

test("no training entry uses consultation wording", () => {
  for (const { file, raw } of entries) {
    assert.doesNotMatch(raw, /konsult|consult/i, `${file}: prohibited terminology`);
  }
});
