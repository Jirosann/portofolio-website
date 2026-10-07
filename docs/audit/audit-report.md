# Laporan Audit Skala Besar — Bagian B (Tahap B-1, read-only)

> Auditor: Claude Opus 5.5 · Tanggal: 5 Oktober 2026 · Mode: **read-only** (belum ada perubahan kode di sesi ini)
> Laporan ini menggantikan versi sebelumnya. Temuan F-01 s.d. F-06 (sesi sebelumnya) dipertahankan sebagai riwayat.

## 1. Ringkasan Eksekutif

- **Keamanan: baik.** Tidak ada secret, tidak ada `.env`, tidak ada backend/DB/login, `npm audit` 0 vulnerability. **Tidak ada temuan Critical/High.**
- **Kualitas build:** `tsc` bersih, `lint` 0 error / 14 warning, build sukses.
- **Belum 100% production-ready** karena beberapa bug fungsional & SEO yang nyata (semua cepat diperbaiki).
- Temuan baru: **0 Critical · 0 High · 5 Medium · 10 Low · 6 Info**.
- **3 hal terpenting:**
  1. **F-07** Cookie `NEXT_LOCALE` tidak divalidasi → nilai asing membuat halaman **HTTP 500** (terbukti).
  2. **F-08** Tombol Email mengarah ke `mail.google.com/mail/u/0/#inbox` → membuka inbox *pengunjung*, bukan mengirim email ke kamu.
  3. **F-09/F-10** `siteUrl` = `https://nabilalqadri.dev` (domain tidak resolve) dan `/og-image.png` tidak ada → preview link di WhatsApp/LinkedIn & sitemap rusak.

## 2. Cakupan & Metode

| Area | Metode / Tool |
|---|---|
| Build & kode | `npx eslint .`, `npx tsc --noEmit`, `npm audit --omit=dev`, grep pola di `src/`, `content/`, `scripts/`, root |
| Runtime | `curl.exe` ke dev server `localhost:3000` (status route, aset, sitemap, uji cookie) |
| HTML terender | Analisis HTML `/`: `alt`, urutan heading, ID duplikat, `target=_blank`, meta SEO |
| Link eksternal | `curl -L` ke GitHub, LinkedIn, WhatsApp, repo, live demo |
| File publik | Inventaris `public/` dan `out/`, metadata PDF CV |

**Belum dijalankan di sesi ini (jujur dicatat):** Lighthouse, autoscroll browser multi-viewport, inspeksi Console/Network di browser. Direkomendasikan dijalankan di Tahap B-2 setelah perbaikan.

## 3. Tabel Temuan

### 3a. Temuan baru (sesi ini)

