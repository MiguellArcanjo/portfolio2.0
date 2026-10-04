import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment, type CSSProperties } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import '@/app/folio.css';
import { jsonLdHtml, projectJsonLd, publishedContent } from '@/lib/seo';
import { localePath, locales, localeLabels, type Locale } from '@/lib/locales';
import { projectPath } from '@/lib/project-path';
import { ProjectCover } from './project-cover';
import { RichText } from './rich-text';
import { ProjectGallery } from './project-gallery';

// A labelled block of the case study: the label sits on the left, the content on the right.
function CaseSection({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <section className={`case-section ${className}`}><p className="case-label">/{label}</p><div className="case-content">{children}</div></section>;
}

const contentFor = publishedContent;
const labels = {
  pt: { back: 'Todos os projetos', about: 'Sobre o projeto', tech: 'Tecnologias', live: 'Ver projeto', repo: 'Código no GitHub', next: 'Próximo projeto', contact: 'Contato', category: 'Categoria', type: 'Tipo', links: 'Links', none: 'Projeto privado', role: 'Papel', status: 'Status', year: 'Ano', problem: 'O problema', discovery: 'Descoberta', learnings: 'O que isso me ensinou', solution: 'A solução', decisions: 'Decisões', gallery: 'Galeria', close: 'Fechar', previous: 'Foto anterior', nextPhoto: 'Próxima foto', openPhoto: 'Ampliar foto' },
  en: { back: 'All projects', about: 'About the project', tech: 'Technologies', live: 'View project', repo: 'Code on GitHub', next: 'Next project', contact: 'Contact', category: 'Category', type: 'Type', links: 'Links', none: 'Private project', role: 'Role', status: 'Status', year: 'Year', problem: 'The problem', discovery: 'Discovery', learnings: 'What it taught me', solution: 'The solution', decisions: 'Decisions', gallery: 'Gallery', close: 'Close', previous: 'Previous photo', nextPhoto: 'Next photo', openPhoto: 'Enlarge photo' },
  es: { back: 'Todos los proyectos', about: 'Sobre el proyecto', tech: 'Tecnologías', live: 'Ver proyecto', repo: 'Código en GitHub', next: 'Siguiente proyecto', contact: 'Contacto', category: 'Categoría', type: 'Tipo', links: 'Enlaces', none: 'Proyecto privado', role: 'Rol', status: 'Estado', year: 'Año', problem: 'El problema', discovery: 'Descubrimiento', learnings: 'Lo que me enseñó', solution: 'La solución', decisions: 'Decisiones', gallery: 'Galería', close: 'Cerrar', previous: 'Foto anterior', nextPhoto: 'Foto siguiente', openPhoto: 'Ampliar foto' },
};
export async function projectMetadata(locale: Locale, id: string): Promise<Metadata> {
  const content = await contentFor(locale);
  const project = content.projects.find(item => item.id === id);
  if (!project) return { title: '404' };
  const title = project.title + ' — ' + content.profile.name;
  // The share image comes from the opengraph-image file next to each project route.
  return { title, description: project.description,
    alternates: { canonical: projectPath(locale,id), languages: { ...Object.fromEntries(locales.map(code => [localeLabels[code].html,projectPath(code,id)])), 'x-default': projectPath('pt', id) } },
    openGraph: { title, description: project.description, url: projectPath(locale, id), siteName: content.profile.name, locale: localeLabels[locale].og, type: 'article' } };
}
export async function ProjectPage({ locale, id }: { locale: Locale; id: string }) {
  const content = await contentFor(locale);
  const index = content.projects.findIndex(item => item.id === id);
  if (index < 0) notFound();
  const project = content.projects[index], next = content.projects[(index+1)%content.projects.length], t = labels[locale];
  const problems = project.problem.split('\n').map(line => line.trim()).filter(Boolean);
  const learnings = project.learnings.map(line => line.trim()).filter(Boolean);
  const gallery = project.gallery.filter(photo => photo.url);
  const hasCase = Boolean(problems.length || project.discovery || project.solution || project.decisions.length);
  return <div className="folio" lang={localeLabels[locale].html}>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(projectJsonLd(content, project, locale))}/>
    <header className="folio-header folio-width"><Link className="folio-brand" href={localePath(locale)}>{content.profile.initials}<span>.</span></Link><Link className="folio-inline" style={{marginLeft:'auto'}} href={localePath(locale)+'#contato'}>{t.contact}<ArrowUpRight size={15}/></Link><nav className="lang-switch" aria-label="Language">{locales.map(code => <Link key={code} href={projectPath(code,id)} hrefLang={localeLabels[code].html} aria-current={code===locale ? 'true' : undefined}>{localeLabels[code].short}</Link>)}</nav></header>
    {/* Reading progress, driven by the page scroll where the browser supports scroll timelines. */}
    <div className="case-progress" aria-hidden="true"/>
    <main className="folio-width">
      <Link className="case-back" href={localePath(locale)+'#projetos'}><ArrowLeft size={16}/>{t.back}</Link>
      <section className="case-heading">
        <p className="folio-role">{String(index + 1).padStart(2, '0')} / {String(content.projects.length).padStart(2, '0')} · {project.category}</p>
        {/* Letters animate one by one; each word stays whole so long titles only break between words. */}
        <h1 aria-label={project.title} data-long={project.title.length > 22 || undefined}>{project.title.split(' ').map((word, w, words) => { const start = words.slice(0, w).join(' ').length + (w ? 1 : 0); return <Fragment key={w}>{w > 0 && ' '}<span className="case-word" aria-hidden="true">{[...word].map((char, i) => <span key={i} style={{ '--i': start + i } as CSSProperties}>{char}</span>)}</span></Fragment>; })}</h1>
        <div className="case-lede">
          <p className="case-summary">{project.description}</p>
          <dl className="case-facts">
            {project.role && <div><dt>{t.role}</dt><dd>{project.role}</dd></div>}
            {project.status && <div><dt>{t.status}</dt><dd>{project.status}</dd></div>}
            {project.type && <div><dt>{t.type}</dt><dd>{project.type}</dd></div>}
            {project.year && <div><dt>{t.year}</dt><dd>{project.year}</dd></div>}
          </dl>
          <div className="case-buttons">
            {project.live && <a className="case-button is-primary" href={project.live} target="_blank" rel="noopener noreferrer">{t.live}<span><ArrowUpRight size={15}/></span></a>}
            {project.github && <a className="case-button" href={project.github} target="_blank" rel="noopener noreferrer">{t.repo}<span><ArrowUpRight size={15}/></span></a>}
            {!project.live && !project.github && <span className="case-private">{t.none}</span>}
          </div>
        </div>
      </section>
      <div className="case-image"><ProjectCover project={project} eager/></div>
      {project.metrics.length > 0 && <dl className="case-metrics">{project.metrics.map((metric, i) => <div key={i}><dt>{metric.value}</dt><dd>{metric.label}</dd></div>)}</dl>}
      {problems.length > 0 && <CaseSection label={t.problem}><ul className="case-problems">{problems.map((line, i) => <li key={i}>{line}</li>)}</ul></CaseSection>}
      {(project.discovery || learnings.length > 0) && <CaseSection label={t.discovery}>
        {project.discovery && <RichText className="case-text" text={project.discovery}/>}
        {learnings.length > 0 && <div className="case-learnings"><p className="case-mini">{t.learnings}</p><ol>{learnings.map((item, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span>{item}</li>)}</ol></div>}
      </CaseSection>}
      {project.solution && <CaseSection label={t.solution} className="is-solution"><p className="case-statement">{project.solution}</p></CaseSection>}
      {project.decisions.length > 0 && <CaseSection label={t.decisions}><ol className="case-decisions">{project.decisions.map((decision, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span><h3>{decision.title}</h3><p>{decision.text}</p></li>)}</ol></CaseSection>}
      {gallery.length > 0 && <CaseSection label={t.gallery} className="is-gallery"><ProjectGallery photos={gallery} labels={{ close: t.close, previous: t.previous, next: t.nextPhoto, open: t.openPhoto }}/></CaseSection>}
      {/* Projects without the case study fields keep their original free text. */}
      {!hasCase && (project.detail || project.description) && <CaseSection label={t.about}><RichText className="case-text" text={project.detail || project.description}/></CaseSection>}
      {project.tags.length > 0 && <CaseSection label={t.tech}><ul className="case-tags">{project.tags.map((tag, i) => <li key={tag} style={{ '--i': i } as CSSProperties}>{tag}</li>)}</ul></CaseSection>}
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
