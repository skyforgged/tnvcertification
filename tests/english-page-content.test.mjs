import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse as parseYaml } from "yaml";
import { parseFrontmatterContent } from "../src/lib/content-validation.ts";

const readEntry = async (file) => {
  const raw = await readFile(new URL(`../src/content/pages/${file}`, import.meta.url), "utf8");
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  return { raw, data: parseYaml(fm?.[1] ?? "{}"), body: fm?.[2] ?? "" };
};

const assertEnglishEntry = ({ raw, data, body }) => {
  assert.equal(data.lang, "en");
  assert.equal(body.trim(), "");
  assert.ok(data.intro.startsWith(`${data.title} is `));
  assert.ok(data.featuredImage.alt.toLowerCase().includes(` ${data.title.toLowerCase()} `));
  assert.ok(data.featuredImage.alt.includes(" is "));
  assert.ok(data.featuredImage.alt.length < data.intro.length);
  assert.notEqual(data.metaDescription, data.intro);
  assert.notEqual(data.metaDescription, data.featuredImage.alt);
  assert.doesNotMatch(raw, /konsult\p{L}*|consult\p{L}*/iu);
  assert.doesNotMatch(raw, /development status|not yet available|not yet approved|belum dinyatakan|status pengembangan/iu);
  assert.doesNotMatch(raw, /href:\s*["']https?:\/\//iu);
  const { headings } = parseFrontmatterContent(data);
  assert.equal(headings.filter((heading) => heading.level === 1).length, 1);
  for (let i = 1; i < headings.length; i += 1) {
    assert.ok(headings[i].level <= headings[i - 1].level + 1);
  }
};

test("English Home entry is frontmatter-only and policy-compliant", async () => {
  assertEnglishEntry(await readEntry("0035-halaman-home-en.md"));
});

test("English Home route resolves the English entry and alternates", async () => {
  const route = await readFile(new URL("../src/pages/en/index.astro", import.meta.url), "utf8");
  assert.match(route, /getPageEntry\("home", "en"\)/);
  assert.match(route, /canonical="\/en\/"/);
  assert.match(route, /pageAlternates\("home"\)/);
});

test("English CSMS entry covers the nine elements with English paths", async () => {
  const entry = await readEntry("0036-halaman-csms-en.md");
  assertEnglishEntry(entry);
  const grid = entry.data.blocks.find((block) => block.type === "link-grid" && block.items.length === 9);
  assert.ok(grid);
  assert.ok(grid.items.every((item) => item.href.startsWith("/en/csms/")));
  const route = await readFile(new URL("../src/pages/en/csms/index.astro", import.meta.url), "utf8");
  assert.match(route, /getPageEntry\("csms", "en"\)/);
  assert.match(route, /canonical="\/en\/csms\/"/);
  assert.match(route, /pageAlternates\("csms"\)/);
});

test("English About entry has English contact labels and a paired route", async () => {
  const entry = await readEntry("0037-halaman-about-us-en.md");
  assertEnglishEntry(entry);
  const contact = entry.data.blocks.find((block) => block.type === "contact");
  assert.deepEqual(contact.labels, { email: "Email", phone: "Phone", address: "Address" });
  const route = await readFile(new URL("../src/pages/en/about-us/index.astro", import.meta.url), "utf8");
  assert.match(route, /getPageEntry\("about-us", "en"\)/);
  assert.match(route, /canonical="\/en\/about-us\/"/);
  assert.match(route, /pageAlternates\("about-us"\)/);
  const generic = await readFile(new URL("../src/pages/[slug].astro", import.meta.url), "utf8");
  assert.match(generic, /entry\.data\.lang !== "en"/);
});
