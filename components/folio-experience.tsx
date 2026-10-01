'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { SiteContent } from '@/lib/content';
import { useI18n } from '@/lib/i18n';
import { RichText } from './rich-text';

const words = {
  pt: { roles: 'experiências', since: 'desde' },
  en: { roles: 'experiences', since: 'since' },
  es: { roles: 'experiencias', since: 'desde' },
};

// A timeline: the line on the left fills with the scroll and each stop lights up when the reader reaches it.
export function FolioExperience({ experience, label }: { experience: SiteContent['experience']; label: string }) {
  const { locale, t } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const years = experience.items.flatMap(item => item.period.match(/\b(19|20)\d{2}\b/g) ?? []).map(Number);
  const first = years.length ? Math.min(...years) : null;

  useEffect(() => {
    const list = root.current;
    if (!list) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>('.xp-item'));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { items.forEach(item => item.setAttribute('data-lit', '')); return; }
    list.setAttribute('data-motion', '');
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = list.getBoundingClientRect(), mark = innerHeight * .62;
      list.style.setProperty('--progress', String(Math.max(0, Math.min(1, (mark - rect.top) / Math.max(1, rect.height)))));
      // Content arrives a bit before the line reaches its stop.
      items.forEach(item => {
        const top = item.getBoundingClientRect().top;
        if (top < innerHeight * .88) item.setAttribute('data-reached', '');
        item.toggleAttribute('data-lit', top < mark);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    update();
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); };
  }, [experience.items]);

  if (!experience.items.length) return null;
  return <section id="experiencia" className="folio-section folio-xp">
    <div className="folio-section-head xp-head">
      <div><p className="folio-role">04 / {label}</p><h2>{experience.title} <span>{experience.accent}</span></h2></div>
      <div className="xp-summary">
        <p><strong>{String(experience.items.length).padStart(2, '0')}</strong>{words[locale].roles}</p>
        {first && <p><strong>{first}</strong>{words[locale].since}</p>}
        {experience.text && <RichText text={experience.text}/>}
      </div>
    </div>
    <div className="xp-timeline" ref={root}>
      <span className="xp-line" aria-hidden="true"><i/></span>
      {experience.items.map((item, index) => <article key={item.id} className="xp-item" data-current={item.current || undefined} style={{ '--i': index } as CSSProperties}>
        <span className="xp-dot" aria-hidden="true"/>
        <div className="xp-when">
          <p className="xp-period">{item.period}</p>
          {item.current && <span className="xp-now">{t.current}</span>}
          {item.type && <span className="xp-type">{item.type}</span>}
        </div>
        <div className="xp-card">
          <h3>{item.role}</h3>
          <p className="xp-company">{item.company}{item.location && <span> · {item.location}</span>}</p>
          <RichText text={item.description}/>
          {item.highlights.filter(Boolean).length > 0 && <ul className="xp-highlights">{item.highlights.filter(Boolean).map((point, i) => <li key={i}>{point}</li>)}</ul>}
          {item.tags.length > 0 && <ul className="xp-tags">{item.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>}
          {item.link && <a className="folio-inline" href={item.link} target="_blank" rel="noopener noreferrer">{t.seeMore}<ArrowUpRight size={15}/></a>}
        </div>
      </article>)}
    </div>
  </section>;
}
