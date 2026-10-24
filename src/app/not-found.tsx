import Link from 'next/link';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { dictionaries, resolveLocale } from '@/lib/i18n';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const t = dictionaries[resolveLocale(cookieStore.get('NEXT_LOCALE')?.value)];
  return {
    title: `404 — ${t.notFound.title}`,
    description: t.notFound.description,
  };
}

export default async function NotFound() {
  const cookieStore = await cookies();
  const t = dictionaries[resolveLocale(cookieStore.get('NEXT_LOCALE')?.value)];

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 py-24">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-accent font-mono mb-6 tracking-tighter" aria-hidden="true">
          404
        </p>
        <h1 className="text-2xl font-bold text-text mb-3 tracking-tight">
          {t.notFound.title}
        </h1>
        <p className="text-text-secondary mb-10">
          {t.notFound.description}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-burgundy-accent)] text-white dark:text-[#F1ECE8] rounded-full font-semibold shadow-sm hover:bg-[var(--color-burgundy)] dark:hover:bg-[color-mix(in_srgb,var(--color-burgundy-accent)_80%,var(--color-highlight)_20%)] active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"

          id="back-to-home"
        >
          {t.notFound.backHome}
        </Link>
      </div>
    </main>
  );
}
