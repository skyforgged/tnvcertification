# Node 22 + review fixes — design

## Intent
Make the committed Astro skeleton build with the documented toolchain and close
the Standards/Spec gaps found in commit `4661a15`. User approved the recommended
approach: install Node 22 locally, pin it in the repo, then fix the findings.

## Goals
- Active runtime becomes Node `22.23.4`; `npm run build` passes.
- Repo pins Node and package manager: `.nvmrc`, `.node-version`, `packageManager`.
- Dependency manager becomes pnpm, per `docs/technology-stack.md:8,17`.
- Editorial gate uses parsed Markdown, not raw-text regex.
- Homepage route resolves at `/` and renders real SSOT metadata.
- Content editorial violations from roadmap §3.5 are corrected.
- ESLint config, `astro check`, and `@/*` alias exist.
- SEO/i18n, layout, and small semantic fixes from review are applied.

## Non-goals
- No feature branches or PRs; commit directly to `main`.
- No new UI kit, framework, or heavy client-side dependency.
- No speculative abstractions beyond shared schemas/registry already implied by docs.

## Constraints
- Astro `7.4.13`, TypeScript `7.0.2`, Tailwind `4.0.0` stay pinned.
- Node must be `>=22.23.4`.
- `src/site.ts` remains SSOT; no company-wide value hardcoded elsewhere.
- All mandatory content rules remain hard build errors.
- Work is one focused change set, committed to `main`.

## Approaches
1. Repo-only pin — rejected: build stays broken locally.
2. Local Node 22 tarball + repo pin — chosen: proves build, no distro upgrade.
3. CI-only setup-node — rejected: local build still broken.

## How
- Install Node `22.23.4` tarball to `/opt/node-v22.23.4`; use absolute PATH for
  all npm/pnpm/astro commands in this session.
- Add `.nvmrc` and `.node-version` containing `22.23.4`.
- Enable pnpm via Corepack; set `packageManager`; replace `package-lock.json`
  with `pnpm-lock.yaml`; update scripts/docs if needed.
- Pin exact dependency versions in `package.json`.
- Add `eslint.config.*`, `astro check` script, and `@/*` tsconfig path alias.
- Declare `tinyglobby` and `yaml` as direct dependencies.
- Rename `src/pages/Index.astro` to `index.astro`; fix `organization.title`
  usage by reading `siteSettings.title`; replace `className` with `class`;
  use `bg-cream` token.
- Replace regex heading parsing with Markdown AST parsing; keep CONTENT-001..011
  diagnostics with entry/path, field, rule id, reason, heading text, expected level.
- Add separate `intro` field to article/page schemas; enforce one paragraph
  immediately after H1; enforce alt uniqueness against intro and featured alt.
- Fix or remove duplicate article entries `0002`, `0007`, `0008`, `0009`.
- Add explicit `services` and `categories` collections or remove orphan refs;
  add `serviceSlug` to schedule schema.
- Add SEO metadata, canonical/OG/hreflang, sitemap, `robots.txt`; add
  translation keys; add per-purpose layouts and shared blocks; add article
  discovery sections.

## Left to builder
Sequence the work, run checks after each logical group, inspect diff, commit.
