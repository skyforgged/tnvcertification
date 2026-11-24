import assert from "node:assert/strict";
import test from "node:test";
import { contentValidationIntegration } from "../src/content-validation.ts";

test("content validation accepts all public-facing copy and components", async () => {
  await assert.doesNotReject(
    contentValidationIntegration.hooks["astro:build:done"](),
  );
});
