'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils/cn';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const router = useRouter();
  const { lang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const switchLanguage = (newLang: 'en' | 'id') => {
    if (newLang === lang) {
      setIsOpen(false);
      return;
    }
    // Set cookie for server components
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    setIsOpen(false);
    // Refresh to trigger server components re-render with new cookie
    router.refresh();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nav-link-base nav-tool-btn flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-200 ease-out"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t.nav.changeLanguage}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div 
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
          <button
            onClick={() => switchLanguage('en')}
            className={cn(
              "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]",
              lang === 'en' && "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]"
            )}
            style={{ color: 'var(--color-text)' }}
          >
            <span className="font-mono font-bold mr-2">EN</span>
            English
          </button>
          <button
            onClick={() => switchLanguage('id')}
            className={cn(
              "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]",
              lang === 'id' && "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]"
            )}
            style={{ color: 'var(--color-text)' }}
          >
            <span className="font-mono font-bold mr-2">ID</span>
            Indonesia
          </button>
        </div>
      </div>
    </div>
  );
}
