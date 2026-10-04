import type { CSSProperties } from 'react';
import { Wrench, CheckCheck } from 'lucide-react';
import type { Project } from '@/lib/content';
import type { Locale } from '@/lib/locales';

// Small animated scenes that tell what each project does. Pure CSS loops (app/folio.css, "sc-" classes),
// mounted only while the project is open in the list. Texts are illustrative, in the project's own language.
const v = (vars: Record<string, string | number>) => vars as CSSProperties;

// The scenes below follow the same recipe: a card with the project's own mark, the real screens in frames
// and small floating cards that play the main flow. Screens come from public/galeria/<project>/.
const shot = (project: Project, index: number, fallback: string) => project.gallery[index]?.url || fallback;

// To-do Live: the real checklist window; OBS closes and the shutdown button unlocks.
function Checklist({ project }: { project: Project }) {
  return <div className="sc sc-show sc-todo">
    <div className="sc-brand">
      <svg viewBox="0 0 200 170" aria-hidden="true">
        <rect className="sc-clip-board" x="52" y="22" width="96" height="128" rx="12"/>
        <rect className="sc-clip-top" x="78" y="12" width="44" height="20" rx="6"/>
        {[0, 1, 2].map(i => <g key={i} style={v({ '--i': i })} className="sc-clip-row"><rect x="68" y={52 + i * 30} width="14" height="14" rx="3"/><path d={`M71 ${59 + i * 30}l3 3 6-7`}/><rect className="sc-clip-line" x="90" y={56 + i * 30} width="42" height="6" rx="3"/></g>)}
        <g className="sc-power"><circle cx="160" cy="136" r="20"/><path d="M160 124v12M152 130a10 10 0 1 0 16 0"/></g>
      </svg>
      <p>Só desliga<br/>com tudo <em>concluído</em>.</p>
    </div>
    <div className="sc-shot sc-todo-window"><img src={shot(project, 1, '/galeria/novo-projeto/02.webp')} alt=""/></div>
    <div className="sc-float sc-obs-card"><span className="sc-obs-dot"/><div><b>OBS</b><small className="sc-obs-text"><i>Live ativa</i><i>Encerrada</i></small></div></div>
    <div className="sc-float sc-power-card"><small>5/5 itens</small><b className="sc-power-btn">Desligar computador</b></div>
  </div>;
}

// Apart: the real app window during a call, the profile card, and a live screen share.
function Call({ project }: { project: Project }) {
  const people = [['R', '#e2557b'], ['L', '#7c6cf0'], ['T', '#3fa2f7'], ['D', '#e9a23b']];
  return <div className="sc sc-show sc-apart">
    <div className="sc-brand">
      <svg viewBox="0 0 200 170" aria-hidden="true">
        {[0, 1, 2].map(i => <circle key={i} className="sc-ring" cx="100" cy="78" r="44" style={v({ '--i': i })}/>)}
        <rect className="sc-logo-bg" x="66" y="44" width="68" height="68" rx="18"/>
        <path className="sc-logo" d="M80 98 92 62h12l-13 36Zm24-21 6-15 14 36h-12Z"/>
      </svg>
      <p>Voz, conversa e<br/>tela <em>compartilhada</em>.</p>
    </div>
    <div className="sc-shot sc-apart-window"><img src={shot(project, 1, '/galeria/novo-projeto-2/02.webp')} alt=""/></div>
    <div className="sc-shot sc-apart-profile"><img src={shot(project, 2, '/galeria/novo-projeto-2/03.webp')} alt=""/></div>
    <div className="sc-float sc-live-card"><span className="sc-live-badge">AO VIVO</span><div><b>Tela de Rafa</b><small>1080p · 60 FPS</small></div></div>
    <div className="sc-float sc-voice-card">{people.map(([letter, color], i) => <span key={letter} style={v({ '--c': color, '--i': i })}>{letter}</span>)}<b className="sc-wave"><i/><i/><i/><i/></b></div>
  </div>;
}

