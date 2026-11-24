# Content Audit Report Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic, report-only content audit that inventories editorial entries and surfaces translation, link, duplicate, and terminology issues without failing the existing build gates.

**Architecture:** Pure analysis modules under `src/lib/` consume frontmatter records produced by one inventory loader and built HTML pages produced by one route collector. A single CLI (`scripts/audit-content.mjs`) aggregates the module results into a terminal report. Nothing writes files, nothing changes deploy behaviour, and no content finding changes the exit code in this phase.

**Tech Stack:** Node 26 built-ins, `yaml`, `tinyglobby`, existing `editorialCollections` registry in `src/data/collections.ts`, `node:test` with `tsx` for TypeScript imports.

**Spec:** `docs/content-editorial-standards.md`, section "Peralatan untuk korpus Markdown besar".

## Global Constraints

- `site.ts` remains the single source of truth for company identity, contact details, navigation, and shared settings.
- ZERO CONSULTATION: no public-facing content may use `konsult*` or `consult*`. `CONTENT-013` already enforces this, so the terminology check must not duplicate those diagnostics.
- No internal development-status, service-availability, or self-audit copy in public content.
- Editorial entries are frontmatter-only; a Markdown body is rejected by `CONTENT-014`.
- Structural Markdown rules use the `remark-parse` AST, never line-based regex.
- No new dependencies. Use only dependencies already in `package.json` and Node built-ins.
- `lastmod` continues to come from content metadata, never build time.
- Phase 1 is report-only: `npm run audit:content` exits 0 for content findings and must not be added to `bash /tmp/opencode/run-gates.sh`.
- Full-text search stays out of scope. `rg` is sufficient for daily work; SQLite FTS5 is only reconsidered if a search UI is built.
- Build/checksum/deploy optimisation is out of scope. This plan does not add a checksum manifest or change `rsync` behaviour.

## Review Focus

- A draft or EN entry sharing a slug with an ID entry must remain a distinct record, otherwise parity and orphan counts silently collapse. Pinned in Task 1 record tests.
- Redirect stub HTML (`http-equiv="refresh"`) and `404.html` must not count as addressable built routes. Pinned in Task 3 route tests.
- Internal links with a `#fragment` must be checked against `id` attributes in the target HTML, not merely against the target route. Pinned in Task 3 anchor tests.
- `konsult`/`consult` must not be reported twice by terminology and `CONTENT-013`. Pinned in Task 4 terminology tests.
- Missing directories in the collections registry (for example `src/content/certifications`) must not crash the inventory. Pinned in Task 1 empty-directory test.

---

### Task 1: Shared types and content inventory loader

**Files:**
- Create: `src/lib/content-audit-types.ts`
- Create: `src/lib/content-inventory.mjs`
- Test: `tests/content-inventory.test.mjs`

**Interfaces:**
- Consumes: `editorialCollections` from `src/data/collections.ts`, `parse` from `yaml`, `glob` from `tinyglobby`.
- Produces:
  - `collectContentRecords(root: string): Promise<ContentRecord[]>`
  - `collectBuiltPages(dist: string): Promise<BuiltPage[]>`
  - `routeForRecord(record: ContentRecord): string | null`
- Shared types exported from `src/lib/content-audit-types.ts`:
  - `ContentRecord = { path: string; collection: string; slug: string; lang: "id" | "en"; translationKey: string; draft: boolean; title: string; intro: string; metaDescription: string; pubDate: string | null; updatedDate: string | null; wordCount: number; featuredImage: string | null; links: string[] }`
  - `BuiltPage = { route: string; html: string }`
  - `AuditIssue = { rule: string; path: string; reason: string }`

- [ ] **Step 1: Write failing tests for record extraction**

Create a temporary fixture with a published ID page (`slug: home`), an ID/EN pair (`slug: about-us`, shared `translationKey`), and one draft article. Assert that `collectContentRecords(fixtureRoot)` returns one record per file, that `draft` is `true` only for the article, that `links` contains `href` from `link-grid.items[]` and `url` from `cta.link`, that `wordCount` is greater than zero, and that no record is dropped because a collection directory is absent.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --import tsx --test tests/content-inventory.test.mjs`
Expected: FAIL because the modules do not exist yet.

- [ ] **Step 3: Implement the types and loader**

Implement the three interfaces above. Glob `**/*.{md,mdx}` under every `editorialCollections[].dir`, skipping directories that do not exist. Parse frontmatter with `yaml`. Count words by splitting `intro` plus all `title`, `description`, `question`, `answer`, and `steps[].description` strings on whitespace. Build routes as: page `home` → `/` or `/en/`; other pages → `/${slug}/` or `/en/${slug}/`; services → `/services/${slug}/` or `/en/services/${slug}/`; articles → `/articles/${slug}/`; training → `/trainings/${slug}/`. Return `null` for collections without a public route. For `collectBuiltPages`, walk `dist/**/*.html`, skip files containing `http-equiv="refresh"` and `404.html`, and derive `route` from the canonical link when present, otherwise from the path relative to `dist`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --import tsx --test tests/content-inventory.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content-audit-types.ts src/lib/content-inventory.mjs tests/content-inventory.test.mjs
git commit -m "feat: add content inventory loader"
```

