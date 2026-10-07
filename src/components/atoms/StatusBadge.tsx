import { cn } from '@/lib/utils/cn';

interface StatusBadgeProps {
  status: 'in-progress' | 'completed' | 'archived';
  className?: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  'in-progress': {
    label: 'In Progress',
    bg: 'color-mix(in srgb, var(--color-highlight) 12%, var(--color-bg))',
    text: 'var(--color-highlight)',
    border: 'color-mix(in srgb, var(--color-highlight) 25%, transparent)',
  },
  'completed': {
    label: 'Completed',
    bg: 'color-mix(in srgb, var(--color-burgundy-accent) 10%, var(--color-bg))',
    text: 'var(--color-burgundy-accent)',
    border: 'color-mix(in srgb, var(--color-burgundy-accent) 20%, transparent)',
  },
  'archived': {
    label: 'Archived',
    bg: 'var(--color-border)',
    text: 'var(--color-text-secondary)',
    border: 'var(--color-border)',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full',
        'text-xs font-mono font-medium',
        className
      )}
      style={{
        background: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
      }}
    >
      {config.label}
    </span>
  );
}
