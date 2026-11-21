# CSMS — Implementation & Document Status Tracker

**Status keseluruhan:** INTERNAL PLANNING — NOT APPROVED FOR CUSTOMER DELIVERY OR PUBLIC LAUNCH  
**Baseline repository:** `main`  
**Baseline commit checked:** `9a4d36ca3add448b72e13c80c6358e1521fbd622`  
**Last repository check:** 21 November 2026

> **Cara membaca status**
> - **SELESAI — DOKUMEN:** dokumen/template/checkpoint sudah tersedia dan ditinjau dalam repository. Ini hanya menyatakan pekerjaan dokumentasi selesai, bukan berarti kontrol sudah diterapkan atau disetujui.
> - **BELUM — IMPLEMENTASI/APPROVAL:** bukti pelaksanaan, keputusan pejabat berwenang, penunjukan personel, atau persetujuan yang dipersyaratkan belum tersedia.
> - **DIPERTAHANKAN:** safeguard sengaja tetap aktif; bukan pekerjaan yang harus dihapus.
>
> Tracker ini mengonsolidasikan status artefak dan prasyarat CSMS yang memang sudah dibuat. Tracker ini **bukan roadmap baru dan tidak mengubah urutan/tahapan rencana implementasi yang telah disepakati**.

## 1. Status dokumen kerja CSMS

| Dokumen | Status dokumen | Apa yang sudah tersedia | Yang masih harus dilakukan |
|---|---|---|---|
| [Service Catalog](../service-catalog.md) | **SELESAI — DOKUMEN** | Benchmark, definisi layanan usulan, batasan klaim, approval gates, dan tautan toolkit | Pertahankan status planned; finalisasi hanya setelah seluruh gate disetujui |
| [Requirement & Evidence Matrix](requirement-evidence-matrix.md) | **SELESAI — TEMPLATE** | Matriks untuk memetakan persyaratan principal ke bukti dan sumber/revisi | Isi hanya memakai persyaratan principal aktual yang telah diverifikasi |
| [Readiness Assessment Form](readiness-assessment-form.md) | **SELESAI — DRAFT TEMPLATE** | Formulir penilaian, metode, sampling, temuan, batasan, dan review | Persetujuan metodologi; uji dan revisi setelah pilot yang diotorisasi |
| [Readiness Report Template](readiness-report-template.md) | **SELESAI — DRAFT TEMPLATE** | Struktur laporan, bukti, temuan, tindakan, batasan, dan otorisasi laporan | Tetapkan reviewer/approver yang kompeten; jangan menerbitkan sebelum disetujui |
| [Operational Procedure](operational-procedure.md) | **SELESAI — DRAFT v0.2** | Alur enquiry hingga pelaporan, pengendalian, keluhan, dan stop/go | Review dan persetujuan formal; implementasikan sebelum layanan berjalan |
| [Competence Matrix](competence-matrix.md) | **SELESAI — FRAMEWORK** | Dimensi kompetensi, skala internal, register, dan otorisasi penugasan | Tetapkan personel aktual; verifikasi bukti kompetensi dan otorisasi per penugasan |
| [Impartiality & Conflict Register](impartiality-conflict-register.md) | **SELESAI — FRAMEWORK** | Metode identifikasi ancaman, evaluasi, safeguard, dan register konflik | Deklarasi aktual, evaluasi konflik per engagement, dan penunjukan reviewer independen |
| [Document Control & Retention](document-control-retention.md) | **SELESAI — FRAMEWORK** | Kontrol dokumen, inventaris, akses, legal hold, disposal, dan master register | Setujui klasifikasi, akses, retensi, keamanan, dan jadwal penyimpanan aktual |
| [Management Approval Register](management-approval-register.md) | **SELESAI — REGISTER DRAFT** | 12 keputusan manajemen dan bukti minimum untuk menutupnya | Seluruh keputusan masih Pending; isi hanya setelah keputusan nyata diberikan |
| [Roles, Responsibilities & Resource Plan](roles-responsibilities-resource-plan.md) | **SELESAI — RENCANA DRAFT** | Fungsi, pemisahan peran, RACI, checklist otorisasi, dan kebutuhan sumber daya | Tunjuk role holder; setujui kapasitas, anggaran, fasilitas, dan sistem |
| [Source Verification & Sampling](source-verification-and-sampling.md) | **SELESAI — PROSEDUR KERJA** | Verifikasi sumber, applicability, sampling, keterbatasan, dan checklist | Terapkan pada dokumen principal aktual; verifikasi independen |
| [Pilot Remediation Register](pilot-remediation-register.md) | **SELESAI — REGISTER** | Sepuluh tindakan RA-01–RA-10 dengan kriteria closure | Seluruh 10 tindakan masih Open; tetapkan owner/tenggat dan tutup dengan bukti |
| [Governance Consistency Audit](governance-consistency-audit.md) | **SELESAI — AUDIT DOKUMENTASI** | 10 temuan; 3 koreksi dokumentasi dicatat selesai | Tindak lanjuti temuan terbuka; audit ini bukan bukti kesiapan operasional |
| [Pilot Case Simulation](pilot/pilot-case-simulation.md) | **SELESAI — SIMULASI SAJA** | Kasus, principal, kriteria, dan bukti fiktif untuk menguji alur | Tidak dapat dipakai sebagai bukti customer/principal; pilot nyata perlu otorisasi terpisah |
| [Pilot Assessment & Report](pilot/pilot-assessment-and-report.md) | **SELESAI — SIMULASI SAJA** | Form penilaian, contoh laporan, dan observasi proses simulasi | Tidak membuktikan kompetensi, efektivitas, atau kesiapan operasional |

