import { cn } from '@/lib/utils/cn';

interface SectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ id, children, className }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-16 md:py-24',
        className
      )}
    >
      {children}
    </section>
  );
}
