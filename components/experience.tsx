'use client';

import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { SiteContent } from '@/lib/content';
import { useI18n } from '@/lib/i18n';
import { watchFit } from '@/lib/fit';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const pad = (value: number) => String(value).padStart(2, '0');

export function Experience({ content }: { content: SiteContent['experience'] }) {
  const items = content.items;
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const timeline = useRef<HTMLDivElement>(null);
  const current = useRef(0);
  const pinned = useRef(false);

  useEffect(() => {
    const section = root.current, rail = track.current, strip = row.current, line = timeline.current;
    if (!section || !rail || !strip || !line) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(min-width: 901px) and (min-height: 700px)');
    const cards = Array.from(strip.children) as HTMLElement[];
    let frame = 0, previous = 0, shown = 0, visible = false;

    // Cards slide sideways as the section is scrolled; the one at the centre faces the viewer.
    const update = (time: number) => {
      frame = 0;
      const reduced = motion.matches;
      pinned.current = desktop.matches && !reduced;
      const rect = rail.getBoundingClientRect();
      const progress = pinned.current ? clamp(-rect.top / Math.max(1, rect.height - innerHeight)) : 0;
      const dt = previous ? Math.min((time - previous) / 1000, .05) : 1;
      previous = time;
      shown += (progress - shown) * (reduced ? 1 : 1 - Math.exp(-dt * 10));
      const moving = Math.abs(progress - shown) > .0005;

      if (pinned.current && cards.length) {
        const first = cards[0], last = cards[cards.length - 1];
        const span = last.offsetLeft - first.offsetLeft;
        const offset = -(first.offsetLeft + first.offsetWidth / 2 - innerWidth / 2) - shown * span;
        strip.style.transform = `translate3d(${offset}px,0,0)`;
        const step = cards.length > 1 ? span / (cards.length - 1) : 1;
        cards.forEach(card => {
          const distance = clamp((card.offsetLeft + card.offsetWidth / 2 + offset - innerWidth / 2) / step, -2, 2);
          card.style.setProperty('--d', distance.toFixed(3));
          card.style.setProperty('--ad', Math.abs(distance).toFixed(3));
        });
        line.style.setProperty('--fill', shown.toFixed(4));
        const index = Math.round(shown * (cards.length - 1));
        if (index !== current.current) { current.current = index; setActive(index); }
      } else {
        strip.style.removeProperty('transform');
        swipe();
      }
      if (moving && visible) schedule();
    };
    // Phones: the row is a native swipe carousel. The same --d/--ad variables drive the 3D turn,
    // the counter and the timeline, so the mobile layout keeps what the desktop scroll promises.
    const scroller = strip.parentElement as HTMLElement;
    const swipe = () => {
      if (pinned.current || !cards.length) return;
      const center = scroller.scrollLeft + scroller.clientWidth / 2;
      const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
      let nearest = 0, best = Infinity;
      cards.forEach((card, index) => {
        const distance = clamp((card.offsetLeft + card.offsetWidth / 2 - center) / step, -2, 2);
        card.style.setProperty('--d', distance.toFixed(3));
        card.style.setProperty('--ad', Math.abs(distance).toFixed(3));
        if (Math.abs(distance) < best) { best = Math.abs(distance); nearest = index; }
      });
      line.style.setProperty('--fill', clamp(scroller.scrollLeft / Math.max(1, scroller.scrollWidth - scroller.clientWidth)).toFixed(4));
      if (nearest !== current.current) { current.current = nearest; setActive(nearest); }
    };
    let swipeFrame = 0;
    const onSwipe = () => { if (!swipeFrame) swipeFrame = requestAnimationFrame(() => { swipeFrame = 0; swipe(); }); };
    scroller.addEventListener('scroll', onSwipe, { passive: true });
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; previous = 0; schedule(); }, { rootMargin: '20% 0px' });
    observer.observe(section);
    // Outside the pinned layout each card simply fades in when it reaches the viewport.
    // data-seen (not a class) because React rewrites className when the active card changes.
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) (entry.target as HTMLElement).dataset.seen = 'true'; }), { threshold: .2 });
    cards.forEach(card => reveal.observe(card));
    const onScroll = () => { if (visible) schedule(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule); desktop.addEventListener('change', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame); cancelAnimationFrame(swipeFrame); observer.disconnect(); reveal.disconnect();
      scroller.removeEventListener('scroll', onSwipe);
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule); desktop.removeEventListener('change', schedule);
    };
  }, [items.length]);

  // Long descriptions or many highlights must never be clipped by the card height.
  useEffect(() => watchFit(Array.from(row.current?.children ?? []) as HTMLElement[]), [content]);

  const go = (index: number) => {
    const rail = track.current;
    if (!pinned.current || !rail) {
      const card = document.getElementById(`xp-${items[index]?.id}`), scroller = row.current?.parentElement;
      if (card && scroller) scroller.scrollTo({ left: card.offsetLeft - (scroller.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
      return;
    }
    const rect = rail.getBoundingClientRect();
    window.scrollTo({ top: scrollY + rect.top + (rect.height - innerHeight) * (items.length > 1 ? index / (items.length - 1) : 0), behavior: 'smooth' });
  };

  const lines = (text: string) => text.split('\n').map((line, index) => <Fragment key={index}>{index > 0 && <br/>}{line}</Fragment>);
  if (!items.length) return null;

  return <section id="experiencia" className="xp-story" ref={root} style={{ '--count': items.length } as CSSProperties}>
    <div className="container xp-heading">
      <div><div className="section-label"><span>04 /</span> {t.labels.experience}</div><h2>{content.title}<br/><span>{content.accent}</span></h2></div>
      <p>{lines(content.text)}</p>
    </div>
    <div className="xp-track" ref={track}>
      <div className="xp-pin">
        <div className="container xp-meta"><span className="xp-hint"><ArrowDown size={14}/> {t.scrollTimeline}</span><span className="xp-hint-mobile"><ArrowRight size={14}/> {t.swipeTimeline}</span><span className="xp-counter">{pad(active + 1)} <i>/ {pad(items.length)}</i></span></div>
        <div className="xp-viewport">
          <div className="xp-row" ref={row}>
            {items.map((item, index) => <article key={item.id} id={`xp-${item.id}`} className={`xp-card ${index === active ? 'is-active' : ''}`} style={{ '--i': index } as CSSProperties} onClick={() => index !== active && go(index)} aria-labelledby={`xp-role-${item.id}`}>
              <div className="xp-card-top"><span className="xp-type">{item.type}</span>{item.current && <span className="xp-now"><i/> {t.current}</span>}</div>
              <p className="xp-period">{item.period}</p>
              <h3 id={`xp-role-${item.id}`}>{item.role}</h3>
              <p className="xp-company">{item.company}{item.location && <span> · {item.location}</span>}</p>
              <p className="xp-description">{item.description}</p>
              {item.highlights.length > 0 && <ul className="xp-highlights">{item.highlights.map((highlight, point) => <li key={point} style={{ '--h': point } as CSSProperties}>{highlight}</li>)}</ul>}
              <div className="xp-card-foot">
                <div className="xp-tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
                {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="xp-link" onClick={event => event.stopPropagation()}>{t.seeMore} <ArrowUpRight size={15}/></a>}
              </div>
              <span className="xp-number" aria-hidden="true">{pad(index + 1)}</span>
            </article>)}
          </div>
        </div>
        <div className="container">
          <div className="xp-timeline" ref={timeline} role="group" aria-label={t.timeline}>
            <span className="xp-line"><i/></span>
            {items.map((item, index) => <button key={item.id} className={`xp-marker ${index <= active ? 'is-passed' : ''} ${index === active ? 'is-active' : ''}`} style={{ '--x': items.length > 1 ? index / (items.length - 1) : 0 } as CSSProperties} onClick={() => go(index)} aria-label={`${item.role}, ${item.period}`} aria-current={index === active ? 'step' : undefined}><i/><span>{item.period}</span></button>)}
          </div>
        </div>
      </div>
    </div>
  </section>;
}
