'use client';

import React from 'react';
import type { Project } from '@/lib/validation/schemas';
import { ProjectCard } from './ProjectCard';
import { ScrollReveal } from '@/components/atoms/ScrollReveal';
import { AnimatedUnderline } from '@/components/atoms/AnimatedUnderline';
import { useTranslation } from '@/components/providers/LanguageProvider';

interface FeaturedProjectsProps {
  projects: Project[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const { t } = useTranslation();

  const completedProjects = projects.filter(p => p.status === 'completed');
  const inProgressProjects = projects.filter(p => p.status === 'in-progress');

  return (
    <section id="projects" className="py-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 rounded-full opacity-10 dark:opacity-5 blur-[120px] pointer-events-none" style={{ background: 'var(--color-burgundy)' }} />
      
      <ScrollReveal className="max-w-content mx-auto px-5 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter" style={{ color: 'var(--color-text)' }}>
              {t.projects.title || 'Featured Projects'}
            </h2>
            <AnimatedUnderline className="w-16 h-1 rounded-full mb-6 bg-accent dark:bg-highlight" />
            <p className="text-lg md:text-xl font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {t.projects.subtitle || 'Some of my recent work'}
            </p>
          </div>
        </div>

        {completedProjects.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Completed</h3>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {completedProjects.map((project) => (
                <div key={project.slug} className="h-full">
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </div>
        )}

        {inProgressProjects.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>On Progress</h3>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {inProgressProjects.map((project) => (
                <div key={project.slug} className="h-full">
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </div>
        )}
      </ScrollReveal>
    </section>
  );
}
