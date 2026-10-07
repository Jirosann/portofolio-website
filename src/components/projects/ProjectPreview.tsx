'use client';

import React from 'react';
import type { Project } from '@/lib/validation/schemas';
import { cn } from '@/lib/utils/cn';

type ProjectPreviewProps = {
  id: string;
  preview: Project['preview'];
  position: 'top' | 'bottom';
};

export function ProjectPreview({ id, preview, position }: ProjectPreviewProps) {
  if (!preview) return null;

  return (
    <div 
      id={id}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 w-[360px] aspect-video z-50",
        position === 'top' ? "bottom-[calc(100%_+_10px)]" : "top-[calc(100%_+_10px)]",
        "opacity-0 scale-95 pointer-events-none transition-all duration-200 delay-150 ease-out",
        "group-hover/btn:opacity-100 group-hover/btn:scale-100 group-focus-within/btn:opacity-100 group-focus-within/btn:scale-100",
        "motion-reduce:transition-none motion-reduce:scale-100",
        "hidden sm:block shadow-xl rounded-xl border border-[var(--color-border)] overflow-hidden"
      )}
      aria-hidden="true"
    >
      { }
      <img
        src={preview.src}
        alt=""
        width={preview.width}
        height={preview.height}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover bg-[var(--color-surface)]"
      />
    </div>
  );
}
