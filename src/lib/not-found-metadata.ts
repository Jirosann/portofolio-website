import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { dictionaries, resolveLocale } from '@/lib/i18n';

// Metadata halaman 404, dipakai not-found.tsx dan slug proyek tak dikenal (judul tab sama dan ikut bahasa aktif).
// Status 404 dan <meta name="robots" content="noindex"> dipasang Next untuk not-found (diverifikasi sesi 12 dan 15);
// robots sendiri tidak ditulis karena menghasilkan tag kedua. Metadata digabung dangkal: openGraph dan alternates di sini menimpa milik layout, jadi pratinjau tautan tidak
// tampil sebagai beranda dan tidak ada canonical ke "/".
export async function notFoundMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const t = dictionaries[resolveLocale(cookieStore.get('NEXT_LOCALE')?.value)];
  const title = `404 — ${t.notFound.title.replace(/\.$/, '')}`;
  return {
    // absolute: segmen /projects mewarisi template judul layout; 404 di root tidak, jadi judul tab keduanya sama.
    title: { absolute: title },
    description: t.notFound.description,
    openGraph: { title: { absolute: title }, description: t.notFound.description },
    alternates: { canonical: null },
  };
}
