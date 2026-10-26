# Checklist QA manual

Hal-hal di bawah tidak bisa diuji otomatis secara andal di CI (Chromium headless di Linux). Jalankan sebelum rilis besar atau setelah mengubah navigasi, tema, atau interaksi. Centang per perangkat.

## Safari macOS dan iOS asli (WebKit sungguhan, bukan emulasi)
- [ ] Pill navigasi kaca (≥1024 px): blur dan saturasi tampil, teks tetap terbaca di atas section terang dan gelap; fallback solid bila `backdrop-filter` mati.
- [ ] Lompatan menu: smooth scroll mendarat tepat di bawah navigasi, sorotan aktif tidak berkedip, pil meluncur halus. Safari lama tanpa `scrollend` memakai jalur fallback 150 ms.
- [ ] Saklar tema: transisi View Transitions (clip-path) atau langsung berganti tanpa kedip putih.
- [ ] iOS: kartu stack terbalik dengan sekali ketuk (bukan dua ketukan karena hover lengket), ketuk di luar/Escape menutup.
- [ ] iOS: kartu Tools I use terangkat saat diketuk, nama muncul, tidak ada hover lengket setelah menggulir.
- [ ] iOS: menu mobile menghormati safe area (notch dan home indicator), body tidak ikut tergulir saat menu terbuka.
- [ ] iOS: textarea Try the model tidak memicu zoom otomatis (font ≥ 16 px) dan keyboard virtual tidak menutupi tombol Run.
- [ ] Gambar AVIF/WebP model card tampil (Safari < 16 tidak mendukung AVIF; fallback WebP).

## Pembaca layar asli
- [ ] VoiceOver (macOS Safari dan iOS), NVDA (Windows Firefox/Chrome), TalkBack (Android Chrome).
- [ ] Urutan baca: navigasi, hero, section bernomor, footer; heading section terbaca sebagai h2.
- [ ] Menu bahasa: diumumkan sebagai menu dengan pilihan "English"/"Indonesia" dan status terpilih.
- [ ] Kartu stack: nama tombol memuat jumlah proyek (mis. "Python used in 2 projects"), status terbuka/tertutup diumumkan, sisi belakang dapat dibaca setelah dibuka.
- [ ] Try the model: status memuat bobot diumumkan, hasil prediksi diumumkan sekali lewat live region.
- [ ] Easter egg hire: toast "Email copied" diumumkan.
- [ ] Game 404: judul, pilihan Real/Fake, hasil tiap putaran, dan skor akhir diumumkan.

## HP fisik (Android dan iPhone, jaringan seluler)
- [ ] Target sentuh ≥ 44 px terasa nyaman (nav, chip bahasa, tombol tema, tautan kontak).
- [ ] Kipas Tools I use: tiga baris 4-4-3, ditengahkan, tidak ada scroll horizontal.
- [ ] Footer: petunjuk "psst: type hire" tidak tampil (Chrome Android, Samsung Internet, Safari iOS). Tablet dengan mouse/trackpad boleh menampilkannya.
- [ ] Tile proyek di hero: ketukan mendarat di model card tepat di bawah bar navigasi.
- [ ] Gulir terasa mulus; tidak ada lompatan tata letak saat gambar dan font termuat.
- [ ] Mode hemat data/jaringan lambat: Try the model menampilkan status memuat dan pesan gagal yang jelas.
- [ ] Orientasi lanskap tidak merusak navigasi atau hero.

## Lain-lain
- [ ] Clipboard nyata: mengetik "hire" benar-benar menyalin email (Chrome, Safari, Firefox); fallback "Press Ctrl+C" muncul bila izin ditolak.
- [ ] `prefers-reduced-transparency: reduce` (macOS/iOS "Reduce transparency"): navigasi menjadi solid.
- [ ] `prefers-reduced-motion: reduce`: tidak ada animasi reveal, flip, atau confetti; konten tetap lengkap.
- [ ] Zoom browser 200% dan ukuran teks sistem besar: tidak ada teks terpotong atau tumpang tindih.
- [ ] Firefox desktop: kartu stack, kilau radial, dan lompatan menu berfungsi.
- [ ] Mode kontras tinggi Windows (forced-colors): fokus dan batas kontrol tetap terlihat.
- [ ] Pratinjau tautan (WhatsApp, LinkedIn, X) menampilkan judul, deskripsi, dan og:image yang benar setelah deploy.
