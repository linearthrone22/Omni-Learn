# Omni Learn

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

## ☁️ Panduan Deploy Gratis di Vercel

Karena Anda memiliki **GitHub Student Developer Pack**, Anda dapat men-deploy aplikasi full-stack (React + Serverless API) ini ke **Vercel** secara gratis dan sangat mudah dengan integrasi otomatis.

### Langkah-langkah Deployment:

1. **Hubungkan Kode ke GitHub**:
   - Buat repositori baru di akun GitHub Anda (misal: `omni-learn`).
   - Push seluruh kode proyek ini ke repositori tersebut:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/USERNAME/REPOS_NAME.git
     git push -u origin main
     ```

2. **Daftar/Masuk ke Vercel**:
   - Pergi ke [Vercel](https://vercel.com) dan daftar menggunakan akun GitHub Anda.

3. **Import Project di Vercel**:
   - Klik tombol **"Add New"** -> **"Project"**.
   - Pilih repositori `omni-learn` dari daftar repositori GitHub Anda yang terhubung.

4. **Konfigurasi Project**:
   - **Framework Preset**: Pilih **Vite** (Vercel akan mendeteksinya secara otomatis).
   - **Root Directory**: Biarkan default (`./`).
   - **Build Command**: `npm run build` atau biarkan default Vercel untuk Vite.
   - **Output Directory**: `dist` (Vercel mendeteksinya secara otomatis).

5. **Tambahkan Environment Variables**:
   - Di bagian **Environment Variables** sebelum klik deploy, tambahkan:
     * **Key**: `GEMINI_API_KEY`
     * **Value**: *(Masukkan kunci API Gemini Anda)*
     * *(Opsional)* **Key**: `APP_URL` | **Value**: *(Gunakan URL deployment Vercel Anda nantinya)*

6. **Klik Deploy** 🚀:
   - Klik tombol **Deploy** dan tunggu proses build selesai (kurang dari 1 menit).
   - Vercel akan otomatis menyajikan aplikasi Anda dengan domain HTTPS gratis (contoh: `omni-learn.vercel.app`).
   - Setiap kali Anda melakukan `git push` ke GitHub, Vercel akan otomatis melakukan build dan update versi terbaru secara real-time!

## 🗺️ Roadmap Pengembangan

* [x] **Phase 1: Foundation (Aktif Saat Ini)** – UI/UX, Local Hashing, Analytics Dashboard, Document Management, Simulasi Ledger Kriptografis.
* [ ] **Phase 2: Verifikasi On-Chain** – Implementasi *smart contract* sesungguhnya (Solidity/L1/L2) untuk menyimpan hash data langsung ke publik/private Blockchain.
* [ ] **Phase 3: AI Learning Assistant** – Integrasi pengenalan pola dengan Model AI tersolasi yang memberikan wawasan pembelajaran dan target belajar adaptif berdasarkan transkripsi akademis yang tersertifikasi pada Phase 2.
