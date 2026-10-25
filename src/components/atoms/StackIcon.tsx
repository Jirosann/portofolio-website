import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';
import { DARK, GLYPH, HALO, LIGHT, MONO, SCALE } from '@/icons/meta';

interface StackIconProps {
  name: string;
  icon?: string;
  className?: string;
}

/** "CapCut" -> "CC", "Hermes Agent" -> "HA". Hanya untuk tool tanpa logo berlisensi jelas. */
function monogram(name: string): string {
  const caps = name.replace(/[^A-Z]/g, '');
  return (caps.length >= 2 && caps !== name.replace(/\s/g, '') ? caps : name).slice(0, 2).toUpperCase();
}

// Ikon dari public/icons (scripts/export-icons.tsx), bukan SVG inline: halaman dirender per request, jadi SVG inline
// ikut dua kali (HTML + payload RSC); terukur +102 KB gzip pada dokumen. Section di bawah layar pertama: lazy.
// Tampilan per ikon (monokrom, varian gelap, skala optis, glyph) ada di src/icons/meta.ts.
export function StackIcon({ name, icon, className }: StackIconProps) {
  if (!icon) {
    return (
      <span aria-hidden="true" className={cn('stack-icon stack-monogram', className)}>
        {monogram(name)}
      </span>
    );
  }
  const file = icon.toLowerCase();
  const style: CSSProperties | undefined = SCALE[icon] ? { scale: String(SCALE[icon]) } : undefined;
  if (GLYPH.has(icon)) {
    return (
      <span
        aria-hidden="true"
        className={cn('stack-icon stack-glyph', className)}
        style={{ ...style, '--glyph': `url(/icons/${file}.svg)` } as CSSProperties}
      />
    );
  }
  const img = (src: string, variant?: string) => (
    <img
      key={src}
      src={src}
      alt=""
      width={32}
      height={32}
      loading="lazy"
      decoding="async"
      style={style}
      className={cn('stack-icon', MONO.has(icon) && 'stack-icon--mono', HALO.has(icon) && 'stack-icon--halo', variant, className)}
    />
  );
  // Satu berkas per tema; <img> lazy yang display:none tidak diunduh, jadi tiap tema hanya memuat satu.
  if (DARK[icon] || LIGHT[icon]) return [img(`/icons/${file}.svg`, 'stack-icon--l'), img(`/icons/${file}-dark.svg`, 'stack-icon--d')];
  return img(`/icons/${file}.svg`);
}
