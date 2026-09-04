-- Armazena as prioridades das hipóteses definidas pela equipe.
-- Escrita direta pelo front-end via anon key (sem Edge Function).
create table if not exists public.hypothesis_priorities (
  hyp_id     text primary key,
  priority   text not null,
  updated_at timestamptz not null default now()
);

alter table public.hypothesis_priorities enable row level security;

-- Leitura e escrita abertas para a anon key (app interno sem auth).
create policy "anon read"  on public.hypothesis_priorities for select using (true);
create policy "anon write" on public.hypothesis_priorities for all    using (true) with check (true);
