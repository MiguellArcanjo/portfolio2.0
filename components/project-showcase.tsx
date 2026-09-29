'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import type { Project, SiteContent } from '@/lib/content';
import { ProjectPreview } from './project-preview';
import { RichText } from './rich-text';
import { boxContentHeight, watchBoxes } from '@/lib/fit';
import { useI18n } from '@/lib/i18n';

// Scroll positions (px from the moment the chapter pins) of each stage. Long implementation notes add
// their own overflow to the chapter height, so they are read at close to the page's scroll speed instead of
// racing through a fixed window, and the stages after them shift down by the same amount.
function chapterGeometry(chapter: HTMLElement, animate: boolean) {
  const pin = chapter.querySelector<HTMLElement>('.chapter-pin')!;
  const phases = chapter.querySelector<HTMLElement>('.chapter-phases');
  const notes = phases?.querySelector<HTMLElement>('.phase-description');
  const overflow = animate && phases?.dataset.fit === 'scroll' && notes
    ? Math.round(Math.max(0, notes.offsetTop + notes.offsetHeight - phases.clientHeight)) : 0;
  const total = Math.max(1, chapter.offsetHeight - pin.offsetHeight);
  const applied = Number(chapter.dataset.readingExtra || 0);
  const base = Math.max(1, total - applied);
  const readStart = base * .34, readLength = overflow + base * .21;
  return { phases, notes, overflow, applied, total, readStart, readLength, stage1: base * .3, stage2: readStart + readLength + base * .1, base };
}

export function ProjectShowcase({ projects, heading, onSelect }: { projects: Project[]; heading: SiteContent['projectsSection']; onSelect: (project: Project) => void }) {
  const { t } = useI18n();
  const ALL = '__all__';
  const [filter, setFilter] = useState(ALL);
  const root = useRef<HTMLElement>(null);
  const categories = [ALL, ...new Set(projects.map(project => project.category).filter(Boolean))];
  const visible = projects.filter(project => filter === ALL || project.category === filter);
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
        const geometry = chapterGeometry(chapter, animate);
        if (geometry.overflow !== geometry.applied) {
          chapter.dataset.readingExtra = String(geometry.overflow);
          chapter.style.setProperty('--reading-extra', `${geometry.overflow}px`);
          schedule();
        }
        const scrolled = Math.max(0, Math.min(geometry.total, 30 - rect.top));
        const progress = scrolled / geometry.total;
        const stage = scrolled < geometry.stage1 ? 0 : scrolled < geometry.stage2 ? 1 : 2;
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
        // Implementation notes too long for the pinned box are read by scrolling the page itself.
        // The text keeps its last position while it fades out, so leaving the stage never jumps it back up.
        const { phases, notes, overflow } = geometry;
        if (phases && notes) {
          const t = Math.max(0, Math.min(1, (scrolled - geometry.readStart) / geometry.readLength));
          const offset = stage === 0 ? 0 : t * overflow;
          notes.style.translate = offset ? `0 ${-offset}px` : '';
          const reading = stage === 1 && overflow > 0;
          phases.toggleAttribute('data-end', !reading || t > .98);
          phases.toggleAttribute('data-scrolled', reading && offset > 2);
        }
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

  // Long implementation notes must fit the pinned screen, so the progress bar and "next" link stay visible.
  useEffect(() => watchBoxes(Array.from(root.current?.querySelectorAll<HTMLElement>('.chapter-phases') ?? [])), [filter, projects]);

  const goToStage = (id: string, stage: number) => {
    const chapter = document.getElementById(`projeto-${id}`);
    if (!chapter) return;
    const geometry = chapterGeometry(chapter, chapter.dataset.animated === 'true');
    // "Implementação" lands on the first line of the notes, not in the middle of the reading.
    const target = [0, geometry.readStart + 1, geometry.stage2 + geometry.base * .14][stage];
    window.scrollTo({ top: scrollY + chapter.getBoundingClientRect().top - 30 + target, behavior: 'smooth' });
  };

  return <section id="projetos" className="projects-story" ref={root}>
    <div className="container section-heading story-heading">
      <div><div className="section-label"><span>02 /</span> {t.labels.projects}</div><h2>{heading.title} <span>{heading.accent}</span></h2></div>
      <div className="filters" role="group" aria-label={t.filterProjects}>
        {categories.map(value => <button key={value} aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value === ALL ? t.all : value}{value === ALL && <span>{String(projects.length).padStart(2, '0')}</span>}</button>)}
      </div>
    </div>
    <div className="project-chapters">
      {visible.map((project, index) => <article id={`projeto-${project.id}`} key={project.id} className={`project-chapter ${index % 2 ? 'chapter-reverse' : ''}`} aria-labelledby={`title-${project.id}`}>
        <div className="chapter-pin container">
          <div className="chapter-meta"><span>{t.project.toUpperCase()} / {number(index + 1)}</span><span>{number(index + 1)} <i>/ {number(visible.length)}</i></span></div>
          <div className="chapter-layout">
            <div className="chapter-visual" onClick={() => onSelect(project)} title={t.openProject}><ProjectPreview kind={project.kind} image={project.image} imageMobile={project.imageMobile} alt={t.coverOf(project.title)} placeholder={project.description.startsWith('[')}/></div>
            <div className="chapter-copy">
              <span className="chapter-category">{project.category}</span>
              <h3 id={`title-${project.id}`}>{project.title}<span>.</span></h3>
              <div className="chapter-steps" role="group" aria-label={t.projectStages(project.title)}>
                {t.stages.map((label, step) => <button key={label} onClick={() => goToStage(project.id, step)}><span>0{step + 1}</span>{label}</button>)}
              </div>
              <div className="chapter-phases">
                {/* Everything is read while scrolling: no extra click to reach the details. */}
                <div className="chapter-phase phase-intro"><span className="phase-kicker">{t.stages[0]}</span><RichText className="chapter-description" text={project.description}/><span className="phase-scroll"><ArrowDown size={16}/> {t.scrollDetails}</span></div>
                <div className="chapter-phase phase-description"><span className="phase-kicker">{t.stages[1]}</span><RichText className="chapter-description" text={project.detail || project.description}/></div>
                <div className="chapter-phase phase-technologies"><span className="phase-kicker">{t.stages[2]}</span><div className="chapter-stack"><div className="tags">{project.tags.map((tag, tagIndex) => <span key={tag} style={{ animationDelay: `${tagIndex * 100}ms` }}>{tag}</span>)}</div></div>
                  {(project.live || project.github) && <div className="chapter-links">
                    {project.live && <a className="chapter-link primary" href={project.live} target="_blank" rel="noopener noreferrer">{t.liveProject} <ArrowUpRight size={16}/></a>}
                    {project.github && <a className="chapter-link" href={project.github} target="_blank" rel="noopener noreferrer">{t.repository} <ArrowUpRight size={16}/></a>}
                  </div>}
                </div>
              </div>
            </div>
          </div>
          <div className="chapter-bottom">{index < visible.length - 1 ? <a href={`#projeto-${visible[index + 1].id}`}>{t.next}: {visible[index + 1].title} <ArrowDown size={15}/></a> : <a href="#stack">{t.stackLink} <ArrowDown size={15}/></a>}</div>
          <div className="chapter-progress" aria-hidden="true"><span/></div>
        </div>
      </article>)}
    </div>
  </section>;
}
