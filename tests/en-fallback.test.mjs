import assert from "node:assert/strict";
import test from "node:test";
import { buildEnglishFallbackPaths } from "../src/lib/locale-fallback.ts";

const empty = {
  pages: [],
  services: [],
  articles: [],
  trainings: [],
  articlePageCount: 1,
  existingEnglishPaths: [],
};

test("includes the five Indonesian index paths", () => {
  const paths = buildEnglishFallbackPaths(empty);
  for (const path of ["/services/", "/trainings/", "/schedules/", "/articles/", "/csms/"]) {
    assert.ok(paths.includes(path), `missing ${path}`);
  }
});

test("maps collection entries to their Indonesian detail paths", () => {
  const paths = buildEnglishFallbackPaths({
    ...empty,
    pages: [{ slug: "about-us" }],
    services: [{ slug: "sertifikasi-iso-9001-2026" }],
    articles: [{ slug: "artikel-iso-9001" }],
    trainings: [{ slug: "pelatihan-iso-9001" }],
  });
  assert.ok(paths.includes("/about-us/"));
  assert.ok(paths.includes("/services/sertifikasi-iso-9001-2026/"));
  assert.ok(paths.includes("/articles/artikel-iso-9001/"));
  assert.ok(paths.includes("/trainings/pelatihan-iso-9001/"));
});

test("adds pagination pages from two up to the article page count", () => {
  const paths = buildEnglishFallbackPaths({ ...empty, articlePageCount: 3 });
  assert.ok(paths.includes("/articles/page/2/"));
  assert.ok(paths.includes("/articles/page/3/"));
  assert.ok(!paths.includes("/articles/page/1/"));
});

test("excludes drafts and English entries", () => {
  const paths = buildEnglishFallbackPaths({
    ...empty,
    pages: [{ slug: "draft-page", draft: true }, { slug: "english-page", lang: "en" }],
    services: [{ slug: "draft-service", draft: true }, { slug: "english-service", lang: "en" }],
    articles: [{ slug: "draft-article", draft: true }, { slug: "english-article", lang: "en" }],
    trainings: [{ slug: "draft-training", draft: true }, { slug: "english-training", lang: "en" }],
  });
  for (const slug of [
    "draft-page",
    "english-page",
    "draft-service",
    "english-service",
    "draft-article",
    "english-article",
    "draft-training",
    "english-training",
  ]) {
    assert.ok(!paths.some((path) => path.includes(slug)), `unexpected fallback for ${slug}`);
  }
});

test("excludes paths that already have a real English page", () => {
  const paths = buildEnglishFallbackPaths({
    ...empty,
    existingEnglishPaths: ["/en/services/"],
  });
  assert.ok(!paths.includes("/services/"));
});

test("returns deduplicated absolute paths without an /en/ segment", () => {
  const paths = buildEnglishFallbackPaths({
    ...empty,
    pages: [{ slug: "about-us" }, { slug: "about-us" }],
  });
  assert.equal(new Set(paths).size, paths.length);
  for (const path of paths) {
    assert.ok(path.startsWith("/"), `not absolute: ${path}`);
    assert.ok(path.endsWith("/"), `missing trailing slash: ${path}`);
    assert.ok(!path.includes("/en/"), `English segment leaked: ${path}`);
  }
});
