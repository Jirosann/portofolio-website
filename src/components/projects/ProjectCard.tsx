'use client';

import React, { useRef, useState } from 'react';
import type { Project } from '@/lib/validation/schemas';
import { StatusBadge } from './StatusBadge';
import { ProjectPreview } from './ProjectPreview';

export function ProjectCard({ project }: { project: Project }) {
  const [previewPos, setPreviewPos] = useState<'top' | 'bottom'>('top');
  const btnRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      // If there is less than 250px space above the button, flip to bottom
      if (rect.top < 250) {
        setPreviewPos('bottom');
      } else {
        setPreviewPos('top');
      }
    }
  };

  return (
    <div className="group relative flex flex-col h-full bg-[color-mix(in_srgb,var(--color-surface)_60%,transparent)] backdrop-blur-xl border border-[var(--color-border)] dark:border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] shadow-[0_1px_2px_color-mix(in_srgb,var(--color-text)_5%,transparent),0_4px_12px_color-mix(in_srgb,var(--color-text)_5%,transparent)] dark:shadow-none rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_10%,transparent)] dark:hover:shadow-none hover:border-[var(--color-highlight)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      
      {/* Static thumbnail for mobile (Touch device fallback) */}
      {project.preview && (
        <div className="sm:hidden w-full aspect-video mb-4 rounded-lg overflow-hidden border border-[var(--color-border)]">
          { }
          <img 
            src={project.preview.src} 
            alt={project.preview.alt} 
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <StatusBadge status={project.status} />
      </div>

      <h3 className="text-xl font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-highlight-text)] transition-colors">
        {project.title}
      </h3>
      
      <p className="text-[var(--color-text-secondary)] mb-6 flex-1 text-sm leading-relaxed">
        {project.description}
      </p>

      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag) => (
            <span 
              key={tag}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-auto">
        {project.status === 'completed' && project.liveUrl && (
          <a
            ref={btnRef}
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Live Demo for ${project.title}`}
            aria-describedby={project.preview ? `preview-${project.slug}` : undefined}
            onMouseEnter={handleMouseEnter}
            onFocus={handleMouseEnter}
            className="group/btn relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[var(--color-burgundy-accent)] text-white dark:text-[#F1ECE8] font-bold text-sm transition-all hover:scale-[1.02] hover:bg-[var(--color-burgundy)] dark:hover:bg-[color-mix(in_srgb,var(--color-burgundy-accent)_80%,var(--color-highlight)_20%)] active:scale-95"

          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Live Demo
            
            {/* Popover Preview (Desktop Only) */}
            {project.preview && (
              <ProjectPreview 
                id={`preview-${project.slug}`}
                preview={project.preview} 
                position={previewPos} 
              />
            )}
          </a>
        )}
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View code for ${project.title} on GitHub`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border-2 border-[var(--color-border)] text-[var(--color-text)] font-bold text-sm transition-all hover:border-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
          </svg>
          View Code
        </a>
      </div>
    </div>
  );
}
