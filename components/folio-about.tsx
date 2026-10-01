'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import type { SiteContent } from '@/lib/content';
import { RichText } from './rich-text';

// The about text lights up word by word as it crosses the screen, like reading along with the scroll.
function ScrollWords({ text }: { text: string }) {
  const root = useRef<HTMLDivElement>(null);
  const paragraphs = text.split(/\n\s*\n/).map(block => block.split(/\s+/).filter(Boolean)).filter(words => words.length);

  useEffect(() => {
    const box = root.current;
    if (!box || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const words = Array.from(box.querySelectorAll<HTMLElement>('.lit-word'));
    box.setAttribute('data-reading', '');
    let frame = 0, lit = -1;
    const update = () => {
      frame = 0;
      const rect = box.getBoundingClientRect(), vh = innerHeight;
      // Starts when the text's top reaches 80% of the screen, ends when its bottom reaches 45%.
      const progress = Math.max(0, Math.min(1, (vh * .8 - rect.top) / Math.max(1, rect.height + vh * .35)));
      const count = Math.round(progress * words.length);
      if (count === lit) return;
      words.forEach((word, index) => word.toggleAttribute('data-lit', index < count));
      lit = count;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { addEventListener('scroll', schedule, { passive: true }); schedule(); }
      else removeEventListener('scroll', schedule);
    });
    observer.observe(box);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); removeEventListener('scroll', schedule); box.removeAttribute('data-reading'); };
  }, [text]);

  return <div className="about-lead" ref={root}>
    {paragraphs.map((words, p) => <p key={p}>{words.map((word, i) => <span key={i} className="lit-word">{word} </span>)}</p>)}
  </div>;
}

export function FolioAbout({ about, label }: { about: SiteContent['about']; label: string }) {
  // Lists keep the regular formatting; plain paragraphs get the scroll reading.
  const hasList = /^\s*[•\-–*]\s+/m.test(about.text);
  return <section id="sobre" className="folio-section folio-about">
    <div className="about-top">
      <div className="about-head">
        <p className="folio-role">02 / {label}</p>
        <h2>{about.title} <span>{about.accent}</span></h2>
      </div>
      <div className="about-body">
        {hasList ? <RichText text={about.text}/> : <ScrollWords text={about.text}/>}
        {about.traits.filter(Boolean).length > 0 && <ul className="folio-techs">{about.traits.filter(Boolean).map(trait => <li key={trait}>{trait}</li>)}</ul>}
      </div>
    </div>
    {about.principles.length > 0 && <div className="about-cards">
      {about.principles.map((item, index) => <article key={index} className="about-card" style={{ '--i': index } as CSSProperties}>
        <span className="about-card-index">{String(index + 1).padStart(2, '0')}</span>
        <h3>{item.title}</h3>
        <RichText text={item.text}/>
      </article>)}
    </div>}
  </section>;
}
