'use client';

import { getIcon } from '@/icons';
import { brandColors } from '@/lib/utils/colors';
import type { Skill } from '@/types';

interface SkillsMarqueeProps {
  categoryName: string;
  skills: Skill[];
  reverse?: boolean;
  /** Speed multiplier - affects animation duration */
  speed?: number;
}

/**
 * Deterministic rotation between -6deg and 6deg based on skill ID.
 * Uses a simple hash so rotation is stable across renders.
 */
function getRotation(): number {
  return 0; // User requested: "jangan miring miring gitu banget lurus aja"
}

import { useState } from 'react';

export function SkillsMarquee({
  categoryName,
  skills,
  reverse = false,
  speed = 1,
}: SkillsMarqueeProps) {
  const [litSkills, setLitSkills] = useState<Set<string>>(new Set());

  // Duplicate array for infinite scroll illusion
  const doubled = [...skills, ...skills];
  const duration = Math.max(20, skills.length * 4) / speed;

  return (
    <div className="marquee-section">
      <div className="marquee-section-label">{categoryName}</div>
      <div className="marquee-track-wrapper">
        <div
          className={`marquee-track ${reverse ? 'marquee-track--reverse' : ''}`}
          style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
        >
        {doubled.map((skill, index) => {
          const Icon = skill.icon ? getIcon(skill.icon) : null;
          const rotation = getRotation();
          const isDuplicate = index >= skills.length;
          const brandColor = brandColors[skill.id] || 'var(--color-text)';

          return (
            <button
              key={`${skill.id}-${index}`}
              className={`marquee-item group ${isDuplicate ? 'marquee-item-duplicate' : ''}`}
              data-lit={litSkills.has(skill.id) ? 'true' : undefined}
              data-tech-id={skill.id}
              style={{
                transform: `rotate(${rotation}deg)`,
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}
              aria-label={skill.name}
              type="button"
              tabIndex={isDuplicate ? -1 : 0}
              onMouseEnter={(e) => {
                setLitSkills((prev) => new Set(prev).add(skill.id));
                e.currentTarget.style.background = `color-mix(in srgb, ${brandColor} 15%, var(--color-surface))`;
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${brandColor} 40%, transparent)`;
                e.currentTarget.style.boxShadow = `0 20px 40px -10px color-mix(in srgb, ${brandColor} 50%, transparent)`;
                e.currentTarget.style.transform = `rotate(0deg) scale(1.15) translateY(-8px)`;
                e.currentTarget.style.zIndex = '50';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-surface)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = '';
                e.currentTarget.style.transform = `rotate(${rotation}deg)`;
                e.currentTarget.style.zIndex = '';
              }}
            >
              {Icon ? (
                <Icon
                  className="marquee-item-icon transition-all duration-300"
                  style={litSkills.has(skill.id) ? { color: brandColor } : undefined}
                />
              ) : (
                <span
                  className="marquee-item-icon flex items-center justify-center text-sm font-bold font-mono"
                  style={{
                    width: 32,
                    height: 32,
                    background: 'var(--color-border)',
                    borderRadius: 6,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {skill.name.charAt(0).toUpperCase()}
                </span>
              )}
              {/* Tooltip */}
              <div
                className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none drop-shadow-md z-30"
                style={{
                  background: 'var(--color-text)',
                  color: 'var(--color-bg)',
                }}
              >
                {skill.name}
                {/* Arrow */}
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                  style={{ background: 'var(--color-text)' }}
                ></div>
              </div>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
