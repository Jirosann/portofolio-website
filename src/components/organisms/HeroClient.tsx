'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Profile } from '@/types';
import { useTranslation } from '@/components/providers/LanguageProvider';

export function HeroClient({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const rect = containerRef.current!.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-[2rem] p-8 md:p-16 border animate-fade-in-up"
      style={{
        background: 'color-mix(in srgb, var(--color-surface) 30%, transparent)',
        borderColor: 'color-mix(in srgb, var(--color-border) 40%, transparent)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Mouse Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, color-mix(in srgb, var(--color-highlight) 15%, transparent), transparent 40%)`,
        }}
      />
      
      {/* Animated Floating Grids */}
      <div className="absolute inset-0 z-[-1] pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
           style={{
             backgroundImage: 'linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             backgroundPosition: 'center center',
             maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
             WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
           }}
      />

      <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" 
               style={{ background: 'color-mix(in srgb, var(--color-text) 5%, transparent)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-highlight)' }}></span>
            <span className="text-sm font-semibold tracking-wide uppercase text-[var(--color-eyebrow)]">
              {t.hero.available}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tighter leading-[1.1] text-transparent bg-clip-text glyph-disambiguate [text-wrap:balance]"
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--color-text) 0%, color-mix(in srgb, var(--color-text) 40%, transparent) 100%)',
              }}>
            {profile.name.replace('Al Qadri', '')}
            <span className="whitespace-nowrap">Al Qadri</span>
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight" style={{ color: 'var(--color-text-secondary)' }}>
            {profile.position}
          </h2>

          <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
            {t.hero.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <a
              href="#projects"
              className="group relative px-8 py-4 rounded-xl font-bold transition-all duration-200 ease-out motion-safe:hover:scale-[1.02] motion-safe:active:scale-95 motion-reduce:transition-none motion-reduce:transform-none bg-[var(--color-burgundy-accent)] text-[var(--color-on-primary)] hover:bg-[var(--color-burgundy)] dark:hover:bg-[color-mix(in_srgb,var(--color-burgundy-accent)_80%,var(--color-highlight)_20%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-link-text)] flex items-center gap-2"
            >
              {t.hero.viewProjects}
              <svg className="w-4 h-4 transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-1 motion-reduce:transform-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>

            <a
              href={profile.cv || '#'}
              download={profile.cv ? "MUHAMMAD NABIL AL QADRI - CV.pdf" : undefined}
              className="group px-8 py-4 rounded-xl font-bold transition-all duration-200 ease-out motion-safe:hover:scale-105 motion-safe:active:scale-95 motion-reduce:transition-none motion-reduce:transform-none flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-link-text)] border border-[color-mix(in_srgb,var(--color-text)_30%,transparent)] hover:border-[color-mix(in_srgb,var(--color-text)_50%,transparent)]"
              style={{
                background: 'transparent',
                color: 'var(--color-text)',
              }}
            >
              {t.hero.downloadCV}
              <svg className="w-4 h-4 transition-transform duration-200 ease-out motion-safe:group-hover:-translate-y-1 motion-reduce:transform-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>

            <a
              href="#contact"
              className="group px-4 py-4 font-bold transition-all duration-200 ease-out motion-reduce:transition-none text-[var(--color-eyebrow)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-link-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] flex items-center gap-2 flex-[1_0_100%] md:flex-none -ml-4 md:ml-0"
            >
              {t.hero.contactMe}
              <svg className="w-4 h-4 transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-1 motion-reduce:transform-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
