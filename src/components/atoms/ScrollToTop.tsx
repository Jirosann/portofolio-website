'use client';

import { useEffect } from 'react';

// Posisi scroll saat muat penuh. Reload dan Back/Forward: restorasi bawaan browser (scrollRestoration "auto") yang
// mengembalikan posisi terakhir, termasuk bila URL ber-hash. Restorasi terjadi sekitar event load dan ikut dianimasikan
// bila scroll-behavior: smooth sudah aktif, jadi smooth scroll (html[data-smooth-scroll]) baru dipasang setelah load.
// Kunjungan baru tanpa hash: browser sudah mulai dari atas, jadi tidak ada scrollTo(0, 0) yang bisa menarik pengguna
// yang sudah menggulir sebelum hidrasi. Kunjungan baru dengan hash (tautan dibagikan, menu navbar dari halaman
// proyek): lompat langsung ke target. Posisi dihitung sendiri dari scroll-margin-top dan dilompati dengan `instant`,
// lalu dikoreksi sekali setelah font siap.
/** Dikirim ke window setelah lompatan hash terakhir (Header menahan sorotan sampai saat itu). */
export const HASH_JUMP_END = 'hashjumpend';

/** Muat penuh yang bukan reload atau Back/Forward: hanya di sini hash dilompati (dan sorotannya dikunci Header). */
export function isFreshLoad() {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  return !nav || (nav.type !== 'reload' && nav.type !== 'back_forward');
}

export function ScrollToTop() {
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'auto';
    }
    let frame = 0;
    const smooth = () => {
      frame = requestAnimationFrame(() => document.documentElement.setAttribute('data-smooth-scroll', ''));
    };
    if (document.readyState === 'complete') smooth();
    else window.addEventListener('load', smooth, { once: true });
    const cleanup = () => {
      window.removeEventListener('load', smooth);
      cancelAnimationFrame(frame);
    };
    if (!isFreshLoad()) return cleanup;

    let target: HTMLElement | null = null;
    try {
      target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    } catch {} // hash dengan % tidak valid
    if (!target) return cleanup;

    const el = target;
    const jump = () => {
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - margin, behavior: 'instant' });
    };
    jump();
    // Font swap dapat menggeser target setelah lompatan pertama. Jadi setelah font siap dan dua frame berlalu,
    // lompat sekali lagi, kecuali pengguna sudah ikut menggulir.
    let moved = false;
    const onInput = () => (moved = true);
    const events = ['wheel', 'touchstart', 'keydown'] as const;
    events.forEach((e) => window.addEventListener(e, onInput, { passive: true, once: true }));
    document.fonts.ready.then(() =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          events.forEach((e) => window.removeEventListener(e, onInput));
          if (!moved) jump();
          window.dispatchEvent(new Event(HASH_JUMP_END));
        })
      )
    );
    return cleanup;
  }, []);

  return null;
}
