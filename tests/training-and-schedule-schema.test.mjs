import assert from "node:assert/strict";
import test from "node:test";
import { collections } from "../src/content.config.ts";

const trainingInput = {
  title: "Pelatihan Sertifikasi ISO 9001:2026",
  intro: "Pelatihan Sertifikasi ISO 9001:2026 adalah program pemahaman proses sertifikasi sistem manajemen mutu.",
  slug: "pelatihan-sertifikasi-iso-9001-2026",
  metaDescription: "Program pemahaman ruang lingkup, audit, dan administrasi sertifikasi ISO 9001:2026.",
  pubDate: "2026-11-23T00:00:00Z",
  featuredImage: {
    src: "/images/illustrations/training-iso9001-2026.webp",
    alt: "Pelatihan Sertifikasi ISO 9001:2026 adalah program pemahaman sertifikasi mutu.",
  },
  lang: "id",
  translationKey: "training-pelatihan-sertifikasi-iso-9001-2026",
  blocks: [
    {
      type: "hero",
      id: "hero-trainings",
      title: "Pelatihan Sertifikasi ISO 9001:2026",
      description: "Pelatihan Sertifikasi ISO 9001:2026 adalah program pemahaman proses sertifikasi sistem manajemen mutu.",
    },
  ],
};

const scheduleInput = {
  trainingSlug: "pelatihan-sertifikasi-iso-9001-2026",
  slug: "jadwal-pelatihan-iso-9001-2026",
  notes: "Jadwal angkatan akan diumumkan.",
};

test("training schema accepts a hero block", () => {
  const result = collections.training.schema.safeParse(trainingInput);
  assert.equal(result.success, true, result.success ? "" : JSON.stringify(result.error.issues));
});

test("schedule schema accepts a placeholder without dates", () => {
  const result = collections.trainingSchedules.schema.safeParse(scheduleInput);
  assert.equal(result.success, true, result.success ? "" : JSON.stringify(result.error.issues));
});

test("schedule schema rejects a record with only one date", () => {
  const result = collections.trainingSchedules.schema.safeParse({
    ...scheduleInput,
    startDate: "2027-01-01",
  });
  assert.equal(result.success, false);
});
