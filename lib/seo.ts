import { cache } from 'react';
import type { Project, SiteContent } from './content';
import { getPublishedContent } from './content-server';
import { localeLabels, localePath, type Locale } from './locales';
import { projectPath } from './project-path';
import { siteUrl } from './site-url';

// One fetch per request even though metadata, the page and the share image all need the content.
export const publishedContent = cache(getPublishedContent);

// Search titles lead with the owner's name: it is what recruiters and contacts type.
const copy: Record<Locale, { role: string; portfolio: string; description: (name: string) => string }> = {
  pt: {
    role: 'Desenvolvedor Full Stack e Cibersegurança',
    portfolio: 'Portfólio',
    description: name => `${name}, desenvolvedor full stack com foco em cibersegurança e segurança web. Projetos, estudos de caso e as ferramentas que uso para construir, publicar e proteger aplicações.`,
  },
  en: {
    role: 'Full Stack Developer & Cybersecurity',
    portfolio: 'Portfolio',
    description: name => `${name}, full stack developer focused on cybersecurity and web security. Projects, case studies and the tools I use to build, ship and secure applications.`,
  },
  es: {
    role: 'Desarrollador Full Stack y Ciberseguridad',
    portfolio: 'Portafolio',
    description: name => `${name}, desarrollador full stack enfocado en ciberseguridad y seguridad web. Proyectos, estudios de caso y las herramientas que uso para construir, publicar y proteger aplicaciones.`,
  },
};

export const seoCopy = (locale: Locale) => copy[locale];
export const absolute = (path: string) => new URL(path, siteUrl).href;

// JSON-LD is written into a <script>; escaping "<" keeps content from closing the tag (XSS).
export const jsonLdHtml = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') });

function person(content: SiteContent, locale: Locale) {
  const { profile, toolkit } = content;
  return {
    '@type': 'Person',
    '@id': absolute('/#person'),
    name: profile.name,
    jobTitle: copy[locale].role,
    description: copy[locale].description(profile.name),
    url: absolute(localePath(locale)),
    ...(profile.photo ? { image: profile.photo } : {}),
    ...(profile.email ? { email: `mailto:${profile.email}` } : {}),
    sameAs: [profile.github, profile.linkedin].filter(Boolean),
    knowsAbout: [...new Set(toolkit.areas.flatMap(area => [area.name, ...area.tools.map(tool => tool.name)]))].filter(Boolean),
  };
}

// Home page: who the site is about, and the site itself in this language.
export function homeJsonLd(content: SiteContent, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person(content, locale),
      {
        '@type': 'WebSite',
        '@id': absolute(`${localePath(locale)}#website`),
        name: `${content.profile.name} — ${copy[locale].portfolio}`,
        url: absolute(localePath(locale)),
        inLanguage: localeLabels[locale].html,
        author: { '@id': absolute('/#person') },
      },
    ],
  };
}

// Project page: the project as a creative work by the owner.
export function projectJsonLd(content: SiteContent, project: Project, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: absolute(projectPath(locale, project.id)),
    inLanguage: localeLabels[locale].html,
    ...(project.image ? { image: absolute(project.image) } : {}),
    ...(project.year ? { dateCreated: project.year } : {}),
    ...(project.tags.length ? { keywords: project.tags.join(', ') } : {}),
    ...(project.live ? { sameAs: [project.live] } : {}),
    author: { '@type': 'Person', '@id': absolute('/#person'), name: content.profile.name, url: absolute(localePath(locale)) },
  };
}
