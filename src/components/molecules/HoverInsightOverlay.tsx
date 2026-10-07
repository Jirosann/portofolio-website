'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface HoverInsightOverlayProps {
  insight: string;
  className?: string;
}

export function HoverInsightOverlay({ insight, className }: HoverInsightOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={cn('hover-insight-wrapper', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <div
        className={cn('hover-insight-overlay', isVisible && 'hover-insight-overlay--visible')}
        aria-hidden={!isVisible}
        role="tooltip"
      >
        <p className="hover-insight-text">{insight}</p>
      </div>
    </div>
  );
}