// Flaviano: the real site and phone screens; the subject is chosen and the message lands on WhatsApp.
function Chat({ project }: { project: Project }) {
  return <div className="sc sc-show sc-flaviano">
    <div className="sc-brand">
      <svg viewBox="0 0 200 170" aria-hidden="true">
        <text className="sc-f" x="58" y="122">f.</text>
        <g className="sc-chat-icon"><path d="M132 40h44a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8h-28l-14 12v-12h-2a8 8 0 0 1-8-8V48a8 8 0 0 1 8-8Z"/><circle cx="144" cy="61" r="3"/><circle cx="154" cy="61" r="3"/><circle cx="164" cy="61" r="3"/></g>
      </svg>
      <p>Crédito pensado<br/>para <em>você</em>.</p>
    </div>
    <div className="sc-shot sc-browser sc-fla-site"><div className="sc-bar"><i/><i/><i/></div><img src={shot(project, 0, '/galeria/flaviano-credito/01.webp')} alt=""/></div>
    <div className="sc-device sc-fla-phone"><div className="sc-screen"><img src={shot(project, 2, '/galeria/flaviano-credito/03.webp')} alt=""/></div></div>
    <div className="sc-float sc-pick"><small>Assunto</small><b>Empréstimo consignado</b></div>
    <div className="sc-float sc-wa"><b>Olá, Flaviano! Meu nome é Maria.</b><small>09:41 <CheckCheck size={12}/></small></div>
  </div>;
}

// Rayssa: the real site and phone, a quote request walking through its three steps.
function Gallery({ project }: { project: Project }) {
  return <div className="sc sc-show sc-rayssa">
    <div className="sc-brand">
      <svg viewBox="0 0 200 170" aria-hidden="true">
        <g className="sc-aperture">{[0, 1, 2, 3, 4, 5].map(i => <path key={i} d="M100 78 L100 34 A44 44 0 0 1 138 56 Z" transform={`rotate(${i * 60} 100 78)`}/>)}</g>
        <circle className="sc-lens" cx="100" cy="78" r="16"/>
      </svg>
      <p><span className="sc-script">Rayssa</span><br/>histórias com <em>luz</em>.</p>
    </div>
    <div className="sc-shot sc-browser sc-ray-site"><div className="sc-bar"><i/><i/><i/></div><img src={shot(project, 0, '/galeria/rayssa-fotografia/01.webp')} alt=""/></div>
    <div className="sc-device sc-ray-phone"><div className="sc-screen"><img src={shot(project, 2, '/galeria/rayssa-fotografia/03.webp')} alt=""/></div></div>
    <div className="sc-float sc-quote"><small>Novo orçamento</small><b>Casamento · 3 etapas</b><span className="sc-steps"><i/><i/><i/></span></div>
    <span className="sc-cursor">Ver</span>
  </div>;
}

// Domu: the brand illustration (an arch with a door, a key and coins) beside real app screens in floating cards.
function Rental({ project }: { project: Project }) {
  // Real screens from the project's gallery when they exist (the app's dashboard and properties list).
  const shots = project.gallery.map(photo => photo.url).filter(Boolean);
  const phoneA = shots[1] ?? '/galeria/domu/02.webp';
  const phoneB = shots[2] ?? '/galeria/domu/03.webp';
  const steps = ['Novo', 'Triado', 'Agendado', 'Concluído'];
  return <div className="sc sc-rental">
    <div className="sc-brand">
      <svg viewBox="0 0 200 170" aria-hidden="true">
        <ellipse className="sc-floor" cx="100" cy="150" rx="70" ry="9"/>
        <path className="sc-arch" d="M48 150V82a52 52 0 0 1 104 0v68h-22V82a30 30 0 0 0-60 0v68Z"/>
        <path className="sc-hole" d="M70 150V82a30 30 0 0 1 60 0v68Z"/>
        <path className="sc-door" d="M70 150V82a30 30 0 0 1 30-30v98Z"/>
        <circle className="sc-knob" cx="91" cy="112" r="3.4"/>
        <g className="sc-key"><circle cx="34" cy="62" r="11"/><circle cx="34" cy="62" r="4.5" className="sc-key-hole"/><path d="M44 58h30v8h-6v6h-6v-6H44Z"/></g>
        <g className="sc-coin sc-coin-a"><circle cx="164" cy="56" r="12"/><path d="M158 61v-7a6 6 0 0 1 12 0v7" className="sc-coin-mark"/></g>
        <g className="sc-coin sc-coin-b"><circle cx="170" cy="104" r="15"/><path d="M163 110v-9a7 7 0 0 1 14 0v9" className="sc-coin-mark"/></g>
        <path className="sc-spark" d="M60 26l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z"/>
        <path className="sc-spark sc-spark-b" d="M182 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>
        <path className="sc-spark sc-spark-c" d="M24 116l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2Z"/>
      </svg>
      <p>Aluguel em dia.<br/>Casa em <em>ordem</em>.</p>
    </div>
    <div className="sc-device sc-device-a"><div className="sc-screen"><img src={phoneA} alt=""/></div></div>
    <div className="sc-device sc-device-b"><div className="sc-screen"><img src={phoneB} alt=""/></div></div>
    <div className="sc-float sc-ticket">
      <span className="sc-ticket-icon"><Wrench size={14}/></span>
      <div><b>Vazamento sob a pia</b><small>Ap 32 · Edifício Acácias</small></div>
      <span className="sc-status">{steps.map((step, i) => <i key={step} style={v({ '--i': i })}>{step}</i>)}</span>
    </div>
    <div className="sc-float sc-rent">
      <small>Outubro · aluguel</small><b>R$ 1.850</b>
      <span className="sc-paid"><CheckCheck size={12}/> Pago</span>
    </div>
  </div>;
}

