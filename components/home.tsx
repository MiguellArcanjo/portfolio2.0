'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDown, Menu, X, Check, Copy } from 'lucide-react';
import Link from 'next/link';
import { ProjectCover } from './project-cover';
import { projectPath } from '@/lib/project-path';

import { RichText } from './rich-text';
import { DrawnName } from './drawn-name';
import { FolioAbout } from './folio-about';
import { FolioStack } from './folio-stack';
import { FolioExperience } from './folio-experience';
import type { SiteContent } from '@/lib/content';
import { I18nProvider, useI18n, locales, localeLabels, localePath, type Locale } from '@/lib/i18n';
import { LOCALE_COOKIE } from '@/lib/locale-detect';

export function Home({ content, locale }: { content: SiteContent; locale: Locale }) {
  return <I18nProvider locale={locale}><Site content={content}/></I18nProvider>;
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

function Site({ content }: { content: SiteContent }) {
  const { locale, t } = useI18n();
  const { profile, about, toolkit, experience } = content;
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
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
  // Covers open like a curtain the first time they enter the screen, then drift slightly against the scroll.
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const covers = Array.from(document.querySelectorAll<HTMLElement>('.work-cover'));
    const visible = new Set<HTMLElement>();
    let frame = 0;
    const update = () => {
      frame = 0;
      visible.forEach(cover => {
        const rect = cover.getBoundingClientRect();
        const center = (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight;
        cover.style.setProperty('--drift', `${Math.max(-1, Math.min(1, center)) * -3}%`);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const cover = entry.target as HTMLElement;
        if (entry.isIntersecting) { visible.add(cover); if (entry.intersectionRatio > .2) cover.setAttribute('data-shown', ''); }
        else visible.delete(cover);
      });
      schedule();
    }, { threshold: [0, .2] });
    covers.forEach(cover => { cover.setAttribute('data-motion', ''); observer.observe(cover); });
    addEventListener('scroll', schedule, { passive: true });
    return () => { cancelAnimationFrame(frame); observer.disconnect(); removeEventListener('scroll', schedule); };
  }, [projects]);
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  };
  const navItems = [[t.nav.projects, 'projetos'], [t.nav.about, 'sobre'], [t.nav.stack, 'stack'], ...(experience.items.length ? [[t.nav.experience, 'experiencia']] : [])];
  return <div className="folio">
    <a className="skip-link" href="#main">{t.skip}</a>
    <header className="folio-header folio-width">
      <a className="folio-brand" href="#inicio" aria-label={t.home}>{profile.initials}<span>.</span></a>
      <nav className={`folio-nav ${menu ? 'is-open' : ''}`} aria-label={t.mainNav}>{navItems.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>{label}</a>)}<a href="#contato" onClick={() => setMenu(false)}>{t.contact}</a></nav>
      <LanguageSwitch/>
      <button className="folio-menu" onClick={() => setMenu(!menu)} aria-label={menu ? t.closeMenu : t.openMenu} aria-expanded={menu}>{menu ? <X/> : <Menu/>}</button>
    </header>
    <main id="main" className="folio-width">

      <section id="inicio" className="folio-hero">
        <div className="hero-heading"><p className="folio-role">{profile.role}</p><DrawnName name={profile.name}/></div>
        <div className="hero-bottom-grid">
          <div className="hero-description"><RichText text={content.hero.text}/><a className="hero-project-link" href="#projetos">{t.seeProjects}<ArrowDown size={22}/></a></div>
          <div className="folio-portrait">{profile.photo && !photoFailed ? <img src={profile.photo} alt={profile.photoAlt} style={{ objectPosition: profile.photoPosition }} onError={() => setPhotoFailed(true)} fetchPriority="high"/> : <span aria-hidden="true">{profile.initials}</span>}</div>
          <div className="hero-side"><span>{profile.status}</span><div>{profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={17}/></a>}{profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<ArrowUpRight size={17}/></a>}</div></div>
        </div>
      </section>
      <section id="projetos" className="folio-section folio-work">
        <div className="folio-section-head"><div><p className="folio-role">01 / {t.nav.projects}</p><h2>{content.projectsSection.title}<br/><span>{content.projectsSection.accent}</span></h2></div>{categories.length > 1 && <div className="folio-filters" aria-label={t.filterProjects}>{['', ...categories].map(category => <button key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category || t.all}<sup>{String(content.projects.filter(project => !category || project.category === category).length).padStart(2,'0')}</sup></button>)}</div>}</div>
        <div className="work-gallery">{projects.map((project,index) => <Link className="work-item" key={project.id} href={projectPath(locale,project.id)}>
          {/* The "open" badge follows the pointer over the cover. */}
          <div className="work-cover" onPointerMove={event => { const rect = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`); event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`); }}><ProjectCover project={project}/><span className="work-open"><span>{t.openProject}</span><ArrowUpRight size={18}/></span></div>
          <div className="work-heading"><span className="work-index">{String(index+1).padStart(2,'0')}</span><h3>{project.title}</h3><span className="work-category">{project.category}</span><ArrowUpRight size={25}/></div>
          <p className="work-description">{project.description}</p>
          {project.tags.length > 0 && <ul className="work-tags">{project.tags.slice(0,5).map(tag => <li key={tag}>{tag}</li>)}{project.tags.length > 5 && <li>+{project.tags.length - 5}</li>}</ul>}
        </Link>)}</div>
      </section>
      <FolioAbout about={about} label={t.nav.about}/>
      <FolioStack toolkit={toolkit} label={t.nav.stack}/>
      <FolioExperience experience={experience} label={t.nav.experience}/>
      <section id="contato" className="folio-section folio-contact"><div><p className="folio-role">{t.contact}</p><h2>{content.contact.title}<br/><span>{content.contact.accent}</span></h2><RichText text={content.contact.text}/></div><div className="folio-contact-links">{profile.email ? <><a className="folio-email" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={22}/></a><button onClick={copyEmail}>{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? t.copied : t.copyEmail}</button><span role="status">{copyError ? t.copyFallback : ''}</span></> : <span>{t.emailPlaceholder}</span>}{profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={16}/></a>}{profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={16}/></a>}</div></section>
    </main>
    <footer className="folio-footer folio-width"><span>{profile.name}</span><a href="#inicio">{t.backToTop}<ArrowUpRight size={15}/></a></footer>

  </div>;
}
