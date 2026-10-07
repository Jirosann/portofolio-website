import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 py-24">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-accent font-mono mb-6 tracking-tighter" aria-hidden="true">
          404
        </p>
        <h1 className="text-2xl font-bold text-text mb-3 tracking-tight">
          Halaman ini belum di-deploy.
        </h1>
        <p className="text-text-secondary mb-10">
          (atau memang tidak pernah ada)
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-burgundy-accent)] text-white dark:text-[#F1ECE8] rounded-full font-semibold shadow-sm hover:bg-[var(--color-burgundy)] dark:hover:bg-[color-mix(in_srgb,var(--color-burgundy-accent)_80%,var(--color-highlight)_20%)] active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"

          id="back-to-home"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
