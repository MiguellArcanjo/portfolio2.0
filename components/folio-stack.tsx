'use client';

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { SiteContent, StackArea, Tool } from '@/lib/content';
import type { ToolIcons } from '@/lib/tool-icons';
import { AreaIcon } from './area-icon';
import { RichText } from './rich-text';

// One card per area: a big faded logo of its first tool in the background, the area's label,
// the name (decoded from random glyphs when it enters the screen) and every tool as a chip.
export function FolioStack({ toolkit, icons, label }: { toolkit: SiteContent['toolkit']; icons: ToolIcons; label: string }) {
  const areas = toolkit.areas.filter(area => area.tools.length);
  if (!areas.length) return null;
  return <section id="stack" className="folio-section stk">
    <div className="folio-section-head"><div><p className="folio-role">01 / {label}</p><h2>{toolkit.title} {toolkit.accent && <span>{toolkit.accent}</span>}</h2></div>{toolkit.text && <div className="stk-intro"><RichText text={toolkit.text}/></div>}</div>
    <div className="stk-grid">
      {areas.map((area, index) => <AreaCard key={area.id} area={area} index={index} icons={icons}/>)}
    </div>
  </section>;
}

function AreaCard({ area, index, icons }: { area: StackArea; index: number; icons: ToolIcons }) {
  const lead = area.tools.find(tool => icons[tool.name]);
  const card = useRef<HTMLElement>(null);
  const name = useScramble(area.name, card);

  return <article ref={card} className="stk-card" style={{ '--area': area.color || 'var(--accent)', '--i': index } as CSSProperties}>
    {lead && <svg className="stk-ghost" viewBox="0 0 24 24" aria-hidden="true"><path d={icons[lead.name].path}/></svg>}
    <p className="stk-badge"><span className="stk-badge-icon"><AreaIcon name={area.icon} size={18} strokeWidth={1.75} aria-hidden="true"/></span>{area.label || area.name}</p>
    <h3 aria-label={area.name}><span aria-hidden="true">{name}</span></h3>
    <ul className="stk-chips">{area.tools.map((tool, at) => <Chip key={`${tool.name}-${at}`} tool={tool} icons={icons}/>)}</ul>
  </article>;
}

function Chip({ tool, icons }: { tool: Tool; icons: ToolIcons }) {
  const icon = icons[tool.name];
  return <li style={{ '--brand': icon?.color || 'var(--fg)' } as CSSProperties} title={tool.description || undefined}>
    <span className="stk-logo" aria-hidden="true">{icon ? <svg viewBox="0 0 24 24"><path d={icon.path}/></svg> : <b>{tool.mark || tool.name.slice(0, 2)}</b>}</span>
    {tool.name}
  </li>;
}

// Random glyphs resolve into the text, left to right, the first time the card enters the screen.
const GLYPHS = '!<>-_\\/[]{}=+*^?#01';
export function useScramble(text: string, target: RefObject<HTMLElement | null>) {
  const [value, setValue] = useState(text);
  useEffect(() => {
    const node = target.current;
    if (!node || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const began = performance.now(), duration = 900 + text.length * 40;
      frame = requestAnimationFrame(function step(now) {
        const progress = Math.min((now - began) / duration, 1), fixed = Math.floor(progress * text.length);
        setValue(text.split('').map((char, at) => at < fixed || char === ' ' ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join(''));
        if (progress < 1) frame = requestAnimationFrame(step);
      });
    }, { threshold: .4 });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [text, target]);
  return value;
}
