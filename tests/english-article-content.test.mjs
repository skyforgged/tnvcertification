import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse as parseYaml } from "yaml";
import { getPublishedArticles } from "../src/data/articles.ts";
import { parseFrontmatterContent } from "../src/lib/content-validation.ts";
import { getContentLastmod } from "../src/lib/sitemap-lastmod.mjs";

const articleDir = new URL("../src/content/articles/", import.meta.url);
const pageDir = new URL("../src/content/pages/", import.meta.url);
const sourceDir = new URL("../assets/illustrations/source/", import.meta.url);
const imageDir = new URL("../public/images/illustrations/", import.meta.url);
const registerPath = new URL("../docs/illustration-library/asset-register.md", import.meta.url);

const pairs = [
  ["0001-posisi-kualitas-sebagai-talenta-kompetitif.md", 300, "posisi-kualitas-sebagai-talenta-kompetitif", "article-en-quality-talent", "ILL-069"],
  ["0002-sertifikasi-iso-9001-2015.md", 301, "sertifikasi-iso-9001-2015", "article-en-iso9001-certification", "ILL-070"],
  ["0003-mengendalikan-risiko-kualitas-di-pabrik.md", 302, "mengendalikan-risiko-kualitas-di-pabrik", "article-en-factory-risk", "ILL-071"],
  ["0004-sertifikasi-iso-45001-2018.md", 303, "sertifikasi-iso-45001-2018", "article-en-iso45001-certification", "ILL-072"],
  ["0005-manajemen-beasiswa-kualitas-di-industri.md", 304, "manajemen-beasiswa-kualitas-di-industri", "article-en-quality-scholarships", "ILL-073"],
  ["0006-penilaian-kepatuhan-terhadap-standar-global.md", 305, "penilaian-kepatuhan-terhadap-standar-global", "article-en-global-conformity", "ILL-074"],
  ["0007-sertifikasi-iso-9001-2015.md", 306, "proses-audit-sertifikasi-iso-9001-2015", "article-en-audit-process", "ILL-075"],
  ["0008-manajemen-kualitas-nononkonformitas.md", 307, "manajemen-kualitas-nononkonformitas", "article-en-nonconformity", "ILL-076"],
  ["0009-sertifikasi-iso-9001-2015.md", 308, "manfaat-sertifikasi-iso-9001-2015-bagi-perusahaan", "article-en-iso9001-benefits", "ILL-077"],
];

