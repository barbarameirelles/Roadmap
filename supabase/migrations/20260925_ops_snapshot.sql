-- Tabela para o snapshot ao vivo dos tickets operacionais (Sys-Ops)
-- Preenchida pela Edge Function sync-jira (Fase 3).
-- Cada sync insere uma nova linha; o frontend lê a mais recente.

create table if not exists public.ops_snapshot (
  id          bigint generated always as identity primary key,
  synced_at   timestamptz default now(),
  smb         jsonb,
  plataforma  jsonb
);

alter table public.ops_snapshot enable row level security;

create policy "anon read ops_snapshot"
  on public.ops_snapshot for select using (true);