### Task 2: Translation parity check

**Files:**
- Create: `src/lib/content-parity.mjs`
- Test: `tests/content-parity.test.mjs`

**Interfaces:**
- Consumes: `ContentRecord[]` from Task 1.
- Produces: `findParityIssues(records: ContentRecord[]): AuditIssue[]`.

- [ ] **Step 1: Write failing tests for parity rules**

Using plain `ContentRecord` objects, assert: `PARITY-001` for a `translationKey` with only an EN record; `PARITY-002` for a key with only an ID record; `PARITY-003` when both records exist but `draft` differs; `PARITY-004` when both exist but one has an empty `metaDescription` or `featuredImage`. Assert that a complete pair produces no issues.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --import tsx --test tests/content-parity.test.mjs`
Expected: FAIL because the module does not exist yet.

- [ ] **Step 3: Implement the parity rules**

Implement `findParityIssues`. Group records by `translationKey`. Keep drafts in the groups so draft-status mismatches are visible. Emit one issue per key per failed rule, using the record path in `path` and a reason that names the missing counterpart or field. Do not require every ID record to have an EN counterpart as a blocking condition; this phase only reports it.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --import tsx --test tests/content-parity.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content-parity.mjs tests/content-parity.test.mjs
git commit -m "feat: add translation parity audit"
```

### Task 3: Internal link, anchor, and orphan checks

**Files:**
- Create: `src/lib/content-links.mjs`
- Test: `tests/content-links.test.mjs`

**Interfaces:**
- Consumes: `ContentRecord[]` and `BuiltPage[]` from Task 1, plus `navigationHrefs: string[]` supplied by the CLI.
- Produces:
  - `findBrokenSourceLinks(records: ContentRecord[], builtRoutes: Set<string>): AuditIssue[]`
  - `findMissingAnchors(records: ContentRecord[], builtPages: BuiltPage[]): AuditIssue[]`
  - `findOrphanPages(records: ContentRecord[], builtPages: BuiltPage[], navigationHrefs: string[]): AuditIssue[]`

- [ ] **Step 1: Write failing tests for link rules**

Build a fixture with two built pages (`/services/` and `/articles/`), one redirect stub, and records linking to a missing route, to `/services/#nonexistent`, and to no other page. Assert `LINK-001` for the missing route, `LINK-002` when the fragment is absent from the target HTML id set, and `LINK-003` for a built page with no incoming record or navigation link. Assert the redirect stub is never reported as orphan.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --import tsx --test tests/content-links.test.mjs`
Expected: FAIL because the module does not exist yet.

- [ ] **Step 3: Implement the link rules**

Implement the three interfaces. Ignore absolute `http(s)` URLs and `mailto:`, `tel:`, `javascript:`, `data:` schemes. Normalise internal hrefs by stripping query and fragment, then ensuring exactly one leading and trailing slash. For `LINK-002`, collect `id="..."` values from the target HTML and require the fragment to match. For `LINK-003`, count a page as linked when any published record links to it or when `navigationHrefs` contains its route. External link checking is explicitly not implemented in this phase.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --import tsx --test tests/content-links.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content-links.mjs tests/content-links.test.mjs
git commit -m "feat: add internal link audit"
```

### Task 4: Duplicate and terminology checks

**Files:**
- Create: `src/lib/content-duplicates.mjs`
- Create: `src/lib/content-terminology.mjs`
- Create: `scripts/content-audit.config.json`
- Test: `tests/content-duplicates.test.mjs`
- Test: `tests/content-terminology.test.mjs`

**Interfaces:**
- Consumes: `ContentRecord[]` from Task 1 and the JSON config.
- Produces:
  - `findDuplicateIssues(records: ContentRecord[], config: { nearDuplicateThreshold: number; allowlist: string[] }): AuditIssue[]`
  - `findTerminologyIssues(records: ContentRecord[], config: { preferredTerms: string[]; variants: Array<{ pattern: string; suggestion: string }> }): AuditIssue[]`
- Config shape: `nearDuplicateThreshold: 0.8`, empty `allowlist`, `preferredTerms` containing `sertifikasi`, `audit`, `penilaian kesesuaian`, and an empty `variants` array. `preferredTerms` is informational; only `variants` produces issues.

- [ ] **Step 1: Write failing tests for duplicate rules**

Assert `DUP-001` for two published records with the same `title`, `DUP-002` for identical `intro`, `DUP-003` for identical `metaDescription`, and `DUP-004` for two different intros whose word-token Jaccard similarity is at or above the configured threshold. Assert allowlisted paths suppress their issues and that draft records are excluded.

- [ ] **Step 2: Write failing tests for terminology rules**

