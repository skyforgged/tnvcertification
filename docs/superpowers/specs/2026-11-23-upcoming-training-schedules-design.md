# Upcoming training schedules on `/trainings/`

Date: 2026-11-23
Status: proposed

## Intent

Visitors browsing the training catalog should see which sessions are scheduled next
without leaving `/trainings/` for the schedule archive.

## Decisions already made with the owner

- Show **upcoming** sessions: `startDate >= today` (build-time, UTC date-only).
- Order **`startDate` DESC**: farthest future at the top, nearest at the bottom.
- Show the **12 nearest upcoming sessions** (the 12 soonest), displayed in DESC order
  within that window.
- The training list is the **sub-menu "Pelatihan Auditor Internal"** on the IAS pages:
  **14 unique programs** after de-duplicating `pelatihan auditor internal iso 13485`
  (the two entries point to the same URL). This supersedes the earlier 6-program
  decision. The published FSSC certification-training title is replaced.
- Fill 2027 dates: **2 one-day sessions per training per month**, on the **2nd and 4th
  Wednesday**, January–December 2027. With 6 trainings this is **144 schedule entries**.
- Fill dates only. Method, venue, price, quota, and registration status stay unset and
  render as “menyusul”.
- Harga di `docs/training-schedule-catalogue.csv` hanya **referensi indikatif untuk
  tinjauan visual**, bukan konten produksi: Rp 2–5 juta/peserta untuk internal auditor
  (Dilatih.co, 16 Jun 2026) dan Rp 7,9–8,75 juta untuk lead auditor IRCA (26 Agu 2026).
  Owner akan mengganti angka finalnya.

## Goals

- A typed editorial block on `/trainings/` listing upcoming sessions.
- One shared, tested selector for filtering and sorting.
- A clear empty state when no dated upcoming sessions exist.
- Date-less, cancelled, and unpublished-training schedules never appear.
- Training program titles and schedule records match the IAS reference catalogue below.

## Non-goals

- No schedule detail route.
- No change to `/schedules/` archive behaviour or ordering.
- No invented venue, price, quota, or registration state.
- No Lead Auditor, awareness, foundation, or online programs; only the 14 programs
  listed under “Program yang dipakai” (which includes the ISO 14001 migration course).

## Constraints

- Page copy lives in `src/content/pages/`; routes resolve dynamic data and pass it to
  blocks.
- Static build: “today” is evaluated at build time. A rebuild is required for past
  sessions to leave the list.
- Schedule dates are date-only and compared in UTC, matching existing date formatting.
- The full 2027 load produces **336 sessions** (24 per training × 14 trainings). The block
  shows only the 12 nearest upcoming sessions; the rest stay available on `/schedules/`.
- With 14 trainings on the same two Wednesdays, the 12 nearest sessions all fall on
  2027-01-13. This is a known consequence of keeping the owner's 12-session cap.
- No `konsult*`/`consult*` wording in any public-facing copy.

## Approaches

1. **Dedicated `upcoming-schedules` block (chosen).** Clear contract, does not overload
   the generic `listing` block, easy to unit-test the selector. Cost: one block type, one
   renderer component, one content-validation branch.
2. **Extend `listing` with `source: "schedules"` and filter/order fields.** Reuses
   `ListingSection`, but makes a generic block schedule-aware and needs cross-field
   validation. Rejected as muddier for one page.

## Design

### Schema

Add `upcomingSchedulesBlock` to `pageBlockSchema`:
`type: "upcoming-schedules"`, `id?`, `surface?`, `eyebrow?`, `title` (required),
`description?`, `emptyTitle?`, `emptyDescription?`.

### Content

Append the block to `src/content/pages/0023-halaman-trainings.md` after the catalog
`listing` block.

Copy lama pada `emptyTitle` / `emptyDescription` blok `listing` katalog —
"Katalog pelatihan sedang disiapkan" dan "Informasi program, materi, persyaratan peserta,
dan jadwal akan ditampilkan setelah masing-masing program siap dipublikasikan. Jadwal
pelaksanaan akan dikelola terpisah dari informasi program agar perubahan tanggal, lokasi,
kuota, dan status pendaftaran tetap akurat." — sudah dihapus bersamaan dengan peluncuran
14 program. Kedua kunci tidak diperlukan lagi karena katalog selalu memiliki entri publish;
`tests/page-content-frontmatter.test.mjs` mencegah teks usang ini muncul kembali.

