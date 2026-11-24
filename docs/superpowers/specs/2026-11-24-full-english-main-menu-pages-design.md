# Full English main-menu pages — design

**Date:** 2026-11-24
**Status:** Approved
**Size:** Project
**Selected approach:** Full English surfaces for Trainings, Schedules, Articles and their published details.

## Intent

A visitor who chooses English must be able to use every main-menu item without being sent to an Indonesian page. Today four of seven menu items have real English pages. Pelatihan, Jadwal, and Artikel still point at Indonesian URLs. Their `/en/...` paths are generated redirect stubs with `http-equiv="refresh"`.

The owner chose the full option: translate the published training and article details too, and render schedules in English. This is an editorial and routing change, not only a navigation change.

## Goals

- Real, indexable English pages for:
  - `/en/trainings/` and `/en/trainings/<slug>/`
  - `/en/schedules/`
  - `/en/articles/`, `/en/articles/page/<n>/`, and `/en/articles/<slug>/`
- English main-menu labels and `hrefEn` values for Pelatihan, Jadwal, Artikel.
- Reciprocal `hreflang` pairs and language-switch counterparts for every new page.
- English UI copy on cards, pagination, schedule status, and schedule venue labels.
- Full English editorial content for every published Indonesian training and article, paired by `translationKey`.
- Sitemap lastmod from the English entry metadata, never build time.
- Structured data that matches visible English content and local URLs.
- One unique `featuredImage` per published page, as required by `audit:page-images`.

## Non-goals

- Translating service details beyond the existing English ISO 14001:2026 service. Menu item Layanan already has a real English index; other service cards may still lead to Indonesian details.
- Changing dates, venues, prices, quotas, or any schedule record. Schedules are shared data; only their presentation language changes.
- Rewriting existing Indonesian content. English entries are new paired records.
- Publishing the P16 document-control draft pair. Both records stay unpublished until an owner approves their technical review, dates, image, and canonical slug.
- New dependencies or a UI framework. Existing Astro components and Tailwind stay.
- Consulting, implementation-support, development-status, availability, or self-audit copy in public content.

## Constraints

- `src/site.ts` stays the single source of truth for navigation labels, hrefs, and shared UI copy.
- Editorial copy stays in validated content collections; `.astro` files only resolve entries and pass data.
- Page entries require a positive numeric `id`; filename prefix, frontmatter `id`, and loader id must agree.
- English intro starts with the title followed by `is`. English image alt uses `is` and is shorter than the intro. Indonesian entries keep `adalah`.
- Every published entry needs a unique `metaDescription`, a single `featuredImage`, and a valid heading hierarchy without skipped levels.
- `buildEnglishFallbackPaths()` emits a redirect stub for every published Indonesian path that is not registered as a real English path.
- Existing article and training collections use the default glob loader id, so an English entry with the same slug as its Indonesian pair would overwrite it.
- Current counts: 14 published Indonesian trainings, 9 published Indonesian articles, and one unpublished bilingual document-control pair (`0010-pengendalian-dokumen-iso-9001-id.md` and `0011-iso-9001-document-control-en.md`).
- Both document-control records are `draft: true`. Docs `p16-2-article-integration-readiness.md` and `p16-3-bilingual-article-integration-audit.md` state that no publication date or featured image has been approved for them.
- The draft pair has different slugs by historical proposal. It is paired by `translationKey` only. Publishing it would require an owner decision on the canonical slug, dates, and image.

## Approaches considered

1. **Index pages only.** Add English trainings, schedules, and articles index routes. Cards still link to Indonesian details. Rejected: a visitor still leaves English on the next click.
2. **Mixed-language details.** English headings with Indonesian body text. Rejected: violates the bilingual content standard and misleads readers.
3. **Full English details.** Translate published trainings and articles, localize schedule presentation, and keep every main-menu click inside `/en/`. Chosen by the owner.

## Design

