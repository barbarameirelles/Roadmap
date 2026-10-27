// Supabase Edge Function: sync-gitlab
// ----------------------------------------------------------------------------
// Botão "Sincronizar" da área Iniciativas Omni. Lê o GitLab (grupo
// sintesesolucoes) com as mesmas regras do script `npm run sync:omni`
// (omni.js) e grava o resultado inteiro em omni_snapshot. O front lê a linha
// mais recente; sem snapshot, usa src/data/omni/omniData.ts.
//
// Secret necessário (Supabase → Edge Functions → Secrets):
//   GITLAB_TOKEN   token do GitLab com escopo read_api
//
// Trava de rajada: ignora chamadas < MIN_INTERVAL_S do último sync.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildOmniData } from "./omni.js";

const MIN_INTERVAL_S = 60;
const KEEP_DAYS = 30; // snapshots mais antigos são apagados a cada sync

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
  const TOKEN        = Deno.env.get("GITLAB_TOKEN");
  if (!TOKEN) return json({ error: "Secret GITLAB_TOKEN não configurado no Supabase." }, 500);

  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: last } = await db
    .from("omni_snapshot").select("synced_at").order("synced_at", { ascending: false }).limit(1);
  const lastAt = last?.[0]?.synced_at ? new Date(last[0].synced_at).getTime() : 0;
  if (Date.now() - lastAt < MIN_INTERVAL_S * 1000) {
    return json({ throttled: true, message: "Sincronizado há menos de 1 minuto — dados já estão atualizados." });
  }

  try {
    const data = await buildOmniData(TOKEN, console.log);
    const summary = {
      initiatives: data.initiatives.length,
      tasks: data.initiatives.reduce((s: number, i: { items: unknown[] }) => s + i.items.length, 0),
      hypotheses: data.hypotheses.length,
      tickets: data.support.length,
    };
    const { error } = await db.from("omni_snapshot").insert({ data, summary });
    if (error) return json({ error: `Falha ao gravar: ${error.message}` }, 500);
    await db.from("omni_snapshot").delete()
      .lt("synced_at", new Date(Date.now() - KEEP_DAYS * 864e5).toISOString());
    return json({ ok: true, summary, synced_at: data.generatedAt });
  } catch (e) {
    return json({ error: `Falha ao ler o GitLab: ${(e as Error).message}` }, 502);
  }
});