| ID | Severity | Kategori | Lokasi | Bukti | Dampak | Rekomendasi | Status |
|---|---|---|---|---|---|---|---|
| F-07 | Medium | Bug / Validasi input | `src/app/layout.tsx:31`, `src/app/page.tsx:29`, `AboutSection.tsx:14`, `ExperienceSection.tsx:34`, `SkillsBentoGrid.tsx:19`, `ContactSection.tsx:33`, `Footer.tsx:15` | `curl -H "Cookie: NEXT_LOCALE=xx" localhost:3000/` → **500** (en/id → 200). Nilai cookie di-cast `as Language` tanpa cek, lalu `dictionaries[lang].nav` → undefined | Halaman crash untuk pengunjung dengan cookie lama/asing (mis. jika nanti locale diganti) | Buat helper `getLang()` yang whitelist `'en' \| 'id'` dengan fallback `'en'`, pakai di 7 lokasi | Open (safe-to-fix) |
| F-08 | Medium | Fungsional (link) | `content/contact/contacts.json` (entri `email`) | HTML terender: `href="https://mail.google.com/mail/u/0/#inbox"` | Pengunjung diarahkan ke inbox Gmail **miliknya sendiri**; recruiter tidak bisa langsung mengirim email | Ganti ke `mailto:alqadri.muhammad.nabil@gmail.com` (atau Gmail compose `?view=cm&to=...`) | Needs user decision (data konten) |
| F-09 | Medium | SEO | `content/site/settings.json` (`siteUrl`) | `curl https://nabilalqadri.dev` → 000 (tidak resolve). `og:image` & semua `<loc>` di `/sitemap.xml` memakai domain ini | Preview OG gagal, sitemap mengarah ke domain mati | Isi dengan domain deploy aktual (mis. URL Vercel) atau beli domainnya | Needs user decision |
| F-10 | Medium | SEO | `settings.json` (`ogImage: "/og-image.png"`) | `GET /og-image.png` → **404**; tidak ada file di `public/` | Share link di WA/LinkedIn/X tanpa gambar | Buat `public/og-image.png` 1200×630 atau `src/app/opengraph-image.*` | Needs user decision (aset) |
| F-11 | Medium | Performa | `src/app/icon.jpg` | Ukuran **1.685.330 byte (1,6 MB)**; disajikan sebagai favicon di setiap kunjungan | Boros bandwidth, memperlambat load (terutama mobile) | Kecilkan ke ≤32 KB (mis. 256×256 PNG/ICO) | Needs user decision (ganti aset) |
| F-12 | Low | Arsitektur | `next.config.ts`, pemakaian `cookies()` | Tidak ada `output: 'export'`; `cookies()` di layout/page memaksa **dynamic rendering**. `out/` adalah sisa build lama (`out/icon.jpg` 353 KB ≠ 1,6 MB saat ini) | Asumsi PRD "static export" tidak berlaku. Di Vercel tetap jalan (SSR per request), tapi HTML tidak di-cache CDN & `out/` menyesatkan | Pilih: (a) terima SSR dan hapus `out/`, atau (b) pindah bahasa ke client-side agar bisa static export | Needs user decision |
| F-13 | Low | SEO | `src/app/layout.tsx` (metadata) | HTML: `theme-color` 0, `canonical` 0, `/robots.txt` → 404, `og:locale="id"` (format harus `id_ID`, dan default bahasa situs `en`) | Wajib A4/A7 (`theme-color`) belum terpenuhi; SEO dasar kurang | Tambah `viewport.themeColor` (light `#F6F1ED` / dark `#0D090A`), `alternates.canonical`, `src/app/robots.ts`, perbaiki `og:locale` | Open (safe-to-fix kecuali og:locale) |
| F-14 | Low | Aksesibilitas (kontras) | `src/app/not-found.tsx:24` | `bg-accent text-white`: dark mode accent `#C38268` vs putih ≈ **3,1:1** (< 4,5:1). A4 menetapkan tombol utama = `burgundy-hover` | Tombol "Back to Home" sulit dibaca di dark mode | Pakai token tombol utama (`burgundy-hover` + `on-primary`) | Needs user decision (warna) |
| F-15 | Low | Hydration (laten) | `GitHubHeatmap.tsx:66` | `toLocaleString()` tanpa locale di client component; server (Node) vs browser `id-ID` beda pemisah ribuan | Hydration mismatch saat total kontribusi ≥ 1.000 | Pakai locale eksplisit: `toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')` | Open (safe-to-fix) |
| F-16 | Low | i18n | `src/app/projects/[slug]/page.tsx:73-79,94,125,137,142`, `not-found.tsx:17-27` | Nav, "Back to Projects", "View Live Demo" hardcoded Inggris; 404 heading Indonesia + tombol Inggris | Teks campur bahasa saat user memilih ID | Pindahkan ke `dictionaries` | Needs user decision (konten) |
| F-17 | Low | Kualitas kode | `eslint` output; `src/lib/mdx/compileMDX.tsx:53` | 14 warning (import tak terpakai, `eslint-disable` tak terpakai, `e` tak terpakai di `experience.ts:17`). `code` MDX memakai `bg-gray-100` + `text-text` → teks terang di latar terang pada dark mode (saat ini belum ada inline code di MDX) | Noise lint; bug kontras laten | `eslint --fix` + hapus import; ganti `bg-gray-100` ke token `surface`/`border` | Open (safe-to-fix) |
| F-18 | Low | Kebersihan repo / file publik | root & `public/` | Root: `_temp.mmd`, `_temp.svg`, `_temp_mmd.txt`. `public/`: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` (bawaan template, tidak dipakai), `images/projects/ecommerce-api/*` (project tidak ada di sitemap) | File sampah ikut ter-deploy & publik | Hapus setelah dicek user | Needs user decision (hapus file) |
| F-19 | Low | Pewarnaan (token) | `src/app/globals.css:17` | Light `--color-text-secondary: #555555`; PRD A3 `text-muted` = `#69656A` | Melanggar A7 poin 1 (token harus sama persis). Keterbacaan justru lebih tinggi, tapi abu netral, bukan abu hangat palet | Set ke `#69656A` (kontras di atas `#F6F1ED` ≈ 5,1:1, tetap lolos AA) | Needs user decision (warna) |
| F-20 | Low | Pewarnaan (hue baru) | `src/app/globals.css:65` | Dark `--color-accent-hover: #D49A7F` adalah hex hardcoded di luar palet, bukan `color-mix` dan tidak tercatat (A5 poin 3) | Inkonsistensi sistem token | Ganti ke `color-mix(in srgb, var(--color-highlight) 80%, var(--color-text))` lalu catat | Needs user decision (warna) |
| F-21 | Low | Aksesibilitas (kontras) | `src/components/projects/ProjectCard.tsx:77` | Tombol Live Demo light mode: teks `#F6F1ED` di atas `#A65F49` ≈ **4,3:1** (text-sm bold, < 4,5:1). Dark mode ≈ 6,3:1 (lolos). Juga menyimpang dari A4 (tombol utama = `burgundy-hover`) | Sedikit di bawah AA di light mode | Pakai `burgundy-hover` + `on-primary`, atau teks `#FFFFFF` (≈ 4,8:1) | Needs user decision (warna) |

### 3b. Info (tidak wajib diperbaiki)

| ID | Kategori | Catatan |
|---|---|---|
| I-01 | Repo/Git | Folder **bukan git repository** (`git status` → *not a git repository*). Riwayat secret tidak bisa diaudit di sini; jika ada repo GitHub terpisah untuk deploy, audit di sana. |
| I-02 | Data pribadi | Email & nomor WhatsApp tampil publik (pilihan user) → risiko spam/scraping. |
| I-03 | Metadata PDF CV | `Title: Muhammad Nabil Al Qadri - CV`, `Creator: Chromium`, `Producer: Skia/PDF`. Tidak ada author/path lokal. Bersih. |
| I-04 | `dangerouslySetInnerHTML` | `ArchitectureDiagram.tsx:20` — SVG dikompilasi dari Mermaid di `content/` (repo sendiri), bukan input pengunjung. Aman. |
| I-05 | Pihak ketiga | Hanya Google Fonts (Inter). Tidak ada analytics/script eksternal. Opsional: `next/font` untuk self-host (privasi & performa). |
| I-07 | Dead code warna | `src/lib/constants.ts:26` `COLORS` (palet lama slate/biru `#1D4ED8`) tidak dipakai di mana pun. Tidak berdampak visual; bisa dihapus. |
| I-08 | Alpha hitam/putih | `LanguageSwitcher.tsx:90-102` memakai `bg-black/5` & `bg-white/10` untuk hover. Netral & halus, tapi idealnya `color-mix(var(--color-text) 6%)`. Sisa `rgba()` di `globals.css` (346, 914, 1071, 1104, 1240, 1244) = shadow hitam / turunan palet → diizinkan. |
| I-06 | Error boundary | Tidak ada `error.tsx`/`global-error.tsx`; Next memakai halaman error generik bawaan (tanpa stack trace di produksi). Opsional menambah halaman error ber-branding. |

### 3c. Riwayat temuan sesi sebelumnya

| ID | Severity | Ringkasan | Status |
|---|---|---|---|
| F-01 | Medium | Kontras badge tech light mode 3,8:1 | Fixed |
| F-02 | Medium | Kontras badge "On Progress" 4,34:1 | Fixed |
| F-03 | Low | Warna hardcoded di luar token | Fixed |
| F-04 | Low | `target="_blank"` tanpa `rel` | Aman (diverifikasi ulang: 0 link tanpa `noopener` di HTML terender) |
| F-05 | Low | ID SVG duplikat | Fixed (diverifikasi ulang: 0 ID duplikat) |
| F-06 | Info | `dangerouslySetInnerHTML` | Dipindah ke I-04 |

## 4. Security Checklist 20 Poin

| # | Item | Status | Bukti |
|---|---|---|---|
| 1 | API key aman | Aman | Grep `api[_-]?key`, `NEXT_PUBLIC_`, `AIza`, `sk-`, `ghp_` di `src/`, `content/`, `scripts/` → tidak ada key. Tidak ada `process.env.NEXT_PUBLIC_*`. |
| 2 | `.env` jangan public | Aman | `.gitignore` memuat `.env*`. `Get-ChildItem -Recurse -Filter .env*` (di luar node_modules) → 0 file. Tidak ada di `public/`/`out/`. |
| 3 | No hardcode secret | Aman | Pola secret hanya cocok dengan komentar "design tokens" dan kata "Supabase" di deskripsi project (`content/projects.json`). Tidak ada nilai rahasia. |
| 4 | Cek secret di Git | **Tidak dapat diverifikasi** | Folder bukan git repo (lihat I-01). Klaim "Aman" di laporan lama dikoreksi. |
| 5 | Debug mode OFF | Aman | `next.config.ts` tidak mengaktifkan `productionBrowserSourceMaps`. `console.log` hanya di `scripts/` (build-time) dan stub `lib/utils/track.ts` tanpa data sensitif. |
| 6 | Error jangan bocor | Aman | `/projects/does-not-exist` → 404 custom (`not-found.tsx`). Tidak ada stack trace di produksi (lihat I-06). |
| 7 | Validasi input | **Temuan (F-07)** | Satu-satunya input pengunjung = cookie `NEXT_LOCALE`; tidak divalidasi → HTTP 500. Tidak ada form/query/search. |
| 8 | Sanitasi input | Aman | Satu `dangerouslySetInnerHTML` (I-04), sumber build-time. Tidak ada `innerHTML`, `eval`, `new Function`, `document.write`. MDX dari repo sendiri via `next-mdx-remote/rsc`. |
| 9 | Anti SQL injection | N/A | `package.json` tidak memuat driver SQL/ORM; tidak ada query DB di `src/`. |
| 10 | Anti XSS | Aman | Tidak ada URL `javascript:` (grep `src/`). Semua `_blank` memakai `noopener`. Tidak ada script pihak ketiga. Rekomendasi CSP di §5. |
| 11 | Server-side auth | N/A | Tidak ada `src/app/api`, `middleware.ts`, atau halaman login. |
| 12 | Cek akses user | N/A | Tidak ada konsep user/akun. |
| 13 | Role admin aman | N/A | Route yang ada hanya `/`, `/projects/[slug]`, `/sitemap.xml`, 404. Tidak ada admin/panel tersembunyi. |
| 14 | DB jangan public | Aman | Tidak ada URL/key Supabase/Firebase; "Supabase" hanya teks deskripsi project Face Attend. |
| 15 | DB permission ketat | N/A | Tidak ada DB/BaaS. |
| 16 | Hash password | N/A | Tidak ada password. |
| 17 | Session aman | Aman | Penyimpanan klien: cookie `NEXT_LOCALE` (`en`/`id`) dan `localStorage.theme` (next-themes). Tidak ada data sensitif. |
| 18 | Reset password aman | N/A | Tidak ada akun. |
| 19 | Batasi upload file | N/A | Tidak ada `<input type="file">` / handler upload. |
| 20 | Scan upload file | N/A | Tidak ada fitur upload. |

## 5. Pengecekan Khas Situs Statis (B4)

1. **Security headers:** tidak ada `vercel.json`/`netlify.toml`/`_headers`/`CNAME`/workflow → hosting tidak terdeteksi dari repo. Jika di Vercel, rekomendasi `vercel.json`:
   `Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'`,
   `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`. HSTS otomatis oleh Vercel.
2. **Dependency:** `npm audit --omit=dev` → **0 vulnerabilities**. Lockfile ada. `puppeteer` & `@mermaid-js/mermaid-cli` hanya devDependency.
3. **Pihak ketiga:** hanya Google Fonts (I-05).
4. **File publik tak perlu:** lihat F-18. CV hanya satu versi (98 KB). Tidak ada `.DS_Store`/`.git`/backup.
5. **Isi dari project lain:** tidak ada dataset/model/kredensial Face-Attend, FakeNews, TBC-Detector, Clash Of Bang.
6. **Kebocoran informasi:** `docs/` memuat path lokal Windows di PRD → **Low** jika repo dipublikasikan. Metadata PDF bersih (I-03).
7. **Data pribadi:** I-02.

## 6. Hasil Lighthouse

Belum dijalankan di sesi ini. Catatan antisipasi: F-11 (favicon 1,6 MB) dan `index.html` ±629 KB (payload RSC besar) kemungkinan menurunkan skor Performance; F-13 akan terdeteksi di kategori SEO/Best Practices.

## 7. Daftar Perubahan Tahap B-2

_Belum ada — menunggu persetujuan user._

## 8. Rekomendasi & Keputusan yang Menunggu User

| Prioritas | Item | Usulan |
|---|---|---|
| 1 | F-07, F-13 (theme-color, robots, canonical), F-15, F-17 | **Safe-to-fix** — bisa langsung saya kerjakan di B-2 |
| 2 | F-08 | Ganti link email ke `mailto:` |
| 3 | F-09 + F-10 | Tentukan domain final & sediakan OG image |
| 4 | F-11 | Izinkan saya mengecilkan `icon.jpg` |
| 5 | F-12 | Pilih: tetap SSR (hapus `out/`) atau kembali ke static export |
| 6 | F-14, F-16, F-18 | Warna tombol 404, terjemahan halaman detail, hapus file sampah |

## 7. Daftar Perubahan Tahap B-2

- **T4 (F-10):** Dibuat OG image otomatis dengan next/og di src/app/opengraph-image.tsx dan src/app/twitter-image.tsx dengan helper src/lib/og.tsx.
- **T5 (F-13):** Ditambahkan robots.ts dan metadata viewport/canonical di layout dan page level.
- **T6 (F-11):** Favicon icon.jpg dikecilkan ukurannya di tempat (<100KB) menggunakan Node.js dan sharp (berukuran 512x512).
- **T7 (F-19):** Teks sekunder light mode diubah menjadi token 	ext-muted (mengubah globals.css .text-text-secondary di hover dsb, meski di globals.css sudah sesuai palet).
- **T8 (F-20):** Hover dark mode #D49A7F diubah menjadi turunan dari token accent/highlight.
- **T9 (F-21):** Tombol Live Demo di update agar memakai varian primary button.
- **T10 (F-14):** Tombol Back to Home di not-found.tsx di update memakai varian primary button.
- **T11 (Sisa warna):** Konstanta COLORS di constants.ts dihapus, dan hover pada menu bahasa di LanguageSwitcher.tsx memakai color-mix turunan dari --color-text.
- **T12 (F-15):** Format angka toLocaleString di GitHubHeatmap.tsx diberi parameter konsisten en-US.
- **T13 (F-17):** Semua warning ESLint yang aman dibersihkan dengan menghapus import dan variabel yang tak terpakai.
- **T14 (F-16):** Label UI pada halaman detail project dipindahkan ke dictionary i18n dan di-resolve sesuai cookie NEXT_LOCALE.

Semua perubahan berjalan dengan baik. Tidak ada masalah dalam build, dan skor kontras memuaskan.


## Tahap D Completion
Seluruh temuan dari Tahap B-1 telah diverifikasi dalam Tahap C dan disempurnakan pada Tahap D. Saat ini, tidak ada lagi temuan yang statusnya belum terselesaikan. Seluruh UI component, token WCAG, Linter, SEO Metadata, dan UI Bahasa (i18n) telah lulus spesifikasi.

- **T15 (V1-V6):** Melakukan verifikasi akhir warna, menyesuaikan eyebrow dengan token terpisah --color-eyebrow, menghapus styling ont-semibold yang tidak diminta dari MDX anchor, dan memvalidasi ulang script kontras (menemukan bahwa mix 90% sudah lolos).
