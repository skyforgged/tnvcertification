# Training Schedule Month Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tampilkan jadwal di `/trainings/<slug>/` per bulan dengan selector bulan dan perilaku JS, supaya daftar 24 jadwal tidak panjang.

**Architecture:** Dua helper murni di `src/lib/schedule-display.ts` menentukan kunci bulan dan bulan awal. Komponen `TrainingScheduleMonths.astro` merender 12 tombol bulan, grup jadwal per bulan (semua kartu tetap di DOM, non-awal diberi `hidden` dari server), dan satu script scope-local untuk mengganti grup, menghitung ulang status dari tanggal, serta mengelola toggle “jadwal lewat”. Halaman detail hanya memilih data dan meneruskan label.

**Tech Stack:** Astro 7+, TypeScript strict, Tailwind token situs, Node test runner (`node --import tsx --test`).

**Spec:** `docs/superpowers/specs/2026-11-23-training-schedule-month-filter-design.md`

## Global Constraints

- Tanpa dependency baru, tanpa perubahan `trainingScheduleSchema`, tanpa blok baru, tanpa navigasi sticky/scrollspy.
- Tailwind + token yang ada; dilarang warna hardcode di komponen.
- Tanpa hardcode identitas perusahaan di komponen; baca dari konfigurasi pusat jika diperlukan.
- Nol kosakata `konsult`/`consult` di konten publik.
- Label berasal dari objek `labels` halaman, bukan kamus baru di komponen.
- Nama bulan dari `Intl.DateTimeFormat`, bukan array literal.
- Gerbang wajib: `npm test`, `npm run check`, `npm run lint`, `npm run build`, `npm run audit:seo`, `npm run audit:blocks`, `npm run audit:page-images`, `npm run audit:headings`.
- Vhost tidak diubah; docroot deploy tetap `/www/wwwroot/tnvcertification/dist`.

## Review Focus

- Jadwal tanpa `startDate` atau ber-`registrationStatus: "cancelled"` masuk koleksi → harus gugur di query halaman dan tidak muncul di tombol bulan maupun kartu. Test: Task 2 Step 1 memeriksa predikat query di `src/pages/trainings/[slug].astro`.
- Semua jadwal suatu program sudah lewat → helper harus jatuh ke bulan tersedia pertama, bukan `undefined`, dan ringkasan tidak boleh menampilkan angka aktif yang salah. Test: Task 1 Step 1 kasus fallback.
- JavaScript gagal dimuat → masih hanya satu grup bulan yang terlihat. Test: Task 2 Step 1 memeriksa `hidden` dan `aria-pressed` dirender dari server.
- Pembaca layar → tombol harus `<button>` nyata dengan `aria-pressed`, toggle harus checkbox berlabel, ringkasan harus `aria-live="polite"`. Test: Task 2 Step 1.
- Tanggal kalender berganti tanpa rebuild → status “lewat/berlangsung” dihitung ulang di browser. Test: Task 2 Step 1 memeriksa skrip memakai `data-start-date`, `data-end-date`, dan `data-timezone`.

---

### Task 1: Helper bulan

**Files:**
- Modify: `src/lib/schedule-display.ts`
- Test: `tests/schedule-display.test.mjs`

**Interfaces:**
- Consumes: tidak ada.
- Produces:
  - `monthKeyFromStartDate(startDate?: string): string | undefined`
  - `selectDefaultScheduleMonth<T extends { data: { startDate?: string } }>(items: T[], todayKey: string): string | undefined`

- [ ] **Step 1: Tambah test yang gagal di `tests/schedule-display.test.mjs`**

```js
import { monthKeyFromStartDate, selectDefaultScheduleMonth } from "../src/lib/schedule-display.ts";

test("month key is derived from a calendar date", () => {
  assert.equal(monthKeyFromStartDate("2027-01-13"), "2027-01");
  assert.equal(monthKeyFromStartDate(undefined), undefined);
});

test("default month is the first month containing an upcoming session", () => {
  const items = [
    { data: { startDate: "2027-03-10" } },
    { data: { startDate: "2027-01-13" } },
    { data: { startDate: "2027-02-24" } },
  ];
  assert.equal(selectDefaultScheduleMonth(items, "2026-11-23"), "2027-01");
});

test("default month falls back to the earliest available month when all are past", () => {
  const items = [
    { data: { startDate: "2027-05-12" } },
    { data: { startDate: "2027-02-10" } },
  ];
  assert.equal(selectDefaultScheduleMonth(items, "2028-01-01"), "2027-02");
});
```

