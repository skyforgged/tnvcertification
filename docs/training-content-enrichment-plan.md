# Rencana Enrichment Konten Pelatihan

**Status:** Direncanakan  
**Cakupan:** Seluruh program pelatihan yang sudah terdaftar di repository  
**Lokasi konten:** `src/content/training/`  
**Sumber of truth:** Repository ini

## Tujuan

Meningkatkan kualitas setiap halaman pelatihan TNCVCertification melalui riset kompetitor dan sumber teknis yang relevan, kemudian mengolah hasil riset menjadi konten orisinal, akurat, komprehensif, dan bermanfaat bagi profesional yang mencari informasi maupun mempertimbangkan pendaftaran pelatihan.

Pekerjaan ini disebut **Training Content Enrichment** dan berlaku untuk seluruh program pelatihan yang sudah ada, bukan hanya Pelatihan Auditor Internal FSSC 22000.

## Sumber benchmark utama

Lakukan pencarian mandiri pada situs berikut untuk menemukan halaman yang paling relevan dengan setiap program pelatihan:

1. LRQA Indonesia — https://www.lrqa.com/id-id/
2. DC Konsultan — https://www.dckonsultan.com/
3. IAS Indonesia — https://ias-indonesia.org/

URL spesifik tidak harus diberikan oleh pemilik proyek. Peneliti/agent bertanggung jawab menemukan halaman rujukan berdasarkan nama pelatihan, standar atau skema, dan substansi program.

Ketentuan pemilihan sumber:

- Gunakan halaman yang benar-benar relevan dengan topik pelatihan.
- Ketiga situs merupakan benchmark utama, tetapi **tidak wajib** semuanya memiliki halaman yang cocok untuk setiap topik. Jangan memaksakan sumber yang tidak relevan.
- Jika tersedia, bandingkan pula sumber primer atau resmi yang diperlukan untuk memverifikasi standar, versi skema, regulasi, terminologi, dan persyaratan teknis.
- Catat URL, judul halaman, penerbit, tanggal akses, dan poin yang digunakan dalam catatan riset internal.
- Sumber eksternal adalah input riset, bukan backlink kompetitor yang ditampilkan pada halaman publik.

## Metode riset dan sintesis

1. Inventarisasi seluruh entri pelatihan di `src/content/training/`; gunakan daftar aktual repository sebagai cakupan kerja.
2. Identifikasi topik, standar/skema, target peserta, dan informasi yang sudah tersedia pada setiap entri.
3. Cari halaman rujukan yang sesuai secara mandiri pada ketiga situs benchmark.
4. Ekstrak informasi yang relevan, misalnya:
   - deskripsi dan konteks pelatihan;
   - tujuan dan kompetensi pembelajaran;
   - ruang lingkup standar/skema;
   - silabus dan pokok bahasan;
   - metode pembelajaran dan latihan;
   - target peserta dan prasyarat;
   - manfaat kompetensi bagi peserta dan organisasi;
   - evaluasi, hasil pembelajaran, dan FAQ.
5. Sintesis informasi ke dalam satu alur editorial yang logis. Jangan membuat ringkasan terpisah per situs dan jangan menyalin struktur atau kalimat sumber.
6. Tulis ulang secara orisinal dengan bahasa profesional, jelas, dan sesuai kebutuhan audiens.
7. Masukkan hasil akhir ke entri pelatihan yang tepat di repository, mengikuti schema, typed blocks, dan aturan frontmatter yang berlaku.
8. Tinjau ulang fakta, SEO, struktur heading, dan kesesuaian dengan positioning TNCVCertification sebelum perubahan diselesaikan.

## Penanganan fakta dan perbedaan sumber

- Jangan menambahkan fakta hanya karena lazim ditemukan pada pelatihan sejenis; setiap klaim substantif harus memiliki dasar sumber yang dapat diverifikasi.
- Bila sumber berbeda dalam durasi, versi standar/skema, silabus, metode, prasyarat, sertifikat, atau pengakuan, jangan menggabungkannya seolah-olah sama.
- Utamakan sumber primer/resmi dan informasi paling mutakhir untuk memverifikasi versi standar, skema, serta ketentuan teknis.
- Jika fakta khusus penyelenggaraan TNCVCertification belum tersedia, jangan mengarangnya. Hilangkan sementara atau tandai sebagai informasi yang perlu dikonfirmasi secara internal; jangan menerbitkan catatan internal tersebut sebagai copy publik.
- Jangan mengklaim akreditasi, otorisasi, pengakuan sertifikat, durasi, jadwal, harga, atau hasil kelulusan tanpa bukti yang sah.
- Bedakan pelatihan auditor internal, lead auditor, dan kompetensi audit sertifikasi pihak ketiga secara akurat.

