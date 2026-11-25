import assert from "node:assert/strict";
import test from "node:test";
import { pageAlternates } from "../src/lib/page-alternates.ts";

const origin = "https://tnv-certification.com";

test("pageAlternates emits reciprocal absolute alternates", () => {
  assert.deepEqual(pageAlternates("home"), [
    { lang: "id", href: `${origin}/` },
    { lang: "en", href: `${origin}/en/` },
  ]);
  assert.deepEqual(pageAlternates("about-us"), [
    { lang: "id", href: `${origin}/about-us/` },
    { lang: "en", href: `${origin}/en/about-us/` },
  ]);
  assert.deepEqual(pageAlternates("trainings"), [
    { lang: "id", href: `${origin}/trainings/` },
    { lang: "en", href: `${origin}/en/trainings/` },
  ]);
});

test("pageAlternates ignores unsupported slugs", () => {
  assert.deepEqual(pageAlternates("unknown-page"), []);
});
