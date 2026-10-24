import { cn } from '@/lib/utils/cn';

// Urutan section di halaman utama (sama dengan page.tsx). Nomor label diturunkan dari sini;
// bila urutan atau visibilitas section berubah, perbarui daftar ini.
const SECTION_ORDER = ['about', 'experience', 'skills', 'projects', 'contact'] as const;

export type SectionId = (typeof SECTION_ORDER)[number];

interface SectionHeadingProps {
  section: SectionId;
  label: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeading({ section, label, title, description, className }: SectionHeadingProps) {
  const number = String(SECTION_ORDER.indexOf(section) + 1).padStart(2, '0');

  return (
    <hgroup className={cn('mb-10 md:mb-12', className)}>
      <p className="section-label mb-3">
        {number} — {label}
      </p>
      <h2 className="font-serif font-semibold text-4xl md:text-5xl leading-[1.08] tracking-tight text-[var(--color-text)] [text-wrap:balance]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
          {description}
        </p>
      )}
    </hgroup>
  );
}
