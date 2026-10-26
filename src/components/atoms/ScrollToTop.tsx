'use client';

import { useEffect } from 'react';

// Muat penuh: tanpa hash mulai dari atas (restorasi scroll browser dimatikan). Dengan hash (tautan dibagikan, menu
// navbar dari halaman proyek), lompat langsung ke target. Saat hidrasi, smooth scroll bawaan browser (scroll-behavior:
// smooth di html) sedang berjalan dan membuat lompatan pertama meleset (terukur sesi 17, Chrome), jadi posisi dihitung
// sendiri dari scroll-margin-top, dilompati dengan `instant`, lalu dikoreksi sekali setelah animasi itu berhenti.
/** Dikirim ke window setelah lompatan hash terakhir (Header menahan sorotan sampai saat itu). */
export const HASH_JUMP_END = 'hashjumpend';

export function ScrollToTop() {
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    let target: HTMLElement | null = null;
    try {
      target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    } catch {} // hash dengan % tidak valid

    if (!target) {
      window.scrollTo(0, 0);
    } else {
      const el = target;
      const jump = () => {
        const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - margin, behavior: 'instant' });
      };
      jump();
      // Lompatan pertama menghentikan animasi bawaan, tetapi posisinya masih bergeser sejauh jarak yang sudah
      // ditempuh animasi itu (terukur 9-91 px). Font swap juga dapat menggeser target. Jadi setelah font siap dan
      // dua frame berlalu, lompat sekali lagi, kecuali pengguna sudah ikut menggulir.
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
    }

    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  return null;
}
