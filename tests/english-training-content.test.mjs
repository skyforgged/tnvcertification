import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse as parseYaml } from "yaml";
import { parseFrontmatterContent } from "../src/lib/content-validation.ts";

const trainingMap = [
  { id: 200, slug: "pelatihan-auditor-internal-cgmp", file: "0200-cgmp-en.md", title: "cGMP Internal Auditor Training", image: "training-en-cgmp.webp" },
  { id: 201, slug: "pelatihan-auditor-internal-fssc-22000", file: "0201-fssc-22000-en.md", title: "FSSC 22000 Internal Auditor Training", image: "training-en-fssc-22000.webp" },
  { id: 202, slug: "pelatihan-auditor-internal-iatf-16949", file: "0202-iatf-16949-en.md", title: "IATF 16949 Internal Auditor Training", image: "training-en-iatf-16949.webp" },
  { id: 203, slug: "pelatihan-auditor-internal-iso-13485", file: "0203-iso-13485-en.md", title: "ISO 13485 Internal Auditor Training", image: "training-en-iso-13485.webp" },
  { id: 204, slug: "pelatihan-auditor-internal-iso-14001", file: "0204-iso-14001-en.md", title: "ISO 14001 Internal Auditor Training", image: "training-en-iso-14001.webp" },
  { id: 205, slug: "pelatihan-auditor-internal-iso-15189", file: "0205-iso-15189-en.md", title: "ISO 15189 Internal Auditor Training", image: "training-en-iso-15189.webp" },
  { id: 206, slug: "pelatihan-auditor-internal-iso-17025", file: "0206-iso-17025-en.md", title: "ISO 17025 Internal Auditor Training", image: "training-en-iso-17025.webp" },
  { id: 207, slug: "pelatihan-auditor-internal-iso-22000", file: "0207-iso-22000-en.md", title: "ISO 22000 Internal Auditor Training", image: "training-en-iso-22000.webp" },
  { id: 208, slug: "pelatihan-auditor-internal-iso-22301", file: "0208-iso-22301-en.md", title: "ISO 22301 Internal Auditor Training", image: "training-en-iso-22301.webp" },
  { id: 209, slug: "pelatihan-auditor-internal-iso-27001", file: "0209-iso-27001-en.md", title: "ISO 27001 Internal Auditor Training", image: "training-en-iso-27001.webp" },
  { id: 210, slug: "pelatihan-auditor-internal-iso-45001", file: "0210-iso-45001-en.md", title: "ISO 45001 Internal Auditor Training", image: "training-en-iso-45001.webp" },
  { id: 211, slug: "pelatihan-auditor-internal-iso-50001", file: "0211-iso-50001-en.md", title: "ISO 50001 Internal Auditor Training", image: "training-en-iso-50001.webp" },
  { id: 212, slug: "pelatihan-auditor-internal-iso-9001", file: "0212-iso-9001-en.md", title: "ISO 9001 Internal Auditor Training", image: "training-en-iso-9001.webp" },
  { id: 213, slug: "pelatihan-internal-auditor-migrasi-iso-14001", file: "0213-migrasi-iso-14001-en.md", title: "ISO 14001 Migration Internal Auditor Training", image: "training-en-iso-14001-migration.webp" },
];

const trainingDir = new URL("../src/content/training/", import.meta.url);
const pageDir = new URL("../src/content/pages/", import.meta.url);
const sourceDir = new URL("../assets/illustrations/source/", import.meta.url);
const imageDir = new URL("../public/images/illustrations/", import.meta.url);
const registerPath = new URL("../docs/illustration-library/asset-register.md", import.meta.url);
const srcPath = (relative) => new URL(`../src/${relative}`, import.meta.url);

