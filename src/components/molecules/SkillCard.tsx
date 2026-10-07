'use client';
import React from 'react';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { getIcon } from '@/icons';
import type { Skill } from '@/types';

export interface SkillCardProps {
  skill: Skill;
  relatedPublicProjects?: { slug: string; title: string }[];
  variant?: 'default' | 'primary';
  className?: string;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  variant = 'default',
  className,
}) => {
  const iconCmp = skill.icon ? getIcon(skill.icon) : null;
  const [hasHovered, setHasHovered] = useState(false);

  return (
    <div
      className={cn(
        'skill-card group',
        variant === 'primary' && 'skill-card--primary',
        className
      )}
      onMouseEnter={() => setHasHovered(true)}
    >
      {iconCmp ? (
        <span className={cn("skill-card-icon transition-all duration-300 filter", hasHovered ? "grayscale-0 opacity-100" : "grayscale opacity-70")} aria-hidden="true">
          {iconCmp && React.createElement(iconCmp, { className: "w-5 h-5" })}
        </span>
      ) : (
        <span className={cn("skill-card-icon skill-card-monogram transition-all duration-300 filter", hasHovered ? "grayscale-0 opacity-100" : "grayscale opacity-70")} aria-hidden="true">
          {skill.name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="skill-card-name">{skill.name}</span>
    </div>
  );
};