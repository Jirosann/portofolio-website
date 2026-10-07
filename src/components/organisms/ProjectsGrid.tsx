'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ProjectCard } from '@/components/molecules/ProjectCard';
import { ScrollReveal } from '@/components/atoms/ScrollReveal';
import { AnimatedUnderline } from '@/components/atoms/AnimatedUnderline';
import { CreativeWorkCard } from '@/components/molecules/CreativeWorkCard';
import type { ProjectSoftware, CreativeWork } from '@/types';
import { useTranslation } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils/cn';

type FilterType = 'all' | 'software' | 'creative';

interface ProjectsGridProps {
  softwareProjects: ProjectSoftware[];
  creativeWorks: CreativeWork[];
}

export function ProjectsGrid({ softwareProjects, creativeWorks }: ProjectsGridProps) {
  const { t } = useTranslation();
  
  const filters: { value: FilterType; label: string }[] = useMemo(() => [
    { value: 'all', label: t.projects.filterAll },
    { value: 'software', label: t.projects.filterSoftware },
    { value: 'creative', label: t.projects.filterCreative },
  ], [t]);

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [hoveredFilter, setHoveredFilter] = useState<FilterType | null>(null);

  const buttonsRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const targetFilter = hoveredFilter || activeFilter;
    const targetBtn = buttonsRef.current[targetFilter];
    
    if (targetBtn) {
      setIndicatorStyle({
        left: targetBtn.offsetLeft,
        width: targetBtn.offsetWidth,
        opacity: 1,
      });
    }
  }, [activeFilter, hoveredFilter]);

  const showSoftware = activeFilter === 'all' || activeFilter === 'software';
  const showCreative = activeFilter === 'all' || activeFilter === 'creative';

  const hasSoftware = softwareProjects.length > 0;
  const hasCreative = creativeWorks.length > 0;

  const isEmpty =
    (showSoftware && !hasSoftware && !showCreative) ||
    (showCreative && !hasCreative && !showSoftware) ||
    (!hasSoftware && !hasCreative);

  const gridContent = useMemo(() => (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {showSoftware &&
        softwareProjects.map((project, idx) => {
          const isHero = project.title.toLowerCase().includes('face attend');
          return (
            <ScrollReveal
              key={project.id}
              delay={idx * 100}
              className={cn(
                "group transition-transform duration-500 hover:-translate-y-2",
                isHero ? "md:col-span-2 md:row-span-2" : "col-span-1"
              )}
            >
              <ProjectCard project={project} isHero={isHero} />
            </ScrollReveal>
          );
        })}
      {showCreative &&
        creativeWorks.map((work, idx) => (
          <ScrollReveal
            key={work.id}
            delay={(softwareProjects.length + idx) * 100}
            className="group transition-transform duration-500 hover:-translate-y-2 col-span-1"
          >
            <CreativeWorkCard work={work} />
          </ScrollReveal>
        ))}
    </div>
  ), [showSoftware, showCreative, softwareProjects, creativeWorks]);

  return (
    <section id="projects" className="py-24 relative overflow-hidden content-visibility-auto">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 rounded-full opacity-10 dark:opacity-5 blur-[120px] pointer-events-none" style={{ background: 'var(--color-burgundy)' }} />
      
      <div className="max-w-content mx-auto px-5 relative z-10">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter" style={{ color: 'var(--color-text)' }}>
              {t.projects.title}
            </h2>
            <AnimatedUnderline className="w-16 h-1 rounded-full mb-6 bg-accent dark:bg-highlight" />
            <p className="text-lg md:text-xl font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {t.projects.subtitle}
            </p>
          </div>

          {/* Sleek Floating Filter Pills */}
          <div className="flex relative p-1 rounded-full overflow-hidden shadow-sm"
               style={{
                 background: 'color-mix(in srgb, var(--color-surface) 40%, transparent)',
                 backdropFilter: 'blur(16px)',
                 border: '1px solid color-mix(in srgb, var(--color-border) 40%, transparent)',
               }}
               role="group" aria-label="Filter projects">
            
            {/* Sliding Jelly Background */}
            <div 
              className="absolute top-1 bottom-1 left-0 rounded-full z-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: `translate3d(${indicatorStyle.left}px, 0, 0)`,
                width: indicatorStyle.width,
                opacity: indicatorStyle.opacity,
                background: 'var(--color-text)',
              }}
            />

            {filters.map((filter) => (
              <button
                key={filter.value}
                ref={(el) => { buttonsRef.current[filter.value] = el; }}
                onClick={() => setActiveFilter(filter.value)}
                onMouseEnter={() => setHoveredFilter(filter.value)}
                onMouseLeave={() => setHoveredFilter(null)}
                className="relative px-6 py-2.5 rounded-full text-sm font-bold z-10 transition-colors duration-300"
                style={{
                  color: (hoveredFilter === filter.value || (!hoveredFilter && activeFilter === filter.value)) 
                          ? 'var(--color-bg)' 
                          : 'var(--color-text-secondary)',
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        </ScrollReveal>

        {isEmpty ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-[var(--border-color)] text-[var(--text-secondary)]">
            <p>No projects found in this category.</p>
          </div>
        ) : (
          gridContent
        )}
      </div>
    </section>
  );
}
