import { cn } from '@/lib/utils/cn';

interface StackIconProps {
  name: string;
  icon?: string;
  className?: string;
}

// Logo monokrom (fill currentColor -> hitam di <img>): dibalik di tema gelap lewat CSS (.stack-icon--mono).
const MONO = new Set(['GitHub', 'Flask', 'Vercel']);

/** "InsightFace" -> "IF", "MediaPipe" -> "MP", "NLTK" -> "NL". */
function monogram(name: string): string {
  const caps = name.replace(/[^A-Z]/g, '');
  return (caps.length >= 2 && caps !== name.replace(/\s/g, '') ? caps : name).slice(0, 2).toUpperCase();
}

// Ikon dari public/icons (scripts/export-icons.tsx), bukan SVG inline: halaman dirender per request, jadi SVG inline
// ikut dua kali (HTML + payload RSC); terukur +102 KB gzip pada dokumen. Section di bawah layar pertama: lazy.
export function StackIcon({ name, icon, className }: StackIconProps) {
  if (!icon) {
    return (
      <span aria-hidden="true" className={cn('stack-icon stack-monogram', className)}>
        {monogram(name)}
      </span>
    );
  }
  return (
    <img
      src={`/icons/${icon.toLowerCase()}.svg`}
      alt=""
      width={32}
      height={32}
      loading="lazy"
      decoding="async"
      className={cn('stack-icon', MONO.has(icon) && 'stack-icon--mono', className)}
    />
  );
}
