// Teks section Video Creation (sesi 13), termasuk label navigasinya.
// Di luar src/locales/*.json karena LanguageProvider membundel kedua locale ke JS awal (pola src/lib/delight/copy.ts):
// selama data video masih draf, teks ini tidak boleh menambah byte di halaman utama. Server membaca berkas ini.
import type { Language } from '@/lib/i18n';

export const videoCopy: Record<
  Language,
  { nav: string; label: string; title: string; play: string; iframeTitle: string; tiktok: string; folder: string }
> = {
  en: {
    nav: 'Videos',
    label: 'Video Creation',
    title: 'Video Creation',
    play: 'Play: {title}',
    iframeTitle: '{title} (Google Drive video)',
    tiktok: 'Open on TikTok',
    folder: 'More on Google Drive',
  },
  id: {
    nav: 'Video',
    label: 'Pembuatan Video',
    title: 'Pembuatan Video',
    play: 'Putar: {title}',
    iframeTitle: '{title} (video Google Drive)',
    tiktok: 'Buka di TikTok',
    folder: 'Selengkapnya di Google Drive',
  },
};
