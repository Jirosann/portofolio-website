'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Label sementara untuk layar sentuh (tanpa hover). Satu id aktif per komponen;
 * hilang saat tap di luar elemen bertanda `data-tip-host`, saat tap elemen lain, atau setelah `ms`.
 * Sengaja terpisah dari state "lit" (warna bertahan).
 */
export function useTransientTip(ms = 2500) {
  const [tipId, setTipId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const hideTip = useCallback(() => {
    clear();
    setTipId(null);
  }, [clear]);

  /** Dipanggil dari onPointerDown; mouse diabaikan karena sudah ditangani :hover. */
  const showTip = useCallback(
    (id: string, pointerType: string) => {
      if (pointerType === 'mouse') return;
      clear();
      setTipId(id);
      timer.current = setTimeout(() => setTipId(null), ms);
    },
    [clear, ms]
  );

  useEffect(() => {
    if (tipId === null) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.('[data-tip-host]')) hideTip();
    };
    document.addEventListener('pointerdown', onDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, [tipId, hideTip]);

  useEffect(() => clear, [clear]);

  return { tipId, showTip, hideTip };
}
