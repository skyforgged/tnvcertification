# Frontmatter Schema Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a `content-section` block declare its Schema.org representation in validated frontmatter, with `ItemList` rendering as a nested `ItemList` of numbered `ListItem`s.

**Architecture:** Add an optional `schema` enum to `contentSectionBlock` in `src/content.config.ts`. `blockGraphNodes()` in `src/lib/structured-data.ts` reads it and chooses the `hasPart` shape while keeping the section node and DOM-matching `@id` unchanged. The one target block in the training Markdown gets `schema: ItemList`; all other content stays on the default.

**Tech Stack:** Astro 7, TypeScript strict, Zod content collections, Node test runner via `node --import tsx --test`.

**Spec:** `docs/superpowers/specs/2026-11-25-frontmatter-schema-selection-design.md`

## Global Constraints

- Do not change `BlockRenderer.astro`, `Layout.astro`, page title, meta description, H1, or editorial copy.
- `site.ts` remains the single source of truth; structured data mirrors visible content.
- No `konsult*`/`consult*` or internal service-status copy in any content.
- No new dependency, no new content collection, no push/PR/deploy/tag/vhost work.
- Before any commit, run the only standard gate: `bash /tmp/opencode/run-gates.sh`.
- Direct test commands must use `node --import tsx --test ...`.

## Review Focus

- **Invalid `schema` value** (e.g. `schema: SomethingElse`) must fail the build, not be silently ignored — pinned by the Zod enum assertion in Task 1's config test.
- **`schema: ItemList` with no `items`** must omit `hasPart`, not emit an empty `ItemList` — pinned by Task 1's no-items test.
- **Default behavior** (field absent) must remain the current `CreativeWork[]` array — pinned by Task 1's existing default test plus an explicit `Array.isArray` assertion.
- **Numbering** must follow visible item order starting at 1 — pinned by Task 1's `position` assertion.
- **Real content entry** must survive validation and render five `ListItem`s in the built JSON-LD — pinned by Task 2's build inspection.

---

### Task 1: Validated frontmatter field and `ItemList` graph representation

**Files:**
- Modify: `src/content.config.ts` (`contentSectionBlock`, lines ~39-51)
- Modify: `src/lib/structured-data.ts` (`blockGraphNodes`, lines ~164-179)
- Test: `tests/training-structured-data.test.mjs`, `tests/page-block-schema.test.mjs`

**Interfaces:**
- Consumes: `PageBlock` from `src/data/pages.ts`; `z` already imported in `src/content.config.ts`.
- Produces: optional `block.schema` with values `"WebPageElement" | "ItemList"` on typed `content-section` blocks; `blockGraphNodes()` emits a nested `ItemList` when the field is `"ItemList"`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/training-structured-data.test.mjs`:

```js
test("content-section with schema ItemList emits a nested ItemList with numbered ListItems", () => {
  const entities = trainingPageJsonLd({
    name: "Pelatihan",
    description: "Deskripsi pelatihan.",
    path,
    blocks: [{
      type: "content-section",
      id: "tujuan-dan-kompetensi-peserta",
      schema: "ItemList",
      title: "Tujuan dan kompetensi yang dikembangkan",
      description: "Paragraf pembuka.",
      items: [
        { title: "Memahami kriteria audit", description: "Mengenali kriteria." },
        { title: "Merencanakan kegiatan audit", description: "Menentukan tujuan." },
      ],
    }],
  });

  const section = entities.find((entity) => entity["@type"] === "WebPageElement");
  assert.equal(section["@id"], `${url}#tujuan-dan-kompetensi-peserta`);
  assert.equal(section.hasPart["@type"], "ItemList");
  assert.deepEqual(section.hasPart.itemListElement, [
    { "@type": "ListItem", position: 1, name: "Memahami kriteria audit", description: "Mengenali kriteria." },
    { "@type": "ListItem", position: 2, name: "Merencanakan kegiatan audit", description: "Menentukan tujuan." },
  ]);
});

test("schema ItemList without items omits hasPart", () => {
  const entities = trainingPageJsonLd({
    name: "Pelatihan",
    description: "Deskripsi pelatihan.",
    path,
    blocks: [{ type: "content-section", id: "kosong", schema: "ItemList", title: "Kosong" }],
  });
  const section = entities.find((entity) => entity["@type"] === "WebPageElement");
  assert.equal("hasPart" in section, false);
});

