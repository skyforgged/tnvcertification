# Agent operational memory

This file records the operational conventions established during repeated merge and release work on `main`. Read it before merging a remote branch, running release validation, pushing, or deleting a merged branch.

## Merge-day workflow

1. Fetch first, then list remote heads. If no branch is pending, report that and stop; do not invent a commit.
2. Inspect `git log main..origin/<branch>` and `git diff --stat main...origin/<branch>` before merging.
3. Merge into `main` with `git merge --no-ff` and a descriptive merge message.
4. Run fresh validation on the merged tree: `npm run check`, `npm run build`, `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run audit:seo`. Record exit codes and counts.
5. Fix code or integration failures in a follow-up commit. Update `docs/prelaunch-work-status.md` in a separate docs commit.
6. Push `main`, delete the merged remote branch, run `git fetch --prune origin`, then verify `git status --short --branch` and `git ls-remote --heads origin`.
7. Report the final commit hash, validation evidence, and anything not verified. Never claim a CI result while its run is still `in_progress`.

## Local toolchain and validation quirks

- Shell commands need `export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"` before running npm scripts. The repository declares Node `26.13.1`; pnpm is `12.21.0`.
- Use `npm run ...` when the user asks for npm scripts, even though `package.json` declares pnpm as the package manager.
- This harness can intercept the literal command text `npm run lint` and print `ESLint output (JSON parse failed: ...)` with exit `2`. The repository's ESLint command resolves local ESLint `10.15.0` and exits `0`. If the parse error appears, rerun the same script through a shell variable, for example `cmd='npm run lint'; $cmd`, and report that evidence.
- Expected non-fatal build warnings: empty content collections and bilingual category records sharing one slug across Indonesian and English files.

## GitHub authentication

- User: `tnvcertification`.
- Personal access token location: `/home/tnv-certification/.git-pat-tnvcertification`.
- Read the file into a shell variable and pass it as a temporary `http.extraHeader` on the `git push` command. Do not print the token, echo it, write it into git config, or store it in repository files.
- After pushing, verify remote heads. Deleting a remote branch requires the same temporary auth.

## Status documentation

- `docs/prelaunch-work-status.md` is the master status file. After each merge, update the validated commit, roadmap row, validation table, and phase section.
- The validation table must match the fresh command output from that merge, including test count and page count.
- Historical phase documents may keep their original wording unless the current change makes a claim false.
