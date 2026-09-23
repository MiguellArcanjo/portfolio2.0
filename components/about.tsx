'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Terminal, LockKeyhole, Sparkles, ScanSearch, Code2, ShieldCheck } from 'lucide-react';
import type { SiteContent } from '@/lib/content';
import { useI18n } from '@/lib/i18n';
import { watchFit } from '@/lib/fit';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const traitIcons = [Terminal, LockKeyhole, Sparkles];

export function Strip({ content }: { content: SiteContent['strip'] }) {
  const items = content.items.filter(Boolean);
  if (!items.length) return null;
  // The list is rendered twice so the marquee loops seamlessly.
  const row = (hidden: boolean) => <div className="marquee-row" aria-hidden={hidden || undefined}>{items.map((item, index) => <span key={index}><i>{String(index + 1).padStart(2, '0')}</i>{item}</span>)}</div>;
  return <div className="stack-strip"><div className="container strip-inner"><span className="strip-label">{content.label}</span><div className="marquee" style={{ '--duration': `${Math.max(18, items.length * 4)}s` } as CSSProperties}><div className="marquee-track">{row(false)}{row(true)}</div></div></div></div>;
}


const glyphs = '01<>/{}[]#$%&*+=?;:~';
const scramble = (word: string) => Array.from(word, char => /\s/.test(char) ? char : glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
const principleIcons = [ScanSearch, Code2, ShieldCheck];

export function About({ profile, about }: { profile: SiteContent['profile']; about: SiteContent['about'] }) {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLParagraphElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const giant = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [slide, setSlide] = useState(0);
  const words = about.text.split(/\s+/).filter(Boolean);
  const principles = about.principles.filter(item => item.title);

  useEffect(() => {
    const section = root.current, rail = track.current, text = copy.current, stack = deck.current, marquee = giant.current;
    if (!section || !rail || !text || !stack || !marquee) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(min-width: 901px) and (min-height: 700px)');
    const spans = Array.from(text.children) as HTMLElement[];
    const cards = Array.from(stack.children) as HTMLElement[];
    const pose = { decrypt: 0, front: 0, rx: 0, ry: 0 };
    const pointer = { x: 0, y: 0 };
    let frame = 0, previous = 0, lastScramble = 0, visible = false;

    const update = (time: number) => {
      frame = 0;
      const reduced = motion.matches, pinned = desktop.matches && !reduced, vh = innerHeight;
      const rect = rail.getBoundingClientRect();
      const progress = pinned ? clamp(-rect.top / Math.max(1, rect.height - vh)) : 0;
      // Pinned: the section's scroll progress drives everything. On phones the paragraph decrypts as it
      // travels up the screen, so the effect still follows the reader's thumb.
      const textRect = text.getBoundingClientRect();
      const decrypt = reduced ? 1 : pinned ? clamp((progress + .08) / .5) : clamp((vh * .92 - textRect.top) / (textRect.height + vh * .35));
      const front = reduced || !pinned ? 0 : clamp((progress - .38) / .52) * Math.max(0, cards.length - 1);
      const target = { decrypt, front, rx: pinned ? pointer.y * -10 : 0, ry: pinned ? pointer.x * 14 : 0 };
      const dt = previous ? Math.min((time - previous) / 1000, .05) : 1;
      previous = time;
      const ease = reduced ? 1 : 1 - Math.exp(-dt * 9);
      let moving = false;
      for (const key of Object.keys(target) as (keyof typeof target)[]) {
        pose[key] += (target[key] - pose[key]) * ease;
        if (Math.abs(target[key] - pose[key]) > .001) moving = true;
      }

      const done = Math.floor(pose.decrypt * (spans.length + .001));
      const reshuffle = time - lastScramble > 70;
      if (reshuffle) lastScramble = time;
      spans.forEach((span, index) => {
        const state = index < done ? 'done' : index < done + 4 ? 'active' : 'idle';
        if (span.dataset.state !== state) span.dataset.state = state;
        if (state === 'active' && reshuffle) span.dataset.s = scramble(span.textContent ?? '');
      });

      stack.style.setProperty('--rx', `${pose.rx}deg`); stack.style.setProperty('--ry', `${pose.ry}deg`);
      cards.forEach((card, index) => {
        const depth = index - pose.front;
        card.style.setProperty('--depth', Math.max(0, depth).toFixed(3));
        card.style.setProperty('--leave', clamp(-depth).toFixed(3));
        card.style.zIndex = String(cards.length - index);
        card.dataset.front = String(Math.abs(depth) < .5);
      });
      marquee.style.transform = `translate3d(${reduced ? 0 : -(pinned ? progress : clamp((vh - section.getBoundingClientRect().top) / (vh * 2))) * 32}%,0,0)`;
      const active = visible && !reduced && (moving || (done < spans.length));
      if (active) schedule();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !visible) return;
      pointer.x = event.clientX / innerWidth - .5; pointer.y = event.clientY / innerHeight - .5; schedule();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) setSeen(true); previous = 0; schedule(); }, { threshold: .15 });
    observer.observe(section);
    spans.forEach(span => { span.dataset.s = scramble(span.textContent ?? ''); });
    const onScroll = () => { if (visible) schedule(); };
    // Phones: the deck becomes a swipe carousel; each card turns in 3D by its distance from the centre.
    let swipeFrame = 0;
    const swipe = () => {
      swipeFrame = 0;
      if (desktop.matches && !motion.matches) return;
      const center = stack.scrollLeft + stack.clientWidth / 2;
      let nearest = 0, best = Infinity;
      cards.forEach((card, index) => {
        const offset = Math.max(-1, Math.min(1, (card.offsetLeft + card.offsetWidth / 2 - center) / card.offsetWidth));
        card.style.setProperty('--m', offset.toFixed(3)); card.style.setProperty('--am', Math.abs(offset).toFixed(3));
        if (Math.abs(offset) < best) { best = Math.abs(offset); nearest = index; }
      });
      setSlide(nearest);
    };
    const onSwipe = () => { if (!swipeFrame) swipeFrame = requestAnimationFrame(swipe); };
    stack.addEventListener('scroll', onSwipe, { passive: true });
    window.addEventListener('resize', onSwipe);
    swipe();
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', schedule);
    window.addEventListener('pointermove', move, { passive: true });
    motion.addEventListener('change', schedule); desktop.addEventListener('change', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame); cancelAnimationFrame(swipeFrame); observer.disconnect();
      stack.removeEventListener('scroll', onSwipe); window.removeEventListener('resize', onSwipe);
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', schedule); window.removeEventListener('pointermove', move);
      motion.removeEventListener('change', schedule); desktop.removeEventListener('change', schedule);
    };
  }, [about.text, principles.length]);

  useEffect(() => watchFit(Array.from(deck.current?.children ?? []) as HTMLElement[]), [about.principles]);

  return <section id="sobre" className="about-story" ref={root}>
    <div className="about-track" ref={track}>
      <div className="about-pin">
        <div className="about-giant" aria-hidden="true"><div ref={giant}>{about.marquee} {about.marquee}</div></div>
        <div className="container about-stage">
          <div className="about-main">
            <div className="section-label"><span>01 /</span> {t.labels.about}</div>
            <h2>{about.title}<br/><span>{about.accent}</span></h2>
            <p className="about-hello">{about.intro} <strong>{profile.name}</strong></p>
            <p className="about-cipher" ref={copy} aria-label={about.text}>{words.map((word, index) => <span key={index} aria-hidden="true" data-state="idle">{word}</span>)}</p>
            <div className="about-traits">{about.traits.filter(Boolean).map((trait, index) => { const Icon = traitIcons[index % traitIcons.length]; return <span key={index} style={{ '--d': index } as CSSProperties} className={seen ? 'in' : ''}><Icon size={15}/>{trait}</span>; })}</div>
          </div>
          <div className="about-deck-wrap">
            
            <div className="about-deck" ref={deck} role="list" aria-label={t.personalNotes}>
              {principles.map((item, index) => { const Icon = principleIcons[index % principleIcons.length]; return <article key={index} className="deck-card" role="listitem" style={{ '--i': index } as CSSProperties}>
                <div className="deck-card-top"><span className="deck-icon"><Icon size={20}/></span></div>
                <span className="deck-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <div className="deck-card-foot"><i/><span>{index + 1} / {principles.length}</span></div>
              </article>; })}
            </div>
            {principles.length > 1 && <div className="deck-dots" aria-label={t.personalNotes}>
              {principles.map((item, index) => <button key={index} aria-label={`${index + 1} / ${principles.length}: ${item.title}`} aria-current={slide === index ? 'true' : undefined} onClick={() => { const card = deck.current?.children[index] as HTMLElement | undefined; deck.current?.scrollTo({ left: (card?.offsetLeft ?? 0) - ((deck.current?.clientWidth ?? 0) - (card?.offsetWidth ?? 0)) / 2, behavior: 'smooth' }); }}><i/></button>)}
              <span className="deck-hint">{t.swipe}</span>
            </div>}
          </div>
        </div>
      </div>
    </div>
  </section>;
}
