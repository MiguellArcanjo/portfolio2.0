'use client';

import { useState, type CSSProperties } from 'react';
import type { SiteContent } from '@/lib/content';
import { RichText } from './rich-text';

// An index of areas on the left and the chosen area opened on the right; hovering, focusing or clicking an area opens it.
export function FolioStack({ toolkit, label }: { toolkit: SiteContent['toolkit']; label: string }) {
  const areas = toolkit.areas.filter(area => area.tools.length || area.description);
  const [active, setActive] = useState(0);
  const area = areas[Math.min(active, areas.length - 1)];
  const allTools = [...new Set(areas.flatMap(item => item.tools.map(tool => tool.name)).filter(Boolean))];
  const number = (value: number) => String(value).padStart(2, '0');
  if (!area) return null;

  return <section id="stack" className="folio-section folio-stack-section">
    <div className="folio-section-head"><div><p className="folio-role">02 / {label}</p><h2>{toolkit.title} {toolkit.accent && <span>{toolkit.accent}</span>}</h2></div>{toolkit.text && <div className="stack-intro"><RichText text={toolkit.text}/></div>}</div>
    {allTools.length > 0 && <div className="stack-marquee" aria-hidden="true">
      {[0, 1].map(copy => <div key={copy} className="stack-marquee-track">{allTools.map(tool => <span key={tool}>{tool}</span>)}</div>)}
    </div>}
    <div className="stack-index">
      <div className="stack-areas" role="tablist" aria-label={label}>
        {areas.map((item, index) => <button key={item.id} role="tab" id={`stack-tab-${item.id}`} aria-selected={index === active} aria-controls="stack-panel"
          onClick={() => setActive(index)} onPointerEnter={event => { if (event.pointerType === 'mouse') setActive(index); }} onFocus={() => setActive(index)}
          style={{ '--area': item.color || 'var(--accent)' } as CSSProperties}>
          <span className="stack-area-index">{number(index + 1)}</span>
          <span className="stack-area-name">{item.name}</span>
          <span className="stack-area-count">{number(item.tools.length)}</span>
        </button>)}
      </div>
      <div className="stack-panel" id="stack-panel" role="tabpanel" aria-labelledby={`stack-tab-${area.id}`} key={area.id} style={{ '--area': area.color || 'var(--accent)' } as CSSProperties}>
        <p className="folio-role stack-panel-label">{area.label || area.name}</p>
        {area.subtitle && <h3>{area.subtitle}</h3>}
        {area.description && <RichText text={area.description}/>}
        <ul className="stack-tools">
          {area.tools.map((tool, index) => <li key={`${tool.name}-${index}`} style={{ '--i': index } as CSSProperties}>
            <span className="stack-tool-mark" aria-hidden="true">{tool.mark || tool.name.slice(0, 2)}</span>
            <span><strong>{tool.name}</strong>{tool.description && <small>{tool.description}</small>}</span>
          </li>)}
        </ul>
        {area.code.trim() && <pre className="stack-code">{area.file && <span>{area.file}</span>}<code>{area.code}</code></pre>}
      </div>
    </div>
  </section>;
}
