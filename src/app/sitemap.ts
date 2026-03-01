import type { MetadataRoute } from 'next';
import { siteUrl } from '@/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          uk: siteUrl,
          en: `${siteUrl}/en`,
          de: `${siteUrl}/de`,
        },
      },
    },
  ];
}
