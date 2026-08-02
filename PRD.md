# Product Requirement Document (PRD)
## PawCare AI – Deteksi Dini & Pertolongan Pertama Kesehatan Hewan Peliharaan Berbasis Multi-Modal AI

* **Versi Dokumen**: 1.0.0
* **Target Kompetisi**: Bitsmikro Innovative Vibecode 2026 (Universitas Mikroskil)
* **Kategori**: Teknologi / Kesehatan / Inovasi Digital
* **Metode Pengembangan**: Vibe Coding (Google Gemini API + Modern Web Stack)

---

## 1. Executive Summary & Visi Produk

**PawCare AI** adalah platform web asisten kesehatan hewan peliharaan (*anabul*: kucing & anjing) berbasis Artificial Intelligence multi-modal (teks dan gambar). Platform ini dirancang untuk memberikan **triase medis darurat mandiri**, panduan pertolongan pertama berbasis bukti ilmiah (*Evidence-Based Veterinary Medicine*), serta rujukan lokasi klinik hewan 24 jam terdekat.

### Visi Utama:
Menjadi pertolongan pertama digital yang cepat, akurat, dan terpercaya bagi pemilik hewan peliharaan guna menekan angka kematian satwa akibat keterlambatan penanganan medis dasar.

---

## 2. Problem Statement & Urgensi (Why Now?)

1. **Akses Klinik Terbatas di Malam Hari**: Gejala kritis pada hewan (seperti muntah berulang, lemas mendadak, kejang) sering terjadi di luar jam operasional klinik biasa.
2. **Kepanikan & Penanganan Yang Salah**: Pemilik hewan kerap kali panik dan memberikan obat manusia (seperti Paracetamol) yang justru beracun dan mematikan bagi kucing/anjing.
3. **Biaya Konsultasi Darurat Tinggi**: Kekhawatiran biaya membuat pemilik menunda penanganan awal hingga kondisi hewan terlanjur parah.
4. **Maraknya Informasi Kucing Abal-abal**: Banyak saran di media sosial yang tidak didasari riset medis veteriner yang valid.

---

## 3. Target Pengguna (User Persona)

* **Primary Users**: Pemilik hewan peliharaan (*cat/dog lovers*), mahasiswa, anak kos, dan keluarga pemelihara anabul.
* **Secondary Users**: Komunitas penyelamat hewan (*animal rescue*), kawan vet medis, dan masyarakat umum.

---

## 4. Fitur Utama & Spesifikasi Teknis (Feature Breakdown)

### 🔴 Fitur 1: Multi-Modal Symptom & Photo Analyzer (AI Triase)
* **Deskripsi**: Pengguna mengunggah foto kondisi fisik hewan (mata, gusi, kulit, kotoran, atau posisi tubuh) serta mengetik deskripsi gejala.
* **Mekanisme AI**: Google Gemini API (Multimodal Vision + Text) menganalisis gabungan visual dan deskripsi teks secara *real-time*.
* **Output**: Estimasi status triase dalam bentuk **Traffic Light Alert**:
  * 🔴 **RED (Emergency / Kritis)**: Butuh tindakan dokter hewan segera (< 2 jam).
  * 🟡 **YELLOW (Warning / Monitor)**: Pertolongan pertama di rumah + pantau 24 jam.
  * 🟢 **GREEN (Mild / Aman)**: Perawatan mandiri dan pemulihan rutin.

### 📚 Fitur 2: Evidence-Based Citation & Rujukan Jurnal (SINTA / Medis)
* **Deskripsi**: Menampilkan 2–3 sitasi literatur ilmiah atau jurnal veteriner terpercaya (misal: Jurnal Kedokteran Hewan Indonesia terindeks SINTA, IPB, UGM, atau Merck Vet Manual) yang mendasari analisis AI.
* **Tujuan**: Mencegah *hallucination* AI dan membangun kepercayaan pengguna bahwa analisis bersifat ilmiah.

### 🩹 Fitur 3: Interactive First-Aid Action Checklist
* **Deskripsi**: Langkah-langkah penanganan darurat yang aman dilakukan pemilik hewan di rumah sebelum dibawa ke klinik.
* **Fitur**: Checkbox langkah demi langkah, peringatan larangan (misal: *"Dilarang memberi paracetamol/panadol!"*), dan panduan pertolongan pertama (cara mengatasi dehidrasi, luka, atau keracunan).

### 🏥 Fitur 4: Emergency Vet Finder & Direct Contact
* **Deskripsi**: Menampilkan lokasi dan kontak klinik hewan 24 jam terdekat berdasarkan posisi atau kota pengguna.
* **Aksi**: Tombol cepat *Call Emergency* dan *Get Directions* ke lokasi klinik.

### 📄 Fitur 5: Download Ringkasan Rekam Medis (Medical Summary PDF)
* **Deskripsi**: Mengunduh atau mencetak ringkasan hasil analisis AI dan riwayat gejala untuk langsung diserahkan kepada dokter hewan saat tiba di klinik.

---

## 5. Arsitektur Sistem & Arsitektur Vibe Coding

