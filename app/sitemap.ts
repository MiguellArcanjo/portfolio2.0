import type { MetadataRoute } from 'next';
import { locales, localeLabels, localePath } from '@/lib/locales';
import { projectPath } from '@/lib/project-path';
import { absolute, publishedContent } from '@/lib/seo';

// Rebuilt with the pages, so projects added in /admin show up after the next revalidation.
export const revalidate = 3600;

// Every page in every language, each one listing its translations (hreflang) for search engines.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const contents = await Promise.all(locales.map(locale => publishedContent(locale)));
  const languages = (path: (locale: (typeof locales)[number]) => string) =>
    Object.fromEntries(locales.map(code => [localeLabels[code].html, absolute(path(code))]));

  const homes = locales.map((locale, index) => ({
    url: absolute(localePath(locale)),
    lastModified: contents[index].updatedAt ?? undefined,
    changeFrequency: 'monthly' as const,
    priority: locale === 'pt' ? 1 : .9,
    alternates: { languages: languages(localePath) },
    ...(contents[index].profile.photo ? { images: [contents[index].profile.photo] } : {}),
  }));

  const projects = locales.flatMap((locale, index) => contents[index].projects.map(project => ({
    url: absolute(projectPath(locale, project.id)),
    lastModified: contents[index].updatedAt ?? undefined,
    changeFrequency: 'monthly' as const,
    priority: .7,
    alternates: { languages: languages(code => projectPath(code, project.id)) },
    ...(project.image ? { images: [project.image] } : {}),
  })));

  return [...homes, ...projects];
}
