-- Iniciativas Omni · sync ao vivo com o GitLab
-- Cada clique em "Sincronizar" (Edge Function sync-gitlab) grava o resultado
-- completo da leitura do GitLab; o front lê a linha mais recente.

create table if not exists public.omni_snapshot (
  id         bigint      generated always as identity primary key,
  synced_at  timestamptz not null default now(),
  data       jsonb       not null,                       -- OmniData (iniciativas, hipóteses, suporte)
  summary    jsonb       not null default '{}'::jsonb    -- contagens do sync
);
comment on table public.omni_snapshot is 'Sync do GitLab da área Omni. A app lê: order by synced_at desc limit 1.';

create index if not exists omni_snapshot_synced_at_idx on public.omni_snapshot (synced_at desc);

alter table public.omni_snapshot enable row level security;

-- leitura pública; escrita só pela Edge Function (service_role ignora RLS)
drop policy if exists omni_snapshot_read on public.omni_snapshot;
create policy omni_snapshot_read on public.omni_snapshot for select using (true);
