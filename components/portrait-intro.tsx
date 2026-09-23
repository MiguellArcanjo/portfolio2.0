'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown } from 'lucide-react';
import type { SiteContent } from '@/lib/content';
import { useI18n } from '@/lib/i18n';

export function PortraitIntro({ profile }: { profile: SiteContent['profile'] }) {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const [failed, setFailed] = useState(false);
  const parts = profile.name.trim().split(/\s+/);
  const name = parts.length > 1 ? [parts[0], parts.slice(1).join(' ')] : [profile.name];
  const longest = Math.max(...name.map(line => line.length), 5);

  useEffect(() => setFailed(false), [profile.photo]);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, visible = true;
    const update = () => {
      frame = 0;
      const distance = section.offsetHeight - innerHeight;
      const raw = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / Math.max(1, distance)));
      const progress = reduced.matches ? 0 : Math.min(1, raw / .82);
      section.style.setProperty('--portrait-progress', String(progress));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const onScroll = () => { if (visible) schedule(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    observer.observe(section);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
    };
  }, []);

  return <section className="portrait-intro" ref={root} aria-label={t.intro} style={{ '--portrait-name-size': `${Math.min(9, 77 / longest)}vw` } as CSSProperties}>
    <div className="portrait-pin">
      <div className="portrait-frame">
        {!failed && profile.photo ? <img src={profile.photo} alt={profile.photoAlt} fetchPriority="high" decoding="async" onError={() => setFailed(true)} style={{ objectPosition: profile.photoPosition || '50% 50%' }}/> : <div className="portrait-fallback" role="img" aria-label={t.portraitPlaceholder}><span>{profile.initials}</span></div>}
      </div>
      <div className="portrait-type"><p className="sr-only">{profile.name}</p><p className="portrait-name" aria-hidden="true">{name.map((line, index) => <span key={index} aria-hidden="true">{line}</span>)}</p></div>
      <a className="portrait-continue" href="#inicio" aria-label={t.continue}><ArrowDown size={22}/></a>
    </div>
  </section>;
}
