// Teks game 404 "Real or fake?" (sesi 12). Di luar src/locales/*.json karena hanya dipakai halaman 404
// (pola copy.ts): locale JSON dibundel ke JS awal semua halaman lewat LanguageProvider.
import type { Language } from '@/lib/i18n';

export interface GameCopy {
  eyebrow: string;
  title: string;
  intro: string;
  play: string;
  progress: string;        // {n}, {total}
  question: string;
  real: string;
  fake: string;
  isot: string;
  you: string;
  model: string;
  right: string;
  wrong: string;
  loading: string;
  error: string;
  next: string;
  finish: string;
  score: string;           // {a}, {b}, {total}
  scoreNoModel: string;    // {a}, {total}
  note: string;            // {title}, {full}
  again: string;
  home: string;
  card: string;
}

export const gameCopy: Record<Language, GameCopy> = {
  en: {
    eyebrow: '404 · Page not found',
    title: "This page doesn't exist. But can you spot fake news?",
    intro: 'Guess 5 headlines from the ISOT test set, then compare with the Fake News Detector model.',
    play: 'Play',
    progress: 'Headline {n} of {total}',
    question: 'Real or fake?',
    real: 'Real',
    fake: 'Fake',
    isot: 'ISOT label',
    you: 'You',
    model: 'Model',
    right: 'correct',
    wrong: 'wrong',
    loading: 'Loading the model…',
    error: 'The model failed to load, so only your score counts.',
    next: 'Next headline',
    finish: 'See the score',
    score: 'You {a}/{total} · Model {b}/{total}',
    scoreNoModel: 'You {a}/{total}',
    note: 'The model sees the headline only. On headlines alone it scores {title} on the ISOT test set, versus {full} on full articles.',
    again: 'Play again',
    home: 'Back to home',
    card: 'See the model card',
  },
  id: {
    eyebrow: '404 · Halaman tidak ditemukan',
    title: 'Halaman ini tidak ada. Tapi bisakah Anda mengenali berita palsu?',
    intro: 'Tebak 5 judul dari data uji ISOT, lalu bandingkan dengan model Fake News Detector.',
    play: 'Main',
    progress: 'Judul {n} dari {total}',
    question: 'Asli atau palsu?',
    real: 'Asli',
    fake: 'Palsu',
    isot: 'Label ISOT',
    you: 'Anda',
    model: 'Model',
    right: 'benar',
    wrong: 'salah',
    loading: 'Memuat model…',
    error: 'Model gagal dimuat, jadi hanya skor Anda yang dihitung.',
    next: 'Judul berikutnya',
    finish: 'Lihat skor',
    score: 'Anda {a}/{total} · Model {b}/{total}',
    scoreNoModel: 'Anda {a}/{total}',
    note: 'Model hanya melihat judul. Dengan judul saja, akurasinya {title} di data uji ISOT, dibanding {full} dengan artikel utuh.',
    again: 'Main lagi',
    home: 'Kembali ke beranda',
    card: 'Lihat model card',
  },
};
