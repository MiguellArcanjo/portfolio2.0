'use client';

import { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { LayoutDashboard, UserRound, Type, FolderKanban, Layers3, BriefcaseBusiness, Save, RotateCcw, Download, Upload, ExternalLink, MonitorSmartphone, Undo2, CheckCircle2, Menu, X, LogOut, DatabaseZap, Languages, RefreshCw } from 'lucide-react';
import { defaultContent, type SiteContent } from '@/lib/content';
import { loadContent, loadTranslatedFromPortuguese, saveContent, resetContent, parseContent, serializeContent, readLegacyContent, clearLegacyContent } from '@/lib/content-store';
import { locales, defaultLocale, localeLabels, localePath, type Locale } from '@/lib/locales';
import { createClient } from '@/lib/supabase/client';
import { Dashboard, ProfileEditor, TextsEditor, ProjectsEditor, StackEditor, ExperienceEditor, type SectionId } from '@/components/admin/editors';
import { Login } from '@/components/admin/login';

const sections: { id: SectionId; label: string; icon: typeof Type; description: string }[] = [
  { id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard, description: 'Resumo e pendências do conteúdo.' },
  { id: 'perfil', label: 'Perfil & contato', icon: UserRound, description: 'Nome, cargo, e-mail e redes.' },
  { id: 'textos', label: 'Textos do site', icon: Type, description: 'Hero, sobre, títulos e contato.' },
  { id: 'projetos', label: 'Projetos', icon: FolderKanban, description: 'Adicione, edite, ordene e remova projetos.' },
  { id: 'stack', label: 'Stack', icon: Layers3, description: 'Camadas, ferramentas e snippets do toolkit.' },
  { id: 'experiencia', label: 'Experiência', icon: BriefcaseBusiness, description: 'Trajetória: empregos, estágios, freelas e formação.' },
];

// Auth gate: the editor only mounts with a Supabase session; RLS enforces the same rule on the database.
export default function Admin() {
  const [session, setSession] = useState<Session | null | 'loading'>('loading');
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => subscription.unsubscribe();
  }, []);
  if (session === 'loading') return <div className="adm-login"><p className="adm-empty">Verificando sessão…</p></div>;
  if (!session) return <Login/>;
  return <Editor email={session.user.email ?? ''}/>;
}

