'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/content';
import { useI18n } from '@/lib/i18n';
import { ProjectPreview } from './project-preview';

export function ProjectHoverList({ projects, onSelect }: { projects: Project[]; onSelect: (project: Project, trigger: HTMLElement) => void }) {
  const { t } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const capable = useRef(false);
  const frame = useRef(0);
  const point = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, tilt: 0, targetTilt: 0 });

  const stop = () => {
    cancelAnimationFrame(frame.current); frame.current = 0;
    setActive(null);
  };
  useEffect(() => {
    const media = matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const sync = () => { capable.current = media.matches; stop(); };
    sync();
    media.addEventListener('change', sync);
    window.addEventListener('scroll', stop, { passive: true });
    window.addEventListener('blur', stop);
    return () => { cancelAnimationFrame(frame.current); media.removeEventListener('change', sync); window.removeEventListener('scroll', stop); window.removeEventListener('blur', stop); };
  }, []);
  useEffect(stop, [projects]);

  const position = (event: PointerEvent<HTMLElement>, entering = false) => {
    if (!capable.current || event.pointerType === 'touch') return;
    const el = preview.current;
    if (!el) return;
    const p = point.current;
    const width = el.offsetWidth, height = el.offsetHeight;
    const x = Math.max(20, Math.min(innerWidth - width - 20, event.clientX - width * .35));
    const y = Math.max(20, Math.min(innerHeight - height - 20, event.clientY - height * .6));
    p.targetTilt = entering ? 0 : Math.max(-5, Math.min(5, (x - p.targetX) * .12));
    p.targetX = x; p.targetY = y;
    if (entering) { p.x = x; p.y = y; p.tilt = 0; el.style.transform = `translate3d(${x}px,${y}px,0)`; }
    if (frame.current) return;
    const tick = () => {
      p.x += (p.targetX - p.x) * .18; p.y += (p.targetY - p.y) * .18;
      p.tilt += (p.targetTilt - p.tilt) * .14; p.targetTilt *= .88;
      el.style.transform = `translate3d(${p.x}px,${p.y}px,0) rotate(${p.tilt}deg)`;
      if (Math.abs(p.targetX-p.x) + Math.abs(p.targetY-p.y) + Math.abs(p.tilt) > .1) frame.current = requestAnimationFrame(tick);
      else frame.current = 0;
    };
    frame.current = requestAnimationFrame(tick);
  };

  return <div className="work-list" ref={root} data-hovering={active ? 'true' : undefined} onPointerLeave={stop}>
    {projects.map((project, index) => <article className="work-row" key={project.id} data-active={active === project.id ? 'true' : undefined} onPointerEnter={event => {
      if (!capable.current || event.pointerType === 'touch') return;
      position(event, active === null); setActive(project.id);
    }} onPointerMove={position}>
      <button className="work-open" onClick={event => { stop(); onSelect(project, event.currentTarget); }} aria-label={`${t.projectDetails}: ${project.title}`}>
        <span className="work-index">{String(index + 1).padStart(2,'0')}</span>
        <span className="work-title">{project.title}</span>
        <span className="work-category">{project.category}</span>
        <ArrowUpRight className="work-arrow" size={25}/>
      </button>
      <div className="work-inline-preview"><ProjectPreview kind={project.kind} image={project.image} imageMobile={project.imageMobile} alt={t.coverOf(project.title)} placeholder={!project.image && !project.imageMobile}/></div>
      <div className="work-summary"><p>{project.description}</p><span>{project.tags.slice(0, 4).join(' / ')}</span></div>
    </article>)}
    <div className="work-float" ref={preview} aria-hidden="true" data-visible={active ? 'true' : undefined}>
      <div className="work-float-inner">{projects.map(project => <div key={project.id} className="work-float-slide" data-active={active === project.id ? 'true' : undefined}><ProjectPreview kind={project.kind} image={project.image || project.imageMobile} alt="" placeholder={!project.image && !project.imageMobile}/><span>{project.title}<ArrowUpRight size={16}/></span></div>)}</div>
    </div>
  </div>;
}
