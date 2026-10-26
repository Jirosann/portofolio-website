import Link from 'next/link';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { dictionaries, resolveLocale } from '@/lib/i18n';
import { gameCopy } from '@/lib/fake-news/game-copy';
import { PlayFakeOrReal } from '@/components/notfound/PlayFakeOrReal';

// Status 404 dan <meta name="robots" content="noindex"> dipasang Next untuk not-found (diverifikasi sesi 12 dan 15);
// robots sendiri tidak ditulis karena menghasilkan tag kedua. Metadata digabung dangkal: openGraph dan alternates di sini menimpa milik layout, jadi pratinjau tautan tidak
// tampil sebagai beranda dan tidak ada canonical ke "/".
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const t = dictionaries[resolveLocale(cookieStore.get('NEXT_LOCALE')?.value)];
  const title = `404 — ${t.notFound.title.replace(/\.$/, '')}`;
  return {
    title,
    description: t.notFound.description,
    openGraph: { title, description: t.notFound.description },
    alternates: { canonical: null },
  };
}

// Halaman 404 (sesi 12): mini game "Real or fake?" dengan judul dari split uji ISOT, dibandingkan dengan model.
export default async function NotFound() {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];
  const copy = gameCopy[lang];

  return (
    <main className="flex-1 px-5 py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <p className="section-label">{copy.eyebrow}</p>
        <h1 className="mt-3 font-serif font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight text-[var(--color-text)] [text-wrap:balance]">
          {copy.title}
        </h1>
        <p className="mt-4 text-[var(--color-text-secondary)]">{copy.intro}</p>
        <Link href="/" className="footer-link" id="back-to-home">
          {t.notFound.backHome}
        </Link>
        <PlayFakeOrReal label={copy.play} lang={lang} cardHref="/#project-fakenews-detector" />
      </div>
    </main>
  );
}
