'use client';
import { useState } from 'react';

import { cn } from '@/lib/utils/cn';
import { getIcon } from '@/icons';
import type { Skill } from '@/types';

interface ToolsRowProps {
  tools: Skill[];
}

import { brandColors } from '@/lib/utils/colors';
import { useTranslation } from '@/components/providers/LanguageProvider';

export function ToolsRow({ tools }: ToolsRowProps) {
  const { t } = useTranslation();
  // Fanning effect with alternating slight rotations
  const rotations = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-2', 'rotate-1'];

  // State to track which tools have been hovered (illuminated)
  const [litTools, setLitTools] = useState<Set<string>>(new Set());

  return (
    <div className="flex flex-col items-center mt-24 mb-8">
      <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        {t.skills.developmentTools}
      </h3>
      <p className="mb-12 text-center" style={{ color: 'var(--color-text-secondary)' }}>
        Tools I use for design, version control, testing, and deployment.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-y-12">
        {tools.map((tool, index) => {
          const Icon = tool.icon ? getIcon(tool.icon) : null;
          if (!Icon) return null;

          const rotation = rotations[index % rotations.length];
          const brandColor = brandColors[tool.id] || 'var(--color-text)';
          const isLit = litTools.has(tool.id);

          return (
            <div
              key={tool.id}
              className="relative group hover:z-20 -ml-3 md:-ml-5 first:ml-0 md:first:ml-0 transition-transform duration-300 ease-out"
            >
              <div
                className={cn(
                  'tools-row-box w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[24px] flex items-center justify-center',
                  'transition-all duration-300 ease-out group-hover:rotate-0 group-hover:scale-110 group-hover:-translate-y-6',
                  rotation
                )}
                data-tech-id={tool.id}
                data-lit={isLit ? 'true' : undefined}
                style={{
                  '--tool-brand-color': brandColor,
                } as React.CSSProperties}
                onMouseEnter={() => {
                  setLitTools((prev) => {
                    const newSet = new Set(prev);
                    newSet.add(tool.id);
                    return newSet;
                  });
                }}
              >
                <Icon
                  className="tools-row-icon w-8 h-8 md:w-10 md:h-10 transition-all duration-300"
                />
              </div>

              {/* Tooltip */}
              <div
                className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none drop-shadow-md z-30"
                style={{
                  background: 'var(--color-text)',
                  color: 'var(--color-bg)',
                }}
              >
                {tool.name}
                {/* Arrow */}
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                  style={{ background: 'var(--color-text)' }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
