// Dados da área Omni: snapshot mais recente do Supabase (gravado pela Edge
// Function sync-gitlab) ou, se ainda não houver, o omniData.ts do código.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { REST_URL, SUPABASE_URL, supabaseHeaders } from "@/config/supabase";
import { OMNI_DATA } from "@/data/omni/omniData";
import type { OmniData } from "@/data/omni/types";

const SYNC_URL = `${SUPABASE_URL}/functions/v1/sync-gitlab`;

async function fetchLatest(): Promise<OmniData | null> {
  try {
    const res = await fetch(`${REST_URL}/omni_snapshot?select=data&order=synced_at.desc&limit=1`, { headers: supabaseHeaders });
    if (!res.ok) return null;
    const rows = (await res.json()) as { data: OmniData }[];
    return rows[0]?.data ?? null;
  } catch {
    return null;
  }
}

interface OmniCtx {
  data: OmniData;
  live: boolean;          // true = veio do Supabase
  syncing: boolean;
  message: string | null;
  sync: () => Promise<void>;
}

const Ctx = createContext<OmniCtx | null>(null);

export function OmniDataProvider({ children }: { children: ReactNode }) {
  const [snap, setSnap] = useState<OmniData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const d = await fetchLatest();
    // Só troca se o snapshot for mais novo que o arquivo do código.
    if (d && d.generatedAt > OMNI_DATA.generatedAt) setSnap(d);
  }, []);

  useEffect(() => { load(); }, [load]);

  const sync = useCallback(async () => {
    setSyncing(true); setMessage(null);
    try {
      const res = await fetch(SYNC_URL, { method: "POST", headers: supabaseHeaders });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) setMessage(`Falha: ${body?.error ?? `erro ${res.status}`}`);
      else { await load(); setMessage(body?.throttled ? body.message : "Sincronizado com o GitLab."); }
    } catch {
      setMessage("Falha: não consegui falar com o Supabase (a função sync-gitlab está publicada?)");
    }
    setSyncing(false);
  }, [load]);

  const value: OmniCtx = { data: snap ?? OMNI_DATA, live: snap !== null, syncing, message, sync };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOmniData(): OmniCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useOmniData deve estar dentro de <OmniDataProvider>");
  return c;
}
