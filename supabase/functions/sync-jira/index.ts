// Supabase Edge Function: sync-jira
// ----------------------------------------------------------------------------
// Consulta o status atual de cada issue no Jira e grava um "mapa de status"
// { key: { status, blocked } } na tabela roadmap_snapshot. O front-end sobrepõe
// esse mapa na estrutura (que vive no código) e calcula % = Done/total.
//
// Secrets necessários (Supabase → Edge Functions → Secrets):
//   JIRA_EMAIL     e-mail da conta Atlassian (dona do token)
//   JIRA_TOKEN     API token do Jira (id.atlassian.com → Security → API tokens)
//   JIRA_BASE_URL  https://wake-experience.atlassian.net
// (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são injetados automaticamente.)
//
// Segurança: sem login. A função só LÊ do Jira e grava o snapshot (idempotente,
// não-destrutivo). Trava de rajada: ignora chamadas < MIN_INTERVAL_S do último sync.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import KEYS from "./keys.json" with { type: "json" };

const MIN_INTERVAL_S = 60; // trava anti-rajada / rate-limit do Jira
const BATCH = 90;          // keys por consulta JQL

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Mapped = { status: "Done" | "In Progress" | "To Do"; blocked: boolean };

function mapStatus(name: string): Mapped {
  const n = (name ?? "").trim().toUpperCase();
  if (n === "CONCLUÍDO" || n === "CANCELADO" || n === "READY TO DEPLOY")
    return { status: "Done", blocked: false };
  if (n === "BLOQUEADO" || n === "BLOCKED")
    return { status: "To Do", blocked: true };
  if (n === "TAREFA PENDENTE" || n === "TAREFAS PENDENTES")
    return { status: "To Do", blocked: false };
  // EM ANDAMENTO, VALIDATION, HOMOLOGATION, CODE REVIEW, QA IN PROGRESS, etc.
  return { status: "In Progress", blocked: false };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const JIRA_EMAIL = Deno.env.get("JIRA_EMAIL");
  const JIRA_TOKEN = Deno.env.get("JIRA_TOKEN");
  const JIRA_BASE = Deno.env.get("JIRA_BASE_URL");

  if (!JIRA_EMAIL || !JIRA_TOKEN || !JIRA_BASE) {
    return json({ error: "Faltam secrets: JIRA_EMAIL, JIRA_TOKEN, JIRA_BASE_URL" }, 500);
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  // ── trava anti-rajada ──────────────────────────────────────────────────────
  const { data: last } = await db
    .from("roadmap_snapshot")
    .select("synced_at, summary")
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (last) {
    const ageS = (Date.now() - new Date(last.synced_at).getTime()) / 1000;
    if (ageS < MIN_INTERVAL_S) {
      return json({
        throttled: true,
        message: `Sync recente há ${Math.round(ageS)}s. Aguarde ${MIN_INTERVAL_S - Math.round(ageS)}s.`,
        synced_at: last.synced_at,
        summary: last.summary,
      });
    }
  }

  // ── consulta o Jira em lotes ───────────────────────────────────────────────
  const auth = "Basic " + btoa(`${JIRA_EMAIL}:${JIRA_TOKEN}`);
  const statuses: Record<string, Mapped> = {};
  const missing: string[] = [];
  const keys: string[] = KEYS as string[];

  for (let i = 0; i < keys.length; i += BATCH) {
    const batch = keys.slice(i, i + BATCH);
    const jql = `key in (${batch.join(",")})`;
    let nextPageToken: string | undefined = undefined;

    do {
      const res = await fetch(`${JIRA_BASE}/rest/api/3/search/jql`, {
        method: "POST",
        headers: { Authorization: auth, "content-type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ jql, fields: ["status"], maxResults: 100, nextPageToken }),
      });
      if (!res.ok) {
        const text = await res.text();
        return json({ error: "Falha ao consultar o Jira", status: res.status, detail: text.slice(0, 500) }, 502);
      }
      const data = await res.json();
      for (const issue of data.issues ?? []) {
        statuses[issue.key] = mapStatus(issue.fields?.status?.name ?? "");
      }
      nextPageToken = data.isLast === false ? data.nextPageToken : undefined;
    } while (nextPageToken);
  }

  // keys que o Jira não retornou (deletadas/movidas) — o front mantém o último status conhecido
  for (const k of keys) if (!(k in statuses)) missing.push(k);

  // ── contadores ─────────────────────────────────────────────────────────────
  const vals = Object.values(statuses);
  const summary = {
    total: vals.length,
    done: vals.filter((v) => v.status === "Done").length,
    in_progress: vals.filter((v) => v.status === "In Progress").length,
    to_do: vals.filter((v) => v.status === "To Do" && !v.blocked).length,
    blocked: vals.filter((v) => v.blocked).length,
    missing: missing.length,
  };

  const synced_by =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "app";

  const { error } = await db.from("roadmap_snapshot").insert({ statuses, summary, synced_by });
  if (error) return json({ error: "Falha ao gravar snapshot", detail: error.message }, 500);

  return json({ ok: true, synced_at: new Date().toISOString(), summary, missing });
});
