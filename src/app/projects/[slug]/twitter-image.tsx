import { getOGImage } from '@/lib/og';
import { getProjectBySlug } from '@/lib/content/projects';

export const alt = 'Project by Muhammad Nabil Al Qadri';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  return getOGImage({
    title: project?.title ?? 'Muhammad Nabil Al Qadri',
    subtitle: project?.role ?? 'Software Engineering Student',
    footer: 'Muhammad Nabil Al Qadri',
  });
}
