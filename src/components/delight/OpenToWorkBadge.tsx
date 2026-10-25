'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface OpenToWorkBadgeProps {
  label: string;   // "Open to Work"
  sayHi: string;   // teks gelembung, tanpa panah
  href: string;    // mailto:
}

// Badge "Open to Work" di hero (sesi 12): klik membuat titik memantul sekali dan membuka gelembung "Say hi →" ke mailto.
// Gelembung tertutup setelah 5 detik (dijeda selama pointer/fokus di gelembung), saat klik di luar, atau Esc.
// Tidak ada gerak sebelum diklik.
export function OpenToWorkBadge({ label, sayHi, href }: OpenToWorkBadgeProps) {
  const [open, setOpen] = useState(false);
  const [held, setHeld] = useState(false);
  const [bounce, setBounce] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open || held) return;
    const timer = setTimeout(() => setOpen(false), 5000);
    return () => clearTimeout(timer);
  }, [open, held]);

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setOpen(false);
      setHeld(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (wrap.current?.contains(document.activeElement)) btn.current?.focus();
      close();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    if (open) {
      setOpen(false);
      setHeld(false);
      return;
    }
    setBounce((n) => n + 1);
    setOpen(true);
  };

  return (
    <div ref={wrap} className="otw">
      <button
        ref={btn}
        type="button"
        className="otw-btn inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-full bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-link-text)]"
        aria-expanded={open}
        aria-controls={id}
        onClick={toggle}
      >
        {/* key: animasi pantul dimulai ulang setiap kali gelembung dibuka */}
        <span key={bounce} className="otw-dot" data-bounce={bounce > 0 ? '' : undefined} aria-hidden="true" />
        <span className="text-sm font-semibold tracking-wide uppercase text-[var(--color-eyebrow)]">{label}</span>
      </button>
      {/* Timer dijeda selama pointer atau fokus ada di gelembung (WCAG 2.2.1) */}
      <div
        id={id}
        className="otw-bubble"
        hidden={!open}
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
      >
        <a href={href} className="otw-link">
          {sayHi}
          <span aria-hidden="true">→</span>
        </a>
      </div>
      <span role="status" className="sr-only">
        {open ? sayHi : ''}
      </span>
    </div>
  );
}
