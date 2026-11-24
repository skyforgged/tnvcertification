# Section Anchor Structured Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every editorial section node a stable `@id` that matches its rendered DOM anchor, using the same `blockAnchorId()` helper as `BlockRenderer.astro`, with the graph still assembled in `Layout.astro`.

**Architecture:** Add one private helper in `src/lib/structured-data.ts` that converts validated blocks into JSON-LD entities and `WebPage.hasPart` references. `trainingPageJsonLd()` and `articlePageJsonLd()` both use it. `Layout.astro`, `BlockRenderer.astro`, and all editorial copy stay unchanged.

**Tech Stack:** Astro 7, TypeScript strict, Node test runner via `node --import tsx --test`.

**Spec:** `docs/superpowers/specs/2026-11-25-section-anchor-structured-data-design.md`

## Global Constraints

- Do not change page title, meta description, H1, or editorial copy.
- `site.ts` remains the single source of truth; no hardcoded company facts.
- Structured data must mirror visible content; never fabricate fields.
- No `konsult*`/`consult*` or internal service-status copy in any content.
- No new dependency, no new content collection, no push/PR/deploy without an explicit request.
- Work on a dedicated local branch from latest `upstream/main`; do not commit fork work to fork `main`.
- Before any commit, run the only standard gate: `bash /tmp/opencode/run-gates.sh`.
- Direct test commands must use `node --import tsx --test ...`.

## Review Focus

- **Block without explicit `id`:** must get a deterministic anchor from its title, never `undefined` or a position-only id — pinned by Task 1's derived-anchor test.
- **Legacy FAQ/HowTo fragments:** current `#faq-<id>` / `#howto-<id>` do not match the DOM section id — pinned by Task 1's anchor-alignment test and Task 2's article alignment test.
- **Missing optional fields:** `description` or `items` absent must omit the JSON-LD key rather than emit empty/fabricated values — pinned by Task 1's optional-fields test.
- **Two page types:** training and article graphs must follow the same anchor convention — pinned by Task 2's article test.
- **Graph assembly:** `pageJsonLdGraph()` must keep the section node and its `WebPage.hasPart` reference intact — pinned by Task 1's graph test.

---

### Task 1: Shared block-to-schema helper and training page wiring

**Files:**
- Modify: `src/lib/structured-data.ts` (imports, new private helper, `trainingPageJsonLd` block loop at current lines ~246-276)
- Test: `tests/training-structured-data.test.mjs`

**Interfaces:**
- Consumes: `blockAnchorId(block, index): string` from `src/lib/block-ids.ts`; `PageBlock` from `src/data/pages.ts`; `siteSettings.url` from `src/site.ts`.
- Produces: private `blockGraphNodes(blocks: PageBlock[], url: string, fallbackName: string): { entities: Array<Record<string, unknown>>; pageParts: Array<{ "@id": string }> }`, used by Task 2.

- [ ] **Step 1: Create the working branch and write the failing tests**

```bash
git fetch upstream && git switch -c feat/section-anchor-structured-data upstream/main
```

Append to `tests/training-structured-data.test.mjs`:

```js
test("content-section blocks contribute a WebPageElement anchored to the rendered section id", () => {
  const blocks = [{
    type: "content-section",
    id: "teknik-pelaksanaan-audit",
    title: "Teknik mengumpulkan dan mengevaluasi bukti audit",
    description: "Kesimpulan audit harus didasarkan pada informasi yang relevan dan dapat diverifikasi.",
    items: [{ title: "Wawancara personel", description: "Auditor mengajukan pertanyaan terbuka." }],
  }];
  const entities = trainingPageJsonLd({
    name: "Pelatihan Auditor Internal FSSC 22000",
    description: "Pelatihan auditor internal FSSC 22000.",
    path,
    blocks,
  });

  const section = entities.find((entity) => entity["@type"] === "WebPageElement");
  assert.equal(section["@id"], `${url}#teknik-pelaksanaan-audit`);
  assert.equal(section.name, "Teknik mengumpulkan dan mengevaluasi bukti audit");
  assert.equal(section.description, blocks[0].description);
  assert.equal(section.hasPart.length, 1);
  assert.equal(section.hasPart[0]["@type"], "CreativeWork");
  assert.equal(section.hasPart[0].name, "Wawancara personel");
  assert.equal(section.hasPart[0].description, blocks[0].items[0].description);
  assert.equal("image" in section, false);

  const page = entities.find((entity) => entity["@type"] === "WebPage");
  assert.deepEqual(page.hasPart, [{ "@id": section["@id"] }]);
});

