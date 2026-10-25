// Teks efek kecil sesi 12 (badge Open to Work, easter egg `hire`, petunjuk footer, salam console).
// Di luar src/locales/*.json karena LanguageProvider membundel kedua locale ke JS awal (pola src/lib/fake-news/copy.ts);
// server membaca berkas ini dan mengirim string yang dipakai sebagai props.
import type { Language } from '@/lib/i18n';

export const siteRepoUrl = 'https://github.com/Jirosann/portofolio-website';

export const delightCopy: Record<
  Language,
  { sayHi: string; hireCopied: string; hireFallback: string; footerHint: string }
> = {
  en: {
    sayHi: 'Say hi',
    hireCopied: "Email copied — let's talk",
    hireFallback: 'Press Ctrl+C to copy the email',
    footerHint: 'psst: type hire',
  },
  id: {
    sayHi: 'Sapa saya',
    hireCopied: 'Email tersalin — mari ngobrol',
    hireFallback: 'Tekan Ctrl+C untuk menyalin email',
    footerHint: 'psst: ketik hire',
  },
};
