# Omni Learn

> Status final demo: Omni Learn sekarang mencakup auth multi-peran, dashboard akademik, input nilai dengan SHA-256 fingerprint, portofolio dokumen, simulasi wallet/blockchain, QR public verification, AI Learning Assistant lokal, dan export portofolio via halaman cetak/PDF.

## Cara Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

Akun demo:

- Email: `andini@sekolah.id`
- Password: `demo123`

## Fitur Final Prototype

- Auth Register/Login untuk Siswa, Orang Tua, dan Admin Sekolah.
- Dashboard dengan statistik nilai, tren semester, aktivitas terbaru, dan status verifikasi.
- Rekam Nilai dengan hash SHA-256 untuk setiap catatan akademik.
- Portofolio dokumen/prestasi dengan status pending atau on-chain.
- Simulasi wallet dan mint hash ke ledger lokal.
- QR/link verifikasi publik dengan payload proof mandiri.
- AI Learning Assistant lokal untuk membaca pola nilai dan membuat rekomendasi belajar.
- Export portofolio ke halaman siap cetak atau simpan sebagai PDF.

---

**Rekam jejak akademik digital berbasis Web3 dan AI.**

---

## 📖 Latar Belakang

Rekam jejak akademik seorang anak dimulai sejak mereka pertama kali duduk di bangku sekolah — mulai dari nilai rapor, prestasi, sertifikat, hingga catatan perkembangan dari tahun ke tahun. Namun hingga saat ini, mayoritas sistem pencatatan akademik di Indonesia masih bergantung pada dokumen fisik. Hal ini menimbulkan beberapa permasalahan krusial:

1. **Rentan Hilang, Rusak, dan Dipalsukan**: Dokumen fisik seperti rapor cetak dan sertifikat kertas sangat rentan rusak, hilang, atau dimanipulasi oleh pihak yang tidak bertanggung jawab.
2. **Kesulitan Verifikasi**: Ketika seorang siswa tumbuh dewasa dan memasuki dunia kerja atau jenjang pendidikan tinggi, dokumen yang seharusnya menjadi portofolio hidup itu seringkali sudah tidak dapat dilacak, tidak lengkap, atau tidak dapat diverifikasi secara kredibel oleh pihak penerima.
3. **Pembelajaran Tidak Terpersonalisasi (One-Size-Fits-All)**: Sistem pendidikan saat ini cenderung seragam. Setiap siswa memiliki potensi, ritme belajar, dan kebutuhan yang berbeda, namun belum ada mekanisme proaktif yang melacak dan menganalisis perkembangan individual dari waktu ke waktu untuk memberikan arahan belajar yang spesifik dan personal.

## 💡 Solusi Omni Learn

**Omni Learn** hadir sebagai platform cerdas yang memecahkan masalah dokumentasi dan personalisasi pembelajaran secara terintegrasi dalam satu ekosistem digital:

1. **Keamanan Dokumen Permanen (Web3 & Blockchain)** ⛓️  
   Omni Learn memanfaatkan teknologi pencatatan terdesentralisasi untuk mencetak setiap nilai, rapor, dan pencapaian siswa sebagai rekam jejak digital yang *immutable* (tidak dapat diubah, terenkripsi, dan anti-pemalsuan). Setiap entri data akan diverifikasi dan dicatat dengan sidik jari kriptografis (SHA-256 Hash) dalam rantai blok permanen, menjamin portofolio anak aman selamanya dan mudah dibagikan secara digital sebagai bukti kredibel tanpa verifikasi manual yang panjang.

2. **Personalisasi Belajar (AI Learning Assistant)** 🤖  
   Platform ini mengintegrasikan kecerdasan buatan dengan arsitektur privasi tinggi yang membaca dan menganalisis *ledger* (buku besar) rekam jejak siswa secara longitudinal. AI menelusuri pola kekuatan, tren perkembangan, serta area yang membutuhkan perhatian khusus. Hasil analisis ini kemudian diterjemahkan menjadi rekomendasi jalur pembelajaran yang personal dan sangat adaptif dengan kondisi riil masing-masing siswa.

## ✨ Fitur Utama (Phase 1 Prototype)

Saat ini, aplikasi berjalan pada **Phase 1**, yakni prototipe fungsional antarmuka dan penyusunan struktur arsitektur dasar. Fitur yang tersedia antara lain:

* **Autentikasi Multi-Peran**: Mendukung pengalaman pengguna untuk 3 aktor utama—**Siswa** 🎓 (untuk melihat progres), **Orang Tua** 👪 (untuk memantau), dan **Admin Sekolah** 🏫 (untuk kelola data).
* **Dashboard Akademik**: Menyediakan ringkasan data siswa lengkap dengan grafik tren nilai rata-rata per semester yang responsif, serta log aktivitas terbaru.
* **Pencatatan Rekam Nilai dengan Sidik Jari Digital**: Mencatat pelajaran, nilai, dan semester. Secara otomatis menghasilkan *Hash SHA-256* dari bobot data tersebut yang menyimulasikan kesiapan pencatatan ke dalam *smart contract* blockchain.
* **Manajemen Portofolio & Kejuaraan**: Modul khusus untuk mengarsipkan sertifikat, piagam, dan rapor per semester yang dilengkapi dengan status sinkronisasi *on-chain*.

## 🛠️ Stack Teknologi

* **Frontend Framework**: React 19 dengan TypeScript.
* **Build Tool**: Vite (untuk eksekusi HMR yang ringan dan performa bundling maksimal).
* **Styling**: Tailwind CSS terintegrasi untuk menyajikan UI modern yang rapi, elegan, dan responsif.
* **Kriptografi Lokal**: Penggunaan `crypto.subtle` berbasis Web Crypto API murni untuk *hashing* dokumen mentah (SHA-256).
* **State Management & Persistence**: Penyimpanan data in-memory menggunakan persistensi sekunder melalui standard `localStorage` (untuk memfasilitasi demo data).

## 🚀 Cara Menjalankan Secara Lokal

1. **Instalasi Node.js**: Pastikan lingkungan Anda memiliki koneksi NPM dan Node.js yang memadai.
2. **Install Dependensi**: Buka terminal dan jalankan `npm install` dari *root* direktori.
3. **Jalankan Development Server**: Eksekusi perintah `npm run dev`.
4. **Alamat Aplikasi**: Buka browser yang diarahkan pada alamat localhost yang disajikan oleh *output* CLI Anda. (Utamanya di `http://localhost:3000`).

> **💡 Tips Login Demo:**  
> Untuk mengakses segera pengalaman siswa:
> * **Email:** `andini@sekolah.id`
> * **Password:** `demo123`  
> *(Akun ini telah dilengkapi dengan nilai awal acak dan dokumen portofolio sebagai bukti konsep).*

## 🗺️ Roadmap Pengembangan

* [x] **Phase 1: Foundation (Aktif Saat Ini)** – UI/UX, Local Hashing, Analytics Dashboard, Document Management, Simulasi Ledger Kriptografis.
* [ ] **Phase 2: Verifikasi On-Chain** – Implementasi *smart contract* sesungguhnya (Solidity/L1/L2) untuk menyimpan hash data langsung ke publik/private Blockchain.
* [ ] **Phase 3: AI Learning Assistant** – Integrasi pengenalan pola dengan Model AI tersolasi yang memberikan wawasan pembelajaran dan target belajar adaptif berdasarkan transkripsi akademis yang tersertifikasi pada Phase 2.