test("FAQ and HowTo @id fragments match their rendered section anchors", () => {
  const entities = trainingPageJsonLd({
    name: "Pelatihan",
    description: "Deskripsi pelatihan.",
    path,
    blocks: [
      { type: "faq", id: "faq-utama", items: [{ question: "Apa?", answer: "Jawaban." }] },
      { type: "howto", id: "tahapan-audit", steps: [{ title: "Satu", description: "Langkah pertama." }] },
    ],
  });
  assert.equal(entities.find((e) => e["@type"] === "FAQPage")["@id"], `${url}#faq-utama`);
  assert.equal(entities.find((e) => e["@type"] === "HowTo")["@id"], `${url}#tahapan-audit`);
});

test("blocks without an explicit id use a deterministic anchor derived from their title", () => {
  const entities = trainingPageJsonLd({
    name: "Pelatihan",
    description: "Deskripsi pelatihan.",
    path,
    blocks: [{ type: "content-section", title: "Pemeriksaan Dokumen", description: "Teks." }],
  });
  const section = entities.find((entity) => entity["@type"] === "WebPageElement");
  assert.equal(section["@id"], `${url}#pemeriksaan-dokumen`);
});

test("section nodes omit absent optional fields and survive graph assembly", () => {
  const graph = pageJsonLdGraph(trainingPageJsonLd({
    name: "Pelatihan",
    description: "Deskripsi pelatihan.",
    path,
    blocks: [{ type: "content-section", id: "ringkas", title: "Ringkasan" }],
  }));
  const section = graph["@graph"].find((entity) => entity["@type"] === "WebPageElement");
  assert.equal("description" in section, false);
  assert.equal("hasPart" in section, false);
  assert.ok(graph["@graph"].some((entity) =>
    entity["@type"] === "WebPage" &&
    entity.hasPart?.some((part) => part["@id"] === section["@id"])));
});
```

Also add `pageJsonLdGraph` to the existing import from `../src/lib/structured-data.ts` in that test file.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --import tsx --test tests/training-structured-data.test.mjs`
Expected: FAIL — no `WebPageElement` entity, and FAQ/HowTo `@id` still uses the `#faq-` / `#howto-` prefix.

- [ ] **Step 3: Implement `blockGraphNodes()` and replace the training block loop**

In `src/lib/structured-data.ts`:
- Import `blockAnchorId` from `../lib/block-ids.ts`.
- Define `blockGraphNodes(blocks: PageBlock[], url: string, fallbackName: string)` returning `{ entities, pageParts }`.
- Inside the loop, compute `const anchor = blockAnchorId(block, index)` and `const id = \`${url}#${anchor}\``.
- For `content-section`, push a `WebPageElement` with `@id`, `name` from `block.title ?? block.eyebrow ?? fallbackName`, `description` only when present, and `hasPart` (array of `CreativeWork` with `name` and `description`) only when `block.items` is a non-empty array.
- For `faq` and `howto`, keep the existing `FAQPage` / `HowTo` bodies but use the shared `id`.
- For every entity pushed, also push `{ "@id": id }` into `pageParts`.
- In `trainingPageJsonLd()`, replace the inline `input.blocks.forEach(...)` with `const { entities: blockEntities, pageParts: blockParts } = blockGraphNodes(input.blocks, url, input.name)`. Spread `...blockEntities` into `entities` and call `pageParts.push(...blockParts)` immediately before the final `entities.push(WebPage, BreadcrumbList)` call, so the existing `hasPart` conditional keeps working unchanged.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --import tsx --test tests/training-structured-data.test.mjs`
Expected: PASS — all tests in the file pass.

- [ ] **Step 5: Run the standard gate**

Run: `bash /tmp/opencode/run-gates.sh`
Expected: `ALL_GATES_OK`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/structured-data.ts tests/training-structured-data.test.mjs docs/superpowers/specs/2026-11-25-section-anchor-structured-data-design.md docs/superpowers/plans/2026-11-25-section-anchor-structured-data.md
git commit -m "feat: anchor training section schema nodes to rendered ids"
```

