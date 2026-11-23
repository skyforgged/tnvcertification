# Design: Semantic classes for training-detail schedule rows

## Intent

Every schedule row rendered on `/trainings/<slug>/` currently consists of Tailwind utility classes plus `data-*` hooks used by the month-filter script. There is no stable, named class for individual parts such as the date, location, or registration text, so feedback like "make the date a link" has no precise target. This change adds those named hooks only.

## Goals

- Each schedule element in `src/components/page/TrainingScheduleMonths.astro` exposes a descriptive semantic class in addition to its existing utilities and `data-*` attributes.
- The date text stays plain text for now; the class makes a later anchor change a one-line edit.
- No visual or behavioral change: no new CSS rules, design tokens, copy, or dependencies.

## Non-goals / anti-goals

- No `/schedules/<slug>/` detail route and no date anchors in this change.
- No changes to `/schedules/` archive or the “Pelatihan Terdekat” section.
- Do not add the audited `block-section` class — this component is not a content block.
- Do not remove or rename the `data-*` attributes consumed by the month-filter JS and existing tests.

## Approaches

1. **Named classes on each element (chosen).** Add a `training-schedule-*` class to every rendered part. Cheap, explicit, and gives a stable address for future edits. Utilities remain for styling, so appearance is unchanged.
2. **Document the existing `data-*` hooks instead.** No markup change, but the user explicitly asked for semantic classes; data attributes are JS state, not presentation hooks. Rejected.
3. **Apply the same classes across the archive and upcoming sections.** More consistent globally, but broader than the current request and would touch audited route markup. Deferred.

## Decisions

- Flat, hyphenated names using one `training-schedule-` prefix, matching the repo’s existing `block-section--*` naming style rather than introducing BEM double underscores.
- Class inventory:
  - `training-schedule-months` — component root
  - `training-schedule-month-list`, `training-schedule-month-button`, `training-schedule-month-count` — month selector
  - `training-schedule-summary`, `training-schedule-show-past` — status bar
  - `training-schedule-month-group`, `training-schedule-month-heading` — monthly group
  - `training-schedule-item` — one session row
  - `training-schedule-date`, `training-schedule-location`, `training-schedule-venue`, `training-schedule-status`, `training-schedule-price`, `training-schedule-quota`, `training-schedule-register` — row fields
  - `training-schedule-empty`, `training-schedule-note` — empty state and footer note
- Use plain `class` for static elements and `class:list` where a class must be combined with conditional utilities.
- Tests: extend `tests/training-schedule-months.test.mjs` with source-marker assertions for the class inventory (repo’s established pattern), then spot-check built HTML for the classes. No new test framework.

## Constraints

- Keep the month-filter JS, labels, locale handling, and `data-*` contract intact.
- Keep zero `konsult*`/`consult*` wording and no hardcoded site-wide copy or hex colors.
- Re-run `npm test`, `npm run check`, `npm run lint`, `npm run build`, and the four build audits; redeploy the same docroot with a timestamped backup and leave the vhost untouched.
