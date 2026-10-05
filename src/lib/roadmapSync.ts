// Camada de sync ao vivo: lê o snapshot de status do Supabase e sobrepõe na
// estrutura (que vive no código). Fórmula ÚNICA de % = Done / total — usada por
// todas as abas, o que elimina a divergência histórica entre elas.

import { REST_URL, SYNC_FUNCTION_URL, supabaseHeaders } from "@/config/supabase";
import { FEATURES, type Feature } from "@/data/ganttData";
import { MONTH_DELIVERIES, type MonthDelivery, type IssueStatus } from "@/data/labeledDeliveries";
import type { MonthStats } from "@/data/opsTicketsData";

export type SnapshotStatus = { status: "Done" | "In Progress" | "To Do"; blocked: boolean };
export type StatusMap = Record<string, SnapshotStatus>;

// Chave = id da trilha ("smb" | "plataforma") → stats do mês corrente
export type OpsSnapshotData = Record<string, MonthStats>;

export type DiscoveredIssue = { key: string; title: string };
export type DiscoveredMap = Record<string, DiscoveredIssue[]>; // "Setembro/segmentador" → issues

export interface Snapshot {
  statuses: StatusMap;
  summary: Record<string, unknown>;
  synced_at: string;
  discovered?: DiscoveredMap;
}

// ── Fórmula única ─────────────────────────────────────────────────────────────
export function progressPct(subs: { status: string }[]): number {
  if (!subs.length) return 0;
  return Math.round((subs.filter(s => s.status === "Done").length / subs.length) * 100);
}

// Extrai os dados de ops do summary do roadmap snapshot (gravados pela fase 3)
export function opsSnapshotFromSummary(summary: Record<string, unknown> | null): OpsSnapshotData | null {
  if (!summary) return null;
  const result: OpsSnapshotData = {};
  if (summary.ops_smb)        result.smb        = summary.ops_smb as MonthStats;
  if (summary.ops_plataforma) result.plataforma = summary.ops_plataforma as MonthStats;
  return Object.keys(result).length ? result : null;
}

// Último snapshot de ops gravado para um mês ("2026-09") — usado para meses que
// já fecharam mas ainda não foram congelados em opsTicketsData.ts.
export async function fetchOpsForMonth(month: string): Promise<OpsSnapshotData | null> {
  try {
    const res = await fetch(
      `${REST_URL}/roadmap_snapshot?select=summary&summary->ops_smb->>month=eq.${month}&order=synced_at.desc&limit=1`,
      { headers: supabaseHeaders },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { summary: Record<string, unknown> }[];
    return opsSnapshotFromSummary(rows[0]?.summary ?? null);
  } catch {
    return null;
  }
}

// ── Leitura do snapshot mais recente ─────────────────────────────────────────
export async function fetchLatestSnapshot(): Promise<Snapshot | null> {
  try {
    const res = await fetch(
      `${REST_URL}/roadmap_snapshot?select=statuses,summary,synced_at,discovered&order=synced_at.desc&limit=1`,
      { headers: supabaseHeaders },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Snapshot[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

// ── Dispara o sync (Edge Function) ───────────────────────────────────────────
export async function triggerSync(): Promise<{ ok: boolean; message?: string; summary?: Record<string, unknown> }> {
  try {
    const res = await fetch(SYNC_FUNCTION_URL, { method: "POST", headers: supabaseHeaders });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: data?.error ?? `Erro ${res.status}` };
    if (data?.throttled) return { ok: true, message: data.message, summary: data.summary };
    return { ok: true, summary: data.summary };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

// ── Overlay: aplica o mapa de status na estrutura ────────────────────────────
export function featuresWithStatuses(map: StatusMap | null): Feature[] {
  return FEATURES.map(f => {
    const subtasks = map
      ? f.subtasks.map(s => {
          const m = map[s.key];
          return m ? { ...s, status: m.status, blocked: m.blocked } : s;
        })
      : f.subtasks;

    const wasBacklog = f.executed === null && f.progress === 0;
    let progress: number;
    if (f.status === "concluido") progress = 100;
    else if (wasBacklog) progress = 0;
    else {
      const p = progressPct(subtasks);
      progress = p === 0 && f.executed === null ? f.progress : p;
    }
    return { ...f, subtasks, progress };
  });
}

const PT_MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

// Grupo descoberto: "Outubro/QuickWin" → chave normalizada "outubro/quickwin"
// (labels do Jira variam de caixa: IPDedicado × Ipdedicado).
const groupId = (month: string, feature: string) => `${month}/${feature}`.toLowerCase();

export function deliveriesWithStatuses(
  map: StatusMap | null,
  discovered?: DiscoveredMap | null,
): MonthDelivery[] {
  const toIssue = (d: DiscoveredIssue) => {
    const m = map?.[d.key];
    const status: IssueStatus = m ? (m.blocked ? "Blocked" : m.status) : "To Do";
    return { key: d.key, title: d.title, status, blocked: m?.blocked ?? false };
  };

  // Agrupa o discovered pela chave normalizada (une variações de caixa, sem duplicar)
  const found = new Map<string, { month: string; feature: string; issues: DiscoveredIssue[] }>();
  for (const [k, list] of Object.entries(discovered ?? {})) {
    const [month, ...rest] = k.split("/");
    const feature = rest.join("/");
    const id = groupId(month, feature);
    const entry = found.get(id) ?? { month, feature, issues: [] };
    for (const i of list) if (!entry.issues.some(e => e.key === i.key)) entry.issues.push(i);
    found.set(id, entry);
  }
  const used = new Set<string>();

  const months: MonthDelivery[] = MONTH_DELIVERIES.map(md => ({
    ...md,
    groups: md.groups.map(g => {
      const id = groupId(md.monthLabel, g.feature);
      const discoveredForGroup = found.get(id)?.issues ?? [];

      if (discoveredForGroup.length > 0) {
        // Discovered é a fonte de verdade: reflete exatamente o que está taggeado
        // no Jira (épico + filhos não-subtask para Regra 1; histórias para Regra 2).
        used.add(id);
        return { ...g, issues: discoveredForGroup.map(toIssue) };
      }

      // Fallback: sync ainda não rodou ou grupo sem issues taggeadas → usa hardcoded
      const issues = g.issues.map(i => {
        if (!map) return i;
        const m = map[i.key];
        if (!m) return i;
        const status: IssueStatus = m.blocked ? "Blocked" : m.status;
        return { ...i, status, blocked: m.blocked };
      });
      return { ...g, issues };
    }),
  }));

  // Grupos taggeados no Jira sem curadoria no código → aparecem mesmo assim
  // (sem descrição/contexto). Mês ainda não cadastrado é criado.
  for (const [id, f] of found) {
    if (used.has(id) || !f.issues.length) continue;
    let md = months.find(m => m.monthLabel.toLowerCase() === f.month.toLowerCase());
    if (!md) {
      const mi = PT_MONTHS.indexOf(f.month);
      if (mi < 0) continue;
      md = { monthLabel: f.month, monthIdx: mi, year: 2026, groups: [] };
      months.push(md);
    }
    md.groups.push({ feature: f.feature, description: "", context: "", issues: f.issues.map(toIssue) });
  }
  return months;
}
