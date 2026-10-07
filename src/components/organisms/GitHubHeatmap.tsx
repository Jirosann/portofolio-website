'use client';

import { useState, useEffect, useLayoutEffect, useRef, useMemo, MouseEvent as ReactMouseEvent, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import type { GitHubContributions } from '@/lib/content/github';
import { useTranslation } from '@/components/providers/LanguageProvider';

interface GitHubHeatmapProps {
  data: GitHubContributions;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  text: string;
  isFlipped: boolean;
  arrowOffset?: number;
}

export function GitHubHeatmap({ data }: GitHubHeatmapProps) {
  const { t, lang } = useTranslation();
  
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, text: '', isFlipped: false });
  const [activeCell, setActiveCell] = useState<{ week: number; day: number } | null>(null);

  const weeks = useMemo(() => data?.weeks || [], [data?.weeks]);

  // Set initial active cell to the last valid day
  useEffect(() => {
    if (!weeks.length) return;
    for (let w = weeks.length - 1; w >= 0; w--) {
      for (let d = 6; d >= 0; d--) {
        if (weeks[w].days[d]?.date) {
          setActiveCell({ week: w, day: d });
          return;
        }
      }
    }
  }, [weeks]);

  // Auto-scroll to right on mount
  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [weeks.length]); // depend on weeks.length so it runs after grid is populated

  // Close tooltip on scroll or outside click
  useEffect(() => {
    const handleScrollOrClick = (e: Event) => {
      if (tooltip.visible && e.type === 'scroll') setTooltip(prev => ({ ...prev, visible: false }));
      if (tooltip.visible && e.type === 'touchstart') {
        const target = e.target as HTMLElement;
        if (!target.closest('.github-heatmap-cell')) setTooltip(prev => ({ ...prev, visible: false }));
      }
    };
    
    window.addEventListener('scroll', handleScrollOrClick, { capture: true, passive: true });
    window.addEventListener('touchstart', handleScrollOrClick, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScrollOrClick, { capture: true });
      window.removeEventListener('touchstart', handleScrollOrClick);
    };
  }, [tooltip.visible]);

  if (!data || data.weeks.length === 0 || data.error) {
    return (
      <section className="py-16 md:py-24 github-heatmap-section">
        <div className="max-w-content mx-auto px-5">
          <div className="github-heatmap-header">
            <div>
              <h2 className="github-heatmap-title">{t.heatmap.title}</h2>
            </div>
            <a href={`https://github.com/${data?.username || 'Jirosann'}`} target="_blank" rel="noopener noreferrer" className="github-heatmap-link">
              {t.heatmap.viewGithub}
            </a>
          </div>
          <div className="github-heatmap-grid-wrapper flex items-center justify-center p-8 text-center text-[var(--color-text-secondary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)]">
            <p>{data?.error ? t.heatmap.errorMsg : t.heatmap.noContributions}</p>
          </div>
        </div>
      </section>
    );
  }

  const formatTooltipText = (count: number, dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    const formattedDate = new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
    }).format(dateObj);

    if (count === 0) return t.heatmap.noContributionsOn.replace('{date}', formattedDate);
    if (count === 1) return t.heatmap.contributionOn.replace('{count}', String(count)).replace('{date}', formattedDate);
    return t.heatmap.contributionsOn.replace('{count}', String(count)).replace('{date}', formattedDate);
  };

  const showTooltip = (el: HTMLElement, count: number, dateStr: string) => {
    const rect = el.getBoundingClientRect();
    const text = formatTooltipText(count, dateStr);
    
    // Default position: above cell
    let y = rect.top - 8;
    let isFlipped = false;
    
    // Flip if too close to top edge
    if (y < 40) {
      y = rect.bottom + 8;
      isFlipped = true;
    }

    const x = rect.left + rect.width / 2;
    let clampedX = x;
    const estHalfWidth = 100;
    
    if (x - estHalfWidth < 8) {
      clampedX = estHalfWidth + 8;
    } else if (x + estHalfWidth > window.innerWidth - 8) {
      clampedX = window.innerWidth - estHalfWidth - 8;
    }
    
    setTooltip({
      visible: true,
      x: clampedX,
      y,
      text,
      isFlipped,
      arrowOffset: x - clampedX
    });
  };

  const hideTooltip = () => setTooltip(prev => ({ ...prev, visible: false }));

  const handleMouseEnter = (e: ReactMouseEvent<HTMLDivElement>, count: number, dateStr: string) => {
    showTooltip(e.currentTarget, count, dateStr);
  };


  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!activeCell) return;
    
    let { week, day } = activeCell;
    let handled = true;

    switch (e.key) {
      case 'ArrowLeft':
        week = Math.max(0, week - 1);
        break;
      case 'ArrowRight':
        week = Math.min(weeks.length - 1, week + 1);
        break;
      case 'ArrowUp':
        day = Math.max(0, day - 1);
        break;
      case 'ArrowDown':
        day = Math.min(6, day + 1);
        break;
      case 'Home':
        week = 0;
        break;
      case 'End':
        week = weeks.length - 1;
        break;
      case 'Escape':
        hideTooltip();
        (document.activeElement as HTMLElement)?.blur();
        break;
      default:
        handled = false;
    }

    if (handled) {
      e.preventDefault();
      const targetCell = weeks[week]?.days[day];
      if (targetCell?.date) {
        setActiveCell({ week, day });
        // Find DOM node and focus it
        setTimeout(() => {
          const el = gridRef.current?.querySelector(`[data-week="${week}"][data-day="${day}"]`) as HTMLElement;
          if (el) {
            el.focus();
            showTooltip(el, targetCell.count, targetCell.date);
          }
        }, 0);
      }
    }
  };

  const monthLabels: { label: string; index: number }[] = [];
  let lastMonthLabelIndex = -4;

  weeks.forEach((week, index) => {
    const firstDay = week.days.find(d => d.date);
    if (!firstDay) return;
    
    const [y, m, d] = firstDay.date.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    const month = dateObj.getUTCMonth();
    
    const prevWeek = weeks[index - 1];
    const prevFirstDay = prevWeek?.days.find(d => d.date);
    let isNewMonth = false;
    
    if (!prevFirstDay) {
      isNewMonth = true;
    } else {
      const [py, pm, pd] = prevFirstDay.date.split('-').map(Number);
      const prevMonth = new Date(Date.UTC(py, pm - 1, pd)).getUTCMonth();
      if (prevMonth !== month) isNewMonth = true;
    }

    if (isNewMonth && (index - lastMonthLabelIndex >= 3)) {
      monthLabels.push({
        index,
        label: new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', timeZone: 'UTC' }).format(dateObj)
      });
      lastMonthLabelIndex = index;
    }
  });

  const getDayLabel = (dayIndex: number) => {
    const date = new Date(Date.UTC(2023, 0, 1 + dayIndex));
    return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'short', timeZone: 'UTC' }).format(date);
  };

  return (
    <section className="py-16 md:py-24 github-heatmap-section">
      <div className="max-w-content mx-auto px-5">
        <div className="github-heatmap-header">
          <div>
            <h2 className="github-heatmap-title">{t.heatmap.title}</h2>
            <p className="github-heatmap-count">
              {data.totalContributions.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')} {t.heatmap.contributionsInYear}
            </p>
          </div>
          <a href={`https://github.com/${data.username}`} target="_blank" rel="noopener noreferrer" className="github-heatmap-link">
            {t.heatmap.viewGithub}
          </a>
        </div>

        <div className="github-heatmap-grid-wrapper" ref={scrollRef}>
          <div 
            className="github-heatmap-grid" 
            ref={gridRef}
            role="grid" 
            aria-label={`GitHub contributions, ${data.totalContributions} in the last year`}
            onKeyDown={handleKeyDown}
            style={{ '--week-count': weeks.length } as React.CSSProperties}
          >
            {/* Top-left corner spacer */}
            <div className="sticky left-0 bg-[var(--color-surface)] z-20 pointer-events-none" style={{ gridRow: 1, gridColumn: 1 }} aria-hidden="true" />
            
            {/* Month labels */}
            {monthLabels.map(({ label, index }) => (
              <div 
                key={`month-${index}`} 
                className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] leading-none pt-1"
                style={{ gridRow: 1, gridColumn: index + 2 }}
                aria-hidden="true"
              >
                {label}
              </div>
            ))}

            {/* Day labels (Left column) */}
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={`day-${i}`}
                className="sticky left-0 bg-[var(--color-surface)] z-20 text-[10px] sm:text-xs text-[var(--color-text-secondary)] leading-none flex items-center justify-end pr-2"
                style={{ gridRow: i + 2, gridColumn: 1 }}
                aria-hidden="true"
              >
                {i === 1 || i === 3 || i === 5 ? getDayLabel(i) : ''}
              </div>
            ))}

            {/* Grid Cells */}
            {weeks.map((week, weekIndex) => (
              week.days.map((day, dayIndex) => {
                if (!day.date) return null; // padding
                const isFocusable = activeCell?.week === weekIndex && activeCell?.day === dayIndex;
                const ariaLabel = formatTooltipText(day.count, day.date);

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    role="gridcell"
                    tabIndex={isFocusable ? 0 : -1}
                    data-week={weekIndex}
                    data-day={dayIndex}
                    aria-label={ariaLabel}
                    className={`github-heatmap-cell github-heatmap-cell--level-${day.level}`}
                    style={{ gridRow: dayIndex + 2, gridColumn: weekIndex + 2 }}
                    onMouseEnter={(e) => handleMouseEnter(e, day.count, day.date)}
                    onMouseLeave={hideTooltip}
                    onFocus={(e) => showTooltip(e.currentTarget, day.count, day.date)}
                    onBlur={hideTooltip}
                    onClick={() => {
                      setActiveCell({ week: weekIndex, day: dayIndex });
                    }}
                  />
                );
              })
            ))}
          </div>

          {/* Legend */}
          <div className="github-heatmap-legend" aria-hidden="true">
            <span>{t.heatmap.less}</span>
            <div className="github-heatmap-legend-cell github-heatmap-cell--level-0" />
            <div className="github-heatmap-legend-cell github-heatmap-cell--level-1" />
            <div className="github-heatmap-legend-cell github-heatmap-cell--level-2" />
            <div className="github-heatmap-legend-cell github-heatmap-cell--level-3" />
            <div className="github-heatmap-legend-cell github-heatmap-cell--level-4" />
            <span>{t.heatmap.more}</span>
          </div>
        </div>
      </div>

      {/* Tooltip Portal */}
      {typeof window !== 'undefined' && tooltip.visible && createPortal(
        <div
          role="tooltip"
          className="github-heatmap-tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: `translate(-50%, ${tooltip.isFlipped ? '0' : '-100%'})`
          }}
        >
          {tooltip.text.split(/(\d+)/).map((part, i) => 
            /\d+/.test(part) ? <strong key={i}>{part}</strong> : part
          )}
          <div 
            className="github-heatmap-tooltip-arrow" 
            style={{ 
              [tooltip.isFlipped ? 'top' : 'bottom']: '-4px',
              left: `calc(50% + ${tooltip.arrowOffset || 0}px)`,
              transform: `translateX(-50%) rotate(45deg)` 
            }} 
          />
        </div>,
        document.body
      )}
    </section>
  );
}
