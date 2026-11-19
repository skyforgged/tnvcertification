# Git Workflow

## Default
- Main working branch: `main`.
- Commit agreed changes directly to `main`.
- Pull Requests and separate feature branches are not required by default.
- Use branches/PRs only when explicitly requested or needed for a specific risk or operation.

## Routine change process
1. Inspect repository status and relevant files.
2. Confirm scope and conventions.
3. Make focused changes; avoid unrelated modifications.
4. Run available checks (typecheck, lint, build, tests). If checks cannot run, disclose that.
5. Commit directly to `main) with a clear descriptive message.
6. Report files changed, checks performed, and commit SHA.

## Commit messages
Use action-oriented messages, with conventional prefixes when useful:
- `docs: update technology stack standards`
- `feat: add bilingual training schedule`
- `fix: correct language switcher routes`
- `refactor: simplify content block renderer`

## Safety
- Never force-push, rewrite shared history, delete files, or alter secrets without explicit authorization.
- Do not say a change is committed or deployed until verified.
- Git commit and production deployment are separate; verify deployment before claiming a change is live.
