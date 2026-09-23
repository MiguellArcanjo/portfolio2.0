import type { Metadata } from 'next';
import { Home } from '@/components/home';
import { getPublishedContent } from '@/lib/content-server';
import { locales, localeLabels, localePath, type Locale } from '@/lib/locales';
import '@/app/editorial.css';
import '@/app/portrait-intro.css';
import '@/app/experience.css';
import '@/app/mobile.css';

const descriptions: Record<Locale, { title: string; description: string }> = {
  pt: { title: 'Cyber / FullStack — Portfólio', description: 'Desenvolvimento full stack e cibersegurança. Interfaces, sistemas e segurança por design.' },
  en: { title: 'Cyber / FullStack — Portfolio', description: 'Full stack development and cybersecurity. Interfaces, systems and security by design.' },
  es: { title: 'Cyber / FullStack — Portafolio', description: 'Desarrollo full stack y ciberseguridad. Interfaces, sistemas y seguridad por diseño.' },
};

export function siteMetadata(locale: Locale): Metadata {
  return {
    ...descriptions[locale],
    alternates: {
      canonical: localePath(locale),
      languages: { ...Object.fromEntries(locales.map(code => [localeLabels[code].html, localePath(code)])), 'x-default': '/' },
    },
    openGraph: { ...descriptions[locale], locale: localeLabels[locale].og, type: 'website' },
  };
}

export async function SitePage({ locale }: { locale: Locale }) {
  const content = await getPublishedContent(locale);
  return <Home content={content} locale={locale}/>;
}
