'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { SiteContent } from '@/lib/content';
import { useI18n } from '@/lib/i18n';

type State = 'top' | 'hidden' | 'pinned';

// Link text that rolls up to a copy of itself on hover.
const Roll = ({ text }: { text: string }) => <span className="roll" data-text={text}><span>{text}</span></span>;

// Fixed bar: transparent at the top, hides while reading down, comes back compact when scrolling up.
// It marks the section on screen, shows the reading progress and opens a full-screen menu on phones.
export function FolioHeader({ profile, nav, contactLabel, languages, mobileLanguages }: {
  profile: SiteContent['profile']; nav: [string, string][]; contactLabel: string; languages: ReactNode; mobileLanguages: ReactNode;
}) {
  const { t } = useI18n();
  const bar = useRef<HTMLElement>(null);
  const links = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>('top');
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
  const sections = [...nav, [contactLabel, 'contato'] as [string, string]];

  useEffect(() => {
    let last = scrollY, frame = 0;
    const update = () => {
      frame = 0;
      const y = scrollY, delta = y - last;
      if (y < 80) setState('top');
      else if (delta > 6) setState('hidden');
      else if (delta < -6) setState('pinned');
      if (Math.abs(delta) > 6 || y < 80) last = y;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.current?.style.setProperty('--read', String(max > 0 ? y / max : 0));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    setState(scrollY < 80 ? 'top' : 'pinned');
    addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', onScroll); };
  }, []);

  // The section crossing the upper middle of the screen is the current one.
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(([, id]) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    const top = () => { if (scrollY < innerHeight * .3) setActive(''); };
    addEventListener('scroll', top, { passive: true });
    return () => { observer.disconnect(); removeEventListener('scroll', top); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav.length]);

  // The indicator slides under the current link.
  useEffect(() => {
    const place = () => {
      const link = links.current?.querySelector<HTMLElement>(`a[href="#${active}"]`);
      setIndicator(link ? { x: link.offsetLeft, w: link.offsetWidth } : null);
    };
    place();
    addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => removeEventListener('resize', place);
  }, [active]);

  // Full-screen menu: locks the page, closes with Esc and returns focus to the button.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlay.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; removeEventListener('keydown', onKey); };
  }, [open]);
  useEffect(() => { if (!open) bar.current?.querySelector<HTMLElement>('.folio-menu')?.blur(); }, [open]);

  return <>
    <div className="topbar-space" aria-hidden="true"/>
    <header ref={bar} className="folio-topbar" data-state={open ? 'pinned' : state} data-open={open || undefined}>
      <div className="folio-header folio-width">
        <a className="folio-brand" href="#inicio" aria-label={t.home} onClick={() => setOpen(false)}>{profile.initials}<span>.</span></a>
        <nav ref={links} className="folio-nav" aria-label={t.mainNav} style={indicator ? { '--x': `${indicator.x}px`, '--w': `${indicator.w}px` } as CSSProperties : undefined} data-indicator={indicator ? 'on' : undefined}>
          {nav.map(([label, id]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}><Roll text={label}/></a>)}
          <i className="nav-indicator" aria-hidden="true"/>
        </nav>
        {languages}
        <a className="topbar-cta" href="#contato" aria-current={active === 'contato' ? 'location' : undefined}><Roll text={contactLabel}/><ArrowUpRight size={15}/></a>
        <button className="folio-menu" onClick={() => setOpen(!open)} aria-label={open ? t.closeMenu : t.openMenu} aria-expanded={open} aria-controls="folio-overlay"><i/><i/></button>
      </div>
      <span className="topbar-progress" aria-hidden="true"/>
    </header>
    <div ref={overlay} id="folio-overlay" className="folio-overlay" data-open={open || undefined} inert={!open} aria-hidden={!open}>
      <nav aria-label={t.mainNav}>
        {sections.map(([label, id], index) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)} style={{ '--i': index } as CSSProperties} aria-current={active === id ? 'location' : undefined}>
          <small>{String(index + 1).padStart(2, '0')}</small>{label}
        </a>)}
      </nav>
      <div className="overlay-foot">
        {mobileLanguages}
        {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
      </div>
    </div>
  </>;
}
