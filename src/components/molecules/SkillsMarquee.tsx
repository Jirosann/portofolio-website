'use client';

import { getIcon } from '@/icons';
import { useTransientTip } from '@/lib/hooks/useTransientTip';
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

import { useEffect, useRef, useState } from 'react';

export function SkillsMarquee({
  categoryName,
  skills,
  reverse = false,
  speed = 1,
}: SkillsMarqueeProps) {
  const [litSkills, setLitSkills] = useState<Set<string>>(new Set());
  // Label nama saat tap (layar sentuh); terpisah dari litSkills agar warna tetap bertahan.
  const { tipId, showTip } = useTransientTip();
  const sectionRef = useRef<HTMLDivElement>(null);
  // Set kedua (untuk loop mulus) dirender setelah mount agar HTML/DOM awal tidak menggandakan ~25 ikon per baris.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  // Jeda animasi saat marquee di luar layar atau tab tersembunyi (lewat atribut DOM, tanpa re-render).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let inView = true;
    const sync = () => {
      el.dataset.paused = !inView || document.hidden ? 'true' : 'false';
    };
    const observer = new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting;
      sync();
    });
    observer.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  // Duplicate array for infinite scroll illusion
  const doubled = ready ? [...skills, ...skills] : skills;
  const duration = Math.max(20, skills.length * 4) / speed;

  return (
    <div ref={sectionRef} className="marquee-section">
      <div className="marquee-section-label">{categoryName}</div>
      <div className="marquee-track-wrapper">
        <div
          data-ready={ready ? 'true' : 'false'}
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
              aria-hidden={isDuplicate ? true : undefined}
              type="button"
              tabIndex={isDuplicate ? -1 : 0}
              data-tip-host=""
              onPointerDown={(e) => showTip(`${skill.id}-${index}`, e.pointerType)}
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
                aria-hidden="true"
                data-show={tipId === `${skill.id}-${index}` ? 'true' : undefined}
                className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 data-[show=true]:opacity-100 transition-opacity text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none drop-shadow-md z-30"
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
