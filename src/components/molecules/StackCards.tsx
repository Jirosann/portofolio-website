'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface StackCardsProps {
  children: ReactNode;
  className?: string;
}

// Interaksi kartu stack dan Tools I use. Markup dan ikon dirender server (children), jadi komponen ini hanya
// mengaktifkan tombol, memasang listener terdelegasi, dan mengubah atribut DOM (data-flipped, aria-expanded,
// data-raised). Sisi belakang disembunyikan CSS (visibility), bukan inert, supaya tanpa JS tetap bisa ditampilkan.
export function StackCards({ children, className }: StackCardsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let open: HTMLElement | null = null;

    // Tombol dirender nonaktif (tanpa JS tidak ada aksi); aktifkan sekarang. Tidak mengubah ukuran apa pun.
    for (const btn of root.querySelectorAll<HTMLButtonElement>('.sc-btn')) {
      btn.disabled = false;
      btn.setAttribute('aria-expanded', 'false');
    }

    const parts = (card: HTMLElement) => ({
      btn: card.querySelector<HTMLButtonElement>('.sc-btn')!,
      back: card.querySelector<HTMLElement>('.sc-back')!,
    });
    const setFlipped = (card: HTMLElement, on: boolean) => {
      card.toggleAttribute('data-flipped', on);
      parts(card).btn.setAttribute('aria-expanded', String(on));
      if (on) open = card;
      else if (open === card) open = null;
    };
    // Fokus kembali ke tombol hanya kalau fokus sedang di sisi belakang (yang akan disembunyikan).
    const close = (card: HTMLElement) => {
      const { btn, back } = parts(card);
      const refocus = back.contains(document.activeElement);
      setFlipped(card, false);
      if (refocus) btn.focus();
    };

    let raised: HTMLElement | null = null;
    // Kartu yang terangkat turun lagi begitu halaman digulir (tidak ada "hover lengket" di layar sentuh).
    let raisedAt = 0;
    const onScroll = () => {
      if (Math.abs(window.scrollY - raisedAt) > 8) setRaised(null);
    };
    const setRaised = (tool: HTMLElement | null) => {
      raised?.removeAttribute('data-raised');
      raised = tool;
      if (tool) {
        tool.setAttribute('data-raised', '');
        raisedAt = window.scrollY;
        window.addEventListener('scroll', onScroll, { passive: true });
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      // Tools I use: ketukan mengangkat kartu (pengganti hover di layar sentuh); ketukan lagi menurunkannya.
      // Target klik = li (area statis); kartunya pointer-events: none.
      const tool = target.closest<HTMLElement>('.tl-fan > li');
      if (tool) {
        setRaised(raised === tool ? null : tool);
        return;
      }
      const card = target.closest<HTMLElement>('.sc');
      if (!card) return;
      if (open && open !== card) setFlipped(open, false);
      // Tautan "Used in": navigasi berjalan normal, kartu ditutup tanpa memindahkan fokus.
      if (target.closest('a')) setFlipped(card, false);
      else if (target.closest('.sc-btn')) setFlipped(card, !card.hasAttribute('data-flipped'));
      else if (card.hasAttribute('data-flipped')) close(card);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) close(open);
    };

    // Kilau mengikuti kursor: satu listener, posisi ditulis sekali per frame.
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let pending: { card: HTMLElement; x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      if (!fine.matches || e.pointerType !== 'mouse') return;
      const card = (e.target as Element).closest<HTMLElement>('.sc');
      if (!card) return;
      pending = { card, x: e.clientX, y: e.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!pending) return;
        const r = pending.card.getBoundingClientRect();
        pending.card.style.setProperty('--mx', `${pending.x - r.left}px`);
        pending.card.style.setProperty('--my', `${pending.y - r.top}px`);
      });
    };

    root.addEventListener('click', onClick);
    root.addEventListener('pointermove', onMove);
    document.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('click', onClick);
      root.removeEventListener('pointermove', onMove);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
