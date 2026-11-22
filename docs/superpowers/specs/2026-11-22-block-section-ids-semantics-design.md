# Design: stable block IDs and semantic section classes

Date: 2026-11-22
Status: approved (short design)

## Intent

Saat review atau development, harus memungkinkan menunjuk satu blok secara tepat, misalnya
"revisi blok `tahapan-audit`", tanpa harus membaca seluruh judul atau menghitung urutan
section. Section yang dirender juga harus memakai class bernama dan token desain, bukan
utility + hex hardcode.

Manfaat yang disampaikan pengguna: saat development bisa langsung menunjukkan blok mana
yang akan direvisi secara tepat.

## Goals

- Setiap section/aside yang dirender `BlockRenderer.astro` punya `id` yang stabil dan
  mudah disebut.
- Setiap section punya class semantik bernama dan memakai token desain, bukan warna
  hardcode `bg-[#...]` / `text-[#...]`.
- Setiap section dihubungkan ke heading-nya lewat `aria-labelledby`.
- Berlaku untuk halaman service dan training karena keduanya memakai renderer yang sama.

## Non-goals

- Mengubah teks, urutan, atau jumlah blok yang sudah ada.
- Mengubah tampilan, spacing, atau nilai warna — token baru hanya memetakan nilai hex yang
  sudah dipakai.
- Hardcode di satu halaman/content entry.

## Constraints

- AGENTS.md: Tailwind sebagai styling utama, token via CSS custom properties, konten
  editorial tinggal di content collection tervalidasi.
- `BlockRenderer.astro` dipakai bersama oleh `ServiceLayout.astro` dan
  `src/pages/trainings/[slug].astro`.
- Saat ini ada 16 blok di 3 entri service (`sertifikasi-iso-14001-2026`,
  `sertifikasi-iso-9001-2026`, `iso-14001-2026-certification`); belum ada blok di training.
- `id` tidak boleh berubah hanya karena judul/eyebrow diedit.

## Approaches

- **A (dipilih) — perbaikan di renderer + skema konten.** `id` eksplisit opsional di skema
  empat tipe blok, diisi pada semua blok existing; fallback slug dari judul untuk blok baru;
  class bernama per tipe dan per surface; token desain di `global.css`; validasi duplikat
  saat build. Dampak: semua halaman service/training konsisten, review bisa menyebut `id`.
- **B — semantik HTML minimal.** Hanya `aria-labelledby` tanpa `id` stabil/class bernama.
  Diff kecil, tapi tidak memberi cara menyebut blok secara presisi dan tidak menjawab
  soal class semantik.
- **C — khusus halaman ISO 14001.** Hardcode di entri/page. Menimbulkan duplikasi logika
  dan halaman training tetap bermasalah.

## Decisions

1. Skema: field `id` opsional dengan format kebab-case pada `content-section`, `faq`,
   `howto`, `cta`.
2. `id` eksplisit diisi pada ke-16 blok existing; pasangan terjemahan ID/EN memakai `id`
   yang sama agar review lintas bahasa bisa merujuk ke blok yang sama.
3. Helper murni `src/lib/block-ids.ts`: `slugifyBlockId()` dan `blockAnchorId(block, index)`.
   Urutan prioritas fallback: `id` eksplisit → judul → eyebrow → `<tipe>-<nomor>`.
4. Renderer: section/aside mendapat `id={blockAnchorId(...)}`,
   `aria-labelledby={`${id}-heading`}`, dan class
   `block-section block-section--<tipe> block-section--surface-<surface>`; heading mendapat
   `id={`${id}-heading`}`.
5. `global.css`: token surface + teks baru di `@theme`, class `.block-section` dan
   variannya di `@layer components`; hex hardcode di `BlockRenderer.astro` dihapus.
6. Validasi: duplikat `id` dalam satu entri menggagalkan build dengan diagnostics
   `[CONTENT-014] <file> → blocks[i].id`; unit test untuk helper slug/fallback/duplikat.

## Left to the plan

Implementasi detail, urutan perubahan, dan daftar perintah verifikasi ada di plan yang
disusun dengan `writing-plans`.
