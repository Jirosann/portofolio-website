import { cn } from '@/lib/utils/cn';
import { getVisibleSections, type SectionId } from '@/lib/content/sections';

interface SectionHeadingProps {
  section: SectionId;
  label: string;
  title: string;
  description?: string;
  className?: string;
}

// Nomor label = posisi di antara section yang benar-benar dirender (getVisibleSections, sumber yang sama dengan nav).
export function SectionHeading({ section, label, title, description, className }: SectionHeadingProps) {
  const number = String(getVisibleSections().indexOf(section) + 1).padStart(2, '0');

  return (
    <hgroup className={cn('mb-10 md:mb-12', className)}>
      <p className="section-label mb-3">
        {number} — {label}
      </p>
      <h2 className="font-serif font-semibold text-4xl md:text-5xl leading-[1.08] tracking-tight text-[var(--color-text)] [text-wrap:balance]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)] [text-wrap:pretty]">
          {description}
        </p>
      )}
    </hgroup>
  );
}
