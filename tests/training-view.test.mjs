import assert from "node:assert/strict";
import test from "node:test";
import { getTrainingView } from "../src/data/training-view.ts";

const hero = {
  type: "hero",
  id: "hero-training",
  title: "Pelatihan Sertifikasi ISO 9001:2026",
  description: "Pelatihan Sertifikasi ISO 9001:2026 adalah program pemahaman sertifikasi mutu.",
};
const section = {
  type: "content-section",
  id: "ruang-lingkup",
  title: "Ruang lingkup program",
};

test("training view separates the hero from the remaining blocks", () => {
  const view = getTrainingView({ title: "Fallback title", blocks: [hero, section] });

  assert.deepEqual(view.hero, hero);
  assert.deepEqual(view.blocks, [section]);
});

test("training view requires a hero block", () => {
  assert.throws(
    () => getTrainingView({ title: "Fallback title", blocks: [section] }),
    /missing a hero block/i,
  );
});
