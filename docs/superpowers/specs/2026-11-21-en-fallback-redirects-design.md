# English-to-Indonesian fallback redirects — design

**Date:** 2026-11-21
**Status:** Awaiting approval
**Chosen approach:** A (repo-only generated redirect stubs). Approach C may follow
later if the user finds it necessary.

## Intent

Every public Indonesian URL should have an English-locale address. When no
English page actually exists, that address must redirect to the Indonesian
original instead of returning nginx's 403 (the current `/en/` case) or silently
falling back to the homepage.

## Goals

- `/en/` redirects to `/` instead of returning 403.
- Published Indonesian routes that have no English counterpart get an
  `/en/<path>/` stub that redirects to `/<path>/`.
- Real English pages (`/en/services/` and `/en/services/<en-slug>/`) keep serving
  their own content and are never shadowed by a stub.

## Non-goals

- No HTTP 301 status and no vhost change. Stubs are `200` + `<meta refresh>`,
  matching the site's existing `/service/`, `/schedule/`, and `/hal-about-us/`
  redirects. Approach B/C would be needed for real 301s.
- No change to Indonesian routes, content entries, draft states, or `src/site.ts`.
- No English article/training pages are created; only redirect stubs.

## Constraints

- `src/site.ts` stays the single source of truth for canonical URLs.
- Each collection keeps its existing published/draft filtering rules.
- A generated stub must never overwrite or duplicate a real English page.
- Article pagination counts must stay in sync with the published article set.

## Approaches considered

1. **A — Repo-only generated stubs (chosen).** A catch-all page under `/en/`
   generates one redirect stub per Indonesian route lacking an English page,
   plus an explicit `/en/` redirect. Ships in the repo/PR; no server access
   needed. Trade-off: 200 + meta refresh, not a 301.
2. **B — Vhost-only rewrite.** `location ^~ /en/` with `try_files` and a named
   location rewriting to the path without `/en`. True 301 and covers arbitrary
   paths, but lives outside the repo and cannot go upstream.
3. **C — Hybrid.** A plus B. Most complete, but split across two places.

## Design

1. `src/lib/locale-fallback.ts` — pure builder. Given typed lists of pages,
   services, articles, trainings, and an article page count, it returns absolute
   Indonesian paths. It excludes drafts and English entries and never emits an
   `/en/`-prefixed path. Unit-testable without Astro.
2. `src/data/locale-fallback.ts` — gathers the data from the existing shared
   queries/collections and calls the pure builder; subtracts routes that already
   have a real English page.
3. `src/pages/en/[...path].astro` — `getStaticPaths` maps each fallback path to
   a stub. Stub markup mirrors Astro's built-in redirect output: `<meta
   http-equiv="refresh">`, `<meta name="robots" content="noindex">`, and a
   canonical pointing at the Indonesian target.
4. `astro.config.mjs` — add `"/en/": "/"` to `redirects`. The catch-all needs at
   least one path segment, so the locale root needs its own entry.
5. Tests — cover Indonesian entries included, drafts and English entries
   excluded, existing English routes excluded, pagination count, and clean
   absolute paths.

## Builder decisions

- Static index paths are one explicit constant: `/services/`, `/trainings/`,
  `/schedules/`, `/articles/`, `/csms/`.
- `/about-us/` is read from the `pages` collection, not hardcoded.
- Detail paths come from the same collection queries the real Indonesian pages
  use, so a newly published item gains its fallback on the next build.
- Redirect stubs use `lang="id"` because their destination is Indonesian; their
  only visible content is the fallback link.
