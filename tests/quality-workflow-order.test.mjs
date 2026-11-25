import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = await readFile(new URL("../.github/workflows/quality.yml", import.meta.url), "utf8");

test("production build runs before tests that read dist", () => {
  const build = workflow.indexOf("run: pnpm build");
  const testStep = workflow.indexOf("run: pnpm test");
  assert.notEqual(build, -1, "quality workflow has no production build step");
  assert.notEqual(testStep, -1, "quality workflow has no test step");
  assert.ok(build < testStep, "pnpm build must run before pnpm test because built-page tests read dist/");
});
