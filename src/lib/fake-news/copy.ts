import type { Language } from '@/lib/i18n';

// Teks panel "Try the model". Sengaja di luar src/locales: LanguageProvider membundel kedua locale ke JS awal,
// sedangkan teks ini hanya dibutuhkan setelah klik (panel lazy). ModelCard (server) mengambil label tombol saja.
export const tryModelCopy = {
  en: {
    button: 'Try the model',
    loading: 'Loading the model weights…',
    error: 'The model failed to load. Check your connection and try again.',
    eyebrow: 'Runs in your browser · TF-IDF + Logistic Regression',
    textareaLabel: 'News article text (English only)',
    hint: 'Paste a title and body. The model reads English text only, so other languages give meaningless scores.',
    samples: 'Sample from ISOT test set',
    sample: { real: 'Real {n}', fake: 'Fake {n}' },
    isotLabel: 'ISOT label: {label}',
    run: 'Run the model',
    empty: 'Paste or type an English article first.',
    unknown: "None of these words are in the model's 5,000-word vocabulary.",
    live: 'Prediction: {label}, {p} probability.',
    label: { real: 'Real', fake: 'Fake' },
    top: { one: 'The word that moved the score most', other: 'The {n} words that moved the score most' },
    toward: 'toward {label}',
    highlight: 'Your text with these words marked',
    legend: 'Solid underline: toward real. Dashed underline: toward fake.',
    note: [
      'Trained on ISOT: English-language US political news, 2016–2017. It scores writing patterns, not truth. It is not a fact-checker.',
      'Real articles in ISOT come from Reuters, so words like “reuters” and “said” push hard toward real. Delete them and run again to see the score shift.',
    ],
  },
  id: {
    button: 'Coba modelnya',
    loading: 'Memuat bobot model…',
    error: 'Model gagal dimuat. Periksa koneksi lalu coba lagi.',
    eyebrow: 'Berjalan di browser Anda · TF-IDF + Logistic Regression',
    textareaLabel: 'Teks artikel berita (hanya bahasa Inggris)',
    hint: 'Tempel judul dan isi. Model hanya membaca teks bahasa Inggris, jadi bahasa lain menghasilkan skor tanpa arti.',
    samples: 'Contoh dari data uji ISOT',
    sample: { real: 'Asli {n}', fake: 'Palsu {n}' },
    isotLabel: 'Label ISOT: {label}',
    run: 'Jalankan model',
    empty: 'Tempel atau ketik artikel berbahasa Inggris dulu.',
    unknown: 'Tidak ada kata ini di kosakata model yang berisi 5.000 kata.',
    live: 'Prediksi: {label}, probabilitas {p}.',
    label: { real: 'Asli', fake: 'Palsu' },
    top: { one: 'Kata yang paling menggeser skor', other: '{n} kata yang paling menggeser skor' },
    toward: 'ke arah {label}',
    highlight: 'Teks Anda dengan kata-kata tersebut ditandai',
    legend: 'Garis bawah penuh: ke arah asli. Garis bawah putus-putus: ke arah palsu.',
    note: [
      'Dilatih pada ISOT: berita politik AS berbahasa Inggris, 2016–2017. Model menilai pola tulisan, bukan kebenaran. Ini bukan alat cek fakta.',
      'Artikel asli di ISOT berasal dari Reuters, jadi kata seperti “reuters” dan “said” sangat mendorong ke arah asli. Hapus kata itu lalu jalankan lagi untuk melihat skornya bergeser.',
    ],
  },
} satisfies Record<Language, unknown>;

export type TryModelCopy = (typeof tryModelCopy)['en'];
