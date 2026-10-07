import { cn } from '@/lib/utils/cn';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        'w-full max-w-content mx-auto px-5 md:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}
