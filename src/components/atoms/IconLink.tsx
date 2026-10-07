import { cn } from '@/lib/utils/cn';

interface IconLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  external?: boolean;
  className?: string;
}

export function IconLink({ href, label, icon, external = false, className }: IconLinkProps) {
  const externalProps = external
    ? {
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `${label} (opens in new tab)`,
      }
    : {
        'aria-label': label,
      };
  
  return (
    <a
      href={href}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
        'bg-surface border border-border',
        'text-text hover:text-accent hover:border-accent',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
        className
      )}
      {...externalProps}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="font-medium">{label}</span>
    </a>
  );
}
