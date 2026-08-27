// Camada de sync ao vivo: lê o snapshot de status do Supabase e sobrepõe na
// estrutura (que vive no código). Fórmula ÚNICA de % = Done / total — usada por
// todas as abas, o que elimina a divergência histórica entre elas.

import { REST_URL, SYNC_FUNCTION_URL, supabaseHeaders } from "@/config/supabase";
import { FEATURES, type Feature } from "@/data/ganttData";
import { MONTH_DELIVERIES, type MonthDelivery, type IssueStatus } from "@/data/labeledDeliveries";

export type SnapshotStatus = { status: "Done" | "In Progress" | "To Do"; blocked: boolean };
export type StatusMap = Record<string, SnapshotStatus>;

export interface Snapshot {
  statuses: StatusMap;
  summary: Record<string, number>;
  synced_at: string;
}

// ── Fórmula única ─────────────────────────────────────────────────────────────
// % = concluídas / total (em-andamento NÃO conta). Vazio => 0.
export function progressPct(subs: { status: string }[]): number {
  if (!subs.length) return 0;
  return Math.round((subs.filter(s => s.status === "Done").length / subs.length) * 100);
}

// ── Leitura do snapshot mais recente ─────────────────────────────────────────
export async function fetchLatestSnapshot(): Promise<Snapshot | null> {
  try {
    const res = await fetch(
      `${REST_URL}/roadmap_snapshot?select=statuses,summary,synced_at&order=synced_at.desc&limit=1`,
      { headers: supabaseHeaders },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Snapshot[];
    return rows[0] ?? null;
  } catch {
    return null; // sem rede / sem Supabase → o caller usa o dado estático
  }
}

// ── Dispara o sync (Edge Function) ───────────────────────────────────────────
export async function triggerSync(): Promise<{ ok: boolean; message?: string; summary?: Record<string, number> }> {
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
// Sempre recalcula o progress pela fórmula única (Done/total), mesmo sem
// snapshot — assim o Kanban (que lia o campo manual feat.progress) já alinha
// com Exec e Entrega do Mês de imediato. Com snapshot, também sobrepõe os status.
export function featuresWithStatuses(map: StatusMap | null): Feature[] {
  return FEATURES.map(f => {
    const subtasks = map
      ? f.subtasks.map(s => {
          const m = map[s.key];
          return m ? { ...s, status: m.status, blocked: m.blocked } : s;
        })
      : f.subtasks;

    // Preserva a classificação de backlog (isBacklog = executed===null && progress===0):
    // features de backlog seguem em 0 (ex.: cdp-2b), e nenhuma feature ativa cai
    // acidentalmente pra backlog ao recalcular.
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

export function deliveriesWithStatuses(map: StatusMap | null): MonthDelivery[] {
  if (!map) return MONTH_DELIVERIES;
  return MONTH_DELIVERIES.map(md => ({
    ...md,
    groups: md.groups.map(g => ({
      ...g,
      issues: g.issues.map(i => {
        const m = map[i.key];
        if (!m) return i;
        const status: IssueStatus = m.blocked ? "Blocked" : m.status;
        return { ...i, status, blocked: m.blocked };
      }),
    })),
  }));
}
