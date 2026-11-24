# Arsitektur Structured Data (JSON-LD)

**Status:** Implementasi awal  
**Generator:** `src/lib/structured-data.ts`  
**Renderer:** `src/layouts/Layout.astro`  
**Sumber data:** Content collections dan `src/site.ts`

## Prinsip

- `site.ts` adalah sumber identitas Organization.
- JSON-LD dibuat dari frontmatter dan blok konten yang benar-benar dirender.
- Setiap entitas menggunakan `@id` kanonis agar halaman lain dapat merujuk ke entitas yang sama.
- Jangan membuat relasi hanya dari kemiripan judul atau keyword. Hubungan harus dinyatakan eksplisit pada konten.
- Jangan menambahkan data jadwal, harga, lokasi, pengajar, akreditasi, atau klaim lain yang tidak tersedia dan terverifikasi.
- JSON-LD harus mencerminkan konten yang dapat dilihat pengguna.

## Graph per jenis halaman

### Halaman layanan

Halaman layanan menghasilkan `WebPage`, `Service`, dan `BreadcrumbList`. Setiap `Service` merujuk ke Organization melalui `provider.@id`.

### Halaman pelatihan

Halaman pelatihan menghasilkan:

- `WebPage` dan `BreadcrumbList`;
- `Course` dengan Organization sebagai provider;
- `FAQPage` dari setiap blok `faq` yang ditampilkan;
- `HowTo` dari setiap blok `howto` yang ditampilkan;
- `CourseInstance` hanya dari entri jadwal yang memiliki tanggal mulai dan selesai serta tidak dibatalkan;
- entitas `Service` yang terkait secara eksplisit.

Gunakan `relatedServiceSlugs` pada frontmatter pelatihan untuk menghubungkan kursus dengan layanan yang benar-benar berkaitan. Slug yang tidak ditemukan atau tidak dipublikasikan akan menggagalkan build agar relasi yang rusak tidak diam-diam diterbitkan.

Contoh:

```yaml
relatedServiceSlugs:
  - "sertifikasi-fssc-22000"
```

Generator menghubungkan `Course.about` ke `Service.@id`. Hubungan ini menyatakan topik atau subjek yang dibahas kursus, bukan bahwa mengikuti pelatihan sama dengan memperoleh sertifikasi.

### Halaman artikel

Halaman artikel menghasilkan `Article`, `WebPage`, dan `BreadcrumbList`. Artikel dapat terhubung ke layanan menggunakan `serviceId` yang sudah tersedia pada schema artikel dan ke program pelatihan menggunakan `relatedTrainingSlugs`.

Contoh:

```yaml
relatedTrainingSlugs:
  - "pelatihan-auditor-internal-fssc-22000"
```

Relasi artikel divalidasi terhadap entri layanan/pelatihan yang dipublikasikan. Blok FAQ dan HowTo hanya ditambahkan ke graph bila blok tersebut juga ditampilkan pada halaman.

## Penamaan ID kanonis

- Organization: `{siteUrl}/#organization`
- Service: `{serviceCanonicalUrl}#service`
- Course: `{trainingCanonicalUrl}#course`
- CourseInstance: `{trainingCanonicalUrl}#course-instance-{scheduleSlug}`
- Article: `{articleCanonicalUrl}#article`
- WebPage: `{canonicalUrl}#webpage`
- BreadcrumbList: `{canonicalUrl}#breadcrumb`

Jangan mengubah pola `@id` tanpa memperbarui seluruh generator yang merujuknya.

## Catatan validasi

- Keberadaan tipe Schema.org tidak menjamin Google menampilkan rich result.
- FAQ dan HowTo tetap dapat digunakan untuk mendeskripsikan konten secara semantik, tetapi jangan menjanjikan tampilan khusus di Google.
- Setelah perubahan generator, jalankan `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`, dan audit SEO.
- Periksa HTML hasil build atau URL publik melalui Schema Markup Validator. Jangan hanya memeriksa satu halaman; uji halaman layanan, pelatihan dengan FAQ/HowTo, pelatihan dengan jadwal, dan artikel.
