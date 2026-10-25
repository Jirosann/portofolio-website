'use client';

import { useEffect } from 'react';
import type { HireCopy } from './hireEffect';

interface DelightRootProps {
  hire: HireCopy;
  githubUrl?: string;
  repoUrl: string;
}

// Satu island kecil di layout (sesi 12):
// - Easter egg: ketik "hire" di mana saja kecuali di kolom isian. Efeknya (clipboard, toast, konfeti) dimuat
//   malas lewat import() saat kata cocok, jadi tidak ada di JS awal.
// - Salam console untuk developer, sekali per sesi tab.
export function DelightRoot({ hire, githubUrl, repoUrl }: DelightRootProps) {
  useEffect(() => {
    let typed = '';
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing || e.key.length !== 1) return;
      const el = e.target as HTMLElement | null;
      if (el?.isContentEditable || el?.closest?.('input, textarea, select')) return;
      typed = (typed + e.key.toLowerCase()).slice(-4);
      if (typed !== 'hire') return;
      typed = '';
      import('./hireEffect').then((m) => m.celebrate(hire));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hire]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('hi')) return;
      sessionStorage.setItem('hi', '1');
    } catch {}
    console.log(
      `%cHi, developer.%c Code and contact below.\nSite code: ${repoUrl}${githubUrl ? `\nGitHub: ${githubUrl}` : ''}\nEmail: ${hire.email}`,
      'font: 600 16px Georgia, serif',
      'font: 12px ui-monospace, monospace'
    );
  }, [hire.email, githubUrl, repoUrl]);

  return null;
}
