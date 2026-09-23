'use client';

import { Fragment, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowDown, Terminal, LockKeyhole } from 'lucide-react';
import type { SiteContent } from '@/lib/content';
import { AreaIcon } from './area-icon';
import { useI18n } from '@/lib/i18n';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const pad = (value: number) => String(value).padStart(2, '0');
// Muted tone for the 3D scene, precomputed instead of a filter that would re-rasterize the scene every frame.
const mute = (color: string) => `color-mix(in srgb, ${color} 38%, #8f989d)`;

const tilt = (event: ReactPointerEvent<HTMLElement>) => {
  if (event.pointerType !== 'mouse') return;
  const tile = event.currentTarget, rect = tile.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width, y = (event.clientY - rect.top) / rect.height;
  tile.style.setProperty('--ry', `${(x - .5) * 12}deg`); tile.style.setProperty('--rx', `${(.5 - y) * 12}deg`);
  tile.style.setProperty('--gx', `${x * 100}%`); tile.style.setProperty('--gy', `${y * 100}%`);
};
const untilt = (event: ReactPointerEvent<HTMLElement>) => { event.currentTarget.style.setProperty('--rx', '0deg'); event.currentTarget.style.setProperty('--ry', '0deg'); };

export function Toolkit({ content }: { content: SiteContent['toolkit'] }) {
  const areas = content.areas;
  const { t } = useI18n();
  const [chosen, setSelected] = useState(0);
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const current = useRef(0);
  const pinned = useRef(false);
  const count = useRef(areas.length);
  count.current = areas.length;
  const selected = Math.min(chosen, Math.max(0, areas.length - 1));
  const area = areas[selected];

  useEffect(() => {
    const section = root.current, rail = track.current, stack = world.current, title = heading.current;
    if (!section || !rail || !stack || !title) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(min-width: 901px) and (min-height: 700px)');
    // The stack assembles as it enters, rotates while it is traversed and leans toward the cursor.
    const pose = { rx: 58, rz: -40, explode: 1, scale: 1 };
    const pointer = { x: 0, y: 0 };
    let frame = 0, previous = 0, visible = false;

    const update = (time: number) => {
      frame = 0;
      const reduced = motion.matches, vh = innerHeight, total = count.current;
      pinned.current = desktop.matches && !reduced;
      const rect = rail.getBoundingClientRect();
      const entry = reduced ? 1 : 1 - (1 - clamp((vh - rect.top) / (vh * .85))) ** 3;
      const progress = pinned.current ? clamp(-rect.top / Math.max(1, rect.height - vh)) : 0;
      const target = { rx: 12 + 46 * entry - pointer.y * 9, rz: -10 - 30 * entry + progress * 24 + pointer.x * 14, explode: entry, scale: .78 + .22 * entry };
      const dt = previous ? Math.min((time - previous) / 1000, .05) : 1;
      previous = time;
      const ease = reduced ? 1 : 1 - Math.exp(-dt * 7);
      let moving = false;
      for (const key of Object.keys(target) as (keyof typeof target)[]) {
        pose[key] += (target[key] - pose[key]) * ease;
        if (Math.abs(target[key] - pose[key]) > .002) moving = true;
      }
      stack.style.transform = `rotateX(${pose.rx}deg) rotateZ(${pose.rz}deg) scale(${pose.scale})`;
      stack.style.setProperty('--explode', pose.explode.toFixed(4));
      const fill = reduced ? 1 : clamp((vh * .95 - title.getBoundingClientRect().top) / (vh * .6));
      title.style.setProperty('--fill', `${fill * 120 - 10}%`);
      if (pinned.current && total) {
        const stage = Math.min(total - 1, Math.floor(progress * total));
        if (stage !== current.current) { current.current = stage; setSelected(stage); }
      }
      tabs.current.forEach((tab, index) => {
        if (pinned.current) tab?.style.setProperty('--fill', clamp(progress * total - index).toFixed(4));
        else tab?.style.removeProperty('--fill');
      });
      if (moving && visible) schedule();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || motion.matches || !visible) return;
      pointer.x = event.clientX / innerWidth - .5; pointer.y = event.clientY / innerHeight - .5; schedule();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; previous = 0; schedule(); }, { rootMargin: '20% 0px' });
    observer.observe(section);
    const onScroll = () => { if (visible) schedule(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pointermove', move, { passive: true });
    motion.addEventListener('change', schedule); desktop.addEventListener('change', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', schedule); window.removeEventListener('pointermove', move);
      motion.removeEventListener('change', schedule); desktop.removeEventListener('change', schedule);
    };
  }, [areas.length]);

  // Phones: the 3D scene stays pinned at the top of the section while each area's details scroll beneath it;
  // whichever area crosses the middle of the screen becomes the active layer.
  useEffect(() => {
    const items = Array.from(list.current?.children ?? []) as HTMLElement[];
    if (!items.length) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting || pinned.current) return;
      const index = items.indexOf(entry.target as HTMLElement);
      (entry.target as HTMLElement).dataset.seen = 'true';
      if (index !== current.current) { current.current = index; setSelected(index); }
    }), { rootMargin: '-64% 0px -34% 0px' }); // a thin band in the middle of the area left below the pinned scene
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [areas.length]);

  const choose = (index: number) => {
    const rail = track.current;
    const mobileItem = list.current?.children[index] as HTMLElement | undefined;
    if (!pinned.current && mobileItem && mobileItem.offsetParent) {
      const scene = mobileItem.parentElement?.parentElement?.querySelector('.stack-scene')?.getBoundingClientRect().height ?? 0;
      window.scrollTo({ top: scrollY + mobileItem.getBoundingClientRect().top - scene - 8, behavior: 'smooth' });
      return;
    }
    if (pinned.current && rail) {
      const rect = rail.getBoundingClientRect();
      window.scrollTo({ top: scrollY + rect.top + (rect.height - innerHeight) * ((index + .12) / areas.length), behavior: 'smooth' });
    } else { current.current = index; setSelected(index); }
  };

  const lines = (text: string) => text.split('\n').map((line, index) => <Fragment key={index}>{index > 0 && <br/>}{line}</Fragment>);

  if (!area) return null;
  return <section id="stack" className="toolkit-story" ref={root} style={{ '--tool-color': area.color, '--count': areas.length } as CSSProperties}>
    <div className="container toolkit-heading" ref={heading}>
      <div><div className="section-label"><span>03 /</span> {t.labels.stack}</div><h2>{content.title}<br/><span>{content.accent}</span></h2></div>
      <p>{lines(content.text)}</p>
    </div>
    <div className="toolkit-track" ref={track}>
      <div className="toolkit-pin container">
        <div className="toolkit-meta"><span><Terminal size={14}/> {t.tools}</span><span className="meta-hint"><ArrowDown size={13}/> {t.scrollAreas}</span><span>{t.layer} <b>{pad(selected + 1)}</b> / {pad(areas.length)}</span></div>
        <div className="toolkit-steps" role="tablist" aria-label={t.knowledgeAreas}>
          {areas.map((item, index) => <button key={item.id} ref={element => { tabs.current[index] = element; }} id={`tool-tab-${index}`} role="tab" aria-selected={selected === index} aria-controls="tool-panel" tabIndex={selected === index ? 0 : -1} onClick={() => choose(index)} onKeyDown={event => {
            let next = index;
            if (event.key === 'ArrowRight') next = (index + 1) % areas.length;
            else if (event.key === 'ArrowLeft') next = (index + areas.length - 1) % areas.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = areas.length - 1;
            else return;
            event.preventDefault(); choose(next); tabs.current[next]?.focus();
          }}><span className="step-index">{pad(index + 1)}</span><AreaIcon name={item.icon} size={17}/><span>{item.name}</span><i className="step-bar"><span/></i></button>)}
        </div>
        <div className="toolkit-stage">
          <div className="stack-scene" aria-hidden="true" style={{ '--tool-color': mute(area.color) } as CSSProperties}>
            <div className="scene-mobile-label" key={area.id}><AreaIcon name={area.icon} size={15}/><b>{area.name}</b><span>{pad(selected + 1)} / {pad(areas.length)}</span></div>
            <div className={`stack-world ${area.icon === 'shield' ? 'is-shielded' : ''}`} ref={world} style={{ '--levels': Math.max(1, areas.length - 1) } as CSSProperties}>
              <span className="stack-floor"/><span className="stack-orbit"/>
              {[0, 1, 2, 3].map(corner => <span key={corner} className={`stack-pillar pillar-${corner}`}/>)}
              <span className="stack-beam"/><span className="stack-beam beam-cross"/>
              <span className="stack-scanner"/>
              {areas.map((item, index) => <div key={item.id} className={`stack-layer ${selected === index ? 'is-active' : index < selected ? 'is-above' : ''}`} style={{ '--i': areas.length - 1 - index, '--c': mute(item.color) } as CSSProperties} onClick={() => choose(index)}>
                <div className="layer-plate">
                  <span className="layer-edge"/>
                  <div className="layer-head"><AreaIcon name={item.icon} size={16}/><b>{item.name}</b><small>{pad(index + 1)}</small></div>
                  <div className="layer-blocks">{item.tools.slice(0, 4).map((tool, index) => <span key={index} style={{ '--t': index } as CSSProperties}>{tool.mark}</span>)}</div>
                  <span className="layer-lock"><LockKeyhole size={11}/></span>
                </div>
              </div>)}
            </div>
            
          </div>
          <div id="tool-panel" role="tabpanel" aria-labelledby={`tool-tab-${selected}`} tabIndex={0} className="toolkit-detail" key={area.id}>
            <div className="detail-eyebrow"><span className="detail-count">{pad(selected + 1)}</span><span>/ {pad(areas.length)} — {area.label.toUpperCase()}</span><AreaIcon name={area.icon} size={19}/></div>
            <h3 aria-label={area.subtitle}>{area.subtitle.split(' ').map((word, index) => <span key={index} aria-hidden="true" style={{ '--w': index } as CSSProperties}>{word}</span>)}</h3>
            <p>{area.description}</p>
            <div className="tool-tiles">{area.tools.map((tool, index) => <div className="tool-tile" key={index} style={{ '--t': index } as CSSProperties} onPointerMove={tilt} onPointerLeave={untilt}><span className="tool-mark">{tool.mark}</span><div><h4>{tool.name}</h4><p>{tool.description}</p></div><span className="tool-tile-number">{pad(index + 1)}</span></div>)}</div>
            {area.code.trim() && <div className="tool-code"><div className="code-bar"><i/><i/><i/><span>{area.file}</span><small>{t.codeSnippet}</small></div><pre aria-label={t.codeExample(area.file)}><code>{area.code.split('\n').map((line, index) => <span key={index} style={{ '--l': index } as CSSProperties}><i>{index + 1}</i>{line}</span>)}</code></pre></div>}
          </div>
          <div className="tool-mobile-list" ref={list}>
            {areas.map((item, index) => <article key={item.id} className={`tool-mobile-item ${selected === index ? 'is-active' : ''}`} style={{ '--c': item.color } as CSSProperties} aria-label={item.name}>
              <div className="detail-eyebrow"><span className="detail-count">{pad(index + 1)}</span><span>/ {pad(areas.length)} — {item.label.toUpperCase()}</span><AreaIcon name={item.icon} size={17}/></div>
              <h3>{item.subtitle}</h3>
              <p>{item.description}</p>
              <div className="tool-tiles">{item.tools.map((tool, toolIndex) => <div className="tool-tile" key={toolIndex} style={{ '--t': toolIndex } as CSSProperties}><span className="tool-mark">{tool.mark}</span><div><h4>{tool.name}</h4><p>{tool.description}</p></div></div>)}</div>
            </article>)}
          </div>
        </div>
      </div>
    </div>
  </section>;
}
