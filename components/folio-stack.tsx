'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Layers } from 'lucide-react';
import type { SiteContent, Tool } from '@/lib/content';
import type { ToolIcons } from '@/lib/tool-icons';
import { AreaIcon } from './area-icon';
import { RichText } from './rich-text';
import { useI18n } from '@/lib/i18n';

type StackProps = { toolkit: SiteContent['toolkit']; icons: ToolIcons; label: string };

const number = (value: number) => String(value).padStart(2, '0');
const visibleAreas = (toolkit: SiteContent['toolkit']) => toolkit.areas.filter(area => area.tools.length);
const areaStyle = (color: string, index: number) => ({ '--area': color || 'var(--accent)', '--i': index } as CSSProperties);

function Head({ toolkit, role }: { toolkit: SiteContent['toolkit']; role: string }) {
  return <div className="folio-section-head"><div><p className="folio-role">{role}</p><h2>{toolkit.title} {toolkit.accent && <span>{toolkit.accent}</span>}</h2></div>{toolkit.text && <div className="stk-intro"><RichText text={toolkit.text}/></div>}</div>;
}

// One row per area: the area on the left, its tools as logo chips on the right.
export function FolioStack({ toolkit, icons, label }: StackProps) {
  const areas = visibleAreas(toolkit);
  if (!areas.length) return null;
  return <section id="stack" className="folio-section stk">
    <Head toolkit={toolkit} role={`01 / ${label}`}/>
    <div className="stk-rows">
      {areas.map((area, index) => <div key={area.id} className="stk-row" style={areaStyle(area.color, index)}>
        <h3><AreaIcon name={area.icon} size={18} aria-hidden="true"/>{area.name}<sup>{number(area.tools.length)}</sup></h3>
        <ul className="stk-chips">{area.tools.map((tool, toolIndex) => <Chip key={`${tool.name}-${toolIndex}`} tool={tool} icons={icons}/>)}</ul>
      </div>)}
    </div>
  </section>;
}

const HUB = 130; // px height of the strip where the wires fan out from the core to the columns.
const GAP = 20; // must match the column gap in .stk-columns

// Test variant shown below the main one: a core wired to one column per area, tools as compact chips.
export function FolioStackTable({ toolkit, icons, label }: StackProps) {
  const { t } = useI18n();
  const areas = visibleAreas(toolkit);
  const total = new Set(areas.flatMap(area => area.tools.map(tool => tool.name))).size;
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
    const x = index * (column + GAP) + column / 2, from = width / 2 + (index - (areas.length - 1) / 2) * 16;
    return `M${from} 0L${x} ${HUB}`;
  });

  return <section id="stack-teste" className="folio-section stk">
    <Head toolkit={toolkit} role={`${label} — teste`}/>
    <div className="stk-board" ref={board}>
      <div className="stk-hub" aria-hidden="true">
        <div className="stk-core"><span className="stk-core-tile"><Layers size={30} strokeWidth={1.5}/></span><small>{number(total)} {t.tools.toLowerCase()}</small></div>
        {width > 0 && <svg className="stk-wires" viewBox={`0 0 ${width} ${HUB}`} style={{ height: HUB }}>
          {wires.map((wire, index) => <g key={areas[index].id} style={areaStyle(areas[index].color, index)}>
            <path className="stk-wire" d={wire} pathLength={100}/>
            <path className="stk-pulse" d={wire} pathLength={100}/>
          </g>)}
        </svg>}
      </div>
      <div className="stk-columns" style={{ '--cols': areas.length } as CSSProperties}>
        {areas.map((area, index) => <div key={area.id} className="stk-area" style={areaStyle(area.color, index)}>
          <h3 className="stk-area-head"><AreaIcon name={area.icon} size={16} aria-hidden="true"/>{area.name}<sup>{number(area.tools.length)}</sup></h3>
          <ul className="stk-chips stk-chips-col">{area.tools.map((tool, toolIndex) => <Chip key={`${tool.name}-${toolIndex}`} tool={tool} icons={icons}/>)}</ul>
        </div>)}
      </div>
    </div>
  </section>;
}

function Chip({ tool, icons }: { tool: Tool; icons: ToolIcons }) {
  const icon = icons[tool.name];
  return <li style={{ '--brand': icon?.color || 'var(--fg)' } as CSSProperties} title={tool.description || undefined}>
    <span className="stk-logo" aria-hidden="true">{icon ? <svg viewBox="0 0 24 24"><path d={icon.path}/></svg> : <b>{tool.mark || tool.name.slice(0, 2)}</b>}</span>
    {tool.name}
  </li>;
}
