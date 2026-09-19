# Development Log

Jurnal kronologis development project. File ini mencatat progres, investigasi, keputusan teknis, kendala/blocker, validasi, dan langkah berikutnya.

---

<!--
Gunakan template berikut untuk setiap entry baru di bawah:

## YYYY-MM-DD HH:mm — [Short Title]

### Goal
Jelaskan tujuan pekerjaan.

### Investigation
Catat investigasi penting, kondisi awal, root cause, atau hal yang ditemukan. (Bisa disingkat/dihilangkan jika tidak ada)

### Process
Catat langkah implementasi penting yang dilakukan.

### Files Changed
* `path/to/file`

### Decisions
Catat keputusan teknis atau arsitektural beserta alasannya. (Bisa dihilangkan jika tidak ada)

### Issues / Findings
Catat bug, limitasi, blocker, technical debt, atau solusi yang gagal dicoba.

### Validation
Catat hasil validasi nyata (contoh: Unit test: PASS, Build: PASS, dsb).

### Result
Status kondisi project: Completed / Partially completed / Blocked / Needs further testing.

### Next
Catat pekerjaan logis berikutnya.

---
-->

## 2026-09-19 10:54 — Inisialisasi Aturan Development Progress Logging

### Goal
Menginisialisasi standar pencatatan development log project sesuai panduan `Development Progress Logging Rules`.

### Process
* Menginisialisasi file utama `docs/DEVELOPMENT_LOG.md`.
* Menyiapkan template standar untuk logging sesi development berikutnya.
* Mengintegrasikan aturan logging ke dalam file konfigurasi agen workspace.

### Files Changed
* `docs/DEVELOPMENT_LOG.md`
* `AGENTS.md`

### Result
Completed.

### Next
Menunggu instruksi tugas / pengerjaan fitur berikutnya dari user.

---

## 2026-09-19 10:56 — Inisialisasi Repository Git & .gitignore

### Goal
Menginisialisasi version control Git untuk project dan menyiapkan aturan pengabaian file `.gitignore` agar commit riwayat development rapi dan terstruktur.

### Process
1. Menjalankan `git init` pada workspace root.
2. Membuat file `.gitignore` mencakup dependensi (`node_modules`), build output, konfigurasi environment secrets, dan file cache/editor.
3. Melakukan git staging dan initial commit dengan deskripsi yang deskriptif.

### Files Changed
* `.gitignore`
* `docs/DEVELOPMENT_LOG.md`

### Decisions
* Menambahkan proteksi file build, environment variables, dan cache IDE ke `.gitignore` sejak awal agar file rahasia/berat tidak masuk ke history repository.

### Validation
* `git init`: Berhasil (Initialized empty Git repository).
* `git status`: File `.gitignore`, `AGENTS.md`, dan `docs/` terdeteksi rapi.

### Result
Completed.

### Next
Siap untuk mulai pengerjaan arsitektur / kode aplikasi serta melakukan commit berkala pada setiap milestone/fitur.

---

## 2026-09-19 11:10 — Instalasi & Konfigurasi aaPanel pada Server Harnet

### Goal
Menginstal dan mengonfigurasi aaPanel pada remote server Harnet Digital Creative (`harnet.cloudbee.my.id:2273`) berbasis Ubuntu 24.04 LTS.

### Investigation
* Host: `harnet.cloudbee.my.id` (IP Publik: `154.17.167.145`)
* SSH Port: `2273` (VM internal IP: `192.168.206.59`, hostname `vm329`)
* OS: Ubuntu 24.04.5 LTS (Noble Numbat) x86_64.
* Arsitektur jaringan: NAT VPS.

### Process
1. Memverifikasi koneksi SSH dan elevasi hak akses root melalui `sudo -i`.
2. Mengunduh installer resmi aaPanel versi Ubuntu dari CDN resmi.
3. Menjalankan skrip instalasi non-interaktif/otomatis (`install.sh aapanel`), menginstal dependensi Python, Nginx, Bt-Panel daemon, dan library pendukung.
4. Memvalidasi service Bt-Panel dan Bt-Task berjalan normal (`bt status` & `bt default`).
5. Membuka port yang dibutuhkan pada firewall `ufw`.