## 2. Status keputusan dan tindakan yang belum selesai

### 2.1 Keputusan manajemen — 12 dari 12 masih Pending

Sumber status: [Management Approval Register](management-approval-register.md).

| Kelompok keputusan | ID | Status |
|---|---|---|
| Model bisnis, target principal, legal/claims | MGT-01–MGT-03 | **BELUM — PENDING** |
| Kompetensi dan impartiality | MGT-04–MGT-05 | **BELUM — PENDING** |
| Metodologi dan dokumen terkendali | MGT-06 | **BELUM — PENDING** |
| Privasi, keamanan informasi, dan retensi | MGT-07 | **BELUM — PENDING** |
| Sumber daya dan komersial | MGT-08–MGT-09 | **BELUM — PENDING** |
| Otorisasi pilot, review pilot, publikasi | MGT-10–MGT-12 | **BELUM — PENDING** |

**Tidak ada persetujuan yang boleh diasumsikan.** Register hanya dianggap selesai per keputusan jika approver berwenang, tanggal, keputusan, kondisi, dan bukti persetujuan nyata dicatat.

### 2.2 Remediasi hasil simulasi — 10 dari 10 masih Open

Sumber status: [Pilot Remediation Register](pilot-remediation-register.md).

| ID | Pokok tindakan | Status |
|---|---|---|
| RA-01 | Verifikasi sumber principal aktual | **BELUM — OPEN** |
| RA-02 | Traceability persyaratan dan bukti | **BELUM — OPEN** |
| RA-03 | Kecukupan bukti | **BELUM — OPEN** |
| RA-04 | Metode sampling | **BELUM — OPEN** |
| RA-05 | Kompetensi dan otorisasi personel | **BELUM — OPEN** |
| RA-06 | Impartiality dan konflik kepentingan | **BELUM — OPEN** |
| RA-07 | Technical review | **BELUM — OPEN** |
| RA-08 | Tata kelola data dan keamanan | **BELUM — OPEN** |
| RA-09 | Review faktual oleh klien | **BELUM — OPEN** |
| RA-10 | Penanganan keluhan | **BELUM — OPEN** |

Tindakan hanya dapat ditutup dengan bukti implementasi objektif dan verifikasi independen, bukan karena dokumen atau template sudah dibuat.

### 2.3 Hasil audit governance

Sumber status: [Governance Consistency Audit](governance-consistency-audit.md).

- **SELESAI — AUD-01 sampai AUD-03:** tiga inkonsistensi dokumentasi dikoreksi.
- **BELUM — AUD-04 sampai AUD-09:** enam gate manajemen/operasional masih terbuka.
- **DIPERTAHANKAN — AUD-10:** halaman publik CSMS tetap draft sebagai safeguard publikasi.

## 3. Status halaman publik

File: `src/content/services/csms-contractor-safety-management-system.md`

**Status: DIPERTAHANKAN SEBAGAI DRAFT (`draft: true`).**  
Jangan mengubahnya menjadi published, menambahkan CTA aktif, atau membuat klaim sertifikasi/otorisasi CSMS sebelum MGT-12 dan seluruh prasyarat yang relevan disetujui serta dibuktikan.

## 4. Log pelaksanaan lanjutan CSMS

### Tahap CSMS-DOC-01 — Traceability persyaratan dan bukti (RA-02)

- [x] Menambahkan pola ID unik REQ / EV / FR / ACT / report statement.
- [x] Menetapkan rantai keterlacakan requirement → evidence → finding → action → report.
- [x] Menambahkan checklist kelengkapan dan pencatatan exception.
- [ ] Uji dengan source principal aktual yang telah diverifikasi.
- [ ] Review independen atas record hasil uji dan persetujuan metodologi.

**Status RA-02:** **BELUM — OPEN**. Yang selesai baru penguatan template; belum ada source principal aktual, engagement record, maupun verifikasi independen. Tidak dihitung sebagai remediasi operasional yang ditutup.

## 5. Kesimpulan status saat ini

- Pekerjaan riset, definisi layanan, toolkit, framework governance, simulasi, register, dan audit dokumentasi: **sudah dibuat sebagai artefak internal**.
- Persetujuan manajemen: **belum — 12/12 Pending**.
- Remediasi simulasi: **belum — 10/10 Open**.
- Kesiapan operasional untuk customer delivery: **belum dibuktikan**.
- Otorisasi pilot customer: **belum diberikan**.
- Persetujuan publikasi: **belum diberikan**.
- Halaman CSMS publik: **tetap draft**.

**Aturan pembaruan:** setiap perubahan status wajib merujuk bukti yang dapat diperiksa (decision record, appointment, competence evidence, approved procedure, test record, source verification, pilot authorization, atau release approval). Perbarui tracker ini dan dokumen register sumber pada commit yang sama. Jangan mengubah status hanya berdasarkan percakapan atau niat.
