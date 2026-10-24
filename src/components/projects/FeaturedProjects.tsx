'use client';

import React from 'react';
import type { Project } from '@/lib/validation/schemas';
import { ProjectCard } from './ProjectCard';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { useTranslation } from '@/components/providers/LanguageProvider';

interface FeaturedProjectsProps {
  projects: Project[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const { t } = useTranslation();

  const completedProjects = projects.filter(p => p.status === 'completed');
  const inProgressProjects = projects.filter(p => p.status === 'in-progress');

  return (
    <section id="projects" className="section-y relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 rounded-full scale-[2] opacity-10 dark:opacity-5 pointer-events-none" style={{ background: 'radial-gradient(ellipse closest-side at center, var(--color-burgundy) 0%, transparent 100%)' }} />
      
      <div className="max-w-content mx-auto px-5 relative z-10">
        <SectionHeading section="projects" label={t.nav.projects} title={t.projects.sectionTitle} description={t.projects.subtitle} />

        {completedProjects.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>{t.status.completed}</h3>
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
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>{t.status.onProgress}</h3>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {inProgressProjects.map((project) => (
                <div key={project.slug} className="h-full">
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