### Files Changed
* `docs/DEVELOPMENT_LOG.md`

### Validation
* `bt status`: `Bt-Panel (pid 32220)` & `Bt-Task (pid 32209)` running.
* `ufw status`: Port 31762/tcp, 80, 443, 888 aktif dan diizinkan.
* `bt 14`: Informasi akses panel (URL entrance, username, password) berhasil digenerate.

### Result
Completed.

### Next
Menginformasikan kredensial panel kepada user dan panduan akses via IP/Domain atau port forwarding/tunneling jika port NAT belum dialokasikan secara publik oleh provider.

---

## 2026-09-19 11:34 — Implementasi Fondasi Aplikasi RASTA IT COM (Backend, Frontend, Uploads, MySQL)

### Goal
Membangun fondasi arsitektur project RASTA IT COM yang terdiri dari 3 folder utama di root (`backend/`, `frontend/`, `uploads/`), backend Fastify dengan MySQL lokal (`root` tanpa password), frontend React + Vite + Tailwind CSS dengan styling diselaraskan dengan referensi Vibrasi AI (mendukung Portal Admin dan Petugas), serta engine penyimpanan media terenkripsi dengan hierarki `YYYY/MM/DD/<jenis_media>/`.

### Investigation
* Server referensi: `https://aplikasi-v-ibrasi-ai-five.vercel.app/` diinspeksi via browser subagent. Menggunakan Tailwind CSS, palet Dark Navy (`#0B132B`) + Canvas Slate (`#F0F4F8`) + Rounded Cards (`rounded-2xl`) + Aksen Cyan/Blue gradient + Lucide React.
* MySQL lokal aktif pada `127.0.0.1:3306` (XAMPP instance) user `root` tanpa password.

### Process
1. **Setup Database MySQL**:
   * Membuat database `rasta_it_db`.
   * Membuat tabel `users` (role: `admin`, `petugas`) dan `media_uploads`.
   * Melakukan seed akun default: `admin` / `admin123` dan `petugas` / `petugas123`.
2. **Setup Folder `backend/` (Fastify Stack)**:
   * Menginisialisasi Fastify v4 + TypeScript + NodeNext.
   * Menginstal driver `@fastify/cors`, `@fastify/jwt`, `@fastify/multipart`, `@fastify/static`, `mysql2`, `bcryptjs`.
   * Membangun modular routes: `/api/auth/login`, `/api/auth/me`, `/api/upload/single`, `/api/upload/list`, `/api/upload/:id`, `/api/dashboard/stats`, `/api/health`.
   * Mengonfigurasi static serving file `/uploads/` langsung dari folder root `uploads/`.
3. **Setup Folder `uploads/` (Hierarki Dinamis & Enkripsi Hash)**:
   * Mengembangkan utility `fileStorage.ts` yang otomatis mendeteksi kategori berkas (`images`, `documents`, `videos`, `others`).
   * Membuat struktur direktori fisik otomatis `uploads/YYYY/MM/DD/<jenis_media>/`.
   * Mengenkripsi nama file menggunakan hash kriptografi SHA-256 32-karakter unik dengan tetap mempertahankan ekstensi asli.
4. **Setup Folder `frontend/` (React + Vite + Tailwind CSS)**:
   * Menginisialisasi React 18 + Vite + Tailwind CSS + Lucide Icons.
   * Menyesuaikan `tailwind.config.js` dengan palet warna referensi Vibrasi AI.
   * Membangun `LoginPage` interaktif dengan **Role Switcher** (Portal Admin vs Portal Petugas).
   * Membangun `AdminDashboard` (Monitoring KPI, storage usage, status MySQL, audit berkas).
   * Membangun `PetugasDashboard` (Area drag-and-drop unggah berkas, indikator sukses, riwayat unggahan).
   * Membangun `MediaUploadsList` (Pencarian, filter kategori, preview kartu arsip).
   * Mengonfigurasi Vite proxy `/api` dan `/uploads` ke backend Fastify port 5000.