function Editor({ email }: { email: string }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [published, setPublished] = useState(true);
  const [saved, setSaved] = useState<SiteContent>(defaultContent);
  const [draft, setDraft] = useState<SiteContent>(defaultContent);
  const [section, setSection] = useState<SectionId>('dashboard');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [preview, setPreview] = useState(false);
  const [nav, setNav] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [legacy, setLegacy] = useState<SiteContent | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const dirty = ready && JSON.stringify(draft) !== JSON.stringify(saved);

  // Each language is loaded on its own. An unpublished language starts dirty-free from the pre-translated
  // Portuguese content, exactly what the public site shows until it is saved.
  useEffect(() => {
    setReady(false); setLoadError('');
    loadContent(locale)
      .then(({ content, published }) => { setSaved(content); setDraft(content); setPublished(published); setReady(true); if (locale === defaultLocale) setLegacy(readLegacyContent()); })
      .catch((error: Error) => setLoadError(/site_content/.test(error.message) ? 'A tabela site_content ainda não existe. Rode o arquivo supabase/schema.sql no SQL Editor do Supabase.' : error.message));
  }, [locale]);

  useEffect(() => {
    const fromHash = () => { const id = location.hash.slice(1) as SectionId; if (sections.some(item => item.id === id)) setSection(id); };
    fromHash(); window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const edit = (recipe: (draft: SiteContent) => void) => setDraft(current => { const next = structuredClone(current); recipe(next); return next; });
  const go = (id: SectionId) => { setSection(id); setNav(false); history.replaceState(null, '', `#${id}`); };

  const save = async () => {
    setStatus('saving');
    setSaveError('');
    try { const content = await saveContent(draft, locale); setSaved(content); setDraft(content); setPublished(true); setStatus('saved'); frame.current?.contentWindow?.location.reload(); setTimeout(() => setStatus('idle'), 2200); }
    catch (error) { setStatus('error'); setSaveError(error instanceof Error ? error.message : 'Erro ao salvar.'); }
  };
  const restore = async () => {
    if (!confirm(`Restaurar o conteúdo em ${localeLabels[locale].name} para o padrão? O que está publicado nesse idioma será substituído.`)) return;
    try { const content = await resetContent(locale); setSaved(content); setDraft(content); setPublished(true); frame.current?.contentWindow?.location.reload(); }
    catch (error) { setStatus('error'); setSaveError(error instanceof Error ? error.message : 'Erro ao restaurar.'); }
  };
  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    if (dirty && !confirm(`Há alterações não salvas em ${localeLabels[locale].name}. Trocar de idioma e descartá-las?`)) return;
    setStatus('idle'); setSaveError(''); setLocale(next);
  };
  const realign = async () => {
    if (!confirm(`Substituir o rascunho em ${localeLabels[locale].name} por uma nova cópia do português pré-traduzida? Nada é publicado até você clicar em Salvar.`)) return;
    try { setDraft(await loadTranslatedFromPortuguese(locale)); } catch (error) { setStatus('error'); setSaveError(error instanceof Error ? error.message : 'Erro ao carregar o português.'); }
  };
  const importLegacy = () => { if (legacy) setDraft(legacy); clearLegacyContent(); setLegacy(null); };
  const dismissLegacy = () => { clearLegacyContent(); setLegacy(null); };
  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([serializeContent(draft, locale)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `portfolio-conteudo-${locale}-${new Date().toISOString().slice(0, 10)}.json`; link.click();
    URL.revokeObjectURL(url);
  };
  const importJson = async (selected?: File) => {
    if (!selected) return;
    try {
      const imported = parseContent(await selected.text());
      if (imported.locale && imported.locale !== locale) {
        alert(`Este arquivo é da versão em ${localeLabels[imported.locale].name}, mas o painel está editando ${localeLabels[locale].name}.\n\nSelecione ${localeLabels[imported.locale].short} no topo do painel e importe de novo.`);
      } else if (confirm(`Substituir o rascunho em ${localeLabels[locale].name} pelo conteúdo de "${selected.name}"? Nada é publicado até você clicar em Salvar.`)) {
        setDraft(imported.content);
      }
    }
    catch { alert('Arquivo inválido. Use um JSON exportado por este painel.'); }
    if (file.current) file.current.value = '';
  };

  const current = sections.find(item => item.id === section)!;
  const editors = { dashboard: <Dashboard content={draft} go={go}/>, perfil: <ProfileEditor content={draft} edit={edit}/>, textos: <TextsEditor content={draft} edit={edit}/>, projetos: <ProjectsEditor content={draft} edit={edit}/>, stack: <StackEditor content={draft} edit={edit}/>, experiencia: <ExperienceEditor content={draft} edit={edit}/> };

  return <div className={`adm ${preview ? 'with-preview' : ''} ${nav ? 'nav-open' : ''}`}>
    <aside className="adm-sidebar">
      <a href="/" className="adm-brand"><span>&lt;</span>{draft.profile.initials}<span>/&gt;</span><small>painel</small></a>
      <nav aria-label="Seções do painel">{sections.map(item => <a key={item.id} href={`#${item.id}`} aria-current={section === item.id ? 'page' : undefined} onClick={event => { event.preventDefault(); go(item.id); }}><item.icon size={17}/>{item.label}</a>)}</nav>
      <div className="adm-sidebar-foot">
        <button className="adm-side-btn" onClick={exportJson}><Download size={15}/> Exportar JSON</button>
        <button className="adm-side-btn" onClick={() => file.current?.click()}><Upload size={15}/> Importar JSON</button>
        <input ref={file} type="file" accept="application/json" hidden onChange={event => importJson(event.target.files?.[0])}/>
        <button className="adm-side-btn danger" onClick={restore}><RotateCcw size={15}/> Restaurar padrão</button>
        <p className="adm-user" title={email}><i/> {email}</p>
        <button className="adm-side-btn" onClick={() => createClient().auth.signOut()}><LogOut size={15}/> Sair</button>
      </div>
    </aside>
    <div className="adm-main">
      <header className="adm-topbar">
        <button className="adm-icon adm-menu" aria-label={nav ? 'Fechar menu' : 'Abrir menu'} onClick={() => setNav(!nav)}>{nav ? <X size={18}/> : <Menu size={18}/>}</button>
        <div className="adm-title"><h1>{current.label}</h1><p>{current.description}</p></div>
        <div className="adm-locale" role="radiogroup" aria-label="Idioma do conteúdo"><Languages size={15}/>{locales.map(code => <button key={code} role="radio" aria-checked={code === locale} title={localeLabels[code].name} onClick={() => switchLocale(code)}>{localeLabels[code].short}</button>)}</div>
        <div className="adm-top-actions">
          <span className={`adm-state ${dirty ? 'dirty' : ''}`} role="status">{status === 'saving' ? 'Salvando…' : status === 'saved' ? <><CheckCircle2 size={14}/> Salvo</> : status === 'error' ? `Erro: ${saveError}` : dirty ? 'Alterações não salvas' : !published ? 'Ainda não publicado' : saved.updatedAt ? `Salvo ${new Date(saved.updatedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}` : 'Conteúdo padrão'}</span>
          <button className="adm-btn ghost" disabled={!dirty} onClick={() => setDraft(saved)}><Undo2 size={15}/> Descartar</button>
          <button className="adm-btn ghost adm-preview-toggle" aria-pressed={preview} onClick={() => setPreview(!preview)}><MonitorSmartphone size={15}/> Prévia</button>
          <a className="adm-btn ghost" href={localePath(locale)} target="_blank" rel="noopener"><ExternalLink size={15}/> Ver site</a>
          <button className="adm-btn primary" disabled={(!dirty && published) || status === 'saving'} onClick={save}><Save size={15}/> {published ? 'Salvar' : 'Publicar'}</button>
        </div>
      </header>
      <div className="adm-body">
        <main className="adm-content adm-scroll" key={section + locale}>
          {!published && locale !== defaultLocale && ready && <div className="adm-banner"><Languages size={18}/><p>A versão em <b>{localeLabels[locale].name}</b> ainda não foi publicada. O site mostra hoje o português com tradução automática, que é o rascunho abaixo. Revise os textos e clique em <b>Publicar</b>.</p></div>}
          {published && locale !== defaultLocale && ready && <div className="adm-banner subtle"><Languages size={18}/><p>Editando a versão em <b>{localeLabels[locale].name}</b>. Cada idioma tem conteúdo próprio: projetos ou experiências adicionados em português precisam ser adicionados aqui também.</p><button className="adm-btn small ghost" onClick={realign}><RefreshCw size={14}/> Recriar a partir do português</button></div>}
          {legacy && locale === defaultLocale && <div className="adm-banner"><DatabaseZap size={18}/><p>Encontramos conteúdo salvo neste navegador pela versão de demonstração. Quer trazê-lo para o rascunho? Depois é só clicar em <b>Salvar</b> para publicar no banco.</p><button className="adm-btn small primary" onClick={importLegacy}>Importar</button><button className="adm-btn small ghost" onClick={dismissLegacy}>Descartar</button></div>}
          {loadError ? <div className="adm-banner error"><p>{loadError}</p></div> : ready ? editors[section] : <p className="adm-empty">Carregando conteúdo…</p>}
        </main>
        {preview && <aside className="adm-preview"><div className="adm-preview-bar"><span>Prévia · reflete o que está salvo</span></div><iframe ref={frame} key={locale} src={localePath(locale)} title="Prévia do site"/></aside>}
      </div>
    </div>
    <button className="adm-scrim" aria-label="Fechar menu" tabIndex={-1} onClick={() => setNav(false)}/>
  </div>;
}
