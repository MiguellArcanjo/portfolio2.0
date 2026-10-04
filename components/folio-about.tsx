'use client';

import { useEffect, useRef, useState } from 'react';
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

// First sentence of the text, pulled out as the opening statement; the rest follows below.
function splitLead(text: string) {
  const match = text.trim().match(/^(.+?[.!?])\s+([\s\S]*)$/);
  return match ? [match[1], match[2]] : [text.trim(), ''];
}

// Editorial layout: the first sentence as a big statement, the title beside the rest of the text,
// then the notes in a zigzag joined by a rope that draws itself with the scroll.
export function FolioAbout({ about, label }: { about: SiteContent['about']; label: string }) {
  const [lead, rest] = splitLead(about.text);
  // Lists keep the regular formatting; plain paragraphs get the scroll reading.
  const hasList = /^\s*[•\-–*]\s+/m.test(rest);
  const notes = about.principles.filter(item => item.title || item.text);
  const rope = useRope(notes.length);
  return <section id="sobre" className="folio-section folio-about">
    <p className="folio-role">03 / {label}</p>
    <blockquote className="about-statement">{lead}</blockquote>
    <div className="about-roped" ref={rope.wrap}>
      {rope.d && <svg className="about-rope" width={rope.size[0]} height={rope.size[1]} aria-hidden="true">
        <path className="about-rope-track" d={rope.d}/>
        <path className="about-rope-line" d={rope.d} ref={rope.line}/>
        <circle className="about-rope-tip" r="4" ref={rope.tip}/>
      </svg>}
      <div className="about-split">
        <h2>{about.title} <span>{about.accent}</span></h2>
        <div ref={rope.start}>
          {rest && (hasList ? <RichText text={rest}/> : <ScrollWords text={rest}/>)}
          {about.traits.filter(Boolean).length > 0 && <ul className="folio-techs">{about.traits.filter(Boolean).map(trait => <li key={trait}>{trait}</li>)}</ul>}
        </div>
      </div>
      {notes.length > 0 && <ol className="about-notes">
        {notes.map((item, index) => <li key={index} ref={node => { rope.notes.current[index] = node; }}>
          <span className="about-knot" aria-hidden="true"/>
          <strong aria-hidden="true">{String(index + 1).padStart(2, '0')}</strong>
          <div><h3>{item.title}</h3><RichText text={item.text}/></div>
        </li>)}
      </ol>}
    </div>
  </section>;
}

const BEND = 22; // corner radius of the rope, px
const DRAW_START = .95; // drawing starts when the rope's origin is at 95% of the screen height…
const DRAW_END = .55; // …and reaches the last knot when it is around the middle of the screen
const EASE = .06; // share of the remaining distance the tip covers per frame

// The rope leaves the bottom of the right-hand text and visits each note's knot, alternating sides. It only runs
// through the gaps (above each note and down the knot column), so it never crosses the text. Its length follows the scroll.
function useRope(count: number) {
  const wrap = useRef<HTMLDivElement>(null);
  const start = useRef<HTMLDivElement>(null);
  const notes = useRef<(HTMLLIElement | null)[]>([]);
  const line = useRef<SVGPathElement>(null);
  const tip = useRef<SVGCircleElement>(null);
  const [shape, setShape] = useState<{ d: string; size: [number, number] }>({ d: '', size: [0, 0] });

  // Build the path from where things actually are, again whenever the layout changes size.
  useEffect(() => {
    const box = wrap.current, from = start.current;
    if (!box || !from || !count) return;
    const build = () => {
      const origin = box.getBoundingClientRect(), text = from.getBoundingClientRect();
      let x = text.left + text.width / 2 - origin.left, y = text.bottom - origin.top + 18;
      let d = `M${x} ${y}`;
      notes.current.slice(0, count).forEach(note => {
        const knot = note?.querySelector('.about-knot')?.getBoundingClientRect();
        if (!note || !knot) return;
        const kx = knot.left + knot.width / 2 - origin.left, ky = knot.top + knot.height / 2 - origin.top;
        const run = note.getBoundingClientRect().top - origin.top - 44; // horizontal run sits in the gap above the note
        const dir = kx < x ? -1 : 1, r = Math.min(BEND, Math.abs(kx - x) / 2, (run - y) / 2, (ky - run) / 2);
        d += ` V${run - r} Q${x} ${run} ${x + dir * r} ${run} H${kx - dir * r} Q${kx} ${run} ${kx} ${run + r} V${ky}`;
        x = kx; y = ky;
      });
      setShape({ d, size: [Math.round(origin.width), Math.round(origin.height)] });
    };
    build();
    const observer = new ResizeObserver(build);
    observer.observe(box);
    document.fonts?.ready.then(build);
    return () => observer.disconnect();
  }, [count]);

  // Draw as much of the rope as the scroll has reached, and light the knots it has passed.
  useEffect(() => {
    const box = wrap.current, path = line.current, dot = tip.current;
    if (!box || !path || !dot || !shape.d) return;
    const total = path.getTotalLength();
    // Horizontal runs count half, so they draw while scrolling instead of snapping into place.
    const samples: { at: number; key: number; y: number }[] = [];
    let key = 0, last = path.getPointAtLength(0);
    for (let at = 0; at <= total; at += 6) {
      const point = path.getPointAtLength(at);
      key += Math.abs(point.y - last.y) + Math.abs(point.x - last.x) * .5;
      samples.push({ at, key, y: point.y });
      last = point;
    }
    const knotAt = notes.current.slice(0, count).map(note => {
      const knot = note?.querySelector('.about-knot')?.getBoundingClientRect(), origin = box.getBoundingClientRect();
      if (!knot) return total;
      const ky = knot.top + knot.height / 2 - origin.top;
      return samples.find(sample => sample.y >= ky - 1)?.at ?? total;
    });
    const startY = samples[0].y, endY = samples[samples.length - 1].y;
    path.style.strokeDasharray = `${total}`;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0, length = -1;
    const update = () => {
      frame = 0;
      const top = box.getBoundingClientRect().top;
      // Starts when the rope's origin is low on the screen and ends only when its end has risen to DRAW_END,
      // so the drawing is spread over more scroll than the rope's own height.
      const travel = (endY - startY) + innerHeight * (DRAW_START - DRAW_END);
      const progress = reduced ? 1 : Math.max(0, Math.min(1, (innerHeight * DRAW_START - top - startY) / Math.max(1, travel)));
      const goal = progress * key;
      const target = progress >= 1 ? total : (samples.find(sample => sample.key >= goal) ?? samples[samples.length - 1]).at;
      // The tip eases toward the target instead of jumping with each scroll step.
      length = reduced || length < 0 ? target : length + (target - length) * EASE;
      if (Math.abs(target - length) < .5) length = target;
      else frame = requestAnimationFrame(update);
      path.style.strokeDashoffset = `${total - length}`;
      const point = path.getPointAtLength(length);
      dot.setAttribute('cx', String(point.x)); dot.setAttribute('cy', String(point.y));
      dot.style.opacity = length > 0 && length < total ? '1' : '0';
      knotAt.forEach((at, index) => notes.current[index]?.toggleAttribute('data-reached', length >= at - 2));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); };
  }, [shape, count]);

  return { wrap, start, notes, line, tip, d: shape.d, size: shape.size };
}