### Data

Add `selectUpcomingSchedules(items, today, limit)` to `src/lib/schedule-display.ts`:

- drop items without `startDate`;
- drop `startDate < today`;
- drop `registrationStatus === "cancelled"`;
- sort `startDate` ASC, then `slug` ASC, and keep the first `limit` (the nearest);
- re-sort the kept window `startDate` DESC, then `slug` ASC for display.

The route keeps only schedules whose `trainingSlug` resolves to a published `id`
training, then calls the selector with `limit = 12`.

### Route and component

- `src/pages/trainings/index.astro` loads `trainingSchedules` and published `training`,
  builds `trainingBySlug`, resolves the upcoming list, and renders
  `UpcomingSchedules.astro`.
- `src/components/page/UpcomingSchedules.astro` renders the section heading, a list
  (date, program title link, method/location, registration status), or the empty state.
- `parseFrontmatterContent` treats the block as an H2 so heading checks stay correct.

### Display

`scheduleDateLabel` collapses a single-day range (`startDate === endDate`) to one date
instead of `date – date`.

### Program yang dipakai

Daftar reviewable lengkap (label asli, URL, judul/slug usulan, dan penanda duplikat) ada di
`docs/training-schedule-catalogue.csv`.

Diambil dari sub-menu IAS "Pelatihan Auditor Internal" (lihat Appendix C). Duplikat menu
`pelatihan auditor internal iso 13485` dihitung sekali. Nomor edisi tidak dipakai karena
menu IAS menuliskan nama tanpa edisi.

| # | Judul pelatihan | Slug |
|---|---|---|
| 1 | Pelatihan Auditor Internal ISO 9001 | `pelatihan-auditor-internal-iso-9001` |
| 2 | Pelatihan Auditor Internal ISO 14001 | `pelatihan-auditor-internal-iso-14001` |
| 3 | Pelatihan Internal Auditor Migrasi ISO 14001 | `pelatihan-internal-auditor-migrasi-iso-14001` |
| 4 | Pelatihan Auditor Internal ISO 50001 | `pelatihan-auditor-internal-iso-50001` |
| 5 | Pelatihan Auditor Internal ISO 27001 | `pelatihan-auditor-internal-iso-27001` |
| 6 | Pelatihan Auditor Internal ISO 22000 | `pelatihan-auditor-internal-iso-22000` |
| 7 | Pelatihan Auditor Internal ISO 45001 | `pelatihan-auditor-internal-iso-45001` |
| 8 | Pelatihan Auditor Internal ISO 13485 | `pelatihan-auditor-internal-iso-13485` |
| 9 | Pelatihan Auditor Internal IATF 16949 | `pelatihan-auditor-internal-iatf-16949` |
| 10 | Pelatihan Auditor Internal ISO 15189 | `pelatihan-auditor-internal-iso-15189` |
| 11 | Pelatihan Auditor Internal ISO 22301 | `pelatihan-auditor-internal-iso-22301` |
| 12 | Pelatihan Auditor Internal ISO 17025 | `pelatihan-auditor-internal-iso-17025` |
| 13 | Pelatihan Auditor Internal FSSC 22000 | `pelatihan-auditor-internal-fssc-22000` |
| 14 | Pelatihan Auditor Internal cGMP | `pelatihan-auditor-internal-cgmp` |

`serviceSlug` diisi hanya jika ada layanan sertifikasi yang benar-benar sesuai; untuk
program tanpa pasangan layanan, kolom ini dihilangkan (bukan diisi sembarangan).

### Content generation

Replace the three date-less placeholder files with 336 dated entries (24 per training),
one file per session, unique slugs such as
`jadwal-auditor-internal-iso-9001-2027-01-13`. Each entry sets only `trainingSlug`,
`serviceSlug` (when supported), `slug`, `startDate`, `endDate`.

2nd/4th Wednesday dates for 2027:

| Month | 2nd | 4th |
|---|---|---|
| Januari | 2027-01-13 | 2027-01-27 |
| Februari | 2027-02-10 | 2027-02-24 |
| Maret | 2027-03-10 | 2027-03-24 |
| April | 2027-04-14 | 2027-04-28 |
| Mei | 2027-05-12 | 2027-05-26 |
| Juni | 2027-06-09 | 2027-06-23 |
| Juli | 2027-07-14 | 2027-07-28 |
| Agustus | 2027-08-11 | 2027-08-25 |
| September | 2027-09-08 | 2027-09-22 |
| Oktober | 2027-10-13 | 2027-10-27 |
| November | 2027-11-10 | 2027-11-24 |
| Desember | 2027-12-08 | 2027-12-22 |

