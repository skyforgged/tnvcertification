import assert from "node:assert/strict";
import test from "node:test";

import {
  findHeadingViolations,
  findLocalizedBlockHeadingViolations,
} from "../scripts/audit-heading-hierarchy.mjs";

test("rendered heading audit rejects a downward level skip", () => {
  assert.deepEqual(findHeadingViolations("<h1>A</h1><h3>B</h3>"), ["1 -> 3"]);
});

test("rendered heading audit accepts sequential and returning headings", () => {
  assert.deepEqual(findHeadingViolations("<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2><h3>E</h3>"), []);
});

test("rendered heading audit ignores markup outside heading tags", () => {
  assert.deepEqual(findHeadingViolations("<p>h1</p><div data-level='3'></div>"), []);
});

test("rendered English FAQ blocks reject the Indonesian fallback heading", () => {
  const html = '<html lang="en"><section class="block-section block-section--faq"><h2>Pertanyaan Umum</h2></section></html>';
  assert.deepEqual(findLocalizedBlockHeadingViolations(html), ["faq: Pertanyaan Umum"]);
});

test("rendered English HowTo blocks reject the Indonesian fallback heading", () => {
  const html = '<html lang="en"><section class="block-section block-section--howto"><h2>Proses Sertifikasi</h2></section></html>';
  assert.deepEqual(findLocalizedBlockHeadingViolations(html), ["howto: Proses Sertifikasi"]);
});

test("rendered heading audit accepts correct English auto headings", () => {
  const html = '<html lang="en"><section class="block-section--faq"><h2>Frequently asked questions</h2></section><section class="block-section--howto"><h2>Certification process</h2></section></html>';
  assert.deepEqual(findLocalizedBlockHeadingViolations(html), []);
});

test("rendered heading audit accepts custom English block headings", () => {
  const html = '<html lang="en"><section class="block-section--howto"><h2>Six stages of an internal audit</h2></section><section class="block-section--faq"><h2>Training questions</h2></section></html>';
  assert.deepEqual(findLocalizedBlockHeadingViolations(html), []);
});

test("rendered English FAQ blocks reject other Indonesian headings", () => {
  const html = '<html lang="en"><section class="block-section--faq"><h2>Pertanyaan Umum Sertifikasi</h2></section></html>';
  assert.deepEqual(findLocalizedBlockHeadingViolations(html), ["faq: Pertanyaan Umum Sertifikasi"]);
});

test("rendered heading audit does not localize Indonesian pages", () => {
  const html = '<html lang="id"><section class="block-section--faq"><h2>Pertanyaan Umum</h2></section></html>';
  assert.deepEqual(findLocalizedBlockHeadingViolations(html), []);
});
