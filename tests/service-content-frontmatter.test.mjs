import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { parse as parseYaml } from "yaml";

const contentDir = new URL("../src/content/services/", import.meta.url);
const files = (await readdir(contentDir)).filter((file) => file.endsWith(".md")).sort();
const entries = await Promise.all(files.map(async (file) => {
  const raw = await readFile(new URL(file, contentDir), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  return {
    file,
    data: match ? parseYaml(match[1]) : {},
    body: match ? match[2] : "",
    raw,
  };
}));

for (const { file, data, body } of entries) {
  test(`${file} has an empty Markdown body`, () => {
    assert.equal(body.trim(), "", `${file}: editorial entries must contain frontmatter only`);
  });

  test(`${file} has exactly one hero block`, () => {
    const heroes = (data.blocks ?? []).filter((block) => block.type === "hero");
    assert.equal(heroes.length, 1, `${file}: expected exactly one hero block`);
  });

  test(`${file} declares a relatedArticles title`, () => {
    assert.ok(data.relatedArticles?.title, `${file}: missing relatedArticles.title`);
  });
}

const prohibitedSectionTitles = ["Status pengembangan layanan", "Service development status"];
const prohibitedSelfAuditPhrases = [
  "pengembangan katalog layanan",
  "belum dinyatakan tersedia",
  "masih berstatus draft",
  "belum dinyatakan disetujui untuk publikasi",
  "status pengembangan layanan",
  "status layanan tncv",
  "status dan kewenangan tncv",
  "menerima permohonan sertifikasi",
  "accepting applications for",
];
for (const { file, data, raw } of entries) {
  test(`${file} has no internal development-status section`, () => {
    const titles = (data.blocks ?? []).map((block) => block.title).filter(Boolean);
    for (const title of prohibitedSectionTitles) {
      assert.ok(!titles.includes(title), `${file}: prohibited block title "${title}"`);
    }
  });

  test(`${file} has no self-audit disclaimer copy`, () => {
    const lowered = raw.toLowerCase();
    for (const phrase of prohibitedSelfAuditPhrases) {
      assert.ok(!lowered.includes(phrase), `${file}: prohibited phrase "${phrase}"`);
    }
  });
}

const expectedSections = {
  id: ["Proses sertifikasi secara umum", "Referensi resmi"],
  en: ["Certification process overview", "Official references"],
};
const sectionOverrides = {
  "sertifikasi-fssc-22000.md": [
    "Tahapan umum menuju sertifikasi FSSC 22000",
    "Referensi resmi dan pembanding layanan",
  ],
};
for (const entry of entries.filter((candidate) => candidate.data.draft !== true)) {
  test(`${entry.file} preserves body sections as block titles`, () => {
    const titles = (entry.data.blocks ?? []).map((block) => block.title).filter(Boolean);
    const sections = sectionOverrides[entry.file] ?? expectedSections[entry.data.lang];
    for (const section of sections) {
      assert.ok(titles.includes(section), `${entry.file}: missing block title "${section}"`);
    }
  });
}

const routes = {
  id: await readFile(new URL("../src/pages/services/[slug].astro", import.meta.url), "utf8"),
  en: await readFile(new URL("../src/pages/en/services/[slug].astro", import.meta.url), "utf8"),
};

for (const [lang, source] of Object.entries(routes)) {
  test(`${lang} service route passes frontmatter blocks without rendering a body`, () => {
    assert.match(source, /<ServiceLayout/);
    assert.match(source, /hero=\{hero\}/);
    assert.match(source, /blocks=\{blocks\}/);
    assert.doesNotMatch(source, /<Content/);
    assert.match(source, /siteCrumb\("\/services\/", lang\)/);
    assert.match(source, /relatedArticles/);
  });
}

const layout = await readFile(new URL("../src/layouts/ServiceLayout.astro", import.meta.url), "utf8");
test("ServiceLayout renders a frontmatter hero and blocks without hardcoded labels", () => {
  assert.match(layout, /PageHero/);
  assert.match(layout, /PageBlockRenderer/);
  assert.match(layout, /breadcrumbs/);
  assert.doesNotMatch(layout, /<FeaturedImage/);
  assert.doesNotMatch(layout, /"Beranda"/);
  assert.doesNotMatch(layout, /"Layanan"/);
});
