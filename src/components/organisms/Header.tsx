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

// Tombol yang menggulir halaman: menekannya selama lompatan menu membatalkan kunci sorotan.
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

interface Indicator {
  x: number;
  y: number;
  w: number;
  h: number;
  on: boolean; // false: tidak ada item aktif, atau Contact (punya gaya aktif sendiri)
  appear: boolean; // menyala dari keadaan tanpa item aktif: muncul di tempat, tidak meluncur
}

const INDICATOR_OFF: Indicator = { x: 0, y: 0, w: 0, h: 0, on: false, appear: false };

export function Header({ navLinks }: HeaderProps) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  // Kunci selama lompatan dari tautan hash: scroll-spy diam sampai smooth scroll selesai, jadi section yang dilewati
  // tidak sempat menyala. release() membuka kunci (dan membersihkan listener).
  const lockRef = useRef<{ release: () => void } | null>(null);
  // Satu elemen, selalu dirender (padam) agar kemunculan pertama setelah hidrasi juga dianimasikan.
  const [indicator, setIndicator] = useState<Indicator>(INDICATOR_OFF);
  const prevActiveRef = useRef('');

  /** Item aktif dari posisi scroll: section terakhir yang tepi atasnya sudah mencapai garis aktif (scroll-margin-top,
   *  titik pendaratan lompatan menu). Di dasar halaman item terakhir, karena Contact terlalu pendek untuk mencapai
   *  garis. Di hero tidak ada. */
  const computeActive = useCallback(() => {
    const root = document.documentElement;
    if (navLinks.length && window.scrollY > 0 && window.scrollY >= root.scrollHeight - window.innerHeight - 1) {
      return navLinks[navLinks.length - 1].href;
    }
    let found = '';
    for (const link of navLinks) {
      const el = document.getElementById(link.href.substring(1));
      if (!el) continue;
      const line = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      if (el.getBoundingClientRect().top - line <= 1) found = link.href;
    }
    return found;
  }, [navLinks]);

  /** Lompatan ke `href` (tautan menu, tile, logo dengan ''): sorotan langsung pindah ke tujuan dan dikunci sampai
   *  lompatan selesai. Pengguna yang ikut menggulir membatalkan kunci saat itu juga. */
  const lockTo = useCallback(
    (href: string) => {
      lockRef.current?.release();
      setActiveSection(href);

      const hasScrollEnd = 'onscrollend' in window;
      // Tanpa scroll sama sekali (sudah di tujuan) tidak ada scrollend: buka setelah 300 ms. Browser tanpa
      // scrollend: buka setelah 150 ms tanpa event scroll. Batas keras 4 s. Selesai normal: sorotan tetap di tujuan
      // (section yang tertahan di dasar halaman tetap tersorot), scroll berikutnya menghitung ulang.
      let idle = window.setTimeout(release, 300);
      const cap = window.setTimeout(release, 4000);
      function onScroll() {
        window.clearTimeout(idle);
        if (!hasScrollEnd) idle = window.setTimeout(release, 150);
      }
      function onInput(e: Event) {
        if (e.type === 'keydown' && !SCROLL_KEYS.has((e as KeyboardEvent).key)) return;
        release();
        setActiveSection(computeActive());
      }
      function release() {
        window.clearTimeout(idle);
        window.clearTimeout(cap);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('scrollend', release);
        window.removeEventListener('wheel', onInput);
        window.removeEventListener('touchstart', onInput);
        window.removeEventListener('keydown', onInput);
        if (lockRef.current === lock) lockRef.current = null;
      }
      const lock = { release };
      lockRef.current = lock;
      window.addEventListener('scroll', onScroll, { passive: true });
      if (hasScrollEnd) window.addEventListener('scrollend', release);
      window.addEventListener('wheel', onInput, { passive: true });
      window.addEventListener('touchstart', onInput, { passive: true });
      window.addEventListener('keydown', onInput);
    },
    [computeActive]
  );

  useEffect(() => () => lockRef.current?.release(), []);

  // Semua tautan hash di halaman ini (menu desktop dan mobile, tile proyek di hero, View Projects, "used in" di Stack)
  // lewat jalur yang sama: tujuan dipetakan ke section menu yang memuatnya, lalu dikunci selama lompatan.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = (e.target as Element | null)?.closest?.('a[href^="#"]')?.getAttribute('href');
      if (!href) return;
      let target: HTMLElement | null = null;
      try {
        target = document.getElementById(decodeURIComponent(href.slice(1)));
      } catch {} // hash dengan % tidak valid
      const section = target?.closest('main section[id]');
      if (section && navLinks.some((link) => link.href === `#${section.id}`)) lockTo(`#${section.id}`);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navLinks, lockTo]);

  // Scroll-spy: dihitung dari posisi scroll, paling banyak sekali per frame. Juga saat mount (setelah restorasi
  // scroll), resize, load, pageshow (bfcache), dan saat tinggi konten berubah (gambar, font).
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!lockRef.current) setActiveSection(computeActive());
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const events = ['scroll', 'resize', 'load', 'pageshow'] as const;
    events.forEach((e) => window.addEventListener(e, schedule, { passive: true }));
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      events.forEach((e) => window.removeEventListener(e, schedule));
      ro.disconnect();
    };
  }, [computeActive]);

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
    // Hero tidak punya item menu: sorotan langsung padam, dikunci selama naik.
    lockTo('');
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

  // Indikator aktif (satu elemen untuk semua tautan desktop): diukur dari tautan aktif, diukur ulang saat lebar
  // tautan berubah (font, bahasa, breakpoint). Contact punya gaya aktif sendiri, jadi indikator memudar di sana
  // (posisinya tetap diukur, jadi dari Contact ke item lain tetap meluncur). Dari keadaan tanpa item aktif
  // (hero, muat penuh) indikator muncul di tempat.
  useLayoutEffect(() => {
    const wrap = linksRef.current;
    if (!wrap) return;
    const appear = !prevActiveRef.current;
    prevActiveRef.current = activeSection;
    const measure = () => {
      const link = activeSection ? wrap.querySelector<HTMLAnchorElement>(`a[href="${activeSection}"]`) : null;
      if (!link || link.offsetParent === null) {
        setIndicator((prev) => ({ ...prev, on: false, appear: false }));
        return;
      }
      setIndicator({
        x: link.offsetLeft,
        y: link.offsetTop,
        w: link.offsetWidth,
        h: link.offsetHeight,
        on: !link.classList.contains('nav-link-contact'),
        appear,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [activeSection, navLinks]);

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
            <span
              aria-hidden="true"
              className="nav-indicator"
              data-on={indicator.on ? '' : undefined}
              data-appear={indicator.appear ? '' : undefined}
              style={{
                transform: `translate(${indicator.x}px, ${indicator.y}px)`,
                width: indicator.w,
                height: indicator.h,
              }}
            />
            {navLinks.map((link) => {
              const active = activeSection === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
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
                      onClick={() => setMobileMenuOpen(false)}
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
                    onClick={() => setMobileMenuOpen(false)}
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
