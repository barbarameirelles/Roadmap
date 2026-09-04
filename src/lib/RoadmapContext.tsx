// Contexto que carrega o snapshot do Jira (Supabase) e entrega a estrutura já
// sobreposta para as abas — fonte única, fórmula única (Done/total).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  fetchLatestSnapshot, triggerSync,
  featuresWithStatuses, deliveriesWithStatuses,
  type StatusMap, type DiscoveredMap,
} from "./roadmapSync";
import type { Feature } from "@/data/ganttData";
import type { MonthDelivery } from "@/data/labeledDeliveries";

interface RoadmapCtx {
  features: Feature[];
  deliveries: MonthDelivery[];
  syncedAt: string | null;
  loading: boolean;
  syncing: boolean;
  message: string | null;
  live: boolean;            // true se está lendo dados do snapshot (não só fallback estático)
  sync: () => Promise<void>;
}

const Ctx = createContext<RoadmapCtx | null>(null);

export function RoadmapProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<StatusMap | null>(null);
  const [discovered, setDiscovered] = useState<DiscoveredMap | null>(null);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const snap = await fetchLatestSnapshot();
    if (snap) { setMap(snap.statuses); setDiscovered(snap.discovered ?? null); setSyncedAt(snap.synced_at); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const sync = useCallback(async () => {
    setSyncing(true); setMessage(null);
    const r = await triggerSync();
    if (r.ok) {
      await load();
      setMessage(r.message ?? "Sincronizado com o Jira.");
    } else {
      setMessage(`Falha: ${r.message}`);
    }
    setSyncing(false);
  }, [load]);

  const features = useMemo(() => featuresWithStatuses(map), [map]);
  const deliveries = useMemo(() => deliveriesWithStatuses(map, discovered), [map, discovered]);

  const value: RoadmapCtx = {
    features, deliveries, syncedAt, loading, syncing, message, live: map !== null, sync,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRoadmap(): RoadmapCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRoadmap deve estar dentro de <RoadmapProvider>");
  return c;
}