### Task 2: Article page wiring and verification

**Files:**
- Modify: `src/lib/structured-data.ts` (`articlePageJsonLd` block loop at current lines ~369-399)
- Test: `tests/article-structured-data.test.mjs` (new)

**Interfaces:**
- Consumes: `blockGraphNodes()` from Task 1; `articlePageJsonLd()` from `src/lib/structured-data.ts`; `siteSettings.url` from `src/site.ts`.
- Produces: no new exported API.

- [ ] **Step 1: Write the failing article test**

Create `tests/article-structured-data.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { articlePageJsonLd, pageJsonLdGraph } from "../src/lib/structured-data.ts";
import { siteSettings } from "../src/site.ts";

const path = "/articles/contoh-artikel/";
const url = new URL(path, siteSettings.url).toString();

const input = {
  name: "Contoh artikel",
  description: "Deskripsi artikel.",
  path,
  image: "/images/contoh.jpg",
  lang: "id",
  datePublished: "2026-11-01",
  dateModified: "2026-11-02",
  blocks: [
    { type: "content-section", id: "teknik-pelaksanaan-audit", title: "Teknik mengumpulkan dan mengevaluasi bukti audit", description: "Paragraf pembuka." },
    { type: "faq", id: "faq-artikel", items: [{ question: "Apa?", answer: "Jawaban." }] },
    { type: "howto", id: "langkah-audit", steps: [{ title: "Satu", description: "Langkah pertama." }] },
  ],
};

test("article block nodes share the training anchor convention and stay in the graph", () => {
  const entities = articlePageJsonLd(input);
  const ids = entities.filter((e) => ["WebPageElement", "FAQPage", "HowTo"].includes(e["@type"])).map((e) => e["@id"]);
  assert.deepEqual(ids, [
    `${url}#teknik-pelaksanaan-audit`,
    `${url}#faq-artikel`,
    `${url}#langkah-audit`,
  ]);

  const graph = pageJsonLdGraph(entities);
  const page = graph["@graph"].find((e) => e["@type"] === "WebPage");
  assert.deepEqual(page.hasPart, ids.map((id) => ({ "@id": id })));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --import tsx --test tests/article-structured-data.test.mjs`
Expected: FAIL — actual ids are `#faq-faq-artikel`, `#howto-langkah-audit`, and no `WebPageElement`.

- [ ] **Step 3: Replace the article block loop with `blockGraphNodes()`**

In `articlePageJsonLd()`, replace the inline `input.blocks.forEach(...)` with the same destructuring/spread pattern used in Task 1, passing `input.name` as `fallbackName`. Call `pageParts.push(...blockParts)` immediately before the final `entities.push(Article, WebPage, BreadcrumbList)` call; leave the `hasPart` conditional unchanged.

- [ ] **Step 4: Run the focused tests**

Run: `node --import tsx --test tests/article-structured-data.test.mjs tests/training-structured-data.test.mjs`
Expected: PASS — both files pass.

- [ ] **Step 5: Run the standard gate**

Run: `bash /tmp/opencode/run-gates.sh`
Expected: `ALL_GATES_OK`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/structured-data.ts tests/article-structured-data.test.mjs
git commit -m "feat: align article section schema anchors with rendered ids"
```