### Files Changed
* `backend/` (Seluruh struktur src, config, modules, server.ts, tsconfig.json, package.json, .env)
* `frontend/` (Seluruh struktur src, components, pages, context, App.tsx, tailwind.config.js, vite.config.ts, package.json)
* `uploads/` (Inisialisasi folder dan pengetesan direktori fisik YYYY/MM/DD/jenis_media)
* `docs/DEVELOPMENT_LOG.md`

### Validation
* MySQL Connection & Query: PASS (`users` & `media_uploads` aktif).
* Fastify Server: PASS (Listening on `http://localhost:5000`, `/api/health` status OK).
* Auth API: PASS (Login Admin dan Petugas berhasil mereturn JWT token).
* Upload API: PASS (File `laporan-kegiatan-foto.jpg` tersimpan ke `uploads/2026/09/19/images/30275c87fd95cfd553c0e99b91f8b293.jpg` dan terverifikasi di disk serta database).
* Frontend Build (`npm run build`): PASS (Vite production build sukses, 0 error).
* Browser Subagent End-to-End: PASS (Login Admin berhasil menampilkan KPI/Audit, Logout berhasil, Login Petugas berhasil menampilkan Upload Area & Riwayat).

### Result
Completed.

### Next
Mengembangkan fitur spesifik lanjutan sesuai kebutuhan operasional (misal: penambahan form data lapangan, laporan berkala, atau integrasi webhook).

---

## 2026-09-19 11:35 — Sentralisasi Konfigurasi Aplikasi ke Root `.env`

### Goal
Memusatkan seluruh konfigurasi aplikasi (backend Fastify, MySQL, JWT, uploads, dan frontend Vite) ke satu file `.env` di folder root project (`e:\PROJECT RASTA IT COM\.env`) agar mudah dirawat dan dikonfigurasi dalam satu tempat.

