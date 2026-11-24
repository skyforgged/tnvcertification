import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse as parseYaml } from "yaml";
import { parseFrontmatterContent } from "../src/lib/content-validation.ts";

const pageFile = "0039-halaman-schedules-en.md";
const pageDir = new URL("../src/content/pages/", import.meta.url);
const routeFile = new URL("../src/pages/en/schedules/index.astro", import.meta.url);
const sourceDir = new URL("../assets/illustrations/source/", import.meta.url);
const imageDir = new URL("../public/images/illustrations/", import.meta.url);
const registerPath = new URL("../docs/illustration-library/asset-register.md", import.meta.url);

async function readEntry(directory, file) {
  const raw = await readFile(new URL(file, directory), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  return { file, raw, data: parseYaml(match?.[1] ?? "{}"), body: match?.[2] ?? "" };
}

test("English schedules entry satisfies editorial and pairing rules", async () => {
  const entry = await readEntry(pageDir, pageFile);
  const pair = await readEntry(pageDir, "0024-halaman-schedules.md");
  const { raw, data, body } = entry;

  assert.equal(data.id, 39);
  assert.equal(data.slug, "schedules");
  assert.equal(data.lang, "en");
  assert.notEqual(data.draft, true);
  assert.equal(data.translationKey, pair.data.translationKey);
  assert.equal(data.pubDate, pair.data.pubDate);
  assert.equal(data.updatedDate, pair.data.updatedDate);
  assert.equal(body.trim(), "");

  assert.ok(data.intro.startsWith(`${data.title} is `));
  assert.equal(data.intro.split(/\n\s*\n/).length, 1);
  assert.ok(data.featuredImage.alt.toLowerCase().includes(` ${data.title.toLowerCase()} `));
  assert.ok(data.featuredImage.alt.includes(" is "));
  assert.ok(data.featuredImage.alt.length < data.intro.length);
  assert.notEqual(data.metaDescription, data.intro);
  assert.notEqual(data.metaDescription, data.featuredImage.alt);
  assert.doesNotMatch(raw, /konsult\p{L}*|consult\p{L}*/iu);
  assert.doesNotMatch(raw, /development status|not yet available|not yet approved|belum dinyatakan|status pengembangan/iu);

  const hero = data.blocks?.find((block) => block.type === "hero");
  assert.ok(hero);
  assert.equal(hero.title, data.title);
  assert.equal(hero.description, data.intro);
  assert.ok(data.blocks.some((block) => block.type === "listing" && block.source === "schedules"));
  assert.ok(data.blocks.every((block) => !block.id || block.id.endsWith("-en")));

  const { headings } = parseFrontmatterContent(data);
  assert.equal(headings.filter((heading) => heading.level === 1).length, 1);
  assert.equal(headings[0].text, data.title);
  for (let index = 1; index < headings.length; index += 1) {
    assert.ok(headings[index].level <= headings[index - 1].level + 1);
  }

  assert.equal(data.featuredImage.src, "/images/illustrations/schedules-calendar-en.webp");
  assert.ok(existsSync(new URL("schedules-calendar-en.svg", sourceDir)));
  assert.ok(existsSync(new URL("schedules-calendar-en.webp", imageDir)));
  const register = readFileSync(registerPath, "utf8");
  const row = register.split("\n").find((line) => line.startsWith("| ILL-067 |"));
  assert.ok(row);
  assert.ok(row.includes("assets/illustrations/source/schedules-calendar-en.svg"));
  assert.ok(row.includes("/images/illustrations/schedules-calendar-en.webp"));
});

test("English schedules route uses shared English labels and English date formatting", async () => {
  const source = await readFile(routeFile, "utf8");
  assert.match(source, /getPageEntry\("schedules", "en"\)/);
  assert.match(source, /data\.lang === "en"/);
  assert.match(source, /pageAlternates\("schedules"\)/);
  assert.match(source, /ScheduleArchiveLayout/);
  assert.match(source, /lang="en"/);
  assert.match(source, /englishLabels\.schedule/);
  assert.match(source, /scheduleDateLabel\([\s\S]*?locale: "en-US"/);
  assert.match(source, /trainingPath\(training\.data\)/);

  const indonesianLabels = [
    "Pendaftaran dibuka",
    "Pendaftaran ditutup",
    "Kuota terpenuhi",
    "Informasi pendaftaran menyusul",
    "Tatap muka",
    "Metode menyusul",
    "Biaya:",
    "Detail program",
    "Belum ada jadwal yang dipublikasikan",
    "Agenda pelaksanaan akan ditampilkan",
  ];
  for (const label of indonesianLabels) {
    assert.ok(!source.includes(label), `route must not contain Indonesian label: ${label}`);
  }
});

test("built English schedules page is real, localized, and links to English trainings", () => {
  const file = "dist/en/schedules/index.html";
  assert.ok(existsSync(new URL(`../${file}`, import.meta.url)), `${file}: run pnpm build first`);
  const html = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  assert.match(html, /<html lang="en">/);
  assert.doesNotMatch(html, /http-equiv=["']refresh["']/i);
  assert.match(html, /<link rel="canonical" href="[^"]*\/en\/schedules\/"/);
  assert.match(html, /rel="alternate" hreflang="id"/);
  assert.match(html, /rel="alternate" hreflang="en"/);
  assert.match(html, /Registration open|Registration closed|Quota full|Registration information pending/);
  assert.match(html, /href="\/en\/trainings\//);
  assert.doesNotMatch(html, /href="\/trainings\//);
  assert.doesNotMatch(html, /Pendaftaran dibuka|Pendaftaran ditutup|Kuota terpenuhi|Tatap muka/);
});
