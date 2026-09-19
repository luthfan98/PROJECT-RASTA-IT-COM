# Development Progress Logging Rules

Project ini harus memiliki catatan development yang rapi dan terus diperbarui selama proses pengerjaan.

Gunakan file utama:
`docs/DEVELOPMENT_LOG.md`

File ini berfungsi sebagai jurnal kronologis development project.

## Before Starting Work
Sebelum mengerjakan task:
1. Baca bagian terbaru dari `docs/DEVELOPMENT_LOG.md`.
2. Pahami progress terakhir, issue yang masih terbuka, keputusan sebelumnya, dan pekerjaan berikutnya.
3. Jangan mengulang solusi yang sebelumnya sudah dicoba dan diketahui gagal.
4. Inspect existing implementation sebelum melakukan perubahan.

## During Work
Selama pengerjaan, perhatikan hal-hal penting yang layak dicatat, termasuk:
* apa yang sedang dikerjakan,
* investigasi yang dilakukan,
* root cause yang ditemukan,
* solusi yang dicoba,
* solusi yang gagal,
* keputusan teknis yang dibuat,
* file penting yang diubah,
* bug atau blocker yang ditemukan,
* perubahan pendekatan selama implementasi.

Tidak perlu mencatat setiap command atau perubahan kecil.
Fokus pada informasi yang berguna untuk memahami bagaimana project berkembang dan agar developer atau AI lain dapat melanjutkan pekerjaan tanpa kehilangan konteks.

## After Completing Work
Setelah menyelesaikan sebuah task, milestone, bug fix, atau sesi development yang berarti, tambahkan entry baru ke:
`docs/DEVELOPMENT_LOG.md`

Jangan menghapus atau menulis ulang history lama kecuali memang terdapat informasi yang salah.

Gunakan format standar:
```markdown
---

## YYYY-MM-DD HH:mm — [Short Title]

### Goal
Jelaskan tujuan pekerjaan.

### Investigation
Catat investigasi penting, kondisi awal, root cause, atau hal yang ditemukan. (Bisa disingkat/dihilangkan jika tidak ada)

### Process
Catat langkah implementasi penting yang dilakukan.

### Files Changed
Catat file atau area utama yang berubah.

### Decisions
Catat keputusan teknis atau arsitektural yang dibuat beserta alasannya jika relevan.

### Issues / Findings
Catat:
* bug yang ditemukan,
* limitation,
* blocker,
* technical debt,
* solusi yang gagal,
* hal yang perlu diperhatikan pada pengerjaan selanjutnya.

### Validation
Catat bagaimana perubahan divalidasi (nyata, bukan asumsi).

### Result
Jelaskan kondisi project setelah pekerjaan selesai (Completed / Partially completed / Blocked / Needs further testing).

### Next
Catat pekerjaan logis berikutnya agar developer atau AI berikutnya tahu dari mana harus melanjutkan.
```

## Logging Principles
Development log harus:
* kronologis,
* ringkas tetapi informatif,
* faktual,
* tidak mengarang hasil testing,
* mencatat kegagalan yang relevan,
* mencatat keputusan penting,
* mencatat blocker,
* mencatat kondisi akhir pekerjaan.

## Important Rule
Sebelum mengakhiri pekerjaan, selalu pastikan:
* Apakah progress penting sudah tercatat?
* Apakah root cause sudah tercatat?
* Apakah keputusan penting sudah tercatat?
* Apakah testing/validation sudah tercatat?
* Apakah developer berikutnya tahu apa yang harus dilakukan selanjutnya?

Jika belum, update `docs/DEVELOPMENT_LOG.md` terlebih dahulu.
Documentation update merupakan bagian dari penyelesaian task, bukan pekerjaan tambahan setelah task selesai.
