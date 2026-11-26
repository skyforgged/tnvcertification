import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routes = {
  home: "src/pages/index.astro",
  services: "src/pages/services/index.astro",
  trainings: "src/pages/trainings/index.astro",
  articles: "src/pages/articles/index.astro",
  "articles page": "src/pages/articles/page/[page].astro",
  homeHero: "src/components/HomeHero.astro",
};
const sources = Object.fromEntries(await Promise.all(
  Object.entries(routes).map(async ([name, path]) => [
    name,
    await readFile(new URL(`../${path}`, import.meta.url), "utf8"),
  ]),
));

const obsoleteCopy = [
  "Sertifikasi dan kepatuhan, dengan informasi yang jelas.",
  "Informasi layanan",
  "Artikel dan panduan",
  "Artikel Terbaru",
  "Layanan Kami",
  "Program Pelatihan",
  "Katalog pelatihan sedang disiapkan",
  "Wawasan dan publikasi",
  "Artikel sertifikasi, pelatihan, dan kepatuhan.",
  'eyebrow="Informasi • Layanan • Wawasan"',
];

for (const [name, source] of Object.entries(sources)) {
  for (const copy of obsoleteCopy) {
    test(`${name} no longer hardcodes: ${copy}`, () => {
      assert.ok(!source.includes(copy), `${name} still contains "${copy}"`);
    });
  }
}

test("trainings route resolves upcoming sessions without owning section copy", () => {
  const source = sources.trainings;
  for (const symbol of ["selectUpcomingSchedules", "UpcomingSchedules", "trainingBySlug"]) {
    assert.ok(source.includes(symbol), `trainings route is missing ${symbol}`);
  }
  assert.ok(!source.includes("Pelatihan Terdekat"));
});

test("locale fallback skips slugs owned by dedicated routes", async () => {
  const source = await readFile(new URL("../src/data/locale-fallback.ts", import.meta.url), "utf8");
  assert.match(source, /routeOwnedPageSlugs/);
  assert.match(source, /!routeOwnedPageSlugs\.includes\(entry\.data\.slug\)/);
});

const entrySlugs = {
  home: "home",
  services: "services",
  trainings: "trainings",
  articles: "articles",
  "articles page": "articles",
};
for (const [name, slug] of Object.entries(entrySlugs)) {
  test(`${name} reads its page entry from frontmatter`, () => {
    assert.match(sources[name], new RegExp(`getPageEntry\\("${slug}"\\)`));
  });
}

test("English fallback excludes CSMS topic routes owned by the dedicated route", async () => {
  const source = await readFile(new URL("../src/data/locale-fallback.ts", import.meta.url), "utf8");
  assert.match(source, /CSMS_TOPIC_PREFIX/);
  assert.match(source, /startsWith\(CSMS_TOPIC_PREFIX\)/);
});
