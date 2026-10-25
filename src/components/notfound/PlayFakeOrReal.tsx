'use client';

import { useState, type ComponentProps } from 'react';
import type { FakeOrReal } from './FakeOrReal';

type PlayProps = ComponentProps<typeof FakeOrReal> & { label: string };

// Pemicu game 404. Root not-found ikut dalam pohon layout: komponen kliennya masuk JS awal SEMUA halaman dan props-nya
// ikut payload RSC setiap dokumen (terukur sesi 12: +5,3 KB gzip JS dan ~2 KB gzip dokumen di `/`). Karena itu hanya
// tombol ini yang ada di JS awal dan props-nya hanya label; game, teks, judul, CSS, inferensi, dan bobot model diambil
// saat "Play" diklik.
export function PlayFakeOrReal({ label, ...props }: PlayProps) {
  const [Game, setGame] = useState<typeof FakeOrReal | null>(null);
  const [loading, setLoading] = useState(false);

  if (Game) return <Game {...props} />;
  return (
    <div className="mt-8">
      <button
        type="button"
        className="mc-link mc-link--primary"
        aria-busy={loading || undefined}
        onClick={() => {
          setLoading(true);
          import('./FakeOrReal').then((m) => setGame(() => m.FakeOrReal), () => setLoading(false));
        }}
      >
        {label}
      </button>
    </div>
  );
}
