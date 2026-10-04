'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { SiteContent, Tool } from '@/lib/content';
import type { ToolIcons } from '@/lib/tool-icons';
import { AreaIcon } from './area-icon';
import { RichText } from './rich-text';
import { useI18n } from '@/lib/i18n';

const ROW = 100; // px between tool rows on the board.
const PAD = 40;

// Copy and area pills on the left; on the right the chosen area as a hub: its tools wired into a glowing core.
export function FolioStack({ toolkit, icons, label }: { toolkit: SiteContent['toolkit']; icons: ToolIcons; label: string }) {
  const areas = toolkit.areas.filter(area => area.tools.length || area.description);
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [hot, setHot] = useState<number | null>(null);
  // Wires are drawn in real pixels (a stretched SVG would distort dashes), so the board width is measured.
  const board = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const node = board.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const area = areas[Math.min(active, areas.length - 1)];
  const number = (value: number) => String(value).padStart(2, '0');
  if (!area) return null;

  // Tools split into a left and a right column, each centered on the core.
  const half = Math.ceil(area.tools.length / 2);
  const rows = Math.max(half, 4);
  const height = rows * ROW + PAD * 2;
  const core = height / 2;
  const placed = area.tools.map((tool, index) => {
    const left = index < half, inSide = left ? index : index - half, count = left ? half : area.tools.length - half;
    const y = PAD + (inSide + .5 + (rows - count) / 2) * ROW;
    const x = left ? 13 : 87, at = (percent: number) => percent / 100 * width;
    // Each wire reaches the core at its own height, like cables plugged side by side.
    const entry = core + (inSide - (count - 1) / 2) * 11;
    return { tool, index, x, y, wire: `M${at(x)} ${y}H${at(left ? 31 : 69)}V${entry}H${at(50)}` };
  });
  const select = (index: number) => { setActive(index); setHot(null); };

  return <section id="stack" className="folio-section stk">
    <div className="stk-layout">
      <div className="stk-copy">
        <p className="folio-role">01 / {label}</p>
        <h2>{toolkit.title} {toolkit.accent && <span>{toolkit.accent}</span>}</h2>
        {toolkit.text && <RichText text={toolkit.text}/>}
        <div className="stk-areas" role="tablist" aria-label={label}>
          {areas.map((item, index) => <button key={item.id} role="tab" id={`stk-tab-${item.id}`} aria-selected={index === active} aria-controls="stk-board"
            onClick={() => select(index)} onPointerEnter={event => { if (event.pointerType === 'mouse' && index !== active) select(index); }} onFocus={() => index !== active && select(index)}
            style={{ '--area': item.color || 'var(--accent)' } as CSSProperties}>
            <AreaIcon name={item.icon} size={15} aria-hidden="true"/>{item.name}<sup>{number(item.tools.length)}</sup>
          </button>)}
        </div>
        <div className="stk-info" key={area.id} style={{ '--area': area.color || 'var(--accent)' } as CSSProperties}>
          <p className="folio-role">{area.label || area.name}</p>
          {area.subtitle && <h3>{area.subtitle}</h3>}
          {area.description && <RichText text={area.description}/>}
          {area.code.trim() && <pre className="stk-code">{area.file && <span>{area.file}</span>}<code>{area.code}</code></pre>}
        </div>
      </div>

      <div className="stk-board" id="stk-board" ref={board} role="tabpanel" aria-labelledby={`stk-tab-${area.id}`}
        style={{ '--area': area.color || 'var(--accent)', '--board-h': `${height}px` } as CSSProperties}>
        {width > 0 && <svg className="stk-wires" key={`wires-${area.id}`} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          {placed.map(({ wire, index }) => <g key={index} className={hot === index ? 'is-hot' : undefined} style={{ '--i': index } as CSSProperties}>
            <path className="stk-wire" d={wire} pathLength={100}/>
            <path className="stk-pulse" d={wire} pathLength={100}/>
          </g>)}
        </svg>}
        <div className="stk-core" key={`core-${area.id}`} style={{ top: core }}>
          <span className="stk-core-tile"><AreaIcon name={area.icon} size={34} strokeWidth={1.5} aria-hidden="true"/></span>
          <span className="stk-core-name">{area.name}<small>{number(area.tools.length)} {t.tools.toLowerCase()}</small></span>
        </div>
        <ul className="stk-tools" key={`tools-${area.id}`}>
          {placed.map(({ tool, index, x, y }) => <li key={`${tool.name}-${index}`} tabIndex={0} className={x < 50 ? 'is-left' : 'is-right'}
            style={{ '--x': `${x}%`, '--y': `${y}px`, '--i': index, '--brand': icons[tool.name]?.color || 'var(--fg)' } as CSSProperties}
            onPointerEnter={() => setHot(index)} onPointerLeave={() => setHot(null)} onFocus={() => setHot(index)} onBlur={() => setHot(null)}>
            <ToolMark tool={tool} icons={icons}/>
            <span className="stk-tool-text"><strong>{tool.name}</strong>{tool.description && <small>{tool.description}</small>}</span>
          </li>)}
        </ul>
      </div>
    </div>
  </section>;
}

function ToolMark({ tool, icons }: { tool: Tool; icons: ToolIcons }) {
  const icon = icons[tool.name];
  return <span className="stk-tile" aria-hidden="true">
    {icon ? <svg viewBox="0 0 24 24"><path d={icon.path}/></svg> : <b>{tool.mark || tool.name.slice(0, 2)}</b>}
  </span>;
}