### Process
1. Membuat file `.env` terpusat di root direktori dengan seluruh variabel:
   * Server Fastify (`PORT`, `HOST`, `NODE_ENV`).
   * MySQL Database (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
   * Security (`JWT_SECRET`).
   * Storage (`UPLOAD_DIR`, `MAX_FILE_SIZE_MB`).
   * Frontend Vite (`VITE_APP_TITLE`, `VITE_API_BASE_URL`, `VITE_PORT`).
2. Membuat file template `.env.example` di root direktori untuk referensi repository.
3. Menghapus file lokal `backend/.env`.
4. Membuat helper `backend/src/config/env.ts` untuk mendeteksi dan memuat root `.env` secara otomatis dan deterministik.
5. Memperbarui `database.ts`, `server.ts`, dan `upload.routes.ts` untuk mengonsumsi `env` terpusat.
6. Memperbarui `frontend/vite.config.ts` dengan `envDir: '../'` agar frontend otomatis membaca variabel root `.env`.
7. Merestart daemon Fastify backend dan memvalidasi koneksi MySQL dan endpoint health.

### Files Changed
* `.env` (Baru di root, terabaikan di git via .gitignore)
* `.env.example` (Template root)
* `backend/.env` (Dihapus)
* `backend/src/config/env.ts` (Loader terpusat)
* `backend/src/config/database.ts`
* `backend/src/modules/upload/upload.routes.ts`
* `backend/src/server.ts`
* `frontend/vite.config.ts`
* `docs/DEVELOPMENT_LOG.md`

### Validation
* Fastify Server startup log: `Connected to MySQL database: rasta_it_db`, `Listening at http://0.0.0.0:5000`, `Uploads serving from: E:\PROJECT RASTA IT COM\uploads`.
* Healthcheck API: `GET http://localhost:5000/api/health` merespons status `ok` dan environment `development`.
* Git check: `.env` di root tetap diabaikan oleh `.gitignore` sehingga rahasia kredensial aman.

### Result
Completed.

### Next
Siap melanjutkan pengembangan modul fitur aplikasi berikutnya.

---

## 2026-09-19 11:39 — Integrasi Logo Resmi RASTA pada Antarmuka Aplikasi

### Goal
Mengintegrasikan aset logo resmi RASTA (`logo-tr.png` dan `logo-bg-white.jpeg`) ke dalam antarmuka aplikasi frontend (halaman Login, Header navbar, dan favicon).

### Process
1. Memeriksa file logo yang diletakkan user di root (`logo-tr.png` transparan dan `logo-bg-white.jpeg`).
2. Menyalin aset logo ke `frontend/public/` (`logo-tr.png`, `logo-bg-white.jpeg`, dan `favicon.png`).
3. Memperbarui `frontend/index.html` agar menggunakan `/favicon.png` sebagai favicon browser.
4. Memperbarui `frontend/src/components/Header.tsx` untuk menampilkan logo RASTA di navbar Dark Navy dengan kartu/wadah putih rounded yang rapi.
5. Memperbarui `frontend/src/pages/auth/LoginPage.tsx` untuk menampilkan logo RASTA di atas judul dan card login.
6. Memvalidasi kompilasi `npm run build` dan memverifikasi tampilan visual via browser subagent.

### Files Changed
* `frontend/public/logo-tr.png`
* `frontend/public/logo-bg-white.jpeg`
* `frontend/public/favicon.png`
* `frontend/index.html`
* `frontend/src/components/Header.tsx`
* `frontend/src/pages/auth/LoginPage.tsx`
* `docs/DEVELOPMENT_LOG.md`

### Validation
* Vite Build (`npm run build`): PASS (Berhasil terkompilasi, 0 error).
* Browser Subagent Verification: PASS (Logo RASTA tampil jelas dan presisi pada modal login dan navbar header).

### Result
Completed.

### Next
Menunggu instruksi fitur atau data operasional berikutnya dari user.

---

## 2026-09-19 11:42 — Penyesuaian Logo Transparan Hero pada Halaman Login

### Goal
Menghapus wadah/kotak putih dan teks judul "RASTA IT COM" yang redundan di atas form login sesuai arahan visual user, serta menampilkan logo transparan `logo-tr.png` secara langsung dengan proporsi ukuran yang pas dan elegan.

### Process
1. Menghapus elemen pembungkus putih dan teks `<h2>RASTA IT COM</h2>` di `frontend/src/pages/auth/LoginPage.tsx`.
2. Menerapkan gambar logo transparan `/logo-tr.png` langsung sebagai hero logo dengan ukuran proporsional (`h-20 sm:h-24 w-auto object-contain drop-shadow-sm`).
3. Memvalidasi hasil tampilan visual via browser subagent dan memastikan respon build produksi `npm run build` sukses (0 error).

### Files Changed
* `frontend/src/pages/auth/LoginPage.tsx`
* `docs/DEVELOPMENT_LOG.md`

### Validation
* Vite Build (`npm run build`): PASS (3.13s, 0 error).
* Browser Subagent Verification: PASS (Logo transparan tampil bersih langsung di atas teks deskripsi tanpa kotak putih dan tanpa teks berlebih).

### Result
Completed.

### Next
Siap melanjutkan ke pengembangan fitur operasional berikutnya.

---

## 2026-09-19 11:43 — Pemotongan (*Crop*) Whitespace Transparan Atas & Bawah Logo RASTA

### Goal
Memotong area transparan kosong (*empty transparent whitespace*) pada bagian atas dan bawah file `logo-tr.png` yang menyebabkan jarak vertikal berlebih pada antarmuka login.

### Investigation
* Dimensi asli `logo-tr.png` adalah `667 x 374` piksel, namun piksel non-transparan (*bounding box*) hanya berada pada koordinat `(45, 102, 622, 234)` (tinggi teks hanya 132px dari total tinggi 374px, atau >64% tinggi berupa ruang kosong transparan).

### Process
1. Menggunakan library Python Pillow untuk mendeteksi `getbbox()` dari kanal alpha logo dan memotong padding kosong atas-bawah secara presisi (`585 x 140` piksel dengan margin halus 4px).
2. Memperbarui file logo hasil crop ke root, `frontend/public/logo-tr.png`, `frontend/dist/logo-tr.png`, dan favicon.
3. Menyesuaikan dimensi tampilan gambar di `frontend/src/pages/auth/LoginPage.tsx` menjadi `h-11 sm:h-13 w-auto`.
4. Memvalidasi ulang tampilan visual via browser subagent.

### Files Changed
* `logo-tr.png` (Root & public)
* `frontend/public/logo-tr.png`
* `frontend/public/favicon.png`
* `frontend/src/pages/auth/LoginPage.tsx`
* `docs/DEVELOPMENT_LOG.md`

### Validation
* Dimensi file berkurang dari `667x374` menjadi `585x140` tanpa kehilangan resolusi teks logo.
* Vite build: PASS (3.19s, 0 error).
* Browser Subagent Verification: PASS (Ruang kosong transparan di atas dan di bawah logo hilang sempurna, jarak dengan teks judul dan tombol menjadi proporsional).

### Result
Completed.

### Next
Menunggu instruksi fitur atau data operasional berikutnya dari user.

---

## 2026-09-19 11:46 — Pembersihan Sample Login & Penerapan Enkripsi Password Bcrypt Database Murni

### Goal
Menghilangkan box sample login ("Akun Demo Standar Bawaan"), menghilangkan prefill teks otomatis, menghapus teks footer, serta memastikan seluruh proses autentikasi login terhubung murni ke database MySQL `rasta_it_db` dengan password terenkripsi bcrypt (tanpa hardcode / fallback demo apapun).

### Process
1. **Pembaruan Password Terenkripsi di MySQL**:
   * Men-generate hash bcrypt salt rounds 12 untuk password akun:
     * `admin`: `$2b$12$dWOpqgcMVNYvGYNF1PoSLuZI.GCfIwwL.ayvaw1rdNWM01BLFozOe`
     * `petugas`: `$2b$12$D2Kg/WZ.mHsa32nLh/MEwuzMIvtNcmCAlufv9k4loPaYYA.9iI/yC`
   * Mengupdate field `password` pada tabel `users` di database MySQL `rasta_it_db`.
2. **Backend Fastify Auth (`auth.routes.ts`)**:
   * Menghapus seluruh fallback hardcode password (`if password === 'admin123' ...`).
   * Menggunakan verifikasi murni `await bcrypt.compare(password, user.password)` terhadap database.
3. **Frontend Login Page (`LoginPage.tsx`)**:
   * Mengosongkan state inisial `username` dan `password` (default string kosong `''`).
   * Menghilangkan logika autofill saat pergantian role admin/petugas.
   * Menghapus seluruh blok kontainer "Akun Demo Standar Bawaan".
   * Menghapus baris teks footer bawaan di bawah card login.
4. **Validasi End-to-End**:
   * Menjalankan automated API test login valid (`admin` & `petugas` return 200 dengan JWT) dan invalid (return 401).
   * Menjalankan browser subagent: verifikasi form kosong dan pengetesan login interaktif ke Admin Dashboard.

### Files Changed
* `backend/src/modules/auth/auth.routes.ts`
* `frontend/src/pages/auth/LoginPage.tsx`
* `docs/DEVELOPMENT_LOG.md`

### Validation
* Automated API Auth Test:
  * Admin login (`admin` / `admin123`): PASS (200 OK, JWT valid)
  * Petugas login (`petugas` / `petugas123`): PASS (200 OK, JWT valid)
  * Invalid password (`admin` / `wrongpass99`): PASS (401 Unauthorized, pesan error tepat)
* Vite build (`npm run build`): PASS (2.95s, 0 error).
* Browser Subagent Verification: PASS (UI login sangat bersih, tanpa box demo, input manual berfungsi, login berhasil redirect ke Admin Dashboard).

### Result
Completed.

### Next
Menunggu instruksi penambahan fitur fungsional atau formulir operasional berikutnya dari user.