### Identifiers and content pairs

- Add a positive numeric `id` to every `articles` and `training` entry. Set `generateId: ({ data }) => String(data.id)` for both collections so Indonesian and English entries with the same `slug` coexist.
- Keep `slug` and `translationKey` identical inside every newly created language pair. `lang` distinguishes the variant. The existing document-control draft pair is exempt because it stays unpublished.
- For each new English translation, reuse the paired Indonesian `pubDate` and `updatedDate`. Do not invent a new publication date. Using the source date keeps pair parity and preserves sitemap accuracy.
- Leave both document-control draft records untouched apart from any collection-wide id migration. They remain excluded from routes, indexes, sitemap, and hreflang output.
- Create English `pages` entries for `trainings`, `schedules`, and `articles` with numeric ids continuing after 37, matching filename prefixes. Each entry carries a hero block, English intro, unique metadata, and a new illustration.

### Routes and shared logic

- Add dedicated English routes; do not add these slugs to the generic `[slug].astro` set.
- Extract shared training-detail label construction into a pure module so ID and EN routes use the same logic with different language output. Avoid copying the long label object.
- Add a language-aware article selector: `getPublishedArticles(lang = "id")` keeps current callers unchanged; English routes pass `"en"`. Homepage and service article sections stay Indonesian.
- Make article and training detail alternate paths language-aware in both ID and EN routes.
- Extend `locale-switch.ts` with training and article detail path handling so pairs resolve to `/en/...` and language options report a missing translation only when no pair exists.
- Register all new English paths through the existing `existingEnglishPaths` input so fallback stubs disappear, including article pagination pages.
- Extend sitemap lastmod mapping for English article and training records.

### Presentation

- Reuse `WidePageLayout`, `PageHero`, `ScheduleArchiveLayout`, `TrainingLayout`, `ArticleLayout`, and existing cards.
- English routes pass `lang="en"` to every layout and block renderer, including hero and FAQ auto-headings.
- Schedule status, location, pagination labels, and empty-state copy come from a shared English label set in `site.ts` or a small typed module. No hardcoded company-wide strings in routes.

### Images

- Generate one original SVG per new page hero and per English training/article detail, convert to WebP with the documented `sharp-cli` pipeline, and register each asset in `docs/illustration-library/asset-register.md`.
- Rebuild the conversion manifest so changed-content preflight does not re-convert assets.

### Validation

- Add failing tests before implementation for: language-aware selectors, alternates, language switch counterparts, fallback exclusion, EN lastmod, and built HTML nav links.
- Run the full gate on the merged tree: `pnpm check`, `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm audit:seo`, `pnpm audit:blocks`, `pnpm audit:page-images`, `pnpm audit:headings`.
- Inspect built HTML for the new English canonicals, reciprocal alternates, English menu hrefs, and absence of refresh stubs on real pages.

## Commits

Keep separate commits, one per logical unit, in this order:

1. Shared routing, ids, selectors, language switch, nav hrefs, fallback exclusion.
2. English trainings index and translated training details.
3. English schedules index.
4. English articles index, pagination, and translated article details.
5. Documentation and validation updates.

Each commit must pass the focused tests relevant to its unit. The last commit includes the full gate evidence.

## Decisions made during review

These are builder calls, not owner decisions:

- The P16 document-control pair stays unpublished. No dates or image are invented.
- New English translations reuse the paired Indonesian dates. No fresh translation date is manufactured.
- New language pairs use the same slug in both locales. The existing draft pair keeps its historical slugs because it is not published.
- One shared typed label module supplies English UI copy for training and schedule routes. This avoids two divergent string sets.

## Left to the builder

- Exact block-by-block English copy per entry, provided it meets the mandatory editorial rules.
- File naming and asset ids for the new illustrations, provided numeric ids and filename prefixes stay aligned.
- Whether to share one label module across training and schedule routes or keep two small typed modules.
