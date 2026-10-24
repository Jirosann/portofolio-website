'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils/cn';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'id', name: 'Indonesia' },
] as const;

type LangCode = (typeof LANGUAGES)[number]['code'];

// Cookie dibaca server components (cookies()) untuk menentukan bahasa
function setLocaleCookie(code: LangCode) {
  document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;
}

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const router = useRouter();
  const { lang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const focusOption = (index: number) => {
    const count = LANGUAGES.length;
    optionRefs.current[(index + count) % count]?.focus();
  };

  // Dibuka lewat keyboard: fokus ke bahasa aktif (setelah inert dilepas pada render berikutnya)
  const openWithFocus = (index?: number) => {
    setIsOpen(true);
    const target = index ?? LANGUAGES.findIndex((l) => l.code === lang);
    requestAnimationFrame(() => focusOption(target));
  };

  const close = (returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  const switchLanguage = (newLang: LangCode) => {
    close(true);
    if (newLang === lang) return;
    setLocaleCookie(newLang);
    // Refresh to trigger server components re-render with new cookie
    router.refresh();
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      close(true);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      openWithFocus(e.key === 'ArrowUp' ? LANGUAGES.length - 1 : undefined);
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    const current = optionRefs.current.indexOf(document.activeElement as HTMLButtonElement);
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); focusOption(current + 1); break;
      case 'ArrowUp': e.preventDefault(); focusOption(current - 1); break;
      case 'Home': e.preventDefault(); focusOption(0); break;
      case 'End': e.preventDefault(); focusOption(LANGUAGES.length - 1); break;
      case 'Escape': e.preventDefault(); close(true); break;
      // Tab: menu ditutup, fokus lanjut ke kontrol berikutnya secara alami
      case 'Tab': setIsOpen(false); break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          // detail === 0: diaktifkan lewat keyboard (Enter/Spasi), fokus pindah ke opsi
          if (isOpen) close(false);
          else if (e.detail === 0) openWithFocus();
          else setIsOpen(true);
        }}
        onKeyDown={handleButtonKeyDown}
        className="nav-link-base nav-tool-btn flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-200 ease-out"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={`${lang.toUpperCase()}, ${t.nav.changeLanguage}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs font-bold font-mono tracking-wider">
          {lang.toUpperCase()}
        </span>
        {/* Dropdown chevron */}
        <svg
          className={cn("w-3 h-3 transition-transform duration-300", isOpen && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu: saat tertutup `inert`, jadi tidak bisa difokus dan tidak terbaca pembaca layar */}
      <div
        id={menuId}
        role="menu"
        aria-label={t.nav.changeLanguage}
        inert={!isOpen}
        onKeyDown={handleMenuKeyDown}
        onBlur={(e) => {
          if (!dropdownRef.current?.contains(e.relatedTarget as Node)) setIsOpen(false);
        }}
        className={cn(
          "absolute right-0 mt-2 w-40 rounded-xl shadow-lg border overflow-hidden transition-all duration-300 origin-top-right",
          isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
        style={{
          background: 'var(--color-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="py-1">
          {LANGUAGES.map((l, i) => (
            <button
              key={l.code}
              ref={(el) => { optionRefs.current[i] = el; }}
              role="menuitemradio"
              aria-checked={lang === l.code}
              tabIndex={-1}
              onClick={() => switchLanguage(l.code)}
              className={cn(
                "w-full min-h-11 text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] focus-visible:outline-none focus-visible:bg-[color-mix(in_srgb,var(--color-text)_12%,transparent)] focus-visible:shadow-[inset_0_0_0_2px_var(--color-link-text)]",
                lang === l.code && "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]"
              )}
              style={{ color: 'var(--color-text)' }}
            >
              {/* Kode hanya visual; nama aksesibel = nama bahasa */}
              <span className="font-mono font-bold mr-2" aria-hidden="true">{l.code.toUpperCase()}</span>
              {l.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