test("content-section without schema keeps the CreativeWork array", () => {
  const entities = trainingPageJsonLd({
    name: "Pelatihan",
    description: "Deskripsi pelatihan.",
    path,
    blocks: [{
      type: "content-section",
      id: "standar",
      title: "Standar",
      items: [{ title: "Satu", description: "Teks." }],
    }],
  });
  const section = entities.find((entity) => entity["@type"] === "WebPageElement");
  assert.equal(Array.isArray(section.hasPart), true);
  assert.equal(section.hasPart[0]["@type"], "CreativeWork");
});
```

Append to `tests/page-block-schema.test.mjs`:

```js
test("content-section schema field is restricted to known JSON-LD representations", () => {
  assert.ok(
    config.includes('schema: z.enum(["WebPageElement", "ItemList"]).optional()'),
    "missing validated schema field on content-section blocks",
  );
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --import tsx --test tests/training-structured-data.test.mjs tests/page-block-schema.test.mjs`
Expected: FAIL — first two new tests see `hasPart` as an array (or missing), and the config test finds no `schema` enum.

- [ ] **Step 3: Add the enum to the content collection**

In `src/content.config.ts`, add `schema: z.enum(["WebPageElement", "ItemList"]).optional(),` to `contentSectionBlock`, immediately after the `layout` line.

- [ ] **Step 4: Branch `hasPart` in `blockGraphNodes()`**

In `src/lib/structured-data.ts`, keep the section node and `id` computation unchanged. Replace the `hasPart` value with a conditional on `block.schema === "ItemList"`:

```ts
const hasPart = block.items?.length
  ? block.schema === "ItemList"
    ? {
        "@type": "ItemList",
        itemListElement: block.items.map((item, itemIndex) => ({
          "@type": "ListItem",
          position: itemIndex + 1,
          name: item.title,
          description: item.description,
        })),
      }
    : block.items.map((item) => ({
        "@type": "CreativeWork",
        name: item.title,
        description: item.description,
      }))
  : undefined;
```

Push the section with `...(hasPart ? { hasPart } : {})` instead of the current inline spread.

- [ ] **Step 5: Run the focused tests to verify they pass**

Run: `node --import tsx --test tests/training-structured-data.test.mjs tests/page-block-schema.test.mjs`
Expected: PASS — all tests in both files pass.

- [ ] **Step 6: Run the standard gate**

Run: `bash /tmp/opencode/run-gates.sh`
Expected: `ALL_GATES_OK`.

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/lib/structured-data.ts tests/training-structured-data.test.mjs tests/page-block-schema.test.mjs docs/superpowers/specs/2026-11-25-frontmatter-schema-selection-design.md docs/superpowers/plans/2026-11-25-frontmatter-schema-selection.md
git commit -m "feat: allow content sections to declare their JSON-LD representation"
```

### Task 2: Mark the target training section and verify the built graph

**Files:**
- Modify: `src/content/training/pelatihan-auditor-internal-fssc-22000.md` (block at lines ~54-70, `id: tujuan-dan-kompetensi-peserta`)

**Interfaces:**
- Consumes: validated `schema` field from Task 1; `trainingPageJsonLd()` from `src/lib/structured-data.ts`.
- Produces: no new API. The built page's JSON-LD contains one `ItemList` node with five `ListItem`s for this section.

- [ ] **Step 1: Add the field to the content entry**

In `src/content/training/pelatihan-auditor-internal-fssc-22000.md`, insert `schema: ItemList` immediately below `id: "tujuan-dan-kompetensi-peserta"`. Do not change any other field.

- [ ] **Step 2: Run the standard gate**

Run: `bash /tmp/opencode/run-gates.sh`
Expected: `ALL_GATES_OK` — content validation accepts the field and all audits pass.

- [ ] **Step 3: Inspect the built JSON-LD**

Run:

```bash
python3 -c "
import re, json
html = open('dist/trainings/pelatihan-auditor-internal-fssc-22000/index.html').read()
graph = json.loads(re.search(r'<script type=\"application/ld\+json\">(.*?)</script>', html, re.S).group(1))['@graph']
node = [e for e in graph if e.get('@type') == 'WebPageElement' and 'tujuan-dan-kompetensi' in e.get('@id', '')][0]
assert node['hasPart']['@type'] == 'ItemList'
assert len(node['hasPart']['itemListElement']) == 5
assert [i['position'] for i in node['hasPart']['itemListElement']] == [1, 2, 3, 4, 5]
print('ItemList verified:', node['@id'])
"
```

Expected: prints `ItemList verified: https://tnv-certification.com/trainings/pelatihan-auditor-internal-fssc-22000/#tujuan-dan-kompetensi-peserta`.

- [ ] **Step 4: Commit**

```bash
git add src/content/training/pelatihan-auditor-internal-fssc-22000.md
git commit -m "feat: mark learning objectives section as ItemList"
```
