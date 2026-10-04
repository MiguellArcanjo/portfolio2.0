<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Portfólio do Miguel Arcanjo — guia para agentes

Next.js 16 (App Router, Turbopack, `proxy.ts`), React 19, TypeScript. Conteúdo no Supabase (tabela `site_content`, linhas `main` = PT, `en`, `es`), editado em `/admin`. Interface e textos em português do Brasil; código e comentários em inglês, curtos, explicando o porquê. **O dono pede commit + push ao fim de cada entrega** (`git push` na `main`). Não commitar `.claude/`, `artifacts/`, `imagens/`, `traducoes/` (as duas últimas estão no `.gitignore`).

## Mapa rápido

- `components/home.tsx` — home (layout "folio", estilos em `app/folio.css`). Seções: `drawn-name.tsx` (nome desenhado), `folio-about.tsx`, `folio-stack.tsx`, `folio-experience.tsx`, `folio-contact.tsx` (contato + rodapé), `folio-header.tsx` (barra fixa).
- `components/project-page.tsx` — página interna `/projetos/[id]` (PT) e `/en|es/projetos/[id]`.
- `lib/content.ts` — modelo `SiteContent`/`Project` e conteúdo padrão; `lib/content-merge.ts` completa campos novos em conteúdo antigo.
- `components/admin/editors.tsx` — editores do `/admin` (`ProjectsEditor`, etc.); campos em `components/admin/fields.tsx`, upload em `image-field.tsx` (bucket `portfolio`).
- **Rotas**: um layout raiz por idioma para o `<html lang>` sair certo do servidor — `app/(pt)/` (home, `projetos/`, `admin/`), `app/en/`, `app/es/`, todos usando `components/root-document.tsx` (fontes e metadados base). Não existe `app/layout.tsx`; URLs inexistentes caem em `app/global-not-found.tsx` (flag `experimental.globalNotFound` no `next.config.ts`). Em `revalidatePath`, as rotas PT levam o grupo: `/(pt)/projetos/[id]`.
- **SEO**: `lib/seo.ts` (títulos/descrições por idioma, JSON-LD de pessoa e de projeto), `app/sitemap.ts`, `app/robots.ts`, imagens de compartilhamento em `opengraph-image.tsx` de cada idioma/projeto (desenho em `lib/og-image.tsx`). Em produção, `NEXT_PUBLIC_SITE_URL` precisa apontar para o domínio final.
- Para testar sem o painel: `npm run dev` (porta 3000). Prints/testes de navegador foram feitos com Edge headless via CDP (script de rascunho, fora do repo).

## Reestruturação da seção de projetos (feita em 02/10/2026)

Pedido do dono, com referências (lista de serviços em acordeão e o case "Workhub" do portfólio do Marcos Cunha):

- **Home**: `components/project-accordion.tsx`. Cada projeto é uma linha que abre no hover (com intenção de 140 ms), no foco ou no toque; à esquerda tipo/status, descrição, `metrics`, tecnologias e "Ver projeto"; à direita uma cena animada (`components/project-scenes.tsx`), montada só depois que a linha abre.
- **Cenas**: receita "cartão da marca com ilustração SVG + telas reais em molduras + cartões flutuantes". Chaves em `projectScenes` (`lib/content.ts`): `rental` (Domu), `call` (Apart), `chat` (Flaviano), `gallery` (Rayssa), `checklist` (To-do Live), `auto` (capa em movimento, para projetos novos). As telas vêm de `project.gallery[i]` com fallback para `public/galeria/<id>/NN.webp`; a ordem esperada das galerias está no próprio componente.
- **Página interna**: `components/project-page.tsx` com seções (`/O problema`, `/Descoberta` + "O que isso me ensinou", `/A solução` em `Instrument_Serif` itálico, `/Decisões`, `/Galeria` com visor em `components/project-gallery.tsx`, `/Tecnologias`). Seções vazias somem; sem os campos novos, mostra o `detail` antigo.
- **Modelo**: `Project` ganhou `scene, role, status, year, metrics, problem, discovery, learnings, solution, decisions, gallery` (`projectCaseDefaults`, completados por `content-merge.ts`). Admin: `CaseStudyEditor` em `components/admin/editors.tsx`.
- **CSS**: classes `pj-`, `sc-` e `case-` no fim de `app/folio.css`. As regras antigas `.work-*` não são mais usadas e podem ser apagadas.
- **Conteúdo**: arquivos de importação `traducoes/{pt,en,es}-estudos-de-caso.json` (fora do git) com os campos novos dos 5 projetos. **O dono precisa importar cada um em /admin (idioma certo no topo) e publicar**; até lá o site publicado mostra a capa em movimento (`auto`) e o texto antigo.

### Também pendente (pedidos anteriores)

- **Auditoria de segurança do Apart** como projeto do portfólio. Projeto em `C:\Users\conta\Desktop\Apart` (Electron + Appwrite + LiveKit); leia `Apart/AGENTS.md`. Não ler `.env`.
  - Feito (04/10/2026): relatório `Apart/docs/auditoria-seguranca.md` (8 achados: 1 alto, 3 médios, 3 baixos, 1 informativo) e correções na branch `fix/security-audit` do Apart (commit `a4ec8ab`, já no GitHub; testes em `scripts/test-security.mjs`). A versão em uso é a 0.7.2, mas o código dela não está no repositório (que para na 0.7.0): o dono precisa juntar a branch com a 0.7.2, rodar `npm run setup-db` e publicar.
  - Falta: o projeto no portfólio (textos PT/EN/ES com os campos de estudo de caso, cena, galeria e capa), gerado a partir das linhas publicadas mais recentes. Não publicar detalhes de como explorar cada falha; contar o processo (escopo, achados por gravidade, correções, testes).
- Arquivos de importação já entregues ao dono: `traducoes/*-com-domu.json` (Domu) e capas em `imagens/cover-domu-*.png`. O Domu é feito em dupla com Marcos Lima; o dono ainda vai confirmar a divisão de papéis descrita no texto.
