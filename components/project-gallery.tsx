'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { ProjectPhoto } from '@/lib/content';

// Project photos in a magazine rhythm (the first one wide, then pairs); a click opens them in a viewer
// that works with arrows, Esc and swipes.
export function ProjectGallery({ photos, labels }: { photos: ProjectPhoto[]; labels: { close: string; previous: string; next: string; open: string } }) {
  const [current, setCurrent] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef(0);
  const go = (step: number) => setCurrent(index => index === null ? null : (index + step + photos.length) % photos.length);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (current !== null && !el.open) el.showModal();
    if (current === null && el.open) el.close();
  }, [current]);
  useEffect(() => {
    if (current === null) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'ArrowRight') go(1); if (event.key === 'ArrowLeft') go(-1); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const photo = current === null ? null : photos[current];
  return <>
    <div className="case-gallery">
      {photos.map((item, index) => <figure key={item.url + index} className={index === 0 ? 'is-wide' : ''}>
        <button type="button" onClick={() => setCurrent(index)} aria-label={`${labels.open}: ${item.caption || index + 1}`}><img src={item.url} alt={item.caption} loading="lazy"/></button>
        {item.caption && <figcaption><span>{String(index + 1).padStart(2, '0')}</span>{item.caption}</figcaption>}
      </figure>)}
    </div>
    <dialog ref={dialog} className="case-viewer" onClose={() => setCurrent(null)} onClick={event => { if (event.target === event.currentTarget) setCurrent(null); }}
      onTouchStart={event => { touch.current = event.touches[0].clientX; }} onTouchEnd={event => { const dx = event.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
      {photo && <>
        <img src={photo.url} alt={photo.caption}/>
        <p>{photo.caption}<span>{(current ?? 0) + 1} / {photos.length}</span></p>
        <button type="button" className="case-viewer-close" onClick={() => setCurrent(null)} aria-label={labels.close}><X size={20}/></button>
        {photos.length > 1 && <>
          <button type="button" className="case-viewer-prev" onClick={() => go(-1)} aria-label={labels.previous}><ArrowLeft size={20}/></button>
          <button type="button" className="case-viewer-next" onClick={() => go(1)} aria-label={labels.next}><ArrowRight size={20}/></button>
        </>}
      </>}
    </dialog>
  </>;
}
