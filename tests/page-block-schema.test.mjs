import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { collections } from "../src/content.config.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8").catch(() => "");
const config = await read("src/content.config.ts");
const helper = await read("src/data/pages.ts");
const slugRoute = await read("src/pages/[slug].astro");

test("page block schema declares the structural block types", () => {
  for (const type of ["hero", "link-grid", "listing", "contact", "upcoming-schedules"]) {
    assert.ok(config.includes(`type: z.literal("${type}")`), `missing ${type} block`);
  }
});

test("page schema owns the page block union", () => {
  assert.match(config, /const pageBlockSchema = z\.discriminatedUnion\("type"/);
  assert.match(config, /blocks: z\.array\(pageBlockSchema\)\.optional\(\)/);
});

test("page helper exports slug routing and block selectors", () => {
  for (const name of ["routeOwnedPageSlugs", "getPageEntry", "getPageHero", "getPageBlocks"]) {
    assert.match(helper, new RegExp(`export (?:const|async function|function) ${name}\\b`), `missing ${name}`);
  }
});

test("generic slug route skips route-owned slugs", () => {
  assert.match(slugRoute, /import \{[^}]*routeOwnedPageSlugs[^}]*\} from/);
  assert.match(slugRoute, /!routeOwnedPageSlugs\.includes\(/);
});

test("content-section schema accepts declared JSON-LD representations", () => {
  const base = {
    id: 99,
    title: "Halaman",
    intro: "Halaman adalah contoh pengujian skema.",
    slug: "halaman-contoh",
    metaDescription: "Deskripsi meta untuk pengujian skema.",
    pubDate: "2026-11-25T00:00:00Z",
    featuredImage: { src: "/images/example.webp", alt: "Halaman adalah contoh ilustrasi." },
    lang: "id",
    translationKey: "page-halaman-contoh",
  };
  const section = (schema) => ({
    blocks: [{ type: "content-section", title: "Bagian", schema, items: [{ title: "Butir", description: "Teks." }] }],
  });
  const valid = collections.pages.schema.safeParse({ ...base, ...section("ItemList") });
  assert.equal(valid.success, true, valid.success ? "" : JSON.stringify(valid.error.issues));

  const invalid = collections.pages.schema.safeParse({ ...base, ...section("Product") });
  assert.equal(invalid.success, false);
});

test("FAQ blocks require an explicit anchor id", () => {
  const base = {
    id: 100,
    title: "Halaman",
    intro: "Halaman adalah contoh pengujian skema.",
    slug: "halaman-faq",
    metaDescription: "Deskripsi meta untuk pengujian skema FAQ.",
    pubDate: "2026-11-25T00:00:00Z",
    featuredImage: { src: "/images/example.webp", alt: "Halaman adalah contoh ilustrasi." },
    lang: "id",
    translationKey: "page-halaman-faq",
  };
  const items = [{ question: "Apa?", answer: "Jawaban." }];
  const missingId = collections.pages.schema.safeParse({
    ...base,
    blocks: [{ type: "faq", items }],
  });
  assert.equal(missingId.success, false);

  const withId = collections.pages.schema.safeParse({
    ...base,
    blocks: [{ type: "faq", id: "faq-utama", items }],
  });
  assert.equal(withId.success, true, withId.success ? "" : JSON.stringify(withId.error.issues));
});
