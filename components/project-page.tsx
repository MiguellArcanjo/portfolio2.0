import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache, type CSSProperties } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import '@/app/folio.css';
import { getPublishedContent } from '@/lib/content-server';
import { localePath, locales, localeLabels, type Locale } from '@/lib/locales';
import { projectPath } from '@/lib/project-path';
import { ProjectCover } from './project-cover';
import { RichText } from './rich-text';

const contentFor = cache(getPublishedContent);
const labels = {
  pt: { back: 'Todos os projetos', about: 'Sobre o projeto', tech: 'Tecnologias', live: 'Abrir projeto', repo: 'Código no GitHub', next: 'Próximo projeto', contact: 'Contato', category: 'Categoria', type: 'Tipo', links: 'Links', none: 'Projeto privado' },
  en: { back: 'All projects', about: 'About the project', tech: 'Technologies', live: 'Open project', repo: 'Code on GitHub', next: 'Next project', contact: 'Contact', category: 'Category', type: 'Type', links: 'Links', none: 'Private project' },
  es: { back: 'Todos los proyectos', about: 'Sobre el proyecto', tech: 'Tecnologías', live: 'Abrir proyecto', repo: 'Código en GitHub', next: 'Siguiente proyecto', contact: 'Contacto', category: 'Categoría', type: 'Tipo', links: 'Enlaces', none: 'Proyecto privado' },
};
export async function projectMetadata(locale: Locale, id: string): Promise<Metadata> {
  const content = await contentFor(locale);
  const project = content.projects.find(item => item.id === id);
  if (!project) return { title: '404' };
  return { title: project.title + ' — ' + content.profile.name, description: project.description,
    alternates: { canonical: projectPath(locale,id), languages: Object.fromEntries(locales.map(code => [localeLabels[code].html,projectPath(code,id)])) },
    openGraph: { title: project.title, description: project.description, ...(project.image ? { images: [project.image] } : {}) } };
}
export async function ProjectPage({ locale, id }: { locale: Locale; id: string }) {
  const content = await contentFor(locale);
  const index = content.projects.findIndex(item => item.id === id);
  if (index < 0) notFound();
  const project = content.projects[index], next = content.projects[(index+1)%content.projects.length], t = labels[locale];
  return <div className="folio" lang={localeLabels[locale].html}>
    <header className="folio-header folio-width"><Link className="folio-brand" href={localePath(locale)}>{content.profile.initials}<span>.</span></Link><Link className="folio-inline" style={{marginLeft:'auto'}} href={localePath(locale)+'#contato'}>{t.contact}<ArrowUpRight size={15}/></Link><nav className="lang-switch" aria-label="Language">{locales.map(code => <Link key={code} href={projectPath(code,id)} hrefLang={localeLabels[code].html} aria-current={code===locale ? 'true' : undefined}>{localeLabels[code].short}</Link>)}</nav></header>
    {/* Reading progress, driven by the page scroll where the browser supports scroll timelines. */}
    <div className="case-progress" aria-hidden="true"/>
    <main className="folio-width">
      <Link className="case-back" href={localePath(locale)+'#projetos'}><ArrowLeft size={16}/>{t.back}</Link>
      <section className="case-heading">
        <p className="folio-role">{String(index + 1).padStart(2, '0')} / {String(content.projects.length).padStart(2, '0')}</p>
        <h1 aria-label={project.title}>{[...project.title].map((char, i) => char === ' ' ? ' ' : <span key={i} aria-hidden="true" style={{ '--i': i } as CSSProperties}>{char}</span>)}</h1>
        <div className="case-intro">
          <dl className="case-meta">
            {project.category && <div><dt>{t.category}</dt><dd>{project.category}</dd></div>}
            {project.type && <div><dt>{t.type}</dt><dd>{project.type}</dd></div>}
            {project.tags.length > 0 && <div><dt>{t.tech}</dt><dd>{project.tags.slice(0, 3).join(', ')}{project.tags.length > 3 && ` +${project.tags.length - 3}`}</dd></div>}
            <div><dt>{t.links}</dt><dd className="case-actions">{project.live && <a href={project.live} target="_blank" rel="noopener noreferrer">{t.live}<ArrowUpRight size={17}/></a>}{project.github && <a href={project.github} target="_blank" rel="noopener noreferrer">{t.repo}<ArrowUpRight size={17}/></a>}{!project.live && !project.github && <span>{t.none}</span>}</dd></div>
          </dl>
          <RichText text={project.description}/>
        </div>
      </section>
      <div className="case-image"><ProjectCover project={project} eager/></div>
      <section className="case-body">
        <aside><h2>{t.tech}</h2><ul>{project.tags.map((tag, i) => <li key={tag} style={{ '--i': i } as CSSProperties}>{tag}</li>)}</ul></aside>
        <article className="case-story"><h2>{t.about}</h2><RichText text={project.detail || project.description}/></article>
      </section>
      <section className="case-next">
        <p className="folio-role">{content.projects.length>1 ? t.next : t.back}</p>
        <Link href={content.projects.length>1 ? projectPath(locale,next.id) : localePath(locale)+'#projetos'}>
          <span className="case-next-title">{content.projects.length>1 ? next.title : t.back}</span>
          {content.projects.length>1 && <span className="case-next-cover" aria-hidden="true"><ProjectCover project={next}/></span>}
          <ArrowUpRight/>
        </Link>
      </section>
    </main><footer className="folio-footer folio-width"><span>{content.profile.name}</span><Link href={localePath(locale)}>{t.back}<ArrowUpRight size={15}/></Link></footer>
  </div>;
}
