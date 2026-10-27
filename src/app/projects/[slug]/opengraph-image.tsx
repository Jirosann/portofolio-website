import { notFound } from 'next/navigation';
import { getOGImage } from '@/lib/og';
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/content/projects';

export const alt = 'Project by Muhammad Nabil Al Qadri';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Dirender saat build dan disajikan dari CDN. Slug lain 404 tanpa render: sebelumnya setiap slug acak merender PNG baru
// per request (render gambar = operasi termahal di situs, bisa dipakai untuk menguras kuota).
export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}
export const dynamicParams = false;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return getOGImage({
    title: project.title,
    subtitle: project.role,
    footer: 'Muhammad Nabil Al Qadri',
  });
}
