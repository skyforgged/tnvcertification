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

GitHub Actions is the authoritative validation for the workflow changes. Confirm
that the run completes and the Node.js 20 deprecation notice is no longer emitted
before merging.