- [ ] **Step 2: Jalankan test dan pastikan gagal**

Run: `node --import tsx --test tests/schedule-display.test.mjs`
Expected: FAIL — `monthKeyFromStartDate is not a function` / tidak ada export.

- [ ] **Step 3: Implementasi kedua helper di `src/lib/schedule-display.ts`**

`monthKeyFromStartDate` mengembalikan 7 karakter pertama dari tanggal kalender yang valid, atau `undefined`. `selectDefaultScheduleMonth` mengambil kunci unik dari item yang punya tanggal, mengembalikan kunci pertama dengan `startDate >= todayKey` (perbandingan leksikografis aman untuk `YYYY-MM-DD`), atau kunci terbesar awalnya bila tidak ada yang mendatang; mengembalikan `undefined` untuk input kosong. Jangan mengubah fungsi yang sudah ada.

- [ ] **Step 4: Jalankan test dan pastikan lulus**

Run: `node --import tsx --test tests/schedule-display.test.mjs`
Expected: PASS (semua test di berkas itu lulus).

- [ ] **Step 5: Commit**

```bash
git add src/lib/schedule-display.ts tests/schedule-display.test.mjs
git commit -m "feat: add schedule month helpers"
```

### Task 2: Komponen selector bulan dan wiring halaman

**Files:**
- Create: `src/components/page/TrainingScheduleMonths.astro`
- Modify: `src/pages/trainings/[slug].astro`
- Test: `tests/training-schedule-months.test.mjs`

**Interfaces:**
- Consumes: `monthKeyFromStartDate`, `selectDefaultScheduleMonth`, `scheduleDateLabel`, `sortSchedulesByStartDate` dari `src/lib/schedule-display.ts`; `labels` dari halaman.
- Produces: komponen dengan props `schedules: CollectionEntry<"trainingSchedules">[]`, `labels: Labels`, `locale: string`, `todayKey: string`. Halaman menambah kunci label `showPast`, `summaryActive`, `summaryAll`, `emptyMonth`, `note`, `past`, `ongoing` pada objek `labels` yang sudah ada.

- [ ] **Step 1: Tulis test sumber yang gagal di `tests/training-schedule-months.test.mjs`**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const component = await read("src/components/page/TrainingScheduleMonths.astro");
const page = await read("src/pages/trainings/[slug].astro");

test("component renders accessible month controls", () => {
  for (const marker of [
    "data-schedule-months", "data-month-filter", "data-month-count",
    "aria-pressed=", "data-show-past", "data-schedule-summary",
    'aria-live="polite"', "data-schedule-empty",
  ]) assert.ok(component.includes(marker), marker);
});

