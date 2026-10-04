import type { MetadataRoute } from 'next';
import { absolute } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    // The admin panel also sends noindex; blocking it here saves crawl budget.
    rules: { userAgent: '*', allow: '/', disallow: '/admin' },
    sitemap: absolute('/sitemap.xml'),
  };
}
