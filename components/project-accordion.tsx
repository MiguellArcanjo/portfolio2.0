'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/content';
import { projectPath } from '@/lib/project-path';
import type { Locale } from '@/lib/locales';
import { ProjectScene } from './project-scenes';

const words = {
  pt: { open: 'Ver projeto', inProgress: 'projeto' },
  en: { open: 'View project', inProgress: 'project' },
  es: { open: 'Ver proyecto', inProgress: 'proyecto' },
};

// Projects as an accordion: one row per project; the row under the pointer (or focus, or a tap) opens to show
// the summary on the left and an animated scene of the project on the right.
export function ProjectAccordion({ projects, locale }: { projects: Project[]; locale: Locale }) {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  // The animated scene mounts only after the row has finished opening, so the two never compete for frames.
  const [sceneReady, setSceneReady] = useState(true);
  const intent = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const w = words[locale];
  useEffect(() => { setActive(0); }, [projects]);
  useEffect(() => { setSceneReady(false); const timer = setTimeout(() => setSceneReady(true), 520); return () => clearTimeout(timer); }, [active]);
  useEffect(() => () => clearTimeout(intent.current), []);
  // Hover intent: sweeping the pointer across the list doesn't open every row it crosses.
  const openSoon = (index: number) => { clearTimeout(intent.current); intent.current = setTimeout(() => setActive(index), 140); };
  useEffect(() => { setHover(matchMedia('(hover: hover) and (pointer: fine)').matches); }, []);

  return <ol className="pj-list">
    {projects.map((project, index) => {
      const open = index === active;
      const href = projectPath(locale, project.id);
      return <li key={project.id} className="pj-item" data-open={open || undefined} style={{ '--i': index } as CSSProperties}
        onPointerEnter={event => { if (event.pointerType === 'mouse') openSoon(index); }} onPointerLeave={() => clearTimeout(intent.current)} onFocus={() => setActive(index)}>
        <Link className="pj-row" href={href} aria-expanded={open}
          // On touch screens the first tap opens the row; the second follows the link.
          onClick={event => { if (!open && !hover) { event.preventDefault(); setActive(index); } }}>
          <span className="pj-index">{String(index + 1).padStart(2, '0')}</span>
          <h3>{project.title}</h3>
          <span className="pj-thumb" aria-hidden="true">{project.image && <img src={project.image} alt="" loading="lazy"/>}</span>
          <span className="pj-category">{project.category}</span>
          <span className="pj-arrow" aria-hidden="true"><ArrowUpRight size={18}/></span>
        </Link>
        <div className="pj-body" inert={!open}>
          <div className="pj-body-inner">
            <div className="pj-copy">
              <p className="pj-type">{project.type}{project.status && <span>{project.status}</span>}</p>
              <p className="pj-description">{project.description}</p>
              {project.metrics.length > 0 && <dl className="pj-metrics">{project.metrics.slice(0, 3).map((metric, i) => <div key={i}><dt>{metric.value}</dt><dd>{metric.label}</dd></div>)}</dl>}
              {project.tags.length > 0 && <ul className="pj-tags">{project.tags.slice(0, 6).map(tag => <li key={tag}>{tag}</li>)}{project.tags.length > 6 && <li>+{project.tags.length - 6}</li>}</ul>}
              <Link className="pj-open" href={href}>{w.open}<ArrowUpRight size={16}/></Link>
            </div>
            <div className="pj-scene" aria-hidden="true">{open && sceneReady && <ProjectScene project={project}/>}</div>
          </div>
        </div>
      </li>;
    })}
  </ol>;
}