```
[ User Input ] ---> ( Foto Fisik + Ketik Gejala )
                        |
                        v
[ Web Interface ] -> [ System Prompting & Google Gemini API (Vision + Grounding) ]
                        |
                        v
[ Output Engine ] -> [ Status Triase (Merah/Kuning/Hijau) ]
                  -> [ Rekomendasi Pertolongan Pertama ]
                  -> [ Citasi Jurnal Veteriner (SINTA/IPB/UGM) ]
                  -> [ Daftar Klinik Vet 24 Jam Terdekat ]
```

### Tech Stack:
* **Frontend**: HTML5, Vanilla CSS (Modern Dark Mode / Glassmorphism Theme), Vanilla JavaScript (ES6+).
* **AI Engine**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`) via Google AI Studio (Free Tier 🤑).
* **Keamanan Kode**: Penyimpanan API Key via Environment Variables (`.env`) & Lisensi Open Source (MIT Non-Commercial License).
* **Deployment**: Vercel / Netlify (Link Akses Publik).


### 5.1 UI/UX Design System & Motion Architecture
* **Visual Vibe**: Hybrid Dark Glassmorphic Theme (Non-AI-slop) with `#121212` canvas and translucent `#181818` frosted glass cards (`backdrop-filter: blur(12px)`).
* **Typography**: Google Fonts `Outfit` (Display & Titles) + `Plus Jakarta Sans` (Body & Buttons).
* **Mobile-First UX**: Direct smartphone camera capture (`capture="environment"`), 1-column responsive layout (no horizontal scroll), 48px touch targets, and 1-tap emergency clinic dialing (`tel:` & Google Maps).
* **Motion & Micro-Animations System**:
  1. *Photo Laser Scanner*: Sinar laser hijau meluncur di atas foto anabul saat AI menganalisis.
  2. *Emergency Beacon Pulse*: Denyutan pendaran merah pada kartu status darurat.
  3. *Spring Slide-Up*: Kartu hasil triase meluncur dari bawah dengan kurva membal `cubic-bezier`.
  4. *Tactile Pill Bounce*: Tombol pill membal halus pas ditap jempol di layar HP.

---

## 6. Pemetaan Ke Proposal Lomba (Guidebook Alignment BAB 1 - 5)

Dokumen PRD ini disinkronkan langsung dengan struktur wajib Proposal Lomba Bitsmikro:

| Bab Proposal | Isi Sinkronisasi dari PRD |
|---|---|
| **BAB I PENDAHULUAN** | Latar Belakang Urgensi Anabul, Rumusan Masalah Pertolongan Pertama, Tujuan & Manfaat PawCare AI. |
| **BAB II DESKRIPSI PROJECT** | Deskripsi PawCare AI, Target Pengguna (Anak Kos/Pemilik Anabul), Solusi Triase AI, Keunggulan Citation SINTA. |
| **BAB III PERANCANGAN SISTEM** | Analisis Kebutuhan, User Flow Analysis, Arsitektur Gemini Multi-modal, UI/UX Wireframe, Teknologi Stack. |
| **BAB IV IMPLEMENTASI & PENGUJIAN** | Tahapan Vibe Coding, Implementasi Gemini API Prompting, Hasil Pengujian Triase, Dokumentasi Prompt. |
| **BAB V PENUTUP** | Kesimpulan Efektivitas PawCare AI, Rencana Pengembangan Startup & Integrasi Layanan Vet. |
| **LAMPIRAN** | Link Repo GitHub, Link Deployment Vercel, Pembagian Tugas Tim (2-3 Orang), Log Prompting AI. |

---

## 7. Strategi Presentasi Demo Lomba (Demo Fast-Track & Robust Architecture)

Untuk memastikan pengujian dan demonstrasi aplikasi di hadapan Dewan Juri Lomba Bitsmikro 2026 berjalan **100% Flawless, Berkecepatan Tinggi (<1s), dan Zero-Error**, PawCare AI dilengkapi dengan 3 pilar arsitektur demo:

1. **Netlify Serverless Backend Proxy (`/.netlify/functions/gemini`)**:
   * Memproses data foto dan teks via serverless Node.js backend untuk mencegah hambatan CORS & otentikasi browser.
2. **Dual-Layered AI Vision Protection Engine**:
   * Menggabungkan analisis cloud **Google Gemini 1.5 Flash Vision API** dengan **HTML5 Canvas Color Histogram & Pixel Analyzer** di sisi client.
3. **Demo Fast-Track & Visual Focus Selector**:
   * Dilengkapi tombol sampel kasus medis darurat (Ringworm Kucing, Pug Muntahan Makanan, Kudis Mange Anjing, Papiloma Mulut) serta pilihan *Focus Visual Pill* untuk pengalaman navigasi yang responsif dan memukau bagi dewan juri.

---

* **Dokumen Disusun Oleh**: Ichsan Nurpratama Dikara (NIM: 202531049, Kelas B, Universitas Mikroskil)
* **Status Proyek**: Produksi Live (100% Deployed on Netlify Cloud)

---

## 8. Indikator Keberhasilan (Success Metrics for Pitching)

1. **Kecepatan Analisis**: Hasil triase keluar < 5 detik setelah submit foto & gejala.
2. **Kesesuaian Proposal vs Produk**: 100% fitur di proposal ada dan berjalan di *Live Demo*.
3. **Kualitas Prompting**: AI mampu menghasilkan struktur respon JSON yang rapi dan bebas halusinasi.