Assert `TERM-001` when a configured variant pattern matches a record's `intro`. Assert that the string `konsultasi` does **not** produce a `TERM-001` issue when it is absent from the config, because `CONTENT-013` owns that rule. Assert that `preferredTerms` alone produces no issues.

- [ ] **Step 3: Run both tests to verify they fail**

Run: `node --import tsx --test tests/content-duplicates.test.mjs tests/content-terminology.test.mjs`
Expected: FAIL because the modules do not exist yet.

- [ ] **Step 4: Implement the duplicate check**

Implement `findDuplicateIssues` with Jaccard similarity over lowercased word tokens split on non-alphanumeric characters. Emit one issue per pair per rule with both record paths in `reason`. Exclude drafts and honour the allowlist.

- [ ] **Step 5: Implement the terminology check and config**

Implement `findTerminologyIssues` as a regex scan over `title`, `intro`, and `metaDescription` using `variants[].pattern` with case-insensitive matching. Create `scripts/content-audit.config.json` with `nearDuplicateThreshold: 0.8`, empty `allowlist` and `variants`, and `preferredTerms` containing `sertifikasi`, `audit`, `penilaian kesesuaian`. Keep `konsult`/`consult` out of the config.

- [ ] **Step 6: Run both tests to verify they pass**

Run: `node --import tsx --test tests/content-duplicates.test.mjs tests/content-terminology.test.mjs`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/content-duplicates.mjs src/lib/content-terminology.mjs scripts/content-audit.config.json tests/content-duplicates.test.mjs tests/content-terminology.test.mjs
git commit -m "feat: add duplicate and terminology audit"
```

### Task 5: Report aggregator and `audit:content` script

**Files:**
- Create: `src/lib/content-report.mjs`
- Create: `scripts/audit-content.mjs`
- Create: `tests/audit-content-cli.test.mjs`
- Modify: `package.json`
- Modify: `docs/content-editorial-standards.md`

**Interfaces:**
- Consumes: all Task 1-4 modules, `primaryNavigation` and `footerNavigation` from `src/site.ts`, and `scripts/content-audit.config.json`.
- Produces:
  - `buildContentReport(root: string, dist: string): ContentReport` where `ContentReport = { sections: Array<{ title: string; lines: string[] }>; issues: AuditIssue[] }`.
  - CLI signature: `node --import tsx scripts/audit-content.mjs [root] [dist]`, defaulting `root` to the repository root and `dist` to `<root>/dist`.

- [ ] **Step 1: Write failing tests for the report shape**

Using a fixture root and dist, assert that `buildContentReport` returns sections titled `Inventory`, `Translation parity`, `Links`, `Duplicates`, and `Terminology`; that every issue line begins with its rule code in brackets; that the Inventory section contains counts per collection and language; and that `issues` contains every issue shown in the sections. Spawn the CLI as `node --import tsx scripts/audit-content.mjs <fixtureRoot> <fixtureDist>` and assert exit 0 even when issues exist; spawn it with a missing dist path and assert exit 1.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --import tsx --test tests/audit-content-cli.test.mjs`
Expected: FAIL because the modules do not exist yet.

- [ ] **Step 3: Implement the report builder**

Implement `buildContentReport` by calling the four audit modules once and formatting their results. Pass all navigation hrefs from `primaryNavigation` and `footerNavigation` to `findOrphanPages`. Format each issue line as `[RULE] path: reason`.

- [ ] **Step 4: Implement the CLI and package script**

Create `scripts/audit-content.mjs` with the `[root] [dist]` arguments from the Interfaces block. It prints each section with a count and returns 0 for content findings; it returns 1 only for a missing `dist` directory or an exception. Add `"audit:content": "node --import tsx scripts/audit-content.mjs"` to `package.json` scripts.

- [ ] **Step 5: Document the command**

Under the tooling section of `docs/content-editorial-standards.md`, add the `npm run audit:content` command and state that it is report-only in this phase and does not affect build or deploy gates.

- [ ] **Step 6: Run the CLI test to verify it passes**

Run: `node --import tsx --test tests/audit-content-cli.test.mjs`
Expected: PASS.

- [ ] **Step 7: Run the existing gates and the new report**

Run: `bash /tmp/opencode/run-gates.sh`
Expected: `ALL_GATES_OK`, with existing test count unchanged by this plan.

Run: `npm run audit:content`
Expected: exit 0 and a printed report with all five sections.

- [ ] **Step 8: Commit**

```bash
git add src/lib/content-report.mjs scripts/audit-content.mjs tests/audit-content-cli.test.mjs package.json docs/content-editorial-standards.md
git commit -m "feat: add report-only content audit command"
```

## Deferred work (not in this plan)

- Promoting `LINK-001`, exact duplicate rules, and `PARITY-004` to build-blocking gates after the first report is reviewed.
- Adding an optional `--external` flag for external link checking.
- Extending `scripts/audit-seo-build.mjs` with source-level link checks once the report baseline is clean.
- Any checksum manifest or incremental build/deploy optimisation.
