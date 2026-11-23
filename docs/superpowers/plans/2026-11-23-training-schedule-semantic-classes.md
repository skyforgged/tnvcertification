# Training Schedule Semantic Classes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Beri class semantik stabil pada tiap elemen jadwal di `/trainings/<slug>/` tanpa mengubah tampilan atau perilaku.

**Architecture:** Satu komponen `TrainingScheduleMonths.astro` menerima class baru sebagai hook tambahan di samping utilitas Tailwind dan atribut `data-*` yang sudah dipakai JS. Tidak ada CSS, token, dependency, atau rute baru.

**Tech Stack:** Astro 7+, TypeScript strict, Tailwind token situs, Node test runner (`node --import tsx --test`).

**Spec:** `docs/superpowers/specs/2026-11-23-training-schedule-semantic-classes-design.md`

## Global Constraints

- Hanya `src/components/page/TrainingScheduleMonths.astro` yang berubah; tidak menyentuh arsip `/schedules/`, halaman `/trainings/`, atau komponen lain.
- Tanggal tetap teks biasa; tidak ada anchor dan tidak ada rute `/schedules/<slug>/` dalam perubahan ini.
- Semua `data-*` dan JS month-filter tetap utuh; nama dan nilai tidak diubah.
- Tanpa aturan CSS baru, warna hardcode, `block-section`, dependency, atau kosakata `konsult*`/`consult*`.
- Gerbang wajib: `npm test`, `npm run check`, `npm run lint`, `npm run build`, `npm run audit:seo`, `npm run audit:blocks`, `npm run audit:page-images`, `npm run audit:headings`.
- Vhost tidak diubah; docroot deploy tetap `/www/wwwroot/tnvcertification/dist`.

## Review Focus

- Field bersyarat (venue, price, quota, registration CTA) tetap punya class saat dirender, dan tidak menyisakan elemen kosong saat tidak ada data. Test: Task 1 Step 1 memeriksa class berada di dalam cabang bersyarat yang benar.
- Class baru tidak menggantikan `data-*` yang dipakai JS. Test: Task 1 Step 1 menegaskan marker `data-schedule-item`, `data-month-filter`, dan `data-status-label` masih ada.
- Class tidak memakai `block-section` (audit blok) atau warna hardcode. Test: Task 1 Step 1 menegaskan ketiadaan keduanya.
- `class:list` yang bersyarat tidak boleh menghilangkan utilitas lama. Test: Task 1 Step 1 memeriksa utilitas `inline-flex`, `min-h-11`, dan `grid` masih hadir.
- HTML hasil build benar-benar memuat class pada tiap baris, bukan hanya di sumber. Test: Task 2 Step 2 menghitung `training-schedule-date` dan `training-schedule-item` pada 24 baris.

---

### Task 1: Class semantik pada komponen

**Files:**
- Modify: `tests/training-schedule-months.test.mjs`
- Modify: `src/components/page/TrainingScheduleMonths.astro`

**Interfaces:**
- Consumes: struktur props `schedules`, `labels`, `locale`, `todayKey` yang sudah ada.
- Produces: class `training-schedule-*` sesuai daftar di spec; tidak ada prop atau fungsi baru.

- [ ] **Step 1: Tambah test yang gagal di `tests/training-schedule-months.test.mjs`**

```js
test("every schedule element exposes a stable semantic class", () => {
  const classes = [
    "training-schedule-months", "training-schedule-month-list",
    "training-schedule-month-button", "training-schedule-month-count",
    "training-schedule-summary", "training-schedule-show-past",
    "training-schedule-month-group", "training-schedule-month-heading",
    "training-schedule-item", "training-schedule-date",
    "training-schedule-location", "training-schedule-venue",
    "training-schedule-status", "training-schedule-price",
    "training-schedule-quota", "training-schedule-register",
    "training-schedule-empty", "training-schedule-note",
  ];
  for (const className of classes) {
    assert.ok(component.includes(`"${className}"`), className);
  }
});

test("conditional fields keep their semantic class inside the right branch", () => {
  for (const [condition, className] of [
    ["data.venue || data.city", "training-schedule-venue"],
    ["data.price !== undefined", "training-schedule-price"],
    ["data.quota !== undefined", "training-schedule-quota"],
    ["data.registrationUrl && data.registrationStatus === \"open\"", "training-schedule-register"],
  ]) {
    assert.match(component, new RegExp(`${condition}[\\s\\S]{0,400}${className}`));
  }
});

test("semantic classes do not displace data hooks or audited block semantics", () => {
  for (const marker of ["data-schedule-item", "data-month-filter", "data-status-label", "inline-flex", "min-h-11", "grid"]) {
    assert.ok(component.includes(marker), marker);
  }
  assert.doesNotMatch(component, /block-section/);
  assert.doesNotMatch(component, /#[0-9a-fA-F]{3,8}\b/);
});
```

- [ ] **Step 2: Jalankan test dan pastikan gagal**

Run: `node --import tsx --test tests/training-schedule-months.test.mjs`
Expected: FAIL — class `training-schedule-*` belum ada.

- [ ] **Step 3: Tambah class pada komponen**

Tambahkan class dari daftar spec pada elemen yang bersesuaian. Pakai `class:list` hanya pada tombol bulan yang sudah punya utilitas bersyarat; elemen lain cukup `class` dengan utilitas lama tetap utuh. Jangan ubah atribut `data-*`, teks label, atau logika JS.

- [ ] **Step 4: Jalankan test dan pastikan lulus**

Run: `node --import tsx --test tests/training-schedule-months.test.mjs`
Expected: PASS (8 test di berkas itu).

- [ ] **Step 5: Jalankan seluruh test dan commit**

```bash
npm test
git add src/components/page/TrainingScheduleMonths.astro tests/training-schedule-months.test.mjs
git commit -m "style: add semantic classes to training schedule rows"
```

### Task 2: Validasi, build, dan deploy

**Files:** tidak ada perubahan sumber; menghasilkan `dist/` dan memperbarui docroot.

**Interfaces:**
- Consumes: hasil Task 1.
- Produces: build final di `dist/` dan situs live dengan class baru.

- [ ] **Step 1: Jalankan seluruh gerbang**

```bash
npm test && npm run check && npm run lint && npm run build \
  && npm run audit:seo && npm run audit:blocks \
  && npm run audit:page-images && npm run audit:headings
```

Expected: semua exit 0; `npm test` 393/393; build 66 halaman.

- [ ] **Step 2: Periksa HTML hasil build**

```bash
f=dist/trainings/pelatihan-auditor-internal-iso-9001/index.html
grep -o 'training-schedule-date' "$f" | wc -l
grep -o 'training-schedule-item' "$f" | wc -l
grep -o 'training-schedule-months' "$f" | wc -l
```

Expected: `24`, `24`, dan minimal `1` (skrip memakai selektor `data-*`, bukan class, jadi class hanya muncul pada markup).

- [ ] **Step 3: Deploy ke docroot yang sudah ada**

Buat backup tar docroot bertimestamp, lalu `rsync -a --delete dist/ /www/wwwroot/tnvcertification/dist/`. Jangan menyentuh file vhost.

- [ ] **Step 4: Verifikasi lewat vhost lokal**

```bash
curl -s -o /dev/null -w '%{http_code}' -H 'Host: tnvcertification.lan' \
  http://127.0.0.1/trainings/pelatihan-auditor-internal-iso-9001/
```

Expected: `200`, dan HTML mengandung `training-schedule-date`.
