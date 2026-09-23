'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import type { Project, SiteContent } from '@/lib/content';
import { ProjectPreview } from './project-preview';

export function ProjectShowcase({ projects, heading, onSelect }: { projects: Project[]; heading: SiteContent['projectsSection']; onSelect: (project: Project) => void }) {
  const [filter, setFilter] = useState('Todos');
  const root = useRef<HTMLElement>(null);
  const categories = ['Todos', ...new Set(projects.map(project => project.category).filter(Boolean))];
  const visible = projects.filter(project => filter === 'Todos' || project.category === filter);
  const number = (value: number) => String(value).padStart(2, '0');

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const chapters = Array.from(section.querySelectorAll<HTMLElement>('.project-chapter'));
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(min-width: 901px) and (min-height: 700px)');
    let frame = 0, visible = true;
    const update = () => {
      frame = 0;
      const vh = innerHeight;
      chapters.forEach((chapter, index) => {
        const rect = chapter.getBoundingClientRect();
        const animate = desktop.matches && !motion.matches;
        const entry = Math.max(0, Math.min(1, (vh - rect.top) / (vh * .7)));
        const pin = chapter.querySelector<HTMLElement>('.chapter-pin')!;
        const progress = Math.max(0, Math.min(1, (30 - rect.top) / Math.max(1, rect.height - pin.offsetHeight)));
        const stage = progress < .3 ? 0 : progress < .65 ? 1 : 2;
        chapter.dataset.stage = String(stage);
        chapter.dataset.animated = String(animate);
        chapter.querySelectorAll<HTMLElement>('.chapter-phase').forEach((phase, phaseIndex) => {
          const hidden = animate && phaseIndex !== stage;
          phase.inert = hidden;
          phase.setAttribute('aria-hidden', String(hidden));
        });
        chapter.querySelectorAll<HTMLButtonElement>('.chapter-steps button').forEach((button, buttonIndex) => {
          button.setAttribute('aria-current', buttonIndex === stage ? 'step' : 'false');
        });
        chapter.style.setProperty('--chapter-shift', `${animate ? (1 - entry) * 85 * (index % 2 ? -1 : 1) : 0}px`);
        chapter.style.setProperty('--chapter-opacity', `${animate ? .2 + entry * .8 : 1}`);
        chapter.style.setProperty('--chapter-scale', `${animate ? .94 + entry * .06 : 1}`);
        chapter.style.setProperty('--chapter-progress', `${progress * 100}%`);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const onScroll = () => { if (visible) schedule(); };
    const inView = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { rootMargin: '10% 0px' });
    inView.observe(section);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    const observer = new ResizeObserver(schedule); observer.observe(section);
    update();
    return () => {
      cancelAnimationFrame(frame); inView.disconnect(); window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', schedule); motion.removeEventListener('change', schedule); observer.disconnect();
    };
  }, [filter, projects]);

  const goToStage = (id: string, stage: number) => {
    const chapter = document.getElementById(`projeto-${id}`);
    const pin = chapter?.querySelector<HTMLElement>('.chapter-pin');
    if (!chapter || !pin) return;
    const fraction = [0, .43, .79][stage];
    window.scrollTo({ top: scrollY + chapter.getBoundingClientRect().top - 30 + (chapter.offsetHeight - pin.offsetHeight) * fraction, behavior: 'smooth' });
  };

  return <section id="projetos" className="projects-story" ref={root}>
    <div className="container section-heading story-heading">
      <div><div className="section-label"><span>02 /</span> PROJETOS</div><h2>{heading.title} <span>{heading.accent}</span></h2></div>
      <div className="filters" aria-label="Filtrar projetos">
        {categories.map(value => <button key={value} aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value}{value === 'Todos' && <span>{String(projects.length).padStart(2, '0')}</span>}</button>)}
      </div>
    </div>
    <div className="project-chapters">
      {visible.map((project, index) => <article id={`projeto-${project.id}`} key={project.id} className={`project-chapter ${index % 2 ? 'chapter-reverse' : ''}`} aria-labelledby={`title-${project.id}`}>
        <div className="chapter-pin container">
          <div className="chapter-meta"><span>PROJETO / {number(index + 1)}</span><span>{number(index + 1)} <i>/ {number(visible.length)}</i></span></div>
          <div className="chapter-layout">
            <div className="chapter-visual"><ProjectPreview kind={project.kind} image={project.image} alt={`Capa do projeto ${project.title}`} placeholder={project.description.startsWith('[')}/></div>
            <div className="chapter-copy">
              <span className="chapter-category">{project.category}</span>
              <h3 id={`title-${project.id}`}>{project.title}<span>.</span></h3>
              <div className="chapter-steps" aria-label={`Etapas de ${project.title}`}>
                {['Projeto', 'Implementação', 'Stack'].map((label, step) => <button key={label} onClick={() => goToStage(project.id, step)}><span>0{step + 1}</span>{label}</button>)}
              </div>
              <div className="chapter-phases">
                <div className="chapter-phase phase-intro"><span className="phase-scroll"><ArrowDown size={16}/> Detalhes ao rolar</span></div>
                <div className="chapter-phase phase-description"><p className="chapter-description">{project.description}</p></div>
                <div className="chapter-phase phase-technologies"><div className="chapter-stack"><div className="tags">{project.tags.map((tag, tagIndex) => <span key={tag} style={{ animationDelay: `${tagIndex * 100}ms` }}>{tag}</span>)}</div></div>
                  <button className="chapter-action" onClick={() => onSelect(project)}>Detalhes do projeto <ArrowUpRight size={20}/></button>
                  {project.github && <a className="text-link" href={project.github} target="_blank" rel="noopener noreferrer">Repositório <ArrowUpRight size={16}/></a>}
                  {project.live && <a className="text-link" href={project.live} target="_blank" rel="noopener noreferrer">Ver projeto online <ArrowUpRight size={16}/></a>}
                </div>
              </div>
            </div>
          </div>
          <div className="chapter-bottom">{index < visible.length - 1 ? <a href={`#projeto-${visible[index + 1].id}`}>Próximo: {visible[index + 1].title} <ArrowDown size={15}/></a> : <a href="#stack">Stack de trabalho <ArrowDown size={15}/></a>}</div>
          <div className="chapter-progress" aria-hidden="true"><span/></div>
        </div>
      </article>)}
    </div>
  </section>;
}
