// Supabase Edge Function: sync-jira
// ----------------------------------------------------------------------------
// 1. Discovery: consulta o Jira via JQL por label (mês × feature) e descobre
//    issues novas sem precisar adicioná-las manualmente ao código.
// 2. Status: atualiza o mapa { key → {status, blocked} } de TODAS as issues
//    (estáticas de keys.json + recém-descobertas).
// 3. Ops: consulta os épicos operacionais e grava o MonthStats do mês corrente
//    na tabela ops_snapshot (usada pela aba Sys-Ops).
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

// ── Helpers de Ops ────────────────────────────────────────────────────────────

async function jiraFetchAll(
  auth: string, base: string, jql: string, fields: string[],
): Promise<unknown[]> {
  const all: unknown[] = [];
  let nextPageToken: string | undefined;
  do {
    const res = await fetch(`${base}/rest/api/3/search/jql`, {
      method: "POST",
      headers: { Authorization: auth, "content-type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ jql, fields, maxResults: 100, nextPageToken }),
    });
    if (!res.ok) break;
    const data = await res.json();
    for (const issue of data.issues ?? []) all.push(issue);
    nextPageToken = data.isLast === false ? data.nextPageToken : undefined;
  } while (nextPageToken);
  return all;
}

function businessDays(startIso: string, endIso: string | null): number {
  const s = new Date(startIso.split("T")[0] + "T12:00:00Z");
  const e = endIso ? new Date(endIso.split("T")[0] + "T12:00:00Z") : new Date();
  if (e < s) return 0;
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const dow = cur.getUTCDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

type OpsStatus = "Blocked" | "In Progress" | "To Do" | "Done";

function opsStatus(name: string): OpsStatus {
  const n = (name ?? "").trim().toUpperCase();
  if (["CONCLUÍDO", "CANCELADO", "VALIDATION"].includes(n)) return "Done";
  if (["BLOQUEADO", "BLOCKED"].includes(n)) return "Blocked";
  if (["EM ANDAMENTO", "IN PROGRESS"].includes(n)) return "In Progress";
  return "To Do";
}

const PT_MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const OPS_TRACKS_CFG = [
  { id: "smb",        epics: ["FRONT-124"] },
  { id: "plataforma", epics: ["POS-221", "FRONT-132"] },
] as const;

// ── Handler ───────────────────────────────────────────────────────────────────

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
          if (!res.ok) break;
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
  const keys: string[] = (KEYS as string[]).filter(k => !(k in statuses));
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

  for (const k of (KEYS as string[])) if (!(k in statuses)) missing.push(k);

  // ── Contadores roadmap ─────────────────────────────────────────────────────
  const vals = Object.values(statuses);
  const discoveredCount = Object.values(discovered).reduce((s, g) => s + g.length, 0);
  const summary = {
    total:       vals.length,
    done:        vals.filter(v => v.status === "Done").length,
    in_progress: vals.filter(v => v.status === "In Progress").length,
    to_do:       vals.filter(v => v.status === "To Do" && !v.blocked).length,
    blocked:     vals.filter(v => v.blocked).length,
    missing:     missing.length,
    discovered:  discoveredCount,
  };

  const synced_by = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "app";
  const { error } = await db
    .from("roadmap_snapshot")
    .insert({ statuses, summary, synced_by, discovered });

  if (error) return json({ error: "Falha ao gravar snapshot", detail: error.message }, 500);

  // ── Fase 3: Ops live snapshot ──────────────────────────────────────────────
  let opsSummary: Record<string, unknown> | null = null;
  try {
    const today = new Date();
    const yr = today.getUTCFullYear();
    const mo = today.getUTCMonth(); // 0-indexed
    const monthStr  = `${yr}-${String(mo + 1).padStart(2, "0")}`;
    const monthStartISO = `${yr}-${String(mo + 1).padStart(2, "0")}-01`;
    const monthLabelStr = PT_MONTHS[mo];

    const OPS_FIELDS = ["summary", "status", "created", "resolutiondate", "assignee"];
    const opsData: Record<string, unknown> = {};

    for (const trackCfg of OPS_TRACKS_CFG) {
      const epicClause = trackCfg.epics.join(",");

      // Todos os tickets abertos (qualquer data de criação)
      const openIssues = await jiraFetchAll(
        auth, JIRA_BASE,
        `parent in (${epicClause}) AND statusCategory in ("To Do", "In Progress") ORDER BY created ASC`,
        OPS_FIELDS,
      ) as Record<string, unknown>[];

      // Tickets concluídos com resolutiondate no mês corrente
      const doneByResdate = await jiraFetchAll(
        auth, JIRA_BASE,
        `parent in (${epicClause}) AND statusCategory = Done AND resolutiondate >= "${monthStartISO}" ORDER BY resolutiondate ASC`,
        OPS_FIELDS,
      ) as Record<string, unknown>[];

      // Tickets concluídos sem resolutiondate, criados no mês corrente
      const doneNoResdate = await jiraFetchAll(
        auth, JIRA_BASE,
        `parent in (${epicClause}) AND statusCategory = Done AND resolutiondate is EMPTY AND created >= "${monthStartISO}" ORDER BY created ASC`,
        OPS_FIELDS,
      ) as Record<string, unknown>[];

      // Merge e dedup por key
      const doneMap = new Map<string, Record<string, unknown>>();
      for (const i of [...doneByResdate, ...doneNoResdate]) {
        doneMap.set(i.key as string, i);
      }
      const doneIssues = Array.from(doneMap.values());

      const tickets = [];
      let withinSla = 0, outsideSla = 0, noDate = 0, blocked = 0;

      for (const issue of openIssues) {
        const f = issue.fields as Record<string, unknown>;
        const statusName = (f?.status as Record<string, unknown>)?.name as string ?? "";
        const st = opsStatus(statusName);
        const created = ((f?.created as string) ?? "").split("T")[0];
        if (st === "Blocked") blocked++;
        const days = businessDays(created, null);
        if (days <= 5) withinSla++; else outsideSla++;
        tickets.push({
          key: issue.key,
          title: (f?.summary as string) ?? issue.key,
          status: st,
          created,
          resdate: null,
          assignee: ((f?.assignee as Record<string, unknown>)?.displayName as string) ?? null,
        });
      }

      for (const issue of doneIssues) {
        const f = issue.fields as Record<string, unknown>;
        const statusName = (f?.status as Record<string, unknown>)?.name as string ?? "";
        if (statusName.trim().toUpperCase() === "CANCELADO") continue;
        const created = ((f?.created as string) ?? "").split("T")[0];
        const resdate = ((f?.resolutiondate as string | null) ?? "")?.split("T")[0] || null;
        if (!resdate) {
          noDate++;
        } else {
          const days = businessDays(created, resdate);
          if (days <= 5) withinSla++; else outsideSla++;
        }
        tickets.push({
          key: issue.key as string,
          title: (f?.summary as string) ?? issue.key,
          status: "Done" as OpsStatus,
          created,
          resdate,
          assignee: ((f?.assignee as Record<string, unknown>)?.displayName as string) ?? null,
        });
      }

      const atRisk = openIssues.filter(i => {
        const created = (((i.fields as Record<string, unknown>)?.created as string) ?? "").split("T")[0];
        return businessDays(created, null) > 5;
      }).length;

      const doneCount = doneIssues.filter(i => {
        const f = i.fields as Record<string, unknown>;
        return ((f?.status as Record<string, unknown>)?.name as string ?? "").trim().toUpperCase() !== "CANCELADO";
      }).length;

      opsData[trackCfg.id] = {
        month: monthStr,
        label: monthLabelStr,
        isLive: true,
        volume: tickets.length,
        done: doneCount,
        withinSla,
        outsideSla,
        open: openIssues.length,
        blocked,
        atRisk,
        noDate,
        tickets,
      };
    }

    const { error: opsErr } = await db
      .from("ops_snapshot")
      .insert({ smb: opsData.smb, plataforma: opsData.plataforma });

    if (opsErr) {
      console.error("ops_snapshot insert failed:", opsErr.message);
    } else {
      opsSummary = {
        smb_volume: (opsData.smb as Record<string, unknown>)?.volume,
        plataforma_volume: (opsData.plataforma as Record<string, unknown>)?.volume,
      };
    }
  } catch (opsErr) {
    console.error("Ops phase failed (non-blocking):", opsErr);
  }

  return json({ ok: true, synced_at: new Date().toISOString(), summary, missing, discovered, ops: opsSummary });
});
