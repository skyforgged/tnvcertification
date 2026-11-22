# Block Section IDs and Semantics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every rendered service/training block addressable by a stable `id` and a named semantic class, with `aria-labelledby` linking each section to its heading.

**Architecture:** Add an optional validated `id` to the four block schemas, resolve it through one pure helper (explicit id → title → eyebrow → type fallback), render the resolved id plus named classes in the shared `BlockRenderer`, and move the six hardcoded surface palettes into design tokens. Duplicate ids fail the build with a CONTENT-014 diagnostic.

**Tech Stack:** Astro 7, TypeScript strict, Zod via `astro/zod`, Tailwind CSS 4 `@theme`, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-22-block-section-ids-semantics-design.md`

## Global Constraints

- Commit directly to `main`; no feature branches or pull requests unless explicitly requested.
- `site.ts` remains the SSOT; no site-wide values hardcoded in components.
- Tailwind is the primary styling tool; colors come from CSS custom properties / `@theme` tokens, never `bg-[#...]` or `text-[#...]`.
- Do not change editorial text, block order, block count, spacing, or the current color values.
- ZERO CONSULTATION rule applies to all edited content and component copy.
- Real `id` values must stay stable when a block title is edited.

## Review Focus

- Two blocks in one entry with the same explicit `id` → build fails with `[CONTENT-014] <file> → blocks[i].id`. Negative build check in Task 2.
- A future block without `id` → deterministic anchor derived from title, never from array position alone. Test in Task 1.
- Editing a block title → explicit `id` unchanged. Test in Task 1.
- Every rendered block section/aside on a service detail page → has `id`, named classes `block-section block-section--<type> block-section--surface-<surface>`, and `aria-labelledby` pointing to an existing heading `id`. Build audit in Task 5.
- All six surfaces after token migration → no hardcoded hex left in `BlockRenderer.astro` or its rendered class attributes. Build audit in Task 5.

---

### Task 1: Pure block ID helper

**Files:**
- Create: `src/lib/block-ids.ts`
- Test: `tests/block-ids.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface BlockAnchorSource { id?: string; type: string; title?: string; eyebrow?: string }`
  - `slugifyBlockId(value: string): string`
  - `blockAnchorId(block: BlockAnchorSource, index: number): string`
  - `interface BlockIdDiagnostic { rule: string; path: string; field: string; reason: string }`
  - `findDuplicateBlockIdIndexes(blocks: readonly BlockAnchorSource[]): number[]` — indices of every occurrence after the first.
  - `validateBlockIds(entries: readonly { path: string; data: Record<string, unknown> }[]): BlockIdDiagnostic[]`

- [ ] **Step 1: Write failing tests** in `tests/block-ids.test.mjs`

  Cover: `slugifyBlockId("Tahapan Audit Sertifikasi")` → `"tahapan-audit-sertifikasi"` (diacritics and punctuation removed, lowercase); `blockAnchorId({ id: "iso14001-tahapan-audit", type: "content-section", title: "Judul Baru" }, 3)` → `"iso14001-tahapan-audit"`; the same block without `id` → `"judul-baru"`; a block with neither title nor eyebrow → `"faq-1"` for index 0; two blocks with `id: "faq"` at indexes 0 and 5 → `findDuplicateBlockIdIndexes` returns `[5]`; `validateBlockIds` returns one diagnostic with `rule: "CONTENT-014"`, `path` equal to the entry path, `field: "blocks[5].id"`, and a reason naming the duplicate id.

- [ ] **Step 2: Run tests to confirm they fail**

  Run: `npm test`
  Expected: FAIL — module `../src/lib/block-ids.ts` not found.

- [ ] **Step 3: Implement `src/lib/block-ids.ts`**

  `slugifyBlockId`: Unicode NFD normalize, strip combining marks, lowercase, replace runs of non-alphanumerics with a single hyphen, trim hyphens. `blockAnchorId`: first non-empty of explicit `id`, `title`, `eyebrow`, then `${type}-${index + 1}`; slugify fallback values, leave an explicit id unchanged. `findDuplicateBlockIdIndexes`: compare explicit `id` values only, case-sensitively, ignoring blocks without one. `validateBlockIds`: treat `data.blocks` as an array of objects when present, use `findDuplicateBlockIdIndexes`, and emit one diagnostic per duplicate with the fields pinned above.

- [ ] **Step 4: Run tests to confirm they pass**

  Run: `npm test`
  Expected: PASS, 74/74 tests green.

- [ ] **Step 5: Commit**

  `git add src/lib/block-ids.ts tests/block-ids.test.mjs`
  `git commit -m "feat(blocks): add pure stable block ID helper"`

### Task 2: Schema field and build-time duplicate validation

**Files:**
- Modify: `src/content.config.ts:18-72`
- Modify: `src/content-validation.ts:95-116`

**Interfaces:**
- Consumes: `validateBlockIds` from Task 1.
- Produces: optional `id` accepted on all four block types; CONTENT-014 diagnostics included in the build-failure list.

- [ ] **Step 1: Add the schema field**

  Add a shared `blockIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "block id must be lowercase kebab-case")` and spread it as optional `id` into `faqBlock`, `contentSectionBlock`, `howToBlock`, and `ctaBlock`.

  Run: `npm run check`
  Expected: exit 0.

- [ ] **Step 2: Wire validation into the build**

  Import `validateBlockIds` in `src/content-validation.ts`, add `...validateBlockIds(contentEntries)` to `diagnostics`, and keep the existing failure message format unchanged.

  Run: `npm run check`
  Expected: exit 0.

- [ ] **Step 3: Verify the negative case**

  Temporarily set the second block id in `src/content/services/sertifikasi-iso-14001-2026.md` to the same value as the first id. Run `npm run build`; expect a non-zero exit containing `[CONTENT-014]` and `blocks[1].id`. Restore the file exactly and re-run `npm run build`; expect exit 0.

- [ ] **Step 4: Commit**

  `git add src/content.config.ts src/content-validation.ts`
  `git commit -m "feat(blocks): validate stable block IDs at build time"`

### Task 3: Explicit IDs on all existing blocks

**Files:**
- Modify: `src/content/services/sertifikasi-iso-14001-2026.md`
- Modify: `src/content/services/sertifikasi-iso-9001-2026.md`
- Modify: `src/content/services/iso-14001-2026-certification.md`

**Interfaces:**
- Consumes: `id` field from Task 2.
- Produces: 16 explicit block ids; the ID and EN ISO 14001 entries use the same ids for mirrored blocks.

- [ ] **Step 1: Add ids in block order**

  `sertifikasi-iso-14001-2026.md`: `iso14001-standar-terkini`, `iso14001-area-sistem`, `iso14001-edisi-2026`, `iso14001-tahapan-audit`, `iso14001-transisi-standar`, `faq`.
  `sertifikasi-iso-9001-2026.md`: `iso9001-standar-terkini`, `iso9001-area-sistem`, `iso9001-periode-transisi`, `faq`.
  `iso-14001-2026-certification.md`: the same six ids as the Indonesian ISO 14001 entry, in the same order.

  Do not change any other frontmatter or body text.

- [ ] **Step 2: Verify content and commit**

  Run: `npm run check && npm run validate:changed`
  Expected: both exit 0; all 16 blocks parse with ids.

  `git add src/content/services/`
  `git commit -m "content: add stable IDs to service blocks"`

### Task 4: Semantic classes and design tokens in the renderer

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/components/BlockRenderer.astro`

**Interfaces:**
- Consumes: `blockAnchorId` from Task 1; `id` on block objects from Task 2.
- Produces: every rendered section/aside carries `id`, `aria-labelledby`, and `block-section block-section--<type> block-section--surface-<surface>`; headings carry `id={`${id}-heading`}`.

- [ ] **Step 1: Add surface tokens**

  In `src/styles/global.css`, add these `@theme` tokens with exactly these values (surface / line / heading / body / divider):

  - white: `--color-block-white: #ffffff`, `--color-block-white-line: #dce2ea`, `--color-block-white-heading: #172033`, `--color-block-white-body: #536174`, `--color-block-white-divider: #dce2ea`
  - blue: `--color-block-blue: #eef3ff`, `--color-block-blue-line: #d7e2ff`, `--color-block-blue-heading: #1736a8`, `--color-block-blue-body: #34476f`, `--color-block-blue-divider: #cbd8f4`
  - navy: `--color-block-navy: #1736a8`, `--color-block-navy-line: #1736a8`, `--color-block-navy-heading: #ffffff`, `--color-block-navy-body: #dbeafe`, `--color-block-navy-divider: rgb(255 255 255 / 0.2)`
  - mint: `--color-block-mint: #eaf8f3`, `--color-block-mint-line: #c7eee3`, `--color-block-mint-heading: #145b4a`, `--color-block-mint-body: #365f55`, `--color-block-mint-divider: #c7e6dc`
  - coral: `--color-block-coral: #fff1eb`, `--color-block-coral-line: #f6d4c9`, `--color-block-coral-heading: #8d3e2b`, `--color-block-coral-body: #704d43`, `--color-block-coral-divider: #f2d5ca`
  - cream: `--color-block-cream: #fbf7eb`, `--color-block-cream-line: #eee4c8`, `--color-block-cream-heading: #55451e`, `--color-block-cream-body: #655b43`, `--color-block-cream-divider: #e9dfc5`

  Add `.block-section` in `@layer components` owning the shared `border-y px-5 py-8 sm:px-9 sm:py-10` via `@apply`, and remove those utilities from the component's class lists in Step 2.

  Run: `npm run check`
  Expected: exit 0.

- [ ] **Step 2: Rewrite the surface map and block markup**

  In `BlockRenderer.astro`: keep the `surfaces` map shape but replace every arbitrary hex value with token-derived utilities (`bg-block-<surface>`, `border-block-<surface>-line`, `text-block-<surface>-heading`, `text-block-<surface>-body`, `divide-block-<surface>-divider`). Add `id` to all four block interfaces via a shared base interface; compute `const id = blockAnchorId(block, index)` inside the `map`; add `id`, `aria-labelledby={`${id}-heading`}`, and classes `block-section block-section--<type> block-section--surface-<surface>` to each `section`/`aside`; add `id={`${id}-heading`}` to each block heading. Keep the existing `aria-label` on FAQ/CTA and all visible copy unchanged.

  Run: `npm run check && npm run build`
  Expected: exit 0; 36 pages built.

- [ ] **Step 3: Commit**

  `git add src/styles/global.css src/components/BlockRenderer.astro`
  `git commit -m "feat(blocks): render stable IDs and semantic section classes"`

### Task 5: Build-output audit and full validation

**Files:**
- Create: `scripts/audit-block-sections.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: built HTML under `dist/`.
- Produces: `npm run audit:blocks` exits 0 only when the Review Focus build checks pass.

- [ ] **Step 1: Write the audit script**

  Parse every HTML file under `dist/services/` and `dist/trainings/` that contains `class="block-section`. For each such element assert: it has an `id` matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`; it has classes `block-section`, one `block-section--<type>`, and one `block-section--surface-<surface>`; its `aria-labelledby` matches the `id` of a heading inside it; ids are unique within a page; and no class attribute on that element contains `[#`. Print the number of checked sections and exit non-zero with file-level messages on failure.

  Run: `node scripts/audit-block-sections.mjs`
  Expected: exit 0 against the Task 4 build; reports sections checked.

- [ ] **Step 2: Add the npm script**

  Add `"audit:blocks": "node scripts/audit-block-sections.mjs"` to `package.json`.

  Run: `npm run audit:blocks`
  Expected: exit 0, same count as Step 1.

- [ ] **Step 3: Full validation and commit**

  Run: `npm run check && npm run build && npm run typecheck && npm run lint && npm test && npm run audit:seo && npm run audit:blocks`
  Expected: all exit 0; tests 74/74; build 36 pages; SEO audit unchanged; block audit reports sections checked.

  `git add scripts/audit-block-sections.mjs package.json`
  `git commit -m "test(blocks): audit rendered section IDs and semantics"`
