import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const schema = await read("src/content.config.ts");
const renderer = await read("src/components/BlockRenderer.astro");
const service = await read("src/content/services/sertifikasi-iso-14001-2026.md");

test("editorial content sections support varied layouts", () => {
  for (const layout of ["numbered-grid", "editorial", "bento", "highlight", "feature-list", "comparison"]) {
    assert.ok(schema.includes(`"${layout}"`), `schema must allow ${layout}`);
    assert.ok(renderer.includes(`layout === "${layout}"`), `renderer must implement ${layout}`);
  }
});

test("howto blocks support timeline layout", () => {
  assert.match(schema, /layout: z\.enum\(\["steps", "timeline", "compact"\]\)/);
  assert.match(renderer, /block\.layout === "timeline"/);
});

test("ISO 14001 service uses frontmatter blocks with deliberate layout variation", () => {
  for (const layout of ["editorial", "bento", "highlight", "feature-list", "comparison", "timeline"]) {
    assert.ok(service.includes(`layout: "${layout}"`), `ISO service missing layout ${layout}`);
  }
  assert.match(service, /blocks:/);
  assert.doesNotMatch(service, /^# |^## |^### /m, "service page body must not contain Markdown headings");
});

test("FAQ is rendered using semantic details and summary disclosure elements", () => {
  assert.match(renderer, /<details class="group py-5/);
  assert.match(renderer, /<summary class:list=/);
});
