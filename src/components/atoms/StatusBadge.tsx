import { cn } from '@/lib/utils/cn';

interface StatusBadgeProps {
  status: 'concept' | 'in-progress' | 'completed' | 'archived';
  className?: string;
  label?: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  // Border netral memakai token chip halaman utama (.mc-chip): opaque, >= 3:1 di kedua tema
  'concept': {
    label: 'Concept',
    bg: 'var(--color-border)',
    text: 'var(--color-text-secondary)',
    border: 'var(--color-chip-border)',
  },
  'in-progress': {
    label: 'In Development',
    bg: 'color-mix(in srgb, var(--color-highlight) 12%, var(--color-bg))',
    text: 'var(--color-badge-progress)',
    border: 'var(--color-badge-progress)',
  },
  'completed': {
    label: 'Completed',
    bg: 'color-mix(in srgb, var(--color-burgundy-accent) 10%, var(--color-bg))',
    // eyebrow: burgundy di terang, tembaga di gelap (burgundy-accent di atas latar gelap hanya ~1,8:1)
    text: 'var(--color-eyebrow)',
    border: 'var(--color-chip-live-border)',
  },
  'archived': {
    label: 'Archived',
    bg: 'var(--color-border)',
    text: 'var(--color-text-secondary)',
    border: 'var(--color-chip-border)',
  },
};

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
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
      {label ?? config.label}
    </span>
  );
}