test("component keeps only the default month visible on the server", () => {
  assert.match(component, /hidden=\{/);
  assert.match(component, /data-month-group/);
  assert.match(component, /data-schedule-item/);
});

test("component script recomputes status from schedule dates", () => {
  for (const marker of ["data-start-date", "data-end-date", "data-timezone", "data-registration-status"]) {
    assert.ok(component.includes(marker), marker);
  }
  assert.match(component, /querySelectorAll\(\s*["']\[data-schedule-months\]/);
});

test("component uses design tokens, not hardcoded colors", () => {
  assert.doesNotMatch(component, /#[0-9a-fA-F]{3,8}\b/);
});

test("detail page delegates schedule rendering and excludes unusable records", () => {
  assert.match(page, /TrainingScheduleMonths/);
  assert.doesNotMatch(page, /schedules\.map\(\(schedule\)/);
  assert.match(page, /data\.startDate/);
  assert.match(page, /registrationStatus\s*!==\s*"cancelled"/);
});
```

- [ ] **Step 2: Jalankan test dan pastikan gagal**

Run: `node --import tsx --test tests/training-schedule-months.test.mjs`
Expected: FAIL — berkas komponen belum ada.

- [ ] **Step 3: Buat `TrainingScheduleMonths.astro`**

Frontmatter: terima props di atas; filter item yang punya `startDate`; urutkan dengan `sortSchedulesByStartDate`; bentuk daftar bulan unik dari `monthKeyFromStartDate` dan render 12 bulan per tahun yang terwakili dengan nama dari `Intl.DateTimeFormat(locale, { month: "short" })`; tentukan `defaultMonth` memakai `selectDefaultScheduleMonth(schedules, todayKey)`; kelompokkan kartu per bulan dengan `data-month-group`.

Markup: `<div data-schedule-months>` berisi `<ol>` tombol (`type="button"`, `data-month-filter`, `data-month-count`, `aria-pressed` sesuai bulan awal, `disabled` bila-count 0), ringkasan `<p data-schedule-summary aria-live="polite">`, `<label>` berisi checkbox `data-show-past`, grup per bulan dengan atribut `hidden` untuk semua kecuali bulan awal, tiap kartu membawa `data-schedule-item`, `data-month`, `data-start-date`, `data-end-date`, `data-timezone`, `data-registration-status` dan `<span data-status-label>`; terakhir `<p data-schedule-empty hidden>` dan `<p>` berisi `labels.note`.

Tempatkan label status untuk JS sebagai atribut `data-label-*` pada elemen `data-schedule-months`: `data-label-past`, `data-label-ongoing`, `data-label-open`, `data-label-closed`, `data-label-full`, `data-label-pending`, `data-label-summary-active`, `data-label-summary-all`. Template ringkasan memakai placeholder `{count}` yang diganti JS.

Script inline: loop tiap `[data-schedule-months]`; hitung status dari `data-start-date`/`data-end-date` memakai `dateKey` dengan timezone `Asia/Jakarta` sebagai default; perbarui `data-active`, class status, dan teks `data-status-label`; sembunyikan kartu di luar bulan terpilih dan kartu lewat bila toggle mati; perbarui count tombol, `aria-pressed`, `hidden` grup, ringkasan, dan `data-schedule-empty`. Gunakan `{ passive: true }` untuk listener scroll bila ada; jangan pakai library.

- [ ] **Step 4: Hubungkan komponen di `src/pages/trainings/[slug].astro`**

Impor komponen; perluas `labels` dengan kunci baru pada Step 1 Interfaces (bahasa mengikuti `isEnglish`); ganti query jadwal agar hanya menerima `data.startDate` dan `registrationStatus !== "cancelled"`; hapus markup daftar jadwal lama; render `<TrainingScheduleMonths schedules={schedules} labels={labels} locale={locale} todayKey={...} />` dengan `todayKey` berupa tanggal hari ini di `Asia/Jakarta` (`YYYY-MM-DD`). Biarkan `Section`/`SectionHeading` pembungkus tetap ada.

- [ ] **Step 5: Jalankan test dan pastikan lulus**

Run: `node --import tsx --test tests/training-schedule-months.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/page/TrainingScheduleMonths.astro src/pages/trainings/[slug].astro tests/training-schedule-months.test.mjs
git commit -m "feat: add month selector to training schedules"
```

### Task 3: Validasi, build, dan deploy

**Files:** tidak ada perubahan sumber; menghasilkan `dist/` dan memperbarui docroot.

**Interfaces:**
- Consumes: hasil Task 1 dan Task 2.
- Produces: build final di `dist/` dan situs live dengan selector bulan aktif.

- [ ] **Step 1: Jalankan seluruh gerbang**

```bash
npm test && npm run check && npm run lint && npm run build \
  && npm run audit:seo && npm run audit:blocks \
  && npm run audit:page-images && npm run audit:headings
```

Expected: semua exit 0; `npm test` lebih banyak dari 382 test.

- [ ] **Step 2: Periksa HTML hasil build**

```bash
grep -o 'data-month-filter=' dist/trainings/internal-auditor-iso-9001-2015/index.html | wc -l
grep -o 'data-month-group=' dist/trainings/internal-auditor-iso-9001-2015/index.html | wc -l
grep -rn 'KONSULTASI\|konsult' dist/trainings/ | wc -l
```

Expected: `12`, `12`, `0`.

- [ ] **Step 3: Deploy ke docroot yang sudah ada**

Buat backup tar docroot dengan nama bertimestamp, lalu `rsync -a --delete dist/ /www/wwwroot/tnvcertification/dist/`. Jangan menyentuh file vhost.

- [ ] **Step 4: Verifikasi lewat vhost lokal**

```bash
curl -s -H 'Host: tnvcertification.lan' http://127.0.0.1/trainings/internal-auditor-iso-9001-2015/ \
  | grep -o 'data-month-filter=' | wc -l
```

Expected: `12`, dan HTTP 200 untuk halaman tersebut serta `/trainings/`.