async function readEntry(directory, file) {
  const raw = await readFile(new URL(file, directory), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  return { file, raw, data: parseYaml(match?.[1] ?? "{}"), body: match?.[2] ?? "" };
}

function listEntries(directory) {
  return readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .sort();
}

function assertEnglishEntry(entry) {
  const { raw, data, body } = entry;
  assert.equal(data.lang, "en", entry.file);
  assert.notEqual(data.draft, true, entry.file);
  assert.equal(body.trim(), "", entry.file);
  assert.ok(data.intro.startsWith(`${data.title} is `), entry.file);
  assert.ok(data.featuredImage.alt.toLowerCase().includes(` ${data.title.toLowerCase()} `), entry.file);
  assert.ok(data.featuredImage.alt.includes(" is "), entry.file);
  assert.ok(data.featuredImage.alt.length < data.intro.length, entry.file);
  assert.notEqual(data.metaDescription, data.intro, entry.file);
  assert.notEqual(data.metaDescription, data.featuredImage.alt, entry.file);
  assert.doesNotMatch(raw, /konsult\p{L}*|consult\p{L}*/iu, entry.file);
  assert.doesNotMatch(raw, /development status|not yet available|not yet approved|belum dinyatakan|status pengembangan/iu, entry.file);

  const hero = data.blocks?.find((block) => block.type === "hero");
  assert.ok(hero, `${entry.file}: hero block`);
  assert.equal(hero.title, data.title, entry.file);
  assert.equal(hero.description, data.intro, entry.file);
  assert.ok(data.blocks.every((block) => !block.id || block.id.endsWith("-en")), entry.file);

  const { headings } = parseFrontmatterContent(data);
  assert.equal(headings.filter((heading) => heading.level === 1).length, 1, entry.file);
  assert.equal(headings[0].text, data.title, entry.file);
  for (let index = 1; index < headings.length; index += 1) {
    assert.ok(headings[index].level <= headings[index - 1].level + 1, entry.file);
  }
}

test("published English training entries pair with ID entries and satisfy editorial rules", async () => {
  const files = listEntries(trainingDir).filter((file) => file.endsWith("-en.md"));
  assert.equal(files.length, 14, "expected exactly 14 English training entries");

  const idEntries = await Promise.all(
    listEntries(trainingDir)
      .filter((file) => !file.endsWith("-en.md"))
      .map((file) => readEntry(trainingDir, file)),
  );
  const idByKey = new Map(idEntries.map((entry) => [entry.data.translationKey, entry]));

  const metas = new Set();
  const images = new Set();
  const register = readFileSync(registerPath, "utf8");

  for (const [index, item] of trainingMap.entries()) {
    const entry = await readEntry(trainingDir, item.file);
    assertEnglishEntry(entry);
    assert.equal(entry.data.id, item.id, item.file);
    assert.equal(entry.data.title, item.title, item.file);
    assert.equal(entry.data.slug, item.slug, item.file);
    assert.equal(entry.data.featuredImage.src, `/images/illustrations/${item.image}`, item.file);

    const pair = idByKey.get(entry.data.translationKey);
    assert.ok(pair, `${item.file}: missing Indonesian pair by translationKey`);
    assert.equal(entry.data.slug, pair.data.slug, item.file);
    assert.equal(entry.data.pubDate, pair.data.pubDate, item.file);
    assert.equal(entry.data.updatedDate, pair.data.updatedDate, item.file);
    assert.deepEqual(
      (entry.data.blocks ?? []).map((block) => block.type),
      (pair.data.blocks ?? []).map((block) => block.type),
      `${item.file}: block order differs from Indonesian pair`,
    );
    assert.deepEqual(entry.data.relatedServiceSlugs ?? [], pair.data.relatedServiceSlugs ?? [], item.file);

    assert.ok(!metas.has(entry.data.metaDescription), `${item.file}: duplicate metaDescription`);
    metas.add(entry.data.metaDescription);
    assert.ok(!images.has(item.image), `${item.file}: duplicate featured image`);
    images.add(item.image);

    assert.ok(existsSync(new URL(item.image, imageDir)), `${item.file}: missing WebP ${item.image}`);
    const svg = item.image.replace(/\.webp$/, ".svg");
    assert.ok(existsSync(new URL(svg, sourceDir)), `${item.file}: missing SVG master ${svg}`);
    const registerId = `ILL-${String(53 + index).padStart(3, "0")}`;
    const row = register.split("\n").find((line) => line.startsWith(`| ${registerId} |`));
    assert.ok(row, `${item.file}: missing ${registerId} register row`);
    assert.ok(row.includes(`assets/illustrations/source/${svg}`), `${item.file}: ${registerId} source path`);
    assert.ok(row.includes(`/images/illustrations/${item.image}`), `${item.file}: ${registerId} output path`);
  }
});

test("English trainings index entry uses its own image and copy", async () => {
  const entry = await readEntry(pageDir, "0038-halaman-trainings-en.md");
  assertEnglishEntry(entry);
  assert.equal(entry.data.id, 38);
  assert.equal(entry.data.slug, "trainings");
  assert.equal(entry.data.featuredImage.src, "/images/illustrations/trainings-index-en.webp");
  assert.ok(entry.data.blocks.some((block) => block.type === "listing" && block.source === "trainings"));

  const pair = await readEntry(pageDir, "0023-halaman-trainings.md");
  assert.equal(entry.data.pubDate, pair.data.pubDate);
  assert.equal(entry.data.updatedDate, pair.data.updatedDate);
  assert.ok(existsSync(new URL("trainings-index-en.svg", sourceDir)));
  assert.ok(existsSync(new URL("trainings-index-en.webp", imageDir)));
  const register = readFileSync(registerPath, "utf8");
  const row = register.split("\n").find((line) => line.startsWith("| ILL-052 |"));
  assert.ok(row);
  assert.ok(row.includes("assets/illustrations/source/trainings-index-en.svg"));
  assert.ok(row.includes("/images/illustrations/trainings-index-en.webp"));
});

test("English training routes consume the shared routing and label modules", async () => {
  const index = await readFile(srcPath("pages/en/trainings/index.astro"), "utf8");
  assert.match(index, /getPageEntry\("trainings", "en"\)/);
  assert.match(index, /data\.lang === "en"/);
  assert.match(index, /trainingIndexPath\("en"\)/);
  assert.match(index, /pageAlternates\("trainings"\)/);
  assert.match(index, /englishLabels\.trainingIndex/);
  assert.match(index, /<TrainingCard[\s\S]*?lang="en"/);

  const detail = await readFile(srcPath("pages/en/trainings/[slug].astro"), "utf8");
  assert.match(detail, /data\.lang === "en"/);
  assert.match(detail, /getTrainingView\(/);
  assert.match(detail, /trainingPath\(training\.data\)/);
  assert.match(detail, /trainingAlternates\(training\.data\.slug\)/);
  assert.match(detail, /englishLabels\.trainingDetail/);
  assert.match(detail, /lang="en"/);
  assert.match(detail, /"en-US"/);

  const card = await readFile(srcPath("components/TrainingCard.astro"), "utf8");
  assert.match(card, /englishLabels/);
});

test("built English training pages are real, localized, and reciprocal", () => {
  const index = "dist/en/trainings/index.html";
  assert.ok(existsSync(new URL(`../${index}`, import.meta.url)), `${index}: run pnpm build first`);
  const indexHtml = readFileSync(new URL(`../${index}`, import.meta.url), "utf8");
  assert.match(indexHtml, /<html lang="en">/);
  assert.doesNotMatch(indexHtml, /http-equiv=["']refresh["']/i);
  assert.match(indexHtml, /<link rel="canonical" href="[^"]*\/en\/trainings\/"/);
  assert.match(indexHtml, /rel="alternate" hreflang="id"/);
  assert.match(indexHtml, /rel="alternate" hreflang="en"/);

  for (const item of trainingMap) {
    const file = `dist/en/trainings/${item.slug}/index.html`;
    assert.ok(existsSync(new URL(`../${file}`, import.meta.url)), file);
    const html = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(html, /<html lang="en">/, file);
    assert.doesNotMatch(html, /http-equiv=["']refresh["']/i, file);
    assert.match(html, new RegExp(`<link rel="canonical" href="[^"]*/en/trainings/${item.slug}/"`), file);
    assert.match(html, /rel="alternate" hreflang="id"/, file);
    assert.match(html, /rel="alternate" hreflang="en"/, file);
    assert.ok(indexHtml.includes(`/en/trainings/${item.slug}/`), `${index}: missing link to ${item.title}`);

    const idFile = `dist/trainings/${item.slug}/index.html`;
    assert.ok(existsSync(new URL(`../${idFile}`, import.meta.url)), idFile);
    const idHtml = readFileSync(new URL(`../${idFile}`, import.meta.url), "utf8");
    assert.match(idHtml, /rel="alternate" hreflang="en"/, idFile);
    assert.ok(idHtml.includes(`/en/trainings/${item.slug}/`), `${idFile}: missing English alternate`);
  }
});
