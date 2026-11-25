# Frontmatter schema selection for content sections — design

## Intent

Let an editor declare, in the content entry itself, which Schema.org
representation a `content-section` block uses. The human partner's reasoning:
the Markdown entry carries content for readers and platforms, while the
`schema.org` block is the machine-facing half for Google and other search
engines — both belong in the same place. Concretely, the section
**“Tujuan dan kompetensi yang dikembangkan”** on the FSSC 22000 internal-auditor
training should be marked as `ItemList` instead of the default generic section
node.

## Goals

- Optional `schema` field on `content-section` blocks in validated frontmatter.
- Allowed values limited to `WebPageElement` (default) and `ItemList`.
- For `ItemList`, the section keeps its `WebPageElement` node and its DOM-matching
  `@id`, with `hasPart` holding one `ItemList` whose `itemListElement` entries
  are `ListItem` with `position`, `name`, and `description` mirrored from the
  visible items.
- Entries without the field keep today's behavior unchanged.

## Non-goals

- No change to `BlockRenderer.astro`, `Layout.astro`, page title, meta
  description, H1, or editorial copy.
- No new dependency, no new content collection.
- No push, PR, deploy, tag, or vhost work.

## Constraints

- `site.ts` remains the single source of truth; structured data mirrors visible
  content; no `konsult*`/`consult*` or internal service-status copy.
- The field is validated by the content collection Zod schema: an invalid value
  fails the build, it is not silently ignored.
- Existing content without `schema` must produce byte-identical JSON-LD.

## Approaches

1. **Nested `ItemList` in `hasPart` (chosen).** One section node, stable anchor,
   `hasPart` becomes a single `ItemList` with numbered `ListItem`s. Preserves the
   `@id`-equals-DOM invariant and backward compatibility; reflects the rendered
   01–05 numbering as `position`.
2. **Multi-typed section node** `@type: ["WebPageElement", "ItemList"]` with
   `itemListElement` on the node itself. Shorter, but Google may ignore one of
   the two types, and it changes the node's `@type` for that section.
3. **Separate `ItemList` node** with its own `@id`. Would require adding an `id`
   to the rendered `<ul>` in `BlockRenderer.astro` for anchor parity, touching
   the template — rejected as out of scope.

## Design

- `src/content.config.ts`: add
  `schema: z.enum(["WebPageElement", "ItemList"]).optional()` to
  `contentSectionBlock`, alongside `layout`.
- `src/lib/structured-data.ts`: inside `blockGraphNodes()`, keep the existing
  section node and `@id`; build `hasPart` conditionally —
  - `block.schema === "ItemList"`: one `ItemList` object with
    `itemListElement: block.items.map((item, i) => ({ "@type": "ListItem",
    position: i + 1, name: item.title, description: item.description }))`;
  - otherwise: the current array of `CreativeWork` entries.
  - Omit `hasPart` when `items` is absent or empty.
- `src/content/training/pelatihan-auditor-internal-fssc-22000.md`: add
  `schema: ItemList` only to the `tujuan-dan-kompetensi-peserta` block.
- Regression tests cover the new representation, the unchanged default, and the
  Zod enum. The standard gate `bash /tmp/opencode/run-gates.sh` runs before any
  commit.

## Left to the implementer

- Exact TypeScript shape of the conditional `hasPart` value, following the
  local `unknown[]` / `Record<string, unknown>` convention.
- Confirm through the build that the edited Markdown entry still passes content
  validation and heading/image audits.
