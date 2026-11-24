import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { parse as parseYaml } from "yaml";
import { parseFrontmatterContent } from "../src/lib/content-validation.ts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

const indexRaw = await read("../src/content/pages/0022-halaman-csms.md");
const index = parseYaml(indexRaw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "{}");
const routeSource = await read("../src/pages/csms/[slug].astro");
const pagesSource = await read("../src/data/pages.ts");

const topicSlugs = [
  "kepemimpinan-komitmen",
  "kebijakan-sasaran",
  "organisasi-tanggungjawab",
  "manajemen-risiko",
  "perencanaan-prosedur",
  "implementasi-pemantauan",
  "audit-tinjauan",
  "pencapaian-kinerja",
  "pencapaian-lainnya",
];

const topics = await Promise.all(topicSlugs.map(async (slug) => {
  const file = `../src/content/pages/00${26 + topicSlugs.indexOf(slug)}-halaman-csms-${slug}.md`;
  const raw = await read(file);
  return { slug, file, raw, data: parseYaml(raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "{}") };
}));

test("CSMS index links to every published element topic", () => {
  const grid = index.blocks.find((block) => block.type === "link-grid" && block.id === "sembilan-elemen");
  assert.ok(grid, "CSMS index must own the nine-element link grid");
  const hrefs = grid.items.map((item) => item.href);
  assert.equal(hrefs.length, 9);
  assert.deepEqual(hrefs, topicSlugs.map((slug) => `/csms/${slug}/`));
  assert.equal(new Set(hrefs).size, hrefs.length);
});

test("CSMS index is frontmatter-only and avoids prohibited service language", () => {
  assert.doesNotMatch(indexRaw, /konsult|consult/i);
  assert.doesNotMatch(indexRaw, /penyusunan dokumen|pendampingan|status layanan/i);
  assert.equal(indexRaw.trimEnd().endsWith("---"), true);
  const { headings } = parseFrontmatterContent(index);
  assert.equal(headings.filter((heading) => heading.level === 1).length, 1);
});

test("dedicated CSMS route resolves topic entries and uses breadcrumbs", () => {
  assert.match(routeSource, /getCsmsTopicEntries\(\)/);
  assert.match(routeSource, /CSMS_TOPIC_PREFIX/);
  assert.match(routeSource, /siteCrumb\("\/csms\/"/);
  assert.match(pagesSource, /entry\.data\.slug\.startsWith\(CSMS_TOPIC_PREFIX\)/);
});

for (const { slug, file, raw, data } of topics) {
  test(`${slug} has complete, policy-compliant frontmatter`, () => {
    for (const field of ["title", "intro", "metaDescription", "pubDate", "slug", "translationKey"]) {
      assert.ok(data[field], `${file}: missing ${field}`);
    }
    assert.equal(data.slug, `csms/${slug}`);
    assert.equal(data.lang, "id");
    assert.equal(data.draft, false);
    assert.match(data.featuredImage.src, new RegExp(`/csms-${slug}\\.webp$`));
    assert.doesNotMatch(raw, /konsult|consult|penyusunan dokumen|pendampingan|status layanan/i);

    const phrase = `${data.title} adalah`.toLocaleLowerCase("id");
    assert.ok(data.intro.toLocaleLowerCase("id").startsWith(phrase), `${file}: intro must start with "${phrase}"`);
    const alt = data.featuredImage.alt.toLocaleLowerCase("id");
    assert.ok(alt.includes(" adalah ") && alt.includes(data.title.toLocaleLowerCase("id")));
    assert.ok(alt.length < data.intro.length, `${file}: alt must be shorter than intro`);
    assert.notEqual(data.metaDescription, data.intro);
    assert.notEqual(data.metaDescription, data.featuredImage.alt);
  });

  test(`${slug} has a valid hero, sections and a certification CTA`, () => {
    const blocks = data.blocks ?? [];
    assert.equal(blocks.filter((block) => block.type === "hero").length, 1);
    assert.equal(blocks.filter((block) => block.type === "content-section").length, 2);
    assert.equal(blocks.filter((block) => block.type === "faq").length, 1);
    const cta = blocks.find((block) => block.type === "cta");
    assert.equal(cta.link.url, "/services/");
    assert.match(cta.link.label, /Lihat layanan/);

    const { headings } = parseFrontmatterContent(data);
    assert.equal(headings.filter((heading) => heading.level === 1).length, 1);
    for (let i = 1; i < headings.length; i += 1) {
      assert.ok(headings[i].level <= headings[i - 1].level + 1, `${file}: heading level skipped`);
    }
  });
}

test("each CSMS topic has a unique SVG master and production WebP", async () => {
  const sources = new Set();
  for (const { slug } of topics) {
    const svg = `../assets/illustrations/source/csms-${slug}.svg`;
    const webp = `../public/images/illustrations/csms-${slug}.webp`;
    const svgText = await read(svg);
    assert.match(svgText, /<svg /);
    const svgStat = await stat(new URL(svg, import.meta.url));
    const webpStat = await stat(new URL(webp, import.meta.url));
    assert.ok(svgStat.size > 0 && webpStat.size > 0);
    sources.add(svgText);
  }
  assert.equal(sources.size, topicSlugs.length);
});
