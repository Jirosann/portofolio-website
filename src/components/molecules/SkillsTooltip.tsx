'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSkillsTooltip } from './skills.config';

export function SkillsTooltip() {
  const tooltip = useSkillsTooltip();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  let content = null;

  if (tooltip) {
    // Tooltip is placed above the bounding box
    const tooltipY = tooltip.y - 12; // 12px above
    const tooltipX = tooltip.x + tooltip.width / 2;
    
    // Check if it fits on screen
    const isTooHigh = tooltipY < 50; 
    const finalY = isTooHigh ? tooltip.y + tooltip.height + 12 : tooltipY;
    const finalTransform = isTooHigh ? 'translate(-50%, 0)' : 'translate(-50%, -100%)';

    content = (
      <div
        style={{
          position: 'fixed',
          left: tooltipX,
          top: finalY,
          transform: finalTransform,
          zIndex: 9999,
          background: 'var(--color-text)',
          color: 'var(--color-bg)',
          pointerEvents: 'none',
          transition: 'opacity 120ms ease-in-out',
        }}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap drop-shadow-md"
      >
        {tooltip.text}
        <div
          className="absolute w-2 h-2 rotate-45"
          style={{ 
            background: 'var(--color-text)', 
            left: '50%', 
            transform: 'translateX(-50%)',
            ...(isTooHigh ? { top: '-4px' } : { bottom: '-4px' })
          }}
        />
      </div>
    );
  }

  return createPortal(content, document.body);
}
