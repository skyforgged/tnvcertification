# Standar Editorial Konten TNV Certification

Dokumen ini adalah standar editorial tetap untuk seluruh konten publik website TNV Certification. Berlaku untuk halaman layanan, artikel, halaman pelatihan, jadwal, metadata, dan komponen yang memuat teks publik.

## Prinsip utama

Website TNV Certification dibangun sebagai **sumber informasi yang bernilai**, bukan sekadar katalog layanan atau kumpulan halaman SEO.

Dua kesalahan yang harus dihindari:

1. **Memasukkan percakapan internal ke dalam konten publik.** Diskusi strategi, instruksi, koreksi, workflow, evaluasi pekerjaan, catatan proses pengembangan, dan arahan AI tidak boleh menjadi materi website.
2. **Menyajikan hasil riset hanya sebagai referensi atau tautan.** Riset harus diolah menjadi konten yang substantif, lengkap, akurat, dan bermanfaat bagi pembaca, lalu ditulis langsung ke halaman yang relevan.

## Standar yang diterapkan

| Elemen | Standar |
|---|---|
| Kedalaman konten | Pembahasan menyeluruh, bukan definisi singkat atau teks pemasaran generik. |
| Landasan informasi | Standar ISO, regulasi, pedoman teknis, praktik industri, dan hasil riset kredibel. |
| Implementasi riset | Informasi hasil riset diolah dan dimasukkan langsung ke halaman layanan. |
| Referensi eksternal | Digunakan sebagai sumber riset. Tidak ditampilkan sebagai backlink kompetitor. |
| Identitas konten | Tidak ada percakapan internal, instruksi AI, catatan strategi, atau komentar proses pengembangan di konten publik. |
| SEO | Mengutamakan relevansi, kedalaman topik, topical authority, struktur semantik, search intent, dan kualitas pengalaman pengguna. |
| Nilai bagi pembaca | Pengunjung mendapatkan pemahaman yang cukup tanpa harus mencari penjelasan dasar dari situs lain. |

## Target setiap halaman layanan

Halaman `/services/<slug>` dikembangkan menjadi pusat informasi mengenai layanan tersebut. Struktur berikut menjadi acuan, tetapi tidak dipaksakan identik untuk setiap layanan:

- Pemahaman dasar dan definisi layanan.
- Tujuan, manfaat, dan urgensi.
- Ruang lingkup serta objek penilaian.
- Standar, regulasi, atau persyaratan yang relevan.
- Kriteria dan aspek yang dinilai.
- Tahapan proses secara terperinci.
- Persyaratan organisasi atau calon klien.
- Dokumen dan persiapan yang diperlukan.
- Contoh penerapan dalam konteks industri.
- FAQ yang benar-benar menjawab pertanyaan calon pelanggan.
- CTA yang relevan dan tidak mengganggu pembahasan informatif.

## SEO dan mutu informasi

Peringkat bukan target yang dikejar dengan menambah panjang artikel secara arbitrer, mengulang kata kunci, atau membuat halaman yang isinya seragam. Target halaman 1 Google diperjuangkan melalui kualitas informasi, relevansi, kepercayaan, struktur website, dan penguatan topical authority secara konsisten.

**Target akhir:** ketika pengguna mencari informasi tentang layanan sertifikasi, website TNV Certification harus menjadi salah satu sumber terbaik yang mereka temukan. Ketika mereka membutuhkan layanan tersebut, mereka tidak perlu diarahkan ke kompetitor.

## Alur kerja yang mengikuti standar ini

1. Audit konten layanan yang sudah ada.
2. Identifikasi kekurangan informasi berdasarkan riset kredibel.
3. Perbaiki konten langsung di repository sebagai materi publik yang profesional dan layak dipublikasikan.

Hasil diskusi internal dan evaluasi proses tetap berada di dokumentasi agent atau catatan operasional, bukan di konten publik.

## Peralatan untuk korpus Markdown besar

Ketika jumlah berkas konten melebihi ratusan, alat yang dibutuhkan adalah content tooling, bukan code graph. CodeGraph memetakan simbol, call path, dan dependency kode. Alat itu tidak memvalidasi makna editorial, pasangan terjemahan, atau aturan konten proyek ini.

### Yang sudah dipakai repository

- **Astro Content Collections + Zod** untuk schema, tipe, dan field wajib.
- **`remark-parse` AST** untuk struktur heading dan intro. Jangan gunakan regex untuk aturan struktur Markdown.
- **Validator konten kustom** untuk aturan CONTENT, copula `adalah`/`is`, alt teks, keunikan intro dan `metaDescription`, hierarchy heading, dan frontmatter-only entries.
- **`validate:changed`** untuk preflight berkas konten yang berubah.
- **Audit hasil build** untuk SEO, canonical, blok, gambar, dan heading.

### Yang perlu ditambahkan bertahap

Keenam alat ini adalah backlog content tooling. Rincian implementasi Fase 1 ada di `docs/superpowers/plans/2026-11-24-content-audit-report.md`.

1. **Inventory script** — merangkum slug, collection, `lang`, `translationKey`, status draft, judul, tanggal, jumlah kata, gambar, dan halaman tanpa tautan masuk. *Status: direncanakan di Fase 1 sebagai laporan.*
2. **Translation parity check** — membandingkan pasangan ID/EN berdasarkan `translationKey`, status draft, dan metadata wajib. *Status: direncanakan di Fase 1 sebagai laporan; belum mewajibkan setiap entri ID memiliki pasangan EN.*
3. **Link audit** — memeriksa tautan internal di berkas `.md`, anchor, dan route hasil build. Pemeriksaan tautan eksternal bersifat opsional dan harus dibedakan dari referensi riset; jangan mengubah sumber riset menjadi backlink kompetitor. *Status: direncanakan di Fase 1 untuk tautan internal dan anchor; opsi `--external` ditunda.*
4. **Duplicate dan near-duplicate check** — memeriksa judul, intro, `metaDescription`, dan kesamaan isi antar halaman. *Status: duplikat persis dan near-duplicate masuk Fase 1 sebagai laporan; hanya duplikat persis yang diusulkan menjadi gate setelah baseline dibersihkan.*
5. **Terminology check** — memeriksa istilah baku dan larangan kata tertentu. *Status: mekanisme config masuk Fase 1; larangan `konsult`/`consult` dan salinan status internal tetap ditangani validator `CONTENT-013` dan aturan konten yang sudah ada, agar tidak diduplikasi.*
6. **Full-text search** — untuk kerja harian, `rg` sudah cukup. SQLite FTS5 baru diperlukan bila dibuat antarmuka pencarian sendiri. *Status: tidak diimplementasikan; tetap menjadi catatan untuk keperluan di masa depan.*

Validator harus tetap deterministik dan berada di repository. AI boleh membantu menulis atau meninjau konten, tetapi tidak menggantikan aturan yang dijalankan pada `check`, `build`, `test`, dan `audit:*`. Obsidian atau alat sejenis boleh dipakai untuk menjelajah konten secara manual, tetapi repository tetap source of truth.
