'use client';
import { useTranslation } from '@/components/providers/LanguageProvider';

import { useState, useEffect, useLayoutEffect, useRef, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Container } from '@/components/layout/Container';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher';
import { HASH_JUMP_END, isFreshLoad } from '@/components/atoms/ScrollToTop';

export interface NavLink {
  href: string;
  label: string;
}

interface HeaderProps {
  navLinks: NavLink[];
}

// Pita scroll-spy: section aktif = section yang memotong 20%–60% tinggi viewport (sama dengan rootMargin observer).
const SPY_TOP = 0.2;
const SPY_BOTTOM = 0.6;

interface Indicator {
  x: number;
  y: number;
  w: number;
  h: number;
  on: boolean; // false: tidak ada item aktif, atau Contact (punya gaya aktif sendiri)
}

export function Header({ navLinks }: HeaderProps) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  // Kunci selama lompatan dari klik menu: scroll-spy diam sampai smooth scroll selesai, jadi section yang dilewati
  // tidak sempat menyala. release() membuka kunci (dan membersihkan listener).
  const lockRef = useRef<{ release: () => void } | null>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  // Penempatan pertama tanpa transisi (indikator tidak meluncur dari kiri saat halaman dimuat).
  const [indicatorReady, setIndicatorReady] = useState(false);

  /** Section terakhir (urutan dokumen) yang memotong pita scroll-spy pada posisi scroll `at`; null bila tidak ada. */
  const sectionInBand = useCallback((at = window.scrollY) => {
    const top = window.innerHeight * SPY_TOP;
    const bottom = window.innerHeight * SPY_BOTTOM;
    const shift = window.scrollY - at;
    let found: string | null = null;
    for (const link of navLinks) {
      const el = document.getElementById(link.href.substring(1));
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top + shift < bottom && r.bottom + shift > top) found = link.href;
    }
    return found;
  }, [navLinks]);

  /** Klik tautan menu: sorotan langsung pindah ke tujuan dan dikunci sampai lompatan selesai. */
  const lockTo = useCallback(
    (href: string) => {
      lockRef.current?.release();
      setActiveSection(href);

      let manual = false; // pengguna ikut menggulir selama lompatan: hitung ulang saat kunci dibuka
      const onManual = () => (manual = true);
      const hasScrollEnd = 'onscrollend' in window;
      // Tanpa scroll sama sekali (sudah di tujuan) tidak ada scrollend: buka setelah 300 ms. Browser tanpa
      // scrollend: buka setelah 150 ms tanpa event scroll. Batas keras 4 s.
      let idle = window.setTimeout(release, 300);
      const cap = window.setTimeout(release, 4000);
      function onScroll() {
        window.clearTimeout(idle);
        if (!hasScrollEnd) idle = window.setTimeout(release, 150);
      }
      function release() {
        window.clearTimeout(idle);
        window.clearTimeout(cap);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('scrollend', release);
        window.removeEventListener('wheel', onManual);
        window.removeEventListener('touchstart', onManual);
        window.removeEventListener('keydown', onManual);
        if (lockRef.current === lock) lockRef.current = null;
        if (manual) {
          const current = sectionInBand();
          if (current) setActiveSection(current);
        }
      }
      const lock = { release };
      lockRef.current = lock;
      window.addEventListener('scroll', onScroll, { passive: true });
      if (hasScrollEnd) window.addEventListener('scrollend', release);
      window.addEventListener('wheel', onManual, { passive: true });
      window.addEventListener('touchstart', onManual, { passive: true });
      window.addEventListener('keydown', onManual);
    },
    [sectionInBand]
  );

  useEffect(() => () => lockRef.current?.release(), []);

  // Kunjungan baru dengan hash menu (mis. menu dari halaman proyek): ScrollToTop melompat ke section, sorotan
  // diperlakukan seperti klik menu. ScrollToTop melompat dua kali (lihat di sana), jadi scroll-spy ditahan sampai
  // HASH_JUMP_END, baru kemudian dikunci seperti biasa sampai scroll terakhir selesai. Reload dan Back/Forward tidak
  // melompat ke hash (browser memulihkan posisi), jadi sorotan langsung mengikuti scroll-spy.
  useEffect(() => {
    const hash = location.hash;
    if (!hash || !isFreshLoad() || !navLinks.some((link) => link.href === hash)) return;
    setActiveSection(hash);
    const done = () => lockTo(hash);
    const cap = window.setTimeout(done, 4000);
    const hold = {
      release() {
        window.clearTimeout(cap);
        window.removeEventListener(HASH_JUMP_END, done);
        if (lockRef.current === hold) lockRef.current = null;
      },
    };
    lockRef.current = hold;
    window.addEventListener(HASH_JUMP_END, done, { once: true });
    // Hanya saat mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Logo di beranda: kembali ke atas dan hapus hash. Dari halaman lain Link bernavigasi seperti biasa. */
  const onBrandClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (location.pathname !== '/' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setMobileMenuOpen(false);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (location.hash) history.pushState(null, '', location.pathname + location.search);
    // Sorotan langsung ke keadaan di posisi atas (seperti saat halaman dimuat), dikunci selama naik.
    lockTo(sectionInBand(0) ?? '');
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  };

  useEffect(() => {
    // Close mobile menu on Escape key
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        toggleRef.current?.focus();
      }
    }
    
    // Close on outside click
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }

    // Lock body scroll
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return; // lompatan dari menu sedang berjalan
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: '-20% 0px -40% 0px',
      }
    );

    navLinks.forEach((link) => {
      const id = link.href.substring(1);
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [navLinks]);

  // Indikator aktif (satu elemen untuk semua tautan desktop): diukur dari tautan aktif, diukur ulang saat lebar
  // tautan berubah (font, bahasa, breakpoint). Contact punya gaya aktif sendiri, jadi indikator memudar di sana.
  useLayoutEffect(() => {
    const wrap = linksRef.current;
    if (!wrap) return;
    const measure = () => {
      const link = activeSection ? wrap.querySelector<HTMLAnchorElement>(`a[href="${activeSection}"]`) : null;
      if (!link || link.offsetParent === null) {
        setIndicator((prev) => (prev ? { ...prev, on: false } : null));
        return;
      }
      setIndicator({
        x: link.offsetLeft,
        y: link.offsetTop,
        w: link.offsetWidth,
        h: link.offsetHeight,
        on: !link.classList.contains('nav-link-contact'),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [activeSection, navLinks]);

  useEffect(() => {
    if (!indicator || indicatorReady) return;
    const id = requestAnimationFrame(() => setIndicatorReady(true));
    return () => cancelAnimationFrame(id);
  }, [indicator, indicatorReady]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 lg:py-3 lg:pointer-events-none"
    >
      {/* < 1024: bar solid selebar layar. >= 1024: wrapper transparan, <nav> jadi pill kaca melayang. */}
      <div className="site-header border-b lg:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
      {/* < 360 px: padding lebih rapat agar logo + bahasa + tema + menu muat di 320 px */}
      <Container className="max-[359px]:px-4">
        <nav className="nav-pill flex items-center justify-between h-16 lg:h-14 lg:w-fit lg:mx-auto lg:gap-6 lg:pl-4 lg:pr-2 lg:rounded-full lg:pointer-events-auto">
          {/* Logo / Name */}
          <Link
            href="/"
            onClick={onBrandClick}
            className="nav-brand flex items-center gap-2.5 min-h-11 transition-opacity hover:opacity-80"
            aria-label="Al-Qadri"
          >
            <div className="w-[30px] h-[30px] rounded-lg overflow-hidden flex-shrink-0">
              { }
              <img 
                src="/brand/al-qadri-logo.webp" 
                alt=""
                width={30}
                height={30}
                className="w-full h-full object-cover"
                fetchPriority="high"
              />
            </div>
            <span className="text-xl font-bold tracking-tight whitespace-nowrap glyph-disambiguate" style={{ color: 'var(--color-text)' }}>
              Al-Qadri<span style={{ color: 'var(--color-highlight-text)' }}>.</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div ref={linksRef} className="nav-links hidden md:flex items-center gap-2">
            {/* Satu indikator yang meluncur antar-tautan (transform), di belakang teks tautan. */}
            {indicator && (
              <span
                aria-hidden="true"
                className="nav-indicator"
                data-on={indicator.on ? '' : undefined}
                data-ready={indicatorReady ? '' : undefined}
                style={{
                  transform: `translate(${indicator.x}px, ${indicator.y}px)`,
                  width: indicator.w,
                  height: indicator.h,
                }}
              />
            )}
            {navLinks.map((link) => {
              const active = activeSection === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => lockTo(link.href)}
                  aria-current={active ? 'true' : undefined}
                  data-text={link.label}
                  className={cn(
                    'nav-link-base inline-flex items-center justify-center min-h-11 rounded-full px-4 md:max-lg:px-2.5 py-1.5 text-sm font-medium',
                    link.href === '#contact' ? 'nav-link-contact' : 'nav-link-normal',
                    active && 'active'
                  )}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="w-px h-5 mx-2" style={{ background: 'var(--color-border)' }}></div>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          
          {/* Mobile: Theme Toggle + Menu Button */}
          {/* < 360 px: jarak antartombol 4 px agar tiga tombol 44 px + logo muat di 320 */}
          <div className="flex md:hidden items-center gap-1 min-[360px]:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              ref={toggleRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="nav-link-base nav-tool-btn p-2 rounded-full"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? (t.nav.closeMenu || 'Close menu') : (t.nav.openMenu || 'Open menu')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </Container>
      </div>

        {/* Mobile Menu: panel solid melayang di atas konten (tidak mendorong halaman) */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden absolute inset-x-3 top-full mt-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const active = activeSection === link.href;
                if (link.href === '#contact') {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => { lockTo(link.href); setMobileMenuOpen(false); }}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'mobile-nav-contact rounded-full px-4 py-3 text-base font-bold text-center mx-auto w-full max-w-xs press',
                        active && 'active'
                      )}
                    >
                      {link.label}
                    </a>
                  );
                }
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => { lockTo(link.href); setMobileMenuOpen(false); }}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'mobile-nav-normal min-h-11 rounded-full px-4 py-2 text-base font-medium text-center',
                      active && 'active'
                    )}
                  >
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
    </header>
  );
}