Dengan 14 program, 12 sesi terdekat seluruhnya jatuh pada 2027-01-13; urutan DESC
tetap dipertahankan sesuai keputusan owner.

### Validation

Add a schema refinement rejecting `endDate < startDate` when both are present.

### Docs

Register the new block in `docs/components-blocks-layouts.md`.

## Testing

- Selector: includes today, excludes past/date-less/cancelled, sorts DESC with stable
  tie-break.
- Label: same-day range renders one date and no en dash.
- Schema: page accepts the block; schedule rejects `endDate < startDate`.
- Content: exactly 24 files per training, all on 2nd/4th Wednesdays of 2027 months, and
  the 14 training titles/slugs above are present.
- Build + audits: `npm test`, `check`, `lint`, `build`, four audits; built `/trainings/`
  shows the block.

---

## Appendix A — Reference: `https://ias-indonesia.org/pelatihan-iso/`

Diambil 2026-11-23 dari halaman "/pelatihan-iso/".

### A1. Kursus Auditor pimpinan ISO (Lead Auditor, terakreditasi IRCA)

- ISO 9001:2015 – QMS Lead Auditor Training Course
- ISO 14001:2015 – EMS Lead Auditor Training Course
- ISO 45001:2018 – OHSMS Lead Auditor Training Course
- ISO 22000:2018 – FSMS Lead Auditor Training Course
- ISO 27001:2022 – ISMS Lead Auditor Training Course
- ISO 22301:2019 – BCMS Lead Auditor Training Course

### A2. Pelatihan Auditor Internal

- ISO 9001:2015 QMS Internal Auditor Course
- ISO 14001:2015 EMS Internal Auditor Course
- ISO 45001:2018 – OHSMS Internal Auditor Course
- ISO 22000:2018 – FSMS Internal Auditor Course
- ISO 27001:2022 – ISMS Internal Auditor Course
- ISO 22301:2019 – BCMS Internal Auditor Course
- IATF 16949:2016 – IATF Internal Auditor Course
- ISO 17025:2017 – Internal Auditor Course
- ISO 50001:2018 – EnMS Internal Auditor Course

### A3. Pelatihan Kesadaran

Kesadaran Internal dan Kesadaran Online. Halaman tidak merinci standar per program.

### A4. Catatan

Menu navigasi halaman ini memuat program tambahan yang tidak ada di daftar tubuh halaman:
Lead Auditor ISO 13485, ISO 17025, ISO 15189, ISO 50001, FSSC 22000, migrasi ISO 14001
dan ISO 45001; Internal Auditor ISO 13485, ISO 15189, ISO 22301, ISO 17025, FSSC 22000,
IATF 16949, dan cGMP.

---

## Appendix B — Reference: `https://ias-indonesia.org/pelatihan-auditor-utama-iso-irca/`

Diambil 2026-11-23 dari halaman "/pelatihan-auditor-utama-iso-irca/".

### B1. Sub-menu "Pelatihan Auditor Utama"

- ISO 9001 Pelatihan Auditor Utama
- ISO 27001 Pelatihan Auditor Utama
- ISO 14001 Pelatihan Auditor Utama
- Pelatihan Lead Auditor Migrasi ISO 14001
- ISO 22000 Pelatihan Auditor Utama
- ISO 13485 Pelatihan Auditor Utama
- ISO 22301 Pelatihan Auditor Utama
- ISO 45001 Pelatihan Auditor Utama
- Pelatihan Lead Auditor Migrasi ISO 14001 *(duplikat di menu)*
- Pelatihan Auditor Utama ISO 50001
- ISO 17025 Pelatihan Auditor Utama
- ISO 15189 Pelatihan Auditor Utama
- Pelatihan Auditor Utama FSSC 22000
- ISO 45001 Migrasi Pelatihan Auditor Utama

### B2. Sub-menu "Pelatihan Auditor Internal" (menu induk yang sama)

