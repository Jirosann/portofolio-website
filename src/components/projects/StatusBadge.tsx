'use client';

import React from 'react';
import { useTranslation } from '@/components/providers/LanguageProvider';

type StatusBadgeProps = {
  status: 'completed' | 'in-progress';
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const isCompleted = status === 'completed';
  
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
      style={isCompleted ? {
        backgroundColor: 'var(--color-badge-completed-bg)',
        color: 'var(--color-badge-completed-text)',
        borderColor: 'var(--color-badge-completed-border)'
      } : {
        backgroundColor: 'var(--color-badge-progress-bg)',
        color: 'var(--color-badge-progress-text)',
        borderColor: 'var(--color-badge-progress-border)'
      }}
    >
      {isCompleted ? t.status.completed : (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
          {t.status.onProgress}
        </>
      )}
    </span>
  );
}
