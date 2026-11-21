# GitHub Actions action runtime refresh

## Scope

Refresh workflow action versions to releases that use Node.js 24 internally, removing
the workflow's dependency on the deprecated Node.js 20 action runtime.

- `actions/checkout@v6`
- `pnpm/action-setup@v6`
- `actions/setup-node@v7`

The workflow continues to install project Node.js from `.node-version` (currently
26.13.1) and pnpm 12.21.0. Action runtime versions and the project's Node.js
runtime are separate concerns; this change does not modify project runtime,
package dependencies, or the lockfile.

## Validation

Local validation on `main` at `cf666d3`: `npm run check`, `npm run build`,
`npm run typecheck`, `npm run lint`, `npm run test` and `npm run audit:seo` all
passed with exit `0`; 33 tests passed and 13 pages built.

The `v6`, `v6` and `v7` major tags for `actions/checkout`, `pnpm/action-setup`
and `actions/setup-node` were confirmed to exist. No CI run result was
independently verified locally. Confirm that the GitHub Actions run completes and
that the Node.js 20 deprecation notice is gone after push.