- Pelatihan Auditor Internal ISO 9001
- Pelatihan Auditor Internal ISO 14001
- Pelatihan Internal Auditor Migrasi ISO 14001
- Pelatihan Auditor Internal ISO 50001
- Pelatihan Auditor Internal ISO 27001
- Pelatihan Auditor Internal ISO 22000
- Pelatihan Auditor Internal ISO 45001
- pelatihan auditor internal iso 13485
- Pelatihan Auditor Internal IATF 16949
- Pelatihan Auditor Internal ISO 15189
- Pelatihan Auditor Internal ISO 22301
- pelatihan auditor internal iso 13485 *(duplikat di menu)*
- Pelatihan Auditor Internal ISO 17025
- Pelatihan Auditor Internal FSSC 22000 di Indonesia
- Pelatihan Auditor Internal cGMP di Indonesia

### B3. Sibling menu lain di bawah "Pelatihan ISO"

- ISO Pelatihan Yayasan
- Jadual Pelatihan
- Pelatihan Atas Talian

### B4. Isi tubuh halaman IRCA

Program Auditor Utama ISO yang dibahas:

- ISO 9001:2015 – Sistem Manajemen Mutu (SMM)
- ISO 14001:2015 – Sistem Manajemen Lingkungan (EMS)
- ISO 45001:2018 – Sistem Manajemen Kesehatan dan Keselamatan Kerja (OHSMS)
- ISO 22000:2018 – Sistem Manajemen Keamanan Pangan (FSMS)
- ISO 22301:2019 – Sistem Manajemen Kontinuitas Bisnis (BCMS)

---

## Appendix C — Reference: `https://ias-indonesia.org/pelatihan-internal-auditor-iso/`

Diambil 2026-11-23 dari halaman "/pelatihan-internal-auditor-iso/". Menu situs identik
dengan halaman IRCA, jadi daftar di bawah berlaku untuk ketiga halaman referensi.

### C1. Sub-menu "Pelatihan Auditor Internal" — daftar pelatihan yang dijadwalkan

1. Pelatihan Auditor Internal ISO 9001
2. Pelatihan Auditor Internal ISO 14001
3. Pelatihan Internal Auditor Migrasi ISO 14001
4. Pelatihan Auditor Internal ISO 50001
5. Pelatihan Auditor Internal ISO 27001
6. Pelatihan Auditor Internal ISO 22000
7. Pelatihan Auditor Internal ISO 45001
8. pelatihan auditor internal iso 13485
9. Pelatihan Auditor Internal IATF 16949
10. Pelatihan Auditor Internal ISO 15189
11. Pelatihan Auditor Internal ISO 22301
12. pelatihan auditor internal iso 13485 *(duplikat, URL sama dengan no. 8)*
13. Pelatihan Auditor Internal ISO 17025
14. Pelatihan Auditor Internal FSSC 22000 di Indonesia
15. Pelatihan Auditor Internal cGMP di Indonesia

**15 butir menu → 14 program unik.** Duplikat no. 12 memakai URL yang sama dengan no. 8
(`/pelatihan-auditor-internal-iso-13485/`), sehingga hanya dibuat satu entri pelatihan.

### C2. Sub-menu "Pelatihan Auditor Utama" (tidak dijadwalkan)

Sama seperti Appendix B1: ISO 9001, ISO 27001, ISO 14001, migrasi ISO 14001 (duplikat),
ISO 22000, ISO 13485, ISO 22301, ISO 45001, ISO 50001, ISO 17025, ISO 15189, FSSC 22000,
dan migrasi ISO 45001. Sesuai instruksi owner, daftar ini **tidak** dibuatkan jadwal.

### C3. Sibling menu lain di bawah "Pelatihan ISO"

- ISO Pelatihan Yayasan
- Jadual Pelatihan
- Pelatihan Atas Talian

### C4. Isi tubuh halaman Internal Auditor

Kursus Auditor Internal yang disebutkan (edisi lama, sengaja tidak dipakai sebagai nama
entri):

- Pelatihan Auditor Internal ISO 9001: 2015
- ISO 14001: 2004 Kursus Pelatihan Auditor Internal
- OHSAS 18001: 2007 Kursus Pelatihan Auditor Internal
- ISO 22000: 2005 Internal Kursus Pelatihan Auditor
- ISO 27001: 2013 Kursus Pelatihan Auditor Internal
- IATF16949: 2004 Standar Kursus Pelatihan Auditor Internal
