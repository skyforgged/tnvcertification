import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { parse as parseYaml } from "yaml";

import { siteSettings } from "../src/site.ts";
import { buildEnglishFallbackPaths } from "../src/lib/locale-fallback.ts";
import { getContentLastmod } from "../src/lib/sitemap-lastmod.mjs";

function markdownFiles(directory) {
  return readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => path.join(directory, file));
}

function frontmatter(file) {
  const raw = readFileSync(file, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(match, `missing frontmatter: ${file}`);
  return parseYaml(match[1]);
}

function absolute(pathname) {
  return new URL(pathname, siteSettings.url).toString();
}

const syntheticPages = [
  { lang: "id", slug: "home", translationKey: "page-home" },
  { lang: "en", slug: "home", translationKey: "page-home" },
];

const emptyFallback = {
  pages: [],
  services: [],
  articles: [],
  trainings: [],
  articlePageCount: 1,
  existingEnglishPaths: [],
};

test("published article selector filters by language and keeps ID order", async () => {
  const { getPublishedArticles } = await import("../src/data/articles.ts");
  const id = getPublishedArticles();
  const en = getPublishedArticles("en");
  assert.deepEqual(
    id.map((article) => article.slug),
    [
      "sertifikasi-iso-9001-2015",
      "proses-audit-sertifikasi-iso-9001-2015",
      "manfaat-sertifikasi-iso-9001-2015-bagi-perusahaan",
      "posisi-kualitas-sebagai-talenta-kompetitif",
      "mengendalikan-risiko-kualitas-di-pabrik",
      "sertifikasi-iso-45001-2018",
      "manajemen-beasiswa-kualitas-di-industri",
      "penilaian-kepatuhan-terhadap-standar-global",
      "manajemen-kualitas-nononkonformitas",
    ],
  );
  assert.ok(Array.isArray(en));
  assert.ok(en.every((article) => article.lang === "en"));
});

test("article and training paths use /en only for English records", async () => {
  const { articleIndexPath, articlePath } = await import("../src/lib/article-routing.ts");
  const { trainingIndexPath, trainingPath } = await import("../src/lib/training-routing.ts");
  assert.equal(articleIndexPath("id"), "/articles/");
  assert.equal(articleIndexPath("en"), "/en/articles/");
  assert.equal(articlePath({ lang: "id", slug: "x" }), "/articles/x/");
  assert.equal(articlePath({ lang: "en", slug: "x" }), "/en/articles/x/");
  assert.equal(trainingIndexPath("id"), "/trainings/");
  assert.equal(trainingIndexPath("en"), "/en/trainings/");
  assert.equal(trainingPath({ lang: "id", slug: "x" }), "/trainings/x/");
  assert.equal(trainingPath({ lang: "en", slug: "x" }), "/en/trainings/x/");
});

test("numeric entry ids reject string values", async () => {
  const { numericEntryId } = await import("../src/lib/numeric-entry-id.ts");
  assert.equal(numericEntryId({ id: 42 }), "42");
  assert.throws(() => numericEntryId({ id: "42" }), /positive numeric id/);
});

test("article and training frontmatter owns unique positive numeric ids", () => {
  for (const directory of ["src/content/articles", "src/content/training"]) {
    const ids = markdownFiles(directory).map((file) => frontmatter(file).id);
    for (const id of ids) {
      assert.equal(typeof id, "number", `${directory} id must be numeric`);
      assert.ok(Number.isInteger(id), `${directory} id must be an integer`);
      assert.ok(id > 0, `${directory} id must be positive`);
    }
    assert.equal(new Set(ids).size, ids.length, `${directory} ids must be unique`);
  }
});

test("new English main-menu pages expose reciprocal alternates", async () => {
  const { articlePageAlternates, pageAlternates } = await import("../src/lib/page-alternates.ts");
  const expected = {
    trainings: "/trainings/",
    schedules: "/schedules/",
    articles: "/articles/",
  };
  for (const [slug, idPath] of Object.entries(expected)) {
    assert.deepEqual(pageAlternates(slug), [
      { lang: "id", href: absolute(idPath) },
      { lang: "en", href: absolute(`/en${idPath}`) },
    ]);
  }
  assert.deepEqual(articlePageAlternates(2), [
    { lang: "id", href: absolute("/articles/page/2/") },
    { lang: "en", href: absolute("/en/articles/page/2/") },
  ]);
});

test("language switch resolves training, article, index and pagination counterparts", async () => {
  const { resolveLanguageOptions } = await import("../src/lib/locale-switch.ts");
  const trainings = [
    { lang: "id", slug: "pelatihan-x", translationKey: "training-x" },
    { lang: "en", slug: "training-x", translationKey: "training-x" },
  ];
  const articles = [
    { lang: "id", slug: "artikel-x", translationKey: "article-x" },
    { lang: "en", slug: "article-x", translationKey: "article-x" },
  ];
  const base = {
    services: [],
    articles,
    trainings,
    pages: syntheticPages,
    fallbackPaths: [],
  };

  const englishTraining = resolveLanguageOptions({
    ...base,
    pathname: "/en/trainings/training-x/",
    currentLang: "en",
  }).find((option) => option.lang === "id");
  assert.equal(englishTraining.href, "/trainings/pelatihan-x/");
  assert.equal(englishTraining.available, true);

  const idArticle = resolveLanguageOptions({
    ...base,
    pathname: "/articles/artikel-x/",
    currentLang: "id",
  }).find((option) => option.lang === "en");
  assert.equal(idArticle.href, "/en/articles/article-x/");
  assert.equal(idArticle.available, true);

  const pagination = resolveLanguageOptions({
    ...base,
    pathname: "/articles/page/2/",
    currentLang: "id",
  }).find((option) => option.lang === "en");
  assert.equal(pagination.href, "/en/articles/page/2/");
  assert.equal(pagination.available, true);

  const trainingIndex = resolveLanguageOptions({
    ...base,
    pathname: "/en/trainings/",
    currentLang: "en",
  }).find((option) => option.lang === "id");
  assert.equal(trainingIndex.href, "/trainings/");
  assert.equal(trainingIndex.available, true);
});

test("English indexes are removed from the redirect fallback set", () => {
  const paths = buildEnglishFallbackPaths({
    ...emptyFallback,
    articlePageCount: 2,
    existingEnglishPaths: [
      "/en/trainings/",
      "/en/schedules/",
      "/en/articles/",
      "/en/articles/page/2/",
    ],
  });
  for (const path of [
    "/trainings/",
    "/schedules/",
    "/articles/",
    "/articles/page/2/",
  ]) {
    assert.ok(!paths.includes(path), `unexpected fallback: ${path}`);
  }
});

test("English home lastmod comes from its own entry", () => {
  const idLastmod = getContentLastmod("/");
  const enLastmod = getContentLastmod("/en/");
  assert.ok(idLastmod);
  assert.ok(enLastmod);
  assert.notEqual(enLastmod, idLastmod);
});
