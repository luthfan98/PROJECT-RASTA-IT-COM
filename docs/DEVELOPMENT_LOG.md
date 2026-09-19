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



