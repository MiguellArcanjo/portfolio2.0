'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUp, ArrowUpRight, Check, Copy } from 'lucide-react';
import type { SiteContent } from '@/lib/content';
import { useI18n } from '@/lib/i18n';
import { RichText } from './rich-text';

const words = {
  pt: { email: 'E-mail', time: 'Horário local', navigation: 'Navegação', networks: 'Redes', language: 'Idioma', rights: 'Todos os direitos reservados.' },
  en: { email: 'Email', time: 'Local time', navigation: 'Navigation', networks: 'Elsewhere', language: 'Language', rights: 'All rights reserved.' },
  es: { email: 'Correo', time: 'Hora local', navigation: 'Navegación', networks: 'Redes', language: 'Idioma', rights: 'Todos los derechos reservados.' },
};

// João Pessoa (UTC−3, no daylight saving).
const ZONE = 'America/Fortaleza';
const handle = (url: string) => { try { return '@' + new URL(url).pathname.split('/').filter(Boolean).at(-1); } catch { return url; } };

function LocalTime() {
  const { locale } = useI18n();
  const [now, setNow] = useState<string>('');
  useEffect(() => {
    const format = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale, { timeZone: ZONE, hour: '2-digit', minute: '2-digit' });
    const tick = () => setNow(format.format(new Date()));
    tick();
    const timer = setInterval(tick, 20_000);
    return () => clearInterval(timer);
  }, [locale]);
  return <span suppressHydrationWarning>{now || '--:--'} <small>UTC−3</small></span>;
}

export function FolioContact({ content, label }: { content: SiteContent; label: string }) {
  const { locale, t } = useI18n();
  const { profile, contact } = content;
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setCopyError(false); setTimeout(() => setCopied(false), 2500); }
    catch { setCopyError(true); }
  };
  const channels: { label: string; value: string; href: string }[] = [
    ...(profile.github ? [{ label: 'GitHub', value: handle(profile.github), href: profile.github }] : []),
    ...(profile.linkedin ? [{ label: 'LinkedIn', value: handle(profile.linkedin), href: profile.linkedin }] : []),
  ];

  return <section id="contato" className="folio-section folio-contact">
    <p className="folio-role">05 / {label}</p>
    <h2 className="contact-title">{contact.title}<br/><span>{contact.accent}</span></h2>
    <div className="contact-grid">
      <div className="contact-lead">
        <RichText text={contact.text}/>
        <p className="contact-time">{words[locale].time} <LocalTime/></p>
      </div>
      <div className="contact-main">
        {profile.email ? <>
          <a className="contact-email" href={`mailto:${profile.email}`}><span>{profile.email.split('@').map((part, i) => i ? <span key={i}>@<wbr/>{part}</span> : part)}</span><i aria-hidden="true"><ArrowUpRight size={26}/></i></a>
          <button className="contact-copy" onClick={copyEmail}>{copied ? <Check size={15}/> : <Copy size={15}/>}{copied ? t.copied : t.copyEmail}</button>
          <span className="contact-status" role="status">{copyError ? t.copyFallback : ''}</span>
        </> : <span className="contact-email">{t.emailPlaceholder}</span>}
        {channels.length > 0 && <ul className="contact-channels">
          {channels.map(channel => <li key={channel.label}><a href={channel.href} target="_blank" rel="noopener noreferrer">
            <span className="contact-channel-label">{channel.label}</span><strong>{channel.value}</strong><ArrowUpRight size={20}/>
          </a></li>)}
        </ul>}
      </div>
    </div>
  </section>;
}

// The name is sized to fill the footer's width exactly, whatever its length.
function FooterName({ name }: { name: string }) {
  const box = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = '100px';
      const text = el.firstElementChild as HTMLElement;
      el.style.fontSize = `${Math.min(260, 100 * el.clientWidth / Math.max(1, text.scrollWidth))}px`;
    };
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    document.fonts?.ready.then(fit);
    return () => observer.disconnect();
  }, [name]);
  return <p className="footer-name" ref={box} aria-hidden="true"><span>{name}</span></p>;
}

export function FolioFooter({ content, nav, languages }: { content: SiteContent; nav: [string, string][]; languages: ReactNode }) {
  const { locale, t } = useI18n();
  const { profile } = content;
  const w = words[locale];
  return <footer className="folio-footer-big folio-width">
    <div className="footer-columns">
      <div className="footer-brand">
        <a className="folio-brand" href="#inicio" aria-label={t.home}>{profile.initials}<span>.</span></a>
        <p>{profile.role}</p>
      </div>
      <nav aria-label={w.navigation}><p className="footer-heading">{w.navigation}</p>{nav.map(([text, id]) => <a key={id} href={`#${id}`}>{text}</a>)}</nav>
      <div><p className="footer-heading">{w.networks}</p>
        {profile.email && <a href={`mailto:${profile.email}`}>{w.email}</a>}
        {profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
        {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
      </div>
      <div><p className="footer-heading">{w.language}</p>{languages}</div>
      <a className="footer-top" href="#inicio" aria-label={t.backToTop}><ArrowUp size={22}/></a>
    </div>
    <FooterName name={profile.name}/>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} {profile.name}. {w.rights}</span>
      <span>{t.footer}</span>
      <span>{w.time} <LocalTime/></span>
    </div>
  </footer>;
}
