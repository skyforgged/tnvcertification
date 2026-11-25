import assert from "node:assert/strict";
import test from "node:test";
import {
  blockAnchorId,
  findDuplicateBlockIdIndexes,
  slugifyBlockId,
  validateBlockIds,
} from "../src/lib/block-ids.ts";

test("slugifyBlockId removes diacritics and punctuation", () => {
  assert.equal(slugifyBlockId("Tahapan Audit Sertifikasi"), "tahapan-audit-sertifikasi");
  assert.equal(slugifyBlockId("ISO 14001:2015 → 2026"), "iso-14001-2015-2026");
});

test("blockAnchorId keeps an explicit id when the title changes", () => {
  const block = {
    id: "iso14001-tahapan-audit",
    type: "content-section",
    title: "Judul Baru",
  };
  assert.equal(blockAnchorId(block, 3), "iso14001-tahapan-audit");
});

test("blockAnchorId derives an id from the title when no explicit id exists", () => {
  assert.equal(
    blockAnchorId({ type: "content-section", title: "Judul Baru" }, 3),
    "judul-baru",
  );
});

test("blockAnchorId falls back to type and position when no text exists", () => {
  assert.equal(blockAnchorId({ type: "faq" }, 0), "faq-1");
});

test("findDuplicateBlockIdIndexes reports every occurrence after the first", () => {
  const blocks = [
    { id: "faq", type: "faq" },
    { id: "standar", type: "content-section" },
    { id: "faq", type: "faq" },
    { id: "faq", type: "faq" },
  ];
  assert.deepEqual(findDuplicateBlockIdIndexes(blocks), [2, 3]);
});

test("findDuplicateBlockIdIndexes reports duplicate ids derived from titles", () => {
  const blocks = [
    { type: "content-section", title: "Tahapan Audit" },
    { type: "hero", title: "Beranda" },
    { type: "content-section", title: "Tahapan Audit" },
  ];
  assert.deepEqual(findDuplicateBlockIdIndexes(blocks), [2]);
});

test("validateBlockIds reports duplicate ids with the file and field", () => {
  const blocks = Array.from({ length: 6 }, (_, index) => ({
    type: index === 0 || index === 5 ? "faq" : "content-section",
    id: index === 0 || index === 5 ? "faq" : `area-${index}`,
  }));
  const diagnostics = validateBlockIds([
    { path: "src/content/services/a.md", data: { blocks } },
  ]);

  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].rule, "CONTENT-014");
  assert.equal(diagnostics[0].path, "src/content/services/a.md");
  assert.equal(diagnostics[0].field, "blocks[5].id");
  assert.match(diagnostics[0].reason, /faq/);
});