async function readEntry(directory, file) {
  const raw = await readFile(new URL(file, directory), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  return { file, raw, data: parseYaml(match?.[1] ?? "{}"), body: match?.[2] ?? "" };
}

function alternateLinks(html) {
  return [...html.matchAll(/<link\b[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"/g)]
    .map((match) => ({ lang: match[1], href: match[2] }))
    .sort((a, b) => a.lang.localeCompare(b.lang));
}

test("exactly nine published English articles pair with the Indonesian records", () => {
  const articles = getPublishedArticles("en");
  assert.equal(articles.length, 9);
  assert.deepEqual(
    articles.map((article) => Number(article.id)).sort((a, b) => a - b),
    pairs.map(([, id]) => id).sort((a, b) => a - b),
  );
});

test("document-control drafts stay unpublished", async () => {
  for (const file of ["0010-pengendalian-dokumen-iso-9001-id.md", "0011-iso-9001-document-control-en.md"]) {
    const { data } = await readEntry(articleDir, file);
    assert.equal(data.draft, true, `${file}: must remain a draft`);
  }
});

for (const [idFile, id, slug, assetStem] of pairs) {
  test(`${slug} English article matches its pair and editorial rules`, async () => {
    const enFile = `${String(id).padStart(4, "0")}-${slug}-en.md`;
    const en = await readEntry(articleDir, enFile);
    const idEntry = await readEntry(articleDir, idFile);
    const { data, raw, body } = en;

    assert.equal(data.id, id);
    assert.equal(data.slug, idEntry.data.slug);
    assert.equal(data.slug, slug);
    assert.equal(data.lang, "en");
    assert.equal(data.translationKey, idEntry.data.translationKey);
    assert.equal(data.pubDate, idEntry.data.pubDate);
    assert.equal(data.updatedDate, idEntry.data.updatedDate);
    assert.notEqual(data.draft, true);
    assert.equal(body.trim(), "");
    assert.deepEqual(data.categoryIds, idEntry.data.categoryIds);

    assert.ok(data.intro.startsWith(`${data.title} is `));
    assert.equal(data.intro.split(/\n\s*\n/).length, 1);
    assert.ok(data.featuredImage.alt.toLowerCase().includes(` ${data.title.toLowerCase()} `));
    assert.ok(data.featuredImage.alt.includes(" is "));
    assert.ok(data.featuredImage.alt.length < data.intro.length);
    assert.notEqual(data.metaDescription, data.intro);
    assert.notEqual(data.metaDescription, data.featuredImage.alt);
    assert.doesNotMatch(raw, /konsult\p{L}*|consult\p{L}*/iu);
    assert.doesNotMatch(raw, /development status|not yet available|not yet approved|belum dinyatakan|status pengembangan/iu);

    assert.equal(data.featuredImage.src, `/images/illustrations/${assetStem}.webp`);
    assert.ok(existsSync(new URL(`${assetStem}.svg`, sourceDir)));
    assert.ok(existsSync(new URL(`${assetStem}.webp`, imageDir)));

    assert.deepEqual(
      (data.blocks ?? []).map((block) => block.type),
      (idEntry.data.blocks ?? []).map((block) => block.type),
    );
    const heroes = data.blocks.filter((block) => block.type === "hero");
    assert.equal(heroes.length, 1);
    assert.equal(heroes[0].title, data.title);
    assert.equal(heroes[0].description, data.intro);
    assert.ok(data.blocks.some((block) => block.type === "content-section"));
    assert.ok(data.blocks.every((block) => !block.id || block.id.endsWith("-en")));

    const { headings } = parseFrontmatterContent(data);
    assert.equal(headings.filter((heading) => heading.level === 1).length, 1);
    assert.equal(headings[0].text, data.title);
    for (let index = 1; index < headings.length; index += 1) {
      assert.ok(headings[index].level <= headings[index - 1].level + 1);
    }
  });
}

test("English article illustrations are unique and registered", () => {
  const register = readFileSync(registerPath, "utf8");
  const images = pairs.map(([, , , assetStem]) => assetStem);
  assert.equal(new Set(images).size, 9);
  for (const [idFile, , , assetStem, illustrationId] of pairs) {
    const row = register.split("\n").find((line) => line.startsWith(`| ${illustrationId} |`));
    assert.ok(row, `${illustrationId}: missing register row for ${idFile}`);
    assert.ok(row.includes(`assets/illustrations/source/${assetStem}.svg`));
    assert.ok(row.includes(`/images/illustrations/${assetStem}.webp`));
  }
  const indexRow = register.split("\n").find((line) => line.startsWith("| ILL-068 |"));
  assert.ok(indexRow);
  assert.ok(indexRow.includes("assets/illustrations/source/articles-index-en.svg"));
  assert.ok(indexRow.includes("/images/illustrations/articles-index-en.webp"));
  assert.ok(existsSync(new URL("articles-index-en.svg", sourceDir)));
  assert.ok(existsSync(new URL("articles-index-en.webp", imageDir)));
});

test("English archive page entry uses its own id and illustration", async () => {
  const entry = await readEntry(pageDir, "0040-halaman-articles-en.md");
  const pair = await readEntry(pageDir, "0025-halaman-articles.md");
  const { data, body } = entry;

  assert.equal(data.id, 40);
  assert.equal(data.slug, "articles");
  assert.equal(data.lang, "en");
  assert.equal(data.translationKey, pair.data.translationKey);
  assert.equal(data.pubDate, pair.data.pubDate);
  assert.equal(data.updatedDate, pair.data.updatedDate);
  assert.notEqual(data.draft, true);
  assert.equal(body.trim(), "");
  assert.ok(data.intro.startsWith(`${data.title} is `));
  assert.equal(data.featuredImage.src, "/images/illustrations/articles-index-en.webp");
  assert.ok(data.blocks.some((block) => block.type === "hero"));
  assert.ok(data.blocks.some((block) => block.type === "listing" && block.source === "articles"));
});

test("article detail routes keep languages and alternates separate", async () => {
  const enRoute = await readFile(new URL("../src/pages/en/articles/[slug].astro", import.meta.url), "utf8");
  const idRoute = await readFile(new URL("../src/pages/articles/[slug].astro", import.meta.url), "utf8");

  assert.match(enRoute, /getPublishedArticles\("en"\)/);
  assert.match(enRoute, /articlePath\(entry\.data\)/);
  assert.match(enRoute, /articleIndexPath\("en"\)/);
  assert.match(enRoute, /lang="en"/);
  assert.match(enRoute, /siteCrumb\("\/articles\/", lang\)/);

  assert.match(idRoute, /getPublishedArticles\("id"\)/);
  assert.match(idRoute, /articlePath\(candidate\.data\)/);
  assert.match(idRoute, /const canonical = `\/articles\/\$\{entry\.data\.slug\}\/`;/);
  assert.doesNotMatch(idRoute, /`\/articles\/\$\{candidate\.data\.slug\}\/`;/);
});

test("English sitemap lastmod reads the English article record", () => {
  for (const [, , slug] of pairs) {
    const url = `/en/articles/${slug}/`;
    const lastmod = getContentLastmod(url);
    assert.ok(lastmod, `${url}: missing content lastmod`);
    const entry = getPublishedArticles("en").find((article) => article.slug === slug);
    assert.equal(lastmod, (entry.updatedDate ?? entry.pubDate).toISOString().replace(/\.\d{3}Z$/, "Z"));
  }
});

test("built article pages are real, localized, and reciprocally linked", () => {
  for (const [, , slug] of pairs) {
    const enFile = `dist/en/articles/${slug}/index.html`;
    const idFile = `dist/articles/${slug}/index.html`;
    assert.ok(existsSync(new URL(`../${enFile}`, import.meta.url)), `${enFile}: run pnpm build first`);
    assert.ok(existsSync(new URL(`../${idFile}`, import.meta.url)), `${idFile}: run pnpm build first`);

    const enHtml = readFileSync(new URL(`../${enFile}`, import.meta.url), "utf8");
    const idHtml = readFileSync(new URL(`../${idFile}`, import.meta.url), "utf8");
    assert.match(enHtml, /<html lang="en">/);
    assert.match(enHtml, new RegExp(`<link rel="canonical" href="[^"]*/en/articles/${slug}/"`));
    assert.doesNotMatch(enHtml, /http-equiv=["']refresh["']/i);

    const expected = [
      { lang: "en", href: `https://tnv-certification.com/en/articles/${slug}/` },
      { lang: "id", href: `https://tnv-certification.com/articles/${slug}/` },
    ];
    assert.deepEqual(alternateLinks(enHtml), expected);
    assert.deepEqual(alternateLinks(idHtml), expected);
  }

  const enIndex = readFileSync(new URL("../dist/en/articles/index.html", import.meta.url), "utf8");
  assert.match(enIndex, /<html lang="en">/);
  assert.match(enIndex, /<link rel="canonical" href="[^"]*\/en\/articles\/"/);
  assert.match(enIndex, /href="\/en\/articles\/posisi-kualitas-sebagai-talenta-kompetitif\/"/);
  assert.doesNotMatch(enIndex, /href="\/articles\/posisi-kualitas-sebagai-talenta-kompetitif\/"/);
  assert.doesNotMatch(enIndex, /Sebelumnya|Berikutnya/);

  assert.ok(!existsSync(new URL("../dist/en/articles/page/2/index.html", import.meta.url)));
});
