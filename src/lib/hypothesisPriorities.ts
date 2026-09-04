import { REST_URL, supabaseHeaders } from "@/config/supabase";
import type { HypothesisPriority } from "@/data/hypothesesData";

export type PriorityMap = Record<string, HypothesisPriority>;

export async function fetchPriorities(): Promise<PriorityMap> {
  try {
    const res = await fetch(`${REST_URL}/hypothesis_priorities?select=hyp_id,priority`, {
      headers: supabaseHeaders,
    });
    if (!res.ok) return {};
    const rows = (await res.json()) as { hyp_id: string; priority: string }[];
    const map: PriorityMap = {};
    for (const r of rows) map[r.hyp_id] = r.priority as HypothesisPriority;
    return map;
  } catch {
    return {};
  }
}

export async function upsertPriority(hypId: string, priority: HypothesisPriority | null): Promise<void> {
  try {
    if (priority === null) {
      await fetch(`${REST_URL}/hypothesis_priorities?hyp_id=eq.${hypId}`, {
        method: "DELETE",
        headers: supabaseHeaders,
      });
    } else {
      await fetch(`${REST_URL}/hypothesis_priorities`, {
        method: "POST",
        headers: {
          ...supabaseHeaders,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({ hyp_id: hypId, priority, updated_at: new Date().toISOString() }),
      });
    }
  } catch {
    // falha silenciosa — UI já atualizou otimisticamente
  }
}
