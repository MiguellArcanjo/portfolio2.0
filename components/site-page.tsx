import type { Metadata } from 'next';
import '@/app/folio.css';
import { Home } from '@/components/home';
import { resolveToolIcons } from '@/lib/tool-icons';
import { locales, localeLabels, localePath, type Locale } from '@/lib/locales';
import { homeJsonLd, jsonLdHtml, publishedContent, seoCopy } from '@/lib/seo';

export async function siteMetadata(locale: Locale): Promise<Metadata> {
  const { profile } = await publishedContent(locale);
  const { role, description } = seoCopy(locale);
  const text = { title: `${profile.name} — ${role}`, description: description(profile.name) };
  return {
    ...text,
    alternates: {
      canonical: localePath(locale),
      languages: { ...Object.fromEntries(locales.map(code => [localeLabels[code].html, localePath(code)])), 'x-default': '/' },
    },
    openGraph: { ...text, url: localePath(locale), siteName: profile.name, locale: localeLabels[locale].og, alternateLocale: locales.filter(code => code !== locale).map(code => localeLabels[code].og), type: 'profile' },
  };
}

export async function SitePage({ locale }: { locale: Locale }) {
  const content = await publishedContent(locale);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(homeJsonLd(content, locale))}/>
    <Home content={content} locale={locale} toolIcons={resolveToolIcons(content.toolkit)}/>
  </>;
}
