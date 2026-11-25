import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "yaml";

const workflow = parse(
  await readFile(new URL("../.github/workflows/quality.yml", import.meta.url), "utf8"),
);

test("production build runs before tests that read dist", () => {
  const steps = workflow.jobs.validate.steps;
  const buildIndex = steps.findIndex((step) => step.run === "pnpm build");
  const testIndex = steps.findIndex((step) => step.run === "pnpm test");
  assert.notEqual(buildIndex, -1, "quality workflow has no production build step");
  assert.notEqual(testIndex, -1, "quality workflow has no test step");
  assert.ok(buildIndex < testIndex, "pnpm build must run before pnpm test because built-page tests read dist/");
});
