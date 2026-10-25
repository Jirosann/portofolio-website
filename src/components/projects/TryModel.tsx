'use client';

import { useState, type ReactNode } from 'react';
import type { Language } from '@/lib/i18n';
import type { FakeNewsModel } from '@/lib/fake-news/infer';
import type { TryModelPanel } from './TryModelPanel';

interface TryModelProps {
  lang: Language;
  labels: { button: string; loading: string; error: string };
  children: ReactNode;    // tautan kartu (dirender server)
}

const PANEL_ID = 'try-model-fake-news';

// Island kecil di JS awal: hanya tombol dan pemicu. Panel, inferensi, teks, contoh, dan bobot model
// baru diambil saat klik pertama (import() + fetch paralel), jadi halaman tidak membayar apa pun sebelum itu.
// Mengembalikan dua anak grid kartu baris: baris tautan (5/12) dan panel selebar kartu.
export function TryModel({ lang, labels, children }: TryModelProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [loaded, setLoaded] = useState<{ Panel: typeof TryModelPanel; model: FakeNewsModel } | null>(null);

  const load = () => {
    setState('loading');
    Promise.all([
      import('./TryModelPanel'),
      fetch('/models/fake-news/model.json').then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<FakeNewsModel>;
      }),
    ])
      .then(([mod, model]) => {
        setLoaded({ Panel: mod.TryModelPanel, model });
        setState('idle');
      })
      .catch(() => setState('error'));
  };

  const toggle = () => {
    setOpen(!open);
    if (!open && !loaded && state !== 'loading') load();
  };

  return (
    <>
      <div className="md:col-span-5 md:self-start">
        <div className="flex flex-wrap gap-3">
          {children}
          <button type="button" className="mc-link mc-link--primary" aria-expanded={open} aria-controls={PANEL_ID} onClick={toggle}>
            {labels.button}
            <span aria-hidden="true">{open ? '−' : '+'}</span>
          </button>
        </div>
      </div>
      <div id={PANEL_ID} className="md:col-span-12" hidden={!open}>
        {loaded ? (
          <loaded.Panel model={loaded.model} lang={lang} open={open} />
        ) : (
          <p role="status" className="text-sm text-[var(--color-text-secondary)]">
            {state === 'error' ? labels.error : open ? labels.loading : null}
          </p>
        )}
      </div>
    </>
  );
}
