'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDown } from 'lucide-react';

import { RichText } from './rich-text';
import { DrawnName } from './drawn-name';
import { FolioAbout } from './folio-about';
import { FolioStack } from './folio-stack';
import { FolioExperience } from './folio-experience';
import { FolioContact, FolioFooter } from './folio-contact';
import { FolioHeader } from './folio-header';
import { ProjectAccordion } from './project-accordion';
import type { SiteContent } from '@/lib/content';
import type { ToolIcons } from '@/lib/tool-icons';
import { I18nProvider, useI18n, locales, localeLabels, localePath, type Locale } from '@/lib/i18n';
import { LOCALE_COOKIE } from '@/lib/locale-detect';
import { whatsappUrl } from '@/lib/whatsapp';

export function Home({ content, locale, toolIcons }: { content: SiteContent; locale: Locale; toolIcons: ToolIcons }) {
  return <I18nProvider locale={locale}><Site content={content} toolIcons={toolIcons}/></I18nProvider>;
}
// Keeps the reader on the same section when switching language.
function LanguageSwitch({ className = '', label }: { className?: string; label?: string }) {
  const { locale, t } = useI18n();
  return <nav className={`lang-switch ${className}`} aria-label={label ?? t.language}>
    {locales.map(code => <a key={code} href={localePath(code)} hrefLang={localeLabels[code].html} lang={localeLabels[code].html} aria-current={code === locale ? 'true' : undefined} title={localeLabels[code].name}
      onClick={event => {
        event.preventDefault();
        // An explicit choice overrides the country/browser detection done by proxy.ts on later visits.
        document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
        if (code !== locale) location.assign(localePath(code) + location.hash);
      }}>{localeLabels[code].short}</a>)}
  </nav>;
}

function Site({ content, toolIcons }: { content: SiteContent; toolIcons: ToolIcons }) {
  const { locale, t } = useI18n();
  const { profile, about, toolkit, experience } = content;
  const [filter, setFilter] = useState('');
  const [photoFailed, setPhotoFailed] = useState(false);
  const categories = [...new Set(content.projects.map(project => project.category).filter(Boolean))];
  const projects = useMemo(() => content.projects.filter(project => !filter || project.category === filter), [content.projects, filter]);
  useEffect(() => { document.documentElement.lang = localeLabels[locale].html; }, [locale]);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('section-arrived'); observer.unobserve(entry.target); }
    }), { threshold: .25 });
    document.querySelectorAll('.folio-section h2').forEach(title => observer.observe(title));
    return () => observer.disconnect();
  }, []);
  const navItems = [[t.nav.stack, 'stack'], [t.nav.projects, 'projetos'], [t.nav.about, 'sobre'], ...(experience.items.length ? [[t.nav.experience, 'experiencia']] : [])];
  return <div className="folio">
    <a className="skip-link" href="#main">{t.skip}</a>
    <FolioHeader profile={profile} nav={navItems as [string, string][]} contactLabel={t.contact} languages={<LanguageSwitch/>} mobileLanguages={<LanguageSwitch className="in-overlay"/>}/>
    <main id="main" className="folio-width">

      <section id="inicio" className="folio-hero">
        <div className="hero-heading"><p className="folio-role">{profile.role}</p><DrawnName name={profile.name}/></div>
        <div className="hero-bottom-grid">
          <div className="hero-description"><RichText text={content.hero.text}/><a className="hero-project-link" href="#projetos">{t.seeProjects}<ArrowDown size={22}/></a></div>
          <div className="folio-portrait">{profile.photo && !photoFailed ? <img src={profile.photo} alt={profile.photoAlt} style={{ objectPosition: profile.photoPosition }} onError={() => setPhotoFailed(true)} fetchPriority="high"/> : <span aria-hidden="true">{profile.initials}</span>}</div>
          <div className="hero-side"><span>{profile.status}</span><div>{profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={17}/></a>}{profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<ArrowUpRight size={17}/></a>}<a href={whatsappUrl(t.whatsappMessage)} target="_blank" rel="noopener noreferrer">WhatsApp<ArrowUpRight size={17}/></a></div></div>
        </div>
      </section>
      <FolioStack toolkit={toolkit} icons={toolIcons} label={t.nav.stack}/>
      <section id="projetos" className="folio-section folio-work">
        <div className="folio-section-head"><div><p className="folio-role">02 / {t.nav.projects}</p><h2>{content.projectsSection.title}<br/><span>{content.projectsSection.accent}</span></h2></div>{categories.length > 1 && <div className="folio-filters" aria-label={t.filterProjects}>{['', ...categories].map(category => <button key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category || t.all}<sup>{String(content.projects.filter(project => !category || project.category === category).length).padStart(2,'0')}</sup></button>)}</div>}</div>
        <ProjectAccordion projects={projects} locale={locale}/>
      </section>
      <FolioAbout about={about} label={t.nav.about}/>
      <FolioExperience experience={experience} label={t.nav.experience}/>
      <FolioContact content={content} label={t.contact}/>
    </main>
    <FolioFooter content={content} nav={[...navItems, [t.contact, 'contato']] as [string, string][]} languages={<LanguageSwitch className="in-footer" label={t.languageFooter}/>}/>

  </div>;
}
