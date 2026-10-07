'use client';
import { useEffect, useState } from 'react';

export const LIT_HOLD_MS = Infinity;

const timers = new Map<string, NodeJS.Timeout>();

// Subscriptions for tooltip global component
let tooltipListener: ((state: TooltipState | null) => void) | null = null;

export interface TooltipState {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function setGlobalTooltip(state: TooltipState | null) {
  if (tooltipListener) tooltipListener(state);
}

export function useSkillsTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  
  useEffect(() => {
    tooltipListener = setTooltip;
    return () => {
      tooltipListener = null;
    };
  }, []);
  
  return tooltip;
}

export function handleTechHover(techId: string, isHovering: boolean, event?: React.MouseEvent | React.FocusEvent | React.TouchEvent, text?: string) {
  const target = event?.currentTarget as HTMLElement;
  
  if (isHovering) {
    if (timers.has(techId)) {
      clearTimeout(timers.get(techId));
      timers.delete(techId);
    }
    
    // Set colored state
    document.querySelectorAll(`[data-tech-id="${techId}"]`).forEach(el => {
      el.setAttribute('data-lit', 'true');
      el.setAttribute('data-hovering', 'true');
    });

    if (target && text) {
      const rect = target.getBoundingClientRect();
      setGlobalTooltip({
        text,
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }

  } else {
    // Remove hover effects, but keep color if LIT_HOLD_MS is Infinity
    document.querySelectorAll(`[data-tech-id="${techId}"]`).forEach(el => {
      el.removeAttribute('data-hovering');
    });
    
    setGlobalTooltip(null);

    if (LIT_HOLD_MS === Infinity) return;
    
    const timer = setTimeout(() => {
      document.querySelectorAll(`[data-tech-id="${techId}"]`).forEach(el => {
        el.removeAttribute('data-lit');
      });
      timers.delete(techId);
    }, LIT_HOLD_MS);
    
    timers.set(techId, timer);
  }
}

export function useTechLitCleanup() {
  useEffect(() => {
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
      document.querySelectorAll('[data-lit="true"]').forEach(el => {
        el.removeAttribute('data-lit');
        el.removeAttribute('data-hovering');
      });
    };
  }, []);
}