// Security audit: a shield being scanned beside the real report and test run; findings flip to fixed.
const auditWords = {
  pt: { line: <>Achar, corrigir<br/>e <em>provar</em>.</>, levels: ['Alta', 'Média', 'Média'], open: 'Aberto', fixed: 'Corrigido', tests: 'testes passando' },
  en: { line: <>Find it, fix it,<br/><em>prove</em> it.</>, levels: ['High', 'Medium', 'Medium'], open: 'Open', fixed: 'Fixed', tests: 'tests passing' },
  es: { line: <>Encontrar, corregir<br/>y <em>probar</em>.</>, levels: ['Alta', 'Media', 'Media'], open: 'Abierto', fixed: 'Corregido', tests: 'pruebas pasando' },
};
function Audit({ project, locale }: { project: Project; locale: Locale }) {
  const w = auditWords[locale];
  return <div className="sc sc-show sc-audit">
    <div className="sc-brand">
      <svg viewBox="0 0 200 170" aria-hidden="true">
        <path className="sc-shield" d="M100 14 48 34v38c0 34 22 60 52 74 30-14 52-40 52-74V34Z"/>
        <clipPath id="sc-shield-clip"><path d="M100 14 48 34v38c0 34 22 60 52 74 30-14 52-40 52-74V34Z"/></clipPath>
        <g clipPath="url(#sc-shield-clip)"><rect className="sc-scan" x="40" y="0" width="120" height="16"/></g>
        {[0, 1, 2].map(i => <g key={i} className="sc-find" style={v({ '--i': i })}><circle cx={78 + i * 22} cy={78 + (i % 2) * 18} r="8"/><path d={`M${74 + i * 22} ${78 + (i % 2) * 18}l3 3 6-6`}/></g>)}
      </svg>
      <p>{w.line}</p>
    </div>
    <div className="sc-shot sc-browser sc-audit-report"><div className="sc-bar"><i/><i/><i/></div><img src={shot(project, 0, '/galeria/auditoria-apart/01.webp')} alt=""/></div>
    <div className="sc-shot sc-audit-term"><img src={shot(project, 2, '/galeria/auditoria-apart/03.webp')} alt=""/></div>
    <div className="sc-float sc-findings">{w.levels.map((level, i) => <div key={i} className="sc-finding" style={v({ '--i': i })}>
      <span className={`sc-sev sc-sev-${i ? 'mid' : 'high'}`}>{level}</span>
      <span className="sc-state"><i>{w.open}</i><i><CheckCheck size={11}/> {w.fixed}</i></span>
    </div>)}</div>
    <div className="sc-float sc-tests"><b>14/14</b><small>{w.tests}</small></div>
  </div>;
}

function Auto({ project }: { project: Project }) {
  return <div className="sc sc-auto">{project.image ? <img src={project.image} alt=""/> : <strong>{project.title}</strong>}<span className="sc-shine"/></div>;
}

export function ProjectScene({ project, locale }: { project: Project; locale: Locale }) {
  switch (project.scene) {
    case 'checklist': return <Checklist project={project}/>;
    case 'call': return <Call project={project}/>;
    case 'chat': return <Chat project={project}/>;
    case 'gallery': return <Gallery project={project}/>;
    case 'rental': return <Rental project={project}/>;
    case 'audit': return <Audit project={project} locale={locale}/>;
    default: return <Auto project={project}/>;
  }
}
