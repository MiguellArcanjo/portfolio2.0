-- Conteúdo do portfólio: uma única linha ('main') com todo o conteúdo em JSON.
-- Pode ser executado mais de uma vez sem erro.
create table if not exists public.site_content (
  id text primary key default 'main',
  content jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.site_content enable row level security;

-- Permissões de acesso pela API (projetos novos não concedem automaticamente).
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;

-- Leitura pública: o site precisa ler o conteúdo sem login.
drop policy if exists "site_content: leitura pública" on public.site_content;
create policy "site_content: leitura pública"
on public.site_content for select
using (true);

-- Escrita só para usuário logado (você, no /admin). Desative novos cadastros no Auth.
drop policy if exists "site_content: inserir autenticado" on public.site_content;
create policy "site_content: inserir autenticado"
on public.site_content for insert to authenticated
with check (true);

drop policy if exists "site_content: atualizar autenticado" on public.site_content;
create policy "site_content: atualizar autenticado"
on public.site_content for update to authenticated
using (true) with check (true);

-- Faz a API enxergar a tabela imediatamente.
notify pgrst, 'reload schema';
