-- Adiciona coluna `discovered` ao roadmap_snapshot.
-- Guarda o mapa de issues descobertas via JQL por label:
--   { "Setembro/segmentador": [{ "key": "POS-4504", "title": "..." }], ... }
-- A Edge Function grava aqui; o front-end mescla com as issues estáticas.
alter table public.roadmap_snapshot
  add column if not exists discovered jsonb not null default '{}'::jsonb;
