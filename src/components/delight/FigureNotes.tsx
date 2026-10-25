'use client';

import { useEffect } from 'react';

// Catatan pinggir model card (sesi 12): panah digambar sekali, saat gambar pertama kali ≥ 50% terlihat.
// Figure hanya "dipersenjatai" (disembunyikan sampai terlihat) bila JS jalan dan reduced motion tidak aktif,
// jadi tanpa JS atau dengan reduced motion catatan tampil statis.
export function FigureNotes() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute('data-seen', '');
          io.unobserve(e.target);
        }
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('figure[data-note]:not([data-seen])').forEach((f) => {
      f.setAttribute('data-note-armed', '');
      io.observe(f);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
