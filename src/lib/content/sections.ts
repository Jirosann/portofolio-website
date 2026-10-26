import { cache } from 'react';
import { getExperience } from '@/lib/content/experience';
import { getVideoSection } from '@/lib/content/videos';

// Urutan section di halaman utama. Section opsional hanya masuk bila dirender, jadi tautan nav (page.tsx) dan
// nomor label (SectionHeading) selalu mengikuti section yang benar-benar tampil. cache(): satu kali baca per request,
// walau dipanggil oleh setiap SectionHeading.
export type SectionId = 'about' | 'projects' | 'experience' | 'videos' | 'skills' | 'contact';

export const getVisibleSections = cache(function getVisibleSections(): SectionId[] {
  const hasExperience = getExperience().some((exp) => exp.visible);
  const hasVideos = getVideoSection() !== null;
  return [
    'about',
    'projects',
    ...(hasExperience ? (['experience'] as const) : []),
    ...(hasVideos ? (['videos'] as const) : []),
    'skills',
    'contact',
  ];
});
