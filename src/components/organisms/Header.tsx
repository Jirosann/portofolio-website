'use client';
import { useTranslation } from '@/components/providers/LanguageProvider';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Container } from '@/components/layout/Container';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher';

export interface NavLink {
  href: string;
  label: string;
}

interface HeaderProps {
  navLinks: NavLink[];
}

export function Header({ navLinks }: HeaderProps) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  
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
  
  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 animate-slide-down lg:py-3 lg:pointer-events-none"
    >
      {/* < 1024: bar solid selebar layar. >= 1024: wrapper transparan, <nav> jadi pill kaca melayang. */}
      <div className="site-header border-b lg:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
      {/* < 360 px: padding lebih rapat agar logo + bahasa + tema + menu muat di 320 px */}
      <Container className="max-[359px]:px-4">
        <nav className="nav-pill flex items-center justify-between h-16 lg:h-14 lg:w-fit lg:mx-auto lg:gap-6 lg:pl-4 lg:pr-2 lg:rounded-full lg:pointer-events-auto">
          {/* Logo / Name */}
          <Link
            href="/"
            className="flex items-center gap-2.5 min-h-11 transition-opacity hover:opacity-80"
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
          <div className="hidden md:flex items-center gap-2">
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
              className="nav-link-base nav-tool-btn p-2 rounded-full transition-colors duration-200"
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
                        'mobile-nav-contact rounded-full px-4 py-3 text-base font-bold text-center mx-auto w-full max-w-xs transition-colors',
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
