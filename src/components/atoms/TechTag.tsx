import { cn } from '@/lib/utils/cn';
import { getIcon } from '@/icons';

interface TechTagProps {
  label: string;
  icon?: string;
  className?: string;
  role?: string;
}

export function TechTag({ label, icon, className, role }: TechTagProps) {
  const Icon = icon ? getIcon(icon) : null;

  return (
    <span
      role={role}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
        'text-[13px] font-medium tracking-tight',
        'transition-colors duration-200',
        className
      )}
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-secondary)',
      }}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </span>
  );
}
