'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, GitFork as Github, ContactRound as Linkedin, Mail, Menu, X, Check, Copy } from 'lucide-react';
import { Orbit } from '@/components/orbit';
import { Toolkit } from '@/components/toolkit';
import { Experience } from '@/components/experience';
import { About } from '@/components/about';
import { ProjectPreview } from '@/components/project-preview';
import { ProjectShowcase } from '@/components/project-showcase';
import type { Project, SiteContent } from '@/lib/content';
import { PortraitIntro } from '@/components/portrait-intro';

const lines = (text: string) => text.split('\n').map((line, index) => <Fragment key={index}>{index > 0 && <br/>}{line}</Fragment>);

export function Home({ content }: { content: SiteContent }) {
  const { profile } = content;
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);


  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(entries => { entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }); }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    const offscreen = new IntersectionObserver(entries => entries.forEach(e => e.target.toggleAttribute('data-offscreen', !e.isIntersecting)), { rootMargin: '10% 0px' });
    document.querySelectorAll('main > section').forEach(el => offscreen.observe(el));
    const pointer = (e: PointerEvent) => { if(reduced.matches) return; document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`); document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`); };
    window.addEventListener('pointermove', pointer, { passive: true });
    return () => { observer.disconnect(); offscreen.disconnect(); window.removeEventListener('pointermove', pointer); };
  }, []);

  useEffect(() => {
    if (selected) { dialog.current?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }
    dialog.current?.close();
  }, [selected]);

  const copyEmail = async () => { if(!profile.email) return; try { await navigator.clipboard.writeText(profile.email); setCopied(true); setCopyError(false); setTimeout(()=>setCopied(false), 2500); } catch { setCopyError(true); } };
  const [heroTitle, heroAccent] = [content.hero.title.split('\n'), content.hero.accent.split('\n')];

  return <div className="portfolio-site">
    <div className="mouse-glow" aria-hidden="true"/>
    <a className="skip-link" href="#main">Pular para o conteúdo</a>
    <header className="header"><a href="#" className="logo" aria-label="Início">{profile.initials}<span>.</span></a><nav aria-label="Navegação principal" className={menu?'nav open':'nav'}>{[['Sobre','sobre'],['Projetos','projetos'],['Stack','stack'],['Experiência','experiencia']].map(([label,id])=><a href={`#${id}`} key={id} onClick={()=>setMenu(false)}>{label}</a>)}</nav><a className="header-contact" href="#contato">Contato <ArrowUpRight size={16}/></a><button className="menu-toggle" onClick={()=>setMenu(!menu)} aria-label={menu?'Fechar menu':'Abrir menu'} aria-expanded={menu}>{menu?<X/>:<Menu/>}</button></header>
    <main id="main">
      <PortraitIntro profile={profile}/>
      <section id="inicio" className="hero container">
        <div className="hero-identity"><span>{profile.name}</span><span>{profile.role}</span></div>
        <div className="hero-content"><h1>{heroTitle.map((line, index) => <span className="hero-title-line" key={index}>{line}</span>)}<span className="hero-title-accent">{heroAccent.join(' ')}</span></h1></div>
        <div className="hero-art"><Orbit/></div>
        <div className="hero-intro"><p>{lines(content.hero.text)}</p><a href="#projetos" className="hero-project-link">Ver projetos <ArrowDown size={23}/></a></div>
        <a href="#sobre" className="hero-about-link">Mais sobre mim <ArrowUpRight size={17}/></a>
      </section>
      <About profile={profile} about={content.about}/>
      <ProjectShowcase projects={content.projects} heading={content.projectsSection} onSelect={setSelected}/>
      <Toolkit content={content.toolkit}/>
      <Experience content={content.experience}/>
      <section id="contato" className="contact-section reveal"><div className="container"><div className="section-label"><span>04 /</span> CONTATO</div><div className="contact-layout"><h2>{lines(content.contact.title)} <span>{content.contact.accent}</span></h2><a className="contact-arrow" href={profile.email?`mailto:${profile.email}`:'#contact-details'} aria-label="Ver contato"><ArrowUpRight/></a></div><div className="contact-bottom" id="contact-details"><p>{lines(content.contact.text)}</p>{profile.email?<div className="email-group"><a href={`mailto:${profile.email}`}>{profile.email}</a><button onClick={copyEmail} aria-label="Copiar e-mail">{copied?<Check size={18}/>:<Copy size={18}/>}</button><span role="status">{copied?'Copiado!':copyError?'Selecione o e-mail para copiar.':''}</span></div>:<div className="contact-placeholder"><Mail size={19}/><span>[seu e-mail]<small>Contato a preencher.</small></span></div>}</div></div></section>
    </main>
    <footer className="container footer"><a href="#" className="logo">{profile.initials}<span>.</span></a><span>Next.js + TypeScript.</span><div className="socials">{profile.github&&<a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={18}/></a>}{profile.linkedin&&<a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={18}/></a>}<a href="#" aria-label="Voltar ao topo">Voltar ao topo <ArrowUpRight size={15}/></a></div></footer>
    <dialog ref={dialog} className="project-dialog" onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}} aria-labelledby="dialog-title"><button className="dialog-close" onClick={()=>setSelected(null)} aria-label="Fechar detalhes"><X size={22}/></button>{selected&&<><ProjectPreview kind={selected.kind} image={selected.image} alt={`Capa do projeto ${selected.title}`} placeholder={selected.description.startsWith('[')}/><div className="dialog-content"><div className="section-label">PROJETO / {selected.type}</div><h2 id="dialog-title">{selected.title}</h2><p>{selected.description}</p><p>{selected.detail}</p><div className="tags">{selected.tags.map(t=><span key={t}>{t}</span>)}</div>{selected.github&&<a href={selected.github}>Ver repositório <ArrowUpRight size={16}/></a>}{selected.live&&<a href={selected.live}>Abrir projeto <ArrowUpRight size={16}/></a>}</div></>}</dialog>
  </div>;
}
