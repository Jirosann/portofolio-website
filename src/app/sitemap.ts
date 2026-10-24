import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/constants';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];

  // /projects/* pages are noindex and intentionally excluded until they have real case-study content.
  return staticRoutes;
}
