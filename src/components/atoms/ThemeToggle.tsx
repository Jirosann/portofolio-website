'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from '@/components/providers/LanguageProvider';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder to prevent layout shift
    return <div className="w-11 h-11 md:w-9 md:h-9" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === 'dark';

  // Saklar "lampu" (sesi 12): tema baru terungkap sebagai lingkaran yang memancar dari tombol (View Transitions).
  // Tanpa dukungan atau dengan reduced motion: ganti instan seperti sebelumnya.
  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? 'light' : 'dark';
    const root = document.documentElement;
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTheme(next);
      return;
    }
    const b = e.currentTarget.getBoundingClientRect();
    const x = b.left + b.width / 2;
    const y = b.top + b.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    // next-themes memasang data-theme di useEffect; flushSync + atribut langsung memastikan snapshot baru sudah bertema baru.
    const vt = document.startViewTransition(() => {
      flushSync(() => setTheme(next));
      root.setAttribute('data-theme', next);
      root.style.colorScheme = next;
    });
    vt.ready.then(() => {
      // Durasi dan easing dari token gerak di globals.css (--dur-slow, --ease-out).
      const css = getComputedStyle(root);
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        {
          duration: parseFloat(css.getPropertyValue('--dur-slow')) || 320,
          easing: css.getPropertyValue('--ease-out').trim() || 'ease-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    }, () => {});
  };

  return (
    <button
      onClick={toggle}
      className="nav-link-base nav-tool-btn p-2 rounded-full"
      aria-label={isDark ? t.nav.themeToLight : t.nav.themeToDark}
    >
      {isDark ? (
        /* Sun icon */
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2"/>
          <path d="M12 20v2"/>
          <path d="m4.93 4.93 1.41 1.41"/>
          <path d="m17.66 17.66 1.41 1.41"/>
          <path d="M2 12h2"/>
          <path d="M20 12h2"/>
          <path d="m6.34 17.66-1.41 1.41"/>
          <path d="m19.07 4.93-1.41 1.41"/>
        </svg>
      ) : (
        /* Moon icon */
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
      )}
    </button>
  );
}
