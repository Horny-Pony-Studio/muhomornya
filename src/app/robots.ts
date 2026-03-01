import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/cart',
          '/checkout',
          '/orders',
          '/account',
          '/search',
          '/carts',
          '/policies/',
          '/*/policies/',
        ],
      },
      { userAgent: 'Nutch', disallow: '/' },
      { userAgent: 'AhrefsBot', crawlDelay: 10 },
      { userAgent: 'AhrefsSiteAudit', crawlDelay: 10 },
      { userAgent: 'MJ12bot', crawlDelay: 10 },
      { userAgent: 'Pinterest', crawlDelay: 1 },
    ],
    sitemap: 'https://muhomornya.com/sitemap.xml',
  };
}
