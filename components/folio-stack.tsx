'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Layers } from 'lucide-react';
import type { SiteContent, Tool } from '@/lib/content';
import type { ToolIcons } from '@/lib/tool-icons';
import { AreaIcon } from './area-icon';
import { RichText } from './rich-text';
import { useI18n } from '@/lib/i18n';

const HUB = 130; // px height of the strip where the wires fan out from the core to the columns.
const GAP = 24; // must match the column gap in .stk-columns

// Everything visible at once: a glowing core wired to one column per area, each listing its tools with logos.
export function FolioStack({ toolkit, icons, label }: { toolkit: SiteContent['toolkit']; icons: ToolIcons; label: string }) {
  const { t } = useI18n();
  const areas = toolkit.areas.filter(area => area.tools.length || area.description);
  const total = new Set(areas.flatMap(area => area.tools.map(tool => tool.name))).size;
  const number = (value: number) => String(value).padStart(2, '0');
  // Wires are drawn in real pixels, so the board width is measured.
  const board = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const node = board.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  if (!areas.length) return null;

  const column = (width - GAP * (areas.length - 1)) / areas.length;
  const wires = areas.map((_, index) => {
    // Straight dashed lines fanning out from under the core to the middle of each column header.
    const x = index * (column + GAP) + column / 2, from = width / 2 + (index - (areas.length - 1) / 2) * 16;
    return `M${from} 0L${x} ${HUB}`;
  });

  return <section id="stack" className="folio-section stk">
    <div className="folio-section-head"><div><p className="folio-role">01 / {label}</p><h2>{toolkit.title} {toolkit.accent && <span>{toolkit.accent}</span>}</h2></div>{toolkit.text && <div className="stk-intro"><RichText text={toolkit.text}/></div>}</div>
    <div className="stk-board" ref={board}>
      <div className="stk-hub" aria-hidden="true">
        <div className="stk-core"><span className="stk-core-tile"><Layers size={30} strokeWidth={1.5}/></span><small>{number(total)} {t.tools.toLowerCase()}</small></div>
        {width > 0 && <svg className="stk-wires" viewBox={`0 0 ${width} ${HUB}`} style={{ height: HUB }}>
          {wires.map((wire, index) => <g key={areas[index].id} style={{ '--area': areas[index].color || 'var(--accent)', '--i': index } as CSSProperties}>
            <path className="stk-wire" d={wire} pathLength={100}/>
            <path className="stk-pulse" d={wire} pathLength={100}/>
          </g>)}
        </svg>}
      </div>
      <div className="stk-columns" style={{ '--cols': areas.length } as CSSProperties}>
        {areas.map((area, index) => <article key={area.id} className="stk-area" style={{ '--area': area.color || 'var(--accent)', '--i': index } as CSSProperties}>
          <h3 className="stk-area-head"><AreaIcon name={area.icon} size={16} aria-hidden="true"/>{area.name}<sup>{number(area.tools.length)}</sup></h3>
          {area.description && <RichText className="stk-area-text" text={area.description}/>}
          <ul className="stk-tools">
            {area.tools.map((tool, toolIndex) => <li key={`${tool.name}-${toolIndex}`} style={{ '--brand': icons[tool.name]?.color || 'var(--fg)', '--j': toolIndex } as CSSProperties}>
              <ToolMark tool={tool} icons={icons}/>
              <span><strong>{tool.name}</strong>{tool.description && <small>{tool.description}</small>}</span>
            </li>)}
          </ul>
          {area.code.trim() && <pre className="stk-code">{area.file && <span>{area.file}</span>}<code>{area.code}</code></pre>}
        </article>)}
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
