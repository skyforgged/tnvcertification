import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  validateAllEntries,
  validateEntry,
} from "../src/lib/content-validation.ts";

const fixture = (name) =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

function makeEntry(overrides = {}) {
  const id = overrides.id ?? "0010-test.md";
  return {
    id,
    collection: "articles",
    path: `src/content/articles/${id}`,
    data: {
      title: "Judul Uji",
      intro: "Judul Uji adalah intro yang menjelaskan topik halaman ini.",
      metaDescription: "Ringkasan SEO unik untuk halaman uji ini.",
      featuredImage: {
        src: "/images/uji.webp",
        alt: "Judul Uji adalah ilustrasi topik ini.",
      },
      ...overrides.data,
    },
    body:
      overrides.body ??
      "# Judul Uji\n\nJudul Uji adalah intro yang menjelaskan topik halaman ini.\n\n## Bagian\n\nIsi.",
  };
}

test("heading skip reports CONTENT-011 with headingText and expectedLevel", () => {
  const diagnostics = validateEntry(
    makeEntry({ body: fixture("heading-skip.md"), data: { title: "Judul Uji" } }),
  );
  const found = diagnostics.find((d) => d.rule === "CONTENT-011");
  assert.ok(found, "expected CONTENT-011 diagnostic");
  assert.equal(found.headingText, "Subheading");
  assert.equal(found.expectedLevel, 2);
});

test("duplicate metaDescription reports CONTENT-006 on the later entry", () => {
  const shared = "Ringkasan SEO yang sama persis untuk dua artikel.";
  const diagnostics = validateAllEntries([
    makeEntry({
      id: "0001-pertama.md",
      body: fixture("duplicate-meta.md"),
      data: { title: "Judul Kedua", metaDescription: shared },
    }),
    makeEntry({
      id: "0002-kedua.md",
      data: { metaDescription: shared },
    }),
  ]);
  const found = diagnostics.find(
    (d) => d.rule === "CONTENT-006" && d.entry === "0002-kedua.md",
  );
  assert.ok(found, "expected CONTENT-006 on 0002-kedua.md");
});

test("alt identical to intro reports CONTENT-006 and CONTENT-009", () => {
  const intro = "Judul Alt adalah teks intro yang sama persis dengan alt gambar.";
  const diagnostics = validateEntry(
    makeEntry({
      body: fixture("bad-alt.md"),
      data: {
        title: "Judul Alt",
        intro,
        metaDescription: intro,
        featuredImage: { src: "/images/alt.webp", alt: intro },
      },
    }),
  );
  const rules = diagnostics.map((d) => d.rule);
  assert.ok(rules.includes("CONTENT-006"), "expected CONTENT-006");
  assert.ok(rules.includes("CONTENT-009"), "expected CONTENT-009");
});

test("missing intro field reports CONTENT-002", () => {
  const data = { title: "Judul Tanpa Field" };
  delete data.intro;
  const diagnostics = validateEntry(
    makeEntry({ body: fixture("missing-intro.md"), data }),
  );
  assert.ok(
    diagnostics.some((d) => d.rule === "CONTENT-002"),
    "expected CONTENT-002",
  );
});

test("two paragraphs after H1 report CONTENT-002", () => {
  const body = [
    "# Judul Dua Paragraf",
    "",
    "Judul Dua Paragraf adalah paragraf intro pertama.",
    "",
    "Ini paragraf kedua yang bukan intro.",
    "",
    "## Bagian",
    "",
    "Isi.",
  ].join("\n");
  const diagnostics = validateEntry(
    makeEntry({ body, data: { title: "Judul Dua Paragraf" } }),
  );
  assert.ok(
    diagnostics.some((d) => d.rule === "CONTENT-002"),
    "expected CONTENT-002",
  );
});
