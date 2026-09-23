'use client';

import { useState, type CSSProperties } from 'react';
import { Plus, Copy, Trash2, FolderKanban, Layers3, Wrench, AlertTriangle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { areaIcons, previewKinds, uniqueId, type AreaIcon as AreaIconName, type Experience, type Project, type SiteContent, type StackArea } from '@/lib/content';
import { AreaIcon } from '@/components/area-icon';
import { PortraitEditor } from './portrait-editor';
import { ImageField } from './image-field';
import { Panel, Field, TextArea, Select, ColorField, Chips, RowActions, move } from './fields';

export type Edit = (recipe: (draft: SiteContent) => void) => void;
export type SectionId = 'dashboard' | 'perfil' | 'textos' | 'projetos' | 'stack' | 'experiencia';

const kindLabels: Record<(typeof previewKinds)[number], string> = { security: 'Painel de segurança', workspace: 'Workspace / Kanban', terminal: 'Terminal' };
const iconLabels: Record<AreaIconName, string> = { code: 'Código', braces: 'Chaves', shield: 'Escudo', layers: 'Camadas', terminal: 'Terminal', database: 'Banco', cloud: 'Nuvem', cpu: 'CPU' };

export function Dashboard({ content, go }: { content: SiteContent; go: (section: SectionId) => void }) {
  const tools = content.toolkit.areas.reduce((total, area) => total + area.tools.length, 0);
  const checks = [
    { ok: content.profile.name !== 'Seu nome' && !!content.profile.name.trim(), label: 'Nome real preenchido (não o texto de exemplo)', section: 'perfil' as const },
    { ok: !!content.profile.email, label: 'E-mail de contato adicionado', section: 'perfil' as const },
    { ok: !!content.profile.github || !!content.profile.linkedin, label: 'Pelo menos uma rede social', section: 'perfil' as const },
    { ok: content.projects.length > 0, label: 'Pelo menos um projeto publicado', section: 'projetos' as const },
    { ok: content.projects.every(project => project.github || project.live), label: 'Todos os projetos têm link (repositório ou online)', section: 'projetos' as const },
    { ok: content.toolkit.areas.every(area => area.tools.length > 0), label: 'Toda camada da stack tem ferramentas', section: 'stack' as const },
    { ok: content.experience.items.length > 0 && !content.experience.items.some(item => (item.role + item.company + item.description).includes('[')), label: 'Experiências preenchidas (sem textos de exemplo entre colchetes)', section: 'experiencia' as const },
  ];
  const done = checks.filter(check => check.ok).length;
  return <>
    <div className="adm-stats">
      <button onClick={() => go('projetos')}><FolderKanban size={18}/><b>{content.projects.length}</b><span>projetos</span></button>
      <button onClick={() => go('stack')}><Layers3 size={18}/><b>{content.toolkit.areas.length}</b><span>camadas de stack</span></button>
      <button onClick={() => go('stack')}><Wrench size={18}/><b>{tools}</b><span>ferramentas</span></button>
    </div>
    <Panel title="Saúde do conteúdo" description={`${done} de ${checks.length} itens concluídos`}>
      <div className="adm-progress"><span style={{ width: `${done / checks.length * 100}%` }}/></div>
      <ul className="adm-checks">{checks.map(check => <li key={check.label} className={check.ok ? 'ok' : ''}>{check.ok ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}<span>{check.label}</span>{!check.ok && <button className="adm-link" onClick={() => go(check.section)}>Resolver <ArrowRight size={13}/></button>}</li>)}</ul>
    </Panel>
    <Panel title="Como funciona" description="Conteúdo e imagens no Supabase">
      <p className="adm-note">O conteúdo fica salvo no <b>Supabase</b>. Ao clicar em <b>Salvar</b>, o site é regenerado na hora com as alterações. Imagens enviadas vão para o bucket <b>portfolio</b>, já otimizadas em WebP. Use <b>Exportar</b> para guardar um backup em JSON.</p>
    </Panel>
  </>;
}

export function ProfileEditor({ content, edit }: { content: SiteContent; edit: Edit }) {
  const profile = content.profile;
  const set = (key: keyof SiteContent['profile']) => (value: string) => edit(draft => { draft.profile[key] = value; });
  return <>
    <Panel title="Identidade" description="Aparece no cabeçalho, na seção Sobre e no rodapé.">
      <div className="adm-grid">
        <Field label="Nome" value={profile.name} onChange={set('name')}/>
        <Field label="Iniciais / logo" hint="Marca curta exibida no cabeçalho e no rodapé." value={profile.initials} onChange={set('initials')} mono/>
        <Field label="Cargo" value={profile.role} onChange={set('role')}/>
      </div>
    </Panel>
    <PortraitEditor profile={profile} edit={edit}/>
    <Panel title="Contato e redes" description="Campos vazios não geram botões no site.">
      <div className="adm-grid">
        <Field label="E-mail" type="email" value={profile.email} onChange={set('email')} placeholder="voce@email.com"/>
        <Field label="GitHub" type="url" value={profile.github} onChange={set('github')} placeholder="https://github.com/usuario"/>
        <Field label="LinkedIn" type="url" value={profile.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/usuario"/>
      </div>
    </Panel>
  </>;
}

export function TextsEditor({ content, edit }: { content: SiteContent; edit: Edit }) {
  const { hero, strip, about, projectsSection, toolkit, contact } = content;
  return <>
    <Panel title="Hero" description="Primeira dobra do site. Quebras de linha viram novas linhas no título.">
      <div className="adm-grid">
        <TextArea label="Título" rows={2} value={hero.title} onChange={value => edit(draft => { draft.hero.title = value; })}/>
        <TextArea label="Título em destaque" rows={2} value={hero.accent} onChange={value => edit(draft => { draft.hero.accent = value; })}/>
      </div>
      <TextArea label="Texto de apoio" value={hero.text} onChange={value => edit(draft => { draft.hero.text = value; })}/>
    </Panel>
    <Panel title="Faixa de tecnologias" description="Letreiro animado logo abaixo do hero.">
      <Field label="Rótulo" value={strip.label} onChange={value => edit(draft => { draft.strip.label = value; })}/>
      <Chips label="Tecnologias" hint="Separe por vírgula ou Enter. Backspace remove a última." values={strip.items} onChange={values => edit(draft => { draft.strip.items = values; })}/>
    </Panel>
    <Panel title="Sobre mim">
      <div className="adm-grid">
        <Field label="Título" value={about.title} onChange={value => edit(draft => { draft.about.title = value; })}/>
        <Field label="Título em destaque" value={about.accent} onChange={value => edit(draft => { draft.about.accent = value; })}/>
      </div>
      <Field label="Saudação" hint="Seguida do seu nome" value={about.intro} onChange={value => edit(draft => { draft.about.intro = value; })}/>
      <TextArea label="Texto principal" hint="As palavras acendem conforme o visitante rola a página." rows={4} value={about.text} onChange={value => edit(draft => { draft.about.text = value; })}/>
      <Field label="Texto gigante de fundo" hint="Tipografia vazada que desliza atrás da seção" value={about.marquee} onChange={value => edit(draft => { draft.about.marquee = value; })}/>
      <Chips label="Características" values={about.traits} onChange={values => edit(draft => { draft.about.traits = values; })}/>
      <div className="adm-subhead"><h3>Princípios</h3><button className="adm-btn ghost small" onClick={() => edit(draft => { draft.about.principles.push({ title: 'Novo princípio', text: '' }); })}><Plus size={14}/> Adicionar</button></div>
      <div className="adm-rows">{about.principles.map((principle, index) => <div className="adm-row" key={index}>
        <span className="adm-row-index">{String(index + 1).padStart(2, '0')}</span>
        <div className="adm-row-fields">
          <Field label="Título" value={principle.title} onChange={value => edit(draft => { draft.about.principles[index].title = value; })}/>
          <TextArea label="Descrição" rows={2} value={principle.text} onChange={value => edit(draft => { draft.about.principles[index].text = value; })}/>
        </div>
        <RowActions index={index} total={about.principles.length} label="princípio" onMove={(from, to) => edit(draft => { draft.about.principles = move(draft.about.principles, from, to); })} onRemove={() => edit(draft => { draft.about.principles.splice(index, 1); })}/>
      </div>)}</div>
    </Panel>
    <Panel title="Títulos das seções">
      <div className="adm-grid">
        <Field label="Projetos — título" value={projectsSection.title} onChange={value => edit(draft => { draft.projectsSection.title = value; })}/>
        <Field label="Projetos — destaque" value={projectsSection.accent} onChange={value => edit(draft => { draft.projectsSection.accent = value; })}/>
        <Field label="Toolkit — título" value={toolkit.title} onChange={value => edit(draft => { draft.toolkit.title = value; })}/>
        <Field label="Toolkit — destaque" value={toolkit.accent} onChange={value => edit(draft => { draft.toolkit.accent = value; })}/>
      </div>
      <TextArea label="Toolkit — texto lateral" rows={2} value={toolkit.text} onChange={value => edit(draft => { draft.toolkit.text = value; })}/>
    </Panel>
    <Panel title="Contato">
      <div className="adm-grid">
        <TextArea label="Título" rows={2} value={contact.title} onChange={value => edit(draft => { draft.contact.title = value; })}/>
        <Field label="Destaque" value={contact.accent} onChange={value => edit(draft => { draft.contact.accent = value; })}/>
      </div>
      <TextArea label="Texto" rows={2} value={contact.text} onChange={value => edit(draft => { draft.contact.text = value; })}/>
    </Panel>
  </>;
}

const newProject = (taken: string[]): Project => ({ id: uniqueId('novo-projeto', taken), title: 'Novo projeto', type: 'FULL STACK APPLICATION', category: 'FullStack', description: '', detail: '', tags: [], kind: 'workspace', github: '', live: '' });

export function ProjectsEditor({ content, edit }: { content: SiteContent; edit: Edit }) {
  const projects = content.projects;
  const [selectedId, setSelectedId] = useState(projects[0]?.id);
  const index = Math.max(0, projects.findIndex(project => project.id === selectedId));
  const project = projects[index];
  const categories = [...new Set(projects.map(item => item.category).filter(Boolean))];
  const set = <K extends keyof Project>(key: K) => (value: Project[K]) => edit(draft => { draft.projects[index][key] = value; });

  const add = () => { const item = newProject(projects.map(p => p.id)); edit(draft => { draft.projects.push(item); }); setSelectedId(item.id); };
  const duplicate = () => { const item = { ...structuredClone(project), id: uniqueId(project.id, projects.map(p => p.id)), title: `${project.title} (cópia)` }; edit(draft => { draft.projects.splice(index + 1, 0, item); }); setSelectedId(item.id); };
  const remove = () => {
    if (!confirm(`Remover o projeto "${project.title}"?`)) return;
    edit(draft => { draft.projects.splice(index, 1); });
    setSelectedId(projects[index + 1]?.id ?? projects[index - 1]?.id);
  };

  return <div className="adm-split">
    <aside className="adm-list">
      <div className="adm-list-head"><span>{projects.length} projetos</span><button className="adm-btn small" onClick={add}><Plus size={14}/> Novo</button></div>
      {projects.map((item, i) => <div key={item.id} className={`adm-list-item ${item.id === project?.id ? 'active' : ''}`}>
        <button className="adm-list-select" onClick={() => setSelectedId(item.id)}><span className="adm-list-index">{String(i + 1).padStart(2, '0')}</span><span><b>{item.title || 'Sem título'}</b><small>{item.category} · {item.tags.length} tags</small></span></button>
        <RowActions index={i} total={projects.length} label={item.title} onMove={(from, to) => edit(draft => { draft.projects = move(draft.projects, from, to); })} onRemove={() => { setSelectedId(item.id); if (confirm(`Remover o projeto "${item.title}"?`)) edit(draft => { draft.projects.splice(i, 1); }); }}/>
      </div>)}
      {!projects.length && <p className="adm-empty">Nenhum projeto ainda.</p>}
    </aside>
    {project ? <div className="adm-editor">
      <Panel title={project.title || 'Sem título'} description={`/${project.id}`} actions={<><button className="adm-btn ghost small" onClick={duplicate}><Copy size={14}/> Duplicar</button><button className="adm-btn danger small" onClick={remove}><Trash2 size={14}/> Remover</button></>}>
        <div className="adm-grid">
          <Field label="Título" value={project.title} onChange={set('title')}/>
          <Field label="Tipo" hint="Linha superior do capítulo, ex.: CYBERSECURITY" value={project.type} onChange={set('type')}/>
          <div className="adm-field"><label htmlFor="adm-category">Categoria</label><input id="adm-category" list="adm-categories" value={project.category} onChange={event => set('category')(event.target.value)}/><datalist id="adm-categories">{categories.map(category => <option key={category} value={category}/>)}</datalist><small>Vira um filtro na seção de projetos.</small></div>
          <Select label="Prévia visual" value={project.kind} options={previewKinds.map(kind => ({ value: kind, label: kindLabels[kind] }))} onChange={set('kind')}/>
        </div>
        <ImageField label="Capa do projeto" folder="projetos" value={project.image ?? ''} onChange={set('image')} previewStyle={{ aspectRatio: '16 / 10' }} hint="Opcional. Sem capa, o site mostra a prévia ilustrada escolhida acima."/>
        <TextArea label="Descrição curta" rows={2} value={project.description} onChange={set('description')}/>
        <TextArea label="Detalhes (modal)" rows={4} value={project.detail} onChange={set('detail')}/>
        <Chips label="Tecnologias" values={project.tags} onChange={set('tags')}/>
        <div className="adm-grid">
          <Field label="Repositório" type="url" value={project.github} onChange={set('github')} placeholder="https://github.com/..."/>
          <Field label="Link online" type="url" value={project.live} onChange={set('live')} placeholder="https://..."/>
        </div>
      </Panel>
    </div> : <div className="adm-editor"><Panel title="Sem projetos"><button className="adm-btn" onClick={add}><Plus size={14}/> Criar primeiro projeto</button></Panel></div>}
  </div>;
}

const newArea = (taken: string[]): StackArea => ({ id: uniqueId('nova-camada', taken), name: 'Nova camada', label: 'Descrição curta', icon: 'cpu', color: '#66c9ff', subtitle: 'Um subtítulo marcante.', description: '', tools: [{ name: 'Ferramenta', description: 'Para que serve', mark: 'Fr' }], file: 'arquivo.ts', code: '' });

export function StackEditor({ content, edit }: { content: SiteContent; edit: Edit }) {
  const areas = content.toolkit.areas;
  const [selectedId, setSelectedId] = useState(areas[0]?.id);
  const [showCode, setShowCode] = useState(true);
  const index = Math.max(0, areas.findIndex(area => area.id === selectedId));
  const area = areas[index];
  const set = <K extends keyof StackArea>(key: K) => (value: StackArea[K]) => edit(draft => { draft.toolkit.areas[index][key] = value; });
  const add = () => { const item = newArea(areas.map(a => a.id)); edit(draft => { draft.toolkit.areas.push(item); }); setSelectedId(item.id); };

  return <div className="adm-split">
    <aside className="adm-list">
      <div className="adm-list-head"><span>{areas.length} camadas</span><button className="adm-btn small" onClick={add}><Plus size={14}/> Nova</button></div>
      {areas.map((item, i) => <div key={item.id} className={`adm-list-item ${item.id === area?.id ? 'active' : ''}`} style={{ '--c': item.color } as CSSProperties}>
        <button className="adm-list-select" onClick={() => setSelectedId(item.id)}><span className="adm-list-icon"><AreaIcon name={item.icon} size={15}/></span><span><b>{item.name || 'Sem nome'}</b><small>{item.tools.length} ferramentas</small></span></button>
        <RowActions index={i} total={areas.length} label={item.name} onMove={(from, to) => edit(draft => { draft.toolkit.areas = move(draft.toolkit.areas, from, to); })} onRemove={() => { if (areas.length > 1 && confirm(`Remover a camada "${item.name}"?`)) edit(draft => { draft.toolkit.areas.splice(i, 1); }); }}/>
      </div>)}
      <p className="adm-empty">A ordem aqui é a ordem das camadas no 3D (a primeira fica no topo).</p>
    </aside>
    {area && <div className="adm-editor">
      <Panel title={area.name || 'Sem nome'} description="Camada do toolkit">
        <div className="adm-grid">
          <Field label="Nome" value={area.name} onChange={set('name')}/>
          <Field label="Rótulo" value={area.label} onChange={set('label')}/>
          <ColorField label="Cor" value={area.color} onChange={set('color')}/>
          <div className="adm-field"><span className="adm-label">Ícone</span><div className="adm-icons" role="radiogroup" aria-label="Ícone">{areaIcons.map(icon => <button key={icon} role="radio" aria-checked={area.icon === icon} title={iconLabels[icon]} className={area.icon === icon ? 'active' : ''} onClick={() => set('icon')(icon)}><AreaIcon name={icon} size={17}/></button>)}</div><small>O ícone de escudo ativa o efeito de varredura de segurança.</small></div>
        </div>
        <Field label="Subtítulo" value={area.subtitle} onChange={set('subtitle')}/>
        <TextArea label="Descrição" rows={3} value={area.description} onChange={set('description')}/>
      </Panel>
      <Panel title="Ferramentas" description="As 4 primeiras aparecem como blocos na camada 3D." actions={<button className="adm-btn small" onClick={() => edit(draft => { draft.toolkit.areas[index].tools.push({ name: '', description: '', mark: '' }); })}><Plus size={14}/> Ferramenta</button>}>
        <div className="adm-rows">{area.tools.map((tool, toolIndex) => <div className="adm-row tool" key={toolIndex}>
          <span className="adm-mark" style={{ color: area.color }}>{tool.mark || '—'}</span>
          <div className="adm-row-fields three">
            <Field label="Nome" value={tool.name} onChange={value => edit(draft => { draft.toolkit.areas[index].tools[toolIndex].name = value; })}/>
            <Field label="Descrição" value={tool.description} onChange={value => edit(draft => { draft.toolkit.areas[index].tools[toolIndex].description = value; })}/>
            <Field label="Sigla" value={tool.mark} mono onChange={value => edit(draft => { draft.toolkit.areas[index].tools[toolIndex].mark = value.slice(0, 4); })}/>
          </div>
          <RowActions index={toolIndex} total={area.tools.length} label={tool.name || 'ferramenta'} onMove={(from, to) => edit(draft => { draft.toolkit.areas[index].tools = move(draft.toolkit.areas[index].tools, from, to); })} onRemove={() => edit(draft => { draft.toolkit.areas[index].tools.splice(toolIndex, 1); })}/>
        </div>)}</div>
      </Panel>
      <Panel title="Conceito em código" description="Snippet exibido abaixo das ferramentas. Deixe vazio para ocultar." actions={<button className="adm-btn ghost small" onClick={() => setShowCode(!showCode)}>{showCode ? <EyeOff size={14}/> : <Eye size={14}/>} {showCode ? 'Recolher' : 'Expandir'}</button>}>
        {showCode && <><Field label="Nome do arquivo" value={area.file} mono onChange={set('file')}/><TextArea label="Código" rows={6} mono value={area.code} onChange={set('code')}/></>}
      </Panel>
    </div>}
  </div>;
}

const newExperience = (taken: string[]): Experience => ({ id: uniqueId('nova-experiencia', taken), role: 'Novo cargo', company: '[Empresa]', period: '2025 — atual', type: 'Emprego', location: 'Remoto', current: false, description: '', highlights: [], tags: [], link: '' });

export function ExperienceEditor({ content, edit }: { content: SiteContent; edit: Edit }) {
  const section = content.experience;
  const items = section.items;
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const index = Math.max(0, items.findIndex(item => item.id === selectedId));
  const item = items[index];
  const types = [...new Set(['Emprego', 'Estágio', 'Freelance', 'Formação', 'Voluntário', ...items.map(entry => entry.type).filter(Boolean)])];
  const set = <K extends keyof Experience>(key: K) => (value: Experience[K]) => edit(draft => { draft.experience.items[index][key] = value; });
  const add = () => { const entry = newExperience(items.map(i => i.id)); edit(draft => { draft.experience.items.unshift(entry); }); setSelectedId(entry.id); };
  const duplicate = () => { const entry = { ...structuredClone(item), id: uniqueId(item.id, items.map(i => i.id)), role: `${item.role} (cópia)` }; edit(draft => { draft.experience.items.splice(index + 1, 0, entry); }); setSelectedId(entry.id); };
  const remove = (at: number) => {
    const target = items[at];
    if (!confirm(`Remover a experiência "${target.role}"?`)) return;
    edit(draft => { draft.experience.items.splice(at, 1); });
    setSelectedId(items[at + 1]?.id ?? items[at - 1]?.id);
  };

  return <>
    <Panel title="Cabeçalho da seção" description="Título exibido antes da linha do tempo.">
      <div className="adm-grid">
        <Field label="Título" value={section.title} onChange={value => edit(draft => { draft.experience.title = value; })}/>
        <Field label="Título em destaque" hint="Aparece em itálico" value={section.accent} onChange={value => edit(draft => { draft.experience.accent = value; })}/>
      </div>
      <TextArea label="Texto lateral" rows={2} value={section.text} onChange={value => edit(draft => { draft.experience.text = value; })}/>
    </Panel>
    <div className="adm-split">
      <aside className="adm-list">
        <div className="adm-list-head"><span>{items.length} experiências</span><button className="adm-btn small" onClick={add}><Plus size={14}/> Nova</button></div>
        {items.map((entry, i) => <div key={entry.id} className={`adm-list-item ${entry.id === item?.id ? 'active' : ''}`}>
          <button className="adm-list-select" onClick={() => setSelectedId(entry.id)}><span className="adm-list-index">{String(i + 1).padStart(2, '0')}</span><span><b>{entry.role || 'Sem cargo'}</b><small>{entry.company} · {entry.period}</small></span></button>
          <RowActions index={i} total={items.length} label={entry.role} onMove={(from, to) => edit(draft => { draft.experience.items = move(draft.experience.items, from, to); })} onRemove={() => remove(i)}/>
        </div>)}
        <p className="adm-empty">{items.length ? 'A ordem aqui é a ordem da linha do tempo. Coloque a mais recente primeiro.' : 'Nenhuma experiência ainda — a seção fica oculta no site.'}</p>
      </aside>
      {item ? <div className="adm-editor">
        <Panel title={item.role || 'Sem cargo'} description={`${item.company} · ${item.period}`} actions={<><button className="adm-btn ghost small" onClick={duplicate}><Copy size={14}/> Duplicar</button><button className="adm-btn danger small" onClick={() => remove(index)}><Trash2 size={14}/> Remover</button></>}>
          <div className="adm-grid">
            <Field label="Cargo / título" value={item.role} onChange={set('role')}/>
            <Field label="Empresa / instituição" value={item.company} onChange={set('company')}/>
            <Field label="Período" hint="Ex.: 2023 — 2024 ou 2024 — atual" value={item.period} onChange={set('period')}/>
            <div className="adm-field"><label htmlFor="adm-xp-type">Tipo</label><input id="adm-xp-type" list="adm-xp-types" value={item.type} onChange={event => set('type')(event.target.value)}/><datalist id="adm-xp-types">{types.map(type => <option key={type} value={type}/>)}</datalist></div>
            <Field label="Local" value={item.location} onChange={set('location')} placeholder="Remoto, São Paulo…"/>
            <div className="adm-field"><span className="adm-label">Situação</span><label className="adm-toggle"><input type="checkbox" checked={item.current} onChange={event => set('current')(event.target.checked)}/><span/>{item.current ? 'Posição atual (selo "Atual")' : 'Encerrada'}</label></div>
          </div>
          <TextArea label="Descrição" rows={3} value={item.description} onChange={set('description')}/>
          <Chips label="Destaques" hint="Conquistas e entregas. Aparecem em sequência quando o card fica em foco." values={item.highlights} split={false} onChange={set('highlights')} placeholder="Digite uma conquista e pressione Enter"/>
          <Chips label="Tecnologias" values={item.tags} onChange={set('tags')}/>
          <Field label="Link (opcional)" type="url" value={item.link} onChange={set('link')} placeholder="https://… (site da empresa, certificado, artigo)"/>
        </Panel>
      </div> : <div className="adm-editor"><Panel title="Sem experiências"><button className="adm-btn" onClick={add}><Plus size={14}/> Adicionar primeira experiência</button></Panel></div>}
    </div>
  </>;
}
