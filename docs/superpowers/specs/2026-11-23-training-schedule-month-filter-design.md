# Design — Filter bulan untuk jadwal di `/trainings/<slug>/`

Tanggal: 2026-11-23 · Status: **menunggu persetujuan**

## Intent dan mengapa

Setiap program pelatihan punya 24 jadwal (2 sesi per bulan × 12 bulan). Halaman detail training sekarang merender semuanya sekaligus sehingga daftarnya panjang. Di situs pusattraining, jadwal dipecah dengan **selector bulan**, jadi yang tampil sekaligus hanya satu bulan. Ini yang ingin diadopsi — pola dan perilakunya, bukan salinan kode/copy-nya.

## Goals

- 12 tombol bulan dengan jumlah jadwal; bulan tanpa jadwal dinonaktifkan.
- Saat halaman dibuka, hanya bulan pertama yang memuat jadwal mendatang yang tampil; sisanya tersembunyi.
- Klik bulan mengganti daftar tanpa reload halaman.
- Toggle “Tampilkan jadwal yang sudah lewat” untuk menampilkan sesi masa lalu.
- Status jadwal dihitung ulang di browser dari tanggal hari ini, sehingga tidak perlu rebuild saat tanggal kalender berganti.
- Tetap accessible: tombol asli, `aria-pressed`, ringkasan `aria-live`, fokus terlihat.
- Tanpa dependency baru dan tanpa perubahan skema content.

## Non-goals

- Navigasi bagian sticky + scrollspy dan konversi halaman ke blok (opsi 2) — tidak diambil sekarang.
- Tidak mengubah `trainingScheduleSchema`, tidak menambah `batchNo`, `status`, `dateLabel`, atau harga.
- Tidak membuat halaman detail per jadwal, tidak menambah tautan Google Calendar.
- Tidak menyalin palet merah, teks “KONSULTASI PROGRAM”, atau CTA WhatsApp dari pusattraining.

## Constraints

- `AGENTS.md`: Tailwind + token desain (bukan warna hardcode), HTML semantik, tanpa hardcode identitas perusahaan di komponen, tanpa kosakata konsultasi di konten publik.
- `trainingScheduleSchema` hanya punya `startDate`/`endDate` (opsional, `YYYY-MM-DD`), `timezone` opsional, dan `registrationStatus` (`open`/`closed`/`full`/`cancelled`). Jadwal `cancelled` dan tanpa tanggal sudah difilter di query halaman dan tetap tidak tampil.
- Gerbang wajib: `npm test`, `npm run check`, `npm run lint`, `npm run build`, dan empat audit (`audit:seo`, `audit:blocks`, `audit:page-images`, `audit:headings`).
- `dist/` sudah ter-deploy ke `/www/wwwroot/tnvcertification/dist`; vhost tidak diubah.

## Approaches

1. **Adaptasi script pusattraining, semua kartu tetap di DOM, disembunyikan dengan `hidden` (dipilih).** Server merender 24 kartu + 12 tombol; JS mengganti atribut `hidden` dan `aria-pressed`. Tradeoff: 24 kartu tetap ada di DOM (ukuran kecil), tetapi tanpa JS pembaca tetap melihat satu bulan saja, dan tidak ada endpoint/fetch baru.
2. **Render satu bulan di server, JS mengambil bulan lain.** Ditolak: butuh endpoint JSON baru, kehilangan fallback tanpa JS, dan menambah kompleksitas untuk kasus yang tidak diminta.
3. **Halaman statis per bulan** (`/trainings/<slug>/<bulan>/`). Ditolak: menambah ~168 halaman, mengubah route dan sitemap, tidak sepadan dengan masalah yang ingin diselesaikan.

## Keputusan implementasi

- Komponen baru `src/components/page/TrainingScheduleMonths.astro`, dipanggil dari `src/pages/trainings/[slug].astro` menggantikan markup daftar jadwal yang sekarang.
- Nama bulan dihasilkan dari `Intl.DateTimeFormat` pada `startDate` (bukan array literal), mengikuti aturan no-hardcoding.
- Bulan awal: bulan pertama yang memuat jadwal dengan `startDate >= hari ini` (fallback `Asia/Jakarta`); bila tidak ada, bulan pertama yang tersedia.
- Setiap kartu membawa `data-start-date`, `data-end-date`, `data-timezone`, `data-registration-status`, dan `data-month`; tiap grup bulan membawa `data-month-group`.
- Script inline scope-local: dijalankan per elemen `[data-schedule-months]`, ada guard bila elemen tidak ada, listener passive untuk scroll bila diperlukan, tanpa library.
- Label status memakai `labels` yang sudah ada di halaman (tidak dibuat kamus baru di komponen).
- Styling memakai utilitas Tailwind dan token yang sudah ada; tidak menambah CSS variable atau warna hardcode.
- Test regresi baru `tests/training-schedule-months.test.mjs`: memeriksa 12 tombol bulan, grup awal yang terlihat, atribut data, dan wiring `aria-pressed`/`aria-live` pada HTML hasil build.

## Yang tersisa untuk builder

- Rencana teknis lewat `writing-plans`.
- Menjalankan seluruh gerbang validasi setelah implementasi.
- Build ulang `dist/` default config dan menyalinnya ke docroot yang sama seperti deploy sebelumnya.
