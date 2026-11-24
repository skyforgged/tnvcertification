# Section anchor structured data — design

## Intent

Make the section **“Teknik mengumpulkan dan mengevaluasi bukti audit”** on
`/trainings/pelatihan-auditor-internal-fssc-22000/` machine-identifiable as a
distinct part of the page. The goal is on-page only: every rendered section
should contribute a stable `@id` to the JSON-LD graph, with the graph itself
assembled in the Astro layout. No title, meta description, or H1 changes.

This is structural metadata that mirrors visible content. It is **not** a
ranking guarantee: `HowTo` and `FAQPage` rich results are retired, and generic
section nodes are not a Google-supported search feature.

## Goals

- One node per rendered block with a stable anchor, referenced from
  `WebPage.hasPart`.
- The node `@id` fragment must equal the DOM `id` of the `<section>` it
  describes.
- Existing `FAQPage` / `HowTo` nodes remain; only their `@id` fragments are
  aligned with the rendered anchor.
- The layout stays the single place that builds and serialises the graph.

## Non-goals

- No new pages, no internal links from other pages, no off-page work.
- No change to page title, meta description, H1, or editorial copy.
- No conversion of `content-section` blocks into `howto` blocks.
- No new dependency or new content collection.

## Constraints

- Content stays in validated collections; block ids are already governed by
  `src/lib/block-ids.ts` and CONTENT-014 duplicate-id validation.
- `site.ts` remains the SSOT for company facts.
- Structured data must mirror visible content; no fabricated fields.
- Public content must not contain `konsult*`/`consult*` or internal
  service-status copy. This change touches no editorial copy.

## Approaches considered

1. **Per-block schema in the layout graph (chosen).** Extend
   `src/lib/structured-data.ts` to emit a section node for each block with a
   stable anchor, using the same `blockAnchorId()` helper as the renderer.
   Tradeoff: valid descriptive metadata, but no confirmed search ranking
   benefit.
2. **Convert the section to a `howto` block.** Rejected: the section is a set
   of techniques, not an ordered procedure, and Google no longer shows HowTo
   rich results.
3. **Change title/meta/H1 to include the phrase.** Rejected by the human
   partner; out of scope for this change.

## Design

- `src/lib/structured-data.ts`: in the existing block loop, compute
  `anchor = blockAnchorId(block, index)` and use
  `@id = ${url}#${anchor}` for all block-derived nodes.
- For `content-section` blocks, emit one node:
  `@type: WebPageElement`, `@id`, `name` from `block.title` (fallback
  `block.eyebrow`), `description` from `block.description`, and `hasPart` from
  `block.items` when present. Each part is a `CreativeWork` with `name` and
  `description` mirrored from the visible item.
- Keep `FAQPage` and `HowTo` nodes unchanged except for the `@id` fragment,
  which becomes the shared anchor.
- Push every block node reference into `pageParts`, already consumed as
  `WebPage.hasPart`.
- `src/layouts/Layout.astro` is unchanged: it still calls
  `pageJsonLdGraph()` and writes the single JSON-LD script tag.
- `src/components/BlockRenderer.astro` is unchanged: it already sets
  `id={blockAnchorId(block, index)}` on each `<section>`.

## Tests

- Regression test: every block with an id produces a node whose `@id` fragment
  equals the DOM anchor, including the `teknik-pelaksanaan-audit` section.
- Regression test: FAQ/HowTo `@id` fragments match their rendered section ids.
- Regression test: no node is emitted for a block without a stable anchor, and
  no unsupported fields are fabricated.
- Existing structured-data tests must still pass; run the standard gate
  `bash /tmp/opencode/run-gates.sh` before any commit or deploy.

## Left to the implementer

- Exact TypeScript node types for the generic section node, following the
  local `unknown[]` convention already used by `structuredData` props.
- Whether to add the in-page jump link described in the earlier discussion;
  that is a separate on-page change and is not part of this design.
