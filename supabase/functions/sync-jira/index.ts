// Supabase Edge Function: sync-jira
// ----------------------------------------------------------------------------
// 1. Discovery: consulta o Jira via JQL por label (mês × feature) e descobre
//    issues novas sem precisar adicioná-las manualmente ao código.
// 2. Status: atualiza o mapa { key → {status, blocked} } de TODAS as issues
//    (estáticas de keys.json + recém-descobertas).
//
// Secrets necessários (Supabase → Edge Functions → Secrets):
//   JIRA_EMAIL     e-mail da conta Atlassian
//   JIRA_TOKEN     API token do Jira
//   JIRA_BASE_URL  https://wake-experience.atlassian.net
//
// Trava de rajada: ignora chamadas < MIN_INTERVAL_S do último sync.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import KEYS from "./keys.json" with { type: "json" };
import LABEL_CONFIG from "./label-config.json" with { type: "json" };

const MIN_INTERVAL_S = 60;
const BATCH = 90;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Mapped = { status: "Done" | "In Progress" | "To Do"; blocked: boolean };
type DiscoveredIssue = { key: string; title: string };
type DiscoveredMap = Record<string, DiscoveredIssue[]>; // "Setembro/segmentador" → issues

function mapStatus(name: string): Mapped {
  const n = (name ?? "").trim().toUpperCase();
  if (n === "CONCLUÍDO" || n === "CANCELADO" || n === "VALIDATION")
    return { status: "Done", blocked: false };
  if (n === "BLOQUEADO" || n === "BLOCKED")
    return { status: "To Do", blocked: true };
  if (n === "TAREFA PENDENTE" || n === "TAREFAS PENDENTES")
    return { status: "To Do", blocked: false };
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
  const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const JIRA_EMAIL   = Deno.env.get("JIRA_EMAIL");
  const JIRA_TOKEN   = Deno.env.get("JIRA_TOKEN");
  const JIRA_BASE    = Deno.env.get("JIRA_BASE_URL");

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

  const auth = "Basic " + btoa(`${JIRA_EMAIL}:${JIRA_TOKEN}`);
  const statuses: Record<string, Mapped> = {};
  const missing: string[] = [];

  // ── Fase 1: Discovery por label ────────────────────────────────────────────
  // Para cada mês configurado, busca todas as issues que também têm um label de feature.
  // Resultado: mapa "Setembro/segmentador" → [{ key, title }]
  const discovered: DiscoveredMap = {};
  const months: string[]   = (LABEL_CONFIG as { months: string[]; features: string[] }).months;
  const features: string[] = (LABEL_CONFIG as { months: string[]; features: string[] }).features;

  if (months.length && features.length) {
    const featureClause = features.map(f => `"${f}"`).join(",");
    for (const month of months) {
      try {
        const jql = `labels = "${month}" AND labels in (${featureClause}) ORDER BY key ASC`;
        let nextPageToken: string | undefined;
        do {
          const res = await fetch(`${JIRA_BASE}/rest/api/3/search/jql`, {
            method: "POST",
            headers: { Authorization: auth, "content-type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ jql, fields: ["summary", "status", "labels"], maxResults: 200, nextPageToken }),
          });
          if (!res.ok) break; // discovery não bloqueia o sync de status
          const data = await res.json();

          for (const issue of data.issues ?? []) {
            const issueLabels: string[] = issue.fields?.labels ?? [];
            const featureLabel = issueLabels.find((l: string) => features.includes(l));
            if (!featureLabel) continue;

            const groupKey = `${month}/${featureLabel}`;
            (discovered[groupKey] ??= []).push({
              key: issue.key,
              title: issue.fields?.summary ?? issue.key,
            });

            // garante que a issue descoberta também entra no sync de status
            statuses[issue.key] = mapStatus(issue.fields?.status?.name ?? "");
          }
          nextPageToken = data.isLast === false ? data.nextPageToken : undefined;
        } while (nextPageToken);
      } catch {
        // discovery de um mês falhou → segue para o próximo sem travar o sync
      }
    }
  }

  // ── Fase 2: Status das issues estáticas (keys.json) ───────────────────────
  const keys: string[] = (KEYS as string[]).filter(k => !(k in statuses)); // pula já descobertas
  for (let i = 0; i < keys.length; i += BATCH) {
    const batch = keys.slice(i, i + BATCH);
    const jql = `key in (${batch.join(",")})`;
    let nextPageToken: string | undefined;
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

  // keys que o Jira não retornou
  for (const k of (KEYS as string[])) if (!(k in statuses)) missing.push(k);

  // ── Contadores ─────────────────────────────────────────────────────────────
  const vals = Object.values(statuses);
  const discoveredCount = Object.values(discovered).reduce((s, g) => s + g.length, 0);
  const summary = {
    total:      vals.length,
    done:       vals.filter(v => v.status === "Done").length,
    in_progress:vals.filter(v => v.status === "In Progress").length,
    to_do:      vals.filter(v => v.status === "To Do" && !v.blocked).length,
    blocked:    vals.filter(v => v.blocked).length,
    missing:    missing.length,
    discovered: discoveredCount,
  };

  const synced_by = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "app";
  const { error } = await db
    .from("roadmap_snapshot")
    .insert({ statuses, summary, synced_by, discovered });

  if (error) return json({ error: "Falha ao gravar snapshot", detail: error.message }, 500);

  return json({ ok: true, synced_at: new Date().toISOString(), summary, missing, discovered });
});