## Standar editorial dan SEO

- Kedalaman mengikuti kebutuhan topik dan search intent; kisaran 1.500–2.500 kata dapat menjadi panduan awal, **bukan target wajib atau alasan untuk memperpanjang konten secara artifisial**.
- Prioritaskan kelengkapan informasi, relevansi, akurasi, trust, topical coverage, pengalaman pembaca, dan konversi yang wajar.
- Gunakan satu H1 dan hierarki H2/H3/H4 yang semantik serta tidak melompati tingkat heading.
- Bahas subtopik yang benar-benar relevan, seperti pengenalan standar, urgensi pelatihan, tujuan, materi, proses/teknik, target peserta, sektor relevan, metode belajar, manfaat, perbedaan program terkait, persiapan, dan FAQ. Tidak semua bagian harus dipaksakan pada setiap pelatihan.
- Optimalkan SEO title, meta description, focus/secondary topics, intro, featured image alt, dan FAQ sesuai schema serta editorial standards repository.
- Hindari keyword stuffing, pengulangan, halaman near-duplicate, klaim pemasaran generik, dan konten yang tidak membantu calon peserta.
- Patuhi seluruh ketentuan `AGENTS.md` dan `docs/content-editorial-standards.md`, termasuk larangan konsultasi/advisory dan larangan menampilkan status internal layanan.

## Urutan pelaksanaan

### Fase 1 — Inventarisasi dan prioritas
- Daftar semua file dan judul pelatihan yang ada.
- Catat kelengkapan konten saat ini dan topik yang masih kurang.
- Kelompokkan berdasarkan standar/skema atau rumpun materi.
- Susun urutan pengerjaan berdasarkan prioritas bisnis, kebutuhan informasi, dan kesiapan sumber.

### Fase 2 — Pemetaan referensi
- Cari dan catat halaman LRQA, DC Konsultan, dan IAS yang relevan untuk setiap pelatihan.
- Tandai sumber yang tidak tersedia atau tidak sebanding.
- Verifikasi versi standar/skema dan klaim teknis dengan sumber primer bila diperlukan.
- Buat ringkasan fakta dan perbedaan sumber sebagai catatan kerja internal.

### Fase 3 — Penulisan dan pembaruan konten
- Kembangkan satu halaman pada satu waktu.
- Sintesis sumber menjadi naskah orisinal yang utuh, bukan gabungan paragraf kompetitor.
- Perbarui frontmatter/blocks pada file pelatihan yang bersangkutan.
- Pertahankan slug, relasi, featured image, dan data terstruktur yang masih valid; ubah hanya bila ada alasan yang terverifikasi.

### Fase 4 — Quality assurance
- Periksa akurasi fakta dan konsistensi terminologi.
- Periksa aturan editorial, kata/konsep terlarang, intro, meta description, featured image alt, dan hierarki heading.
- Pastikan tidak ada percakapan internal, instruksi AI, atau catatan riset dalam konten publik.
- Jalankan validasi konten, test, typecheck/lint/build yang relevan sesuai workflow repository.
- Tinjau diff untuk memastikan perubahan hanya pada file yang dimaksud dan tidak merusak schema atau relasi.

### Fase 5 — Pelaksanaan bertahap
- Selesaikan dan validasi setiap kelompok/per halaman sebelum melanjutkan.
- Catat status pekerjaan (belum diriset, riset selesai, draft, diperbarui, tervalidasi) dalam dokumentasi kerja yang sesuai.
- Jangan menganggap seluruh program selesai hanya karena satu halaman contoh telah diperbarui.

## Output yang diharapkan

Untuk setiap program pelatihan:

1. Pemetaan URL referensi dan catatan riset internal.
2. Daftar topik/fakta yang relevan beserta sumber pendukung.
3. Konten course page yang telah disintesis dan ditulis ulang secara orisinal.
4. Metadata SEO yang sesuai.
5. Hasil validasi dan ringkasan file/commit yang diubah.

## Catatan awal

Pelatihan Auditor Internal FSSC 22000 merupakan contoh awal pendekatan enrichment ini. Pengembangan konten untuk program lainnya **belum dianggap selesai** dan harus dilakukan melalui inventarisasi serta riset mandiri sesuai rencana di atas.

Dokumen ini adalah rencana kerja internal. Isinya tidak boleh dipublikasikan sebagai konten website.
