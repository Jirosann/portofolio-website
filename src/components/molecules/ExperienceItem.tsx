import { cn } from '@/lib/utils/cn';
import type { Experience } from '@/types';

interface ExperienceItemProps {
  experience: Experience;
  isLast?: boolean;
  className?: string;
}

const typeLabel: Record<Experience['type'], string> = {
  'organization': 'Organization',
  'work': 'Work',
  'startup': 'Startup',
  'academic': 'Academic',
  'competition': 'Competition',
  'other': 'Other',
  'ORGANIZATION': 'Organization',
  'ACADEMIC PROJECT': 'Academic Project',
  'WORKSHOP': 'Workshop',
  'SEMINAR': 'Seminar',
};

export function ExperienceItem({ experience, isLast, className }: ExperienceItemProps) {
  return (
    <li className={cn('relative pl-8 md:pl-0', className)}>
      {/* Timeline connector line (desktop/mobile) */}
      {!isLast && (
        <>
          <div className="md:hidden absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-border" aria-hidden="true" />
          <div className="hidden md:block absolute left-[143px] top-8 bottom-[-24px] w-0.5 bg-border" aria-hidden="true" />
        </>
      )}

      {/* Timeline dot */}
      <div className="absolute left-0 md:left-[132px] top-2 w-6 h-6 rounded-full bg-surface border-4 border-accent flex items-center justify-center z-10" aria-hidden="true" />

      <div className="md:grid md:grid-cols-[120px_1fr] md:gap-12 items-baseline">
        {/* Period (Left column on desktop, top on mobile) */}
        <div className="mb-2 md:mb-0 text-sm font-medium text-text-secondary md:text-right mt-2 md:mt-0 font-mono">
          <time>{experience.period}</time>
        </div>

        {/* Content (Right column on desktop) */}
        <div className="bg-surface border border-border rounded-xl p-5 md:p-6 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-accent/10 text-accent rounded font-mono">
              {typeLabel[experience.type]}
            </span>
            <h3 className="text-lg font-bold text-text leading-tight">{experience.role}</h3>
          </div>
          
          <div className="text-base font-semibold text-text-secondary mb-3">
            {experience.organization}
          </div>

          {experience.description && (
            <p className="text-text-secondary mb-4 leading-relaxed">
              {experience.description}
            </p>
          )}

          {experience.highlights && experience.highlights.length > 0 && (
            <ul className="list-disc pl-5 space-y-2" aria-label="Key highlights">
              {experience.highlights.map((highlight, i) => (
                <li key={i} className="text-text-secondary leading-relaxed">
                  {highlight}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}
