// Verifica se o Supabase do Roadmap está configurado corretamente.
// Uso: preencha .env.local (ver .env.example) e rode: node scripts/check-supabase.mjs
// Usa fetch puro (PostgREST) — não precisa instalar nada.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// carrega .env.local sem sobrescrever o que já vier do shell
try {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
} catch { /* sem .env.local: usa o ambiente */ }

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  console.error("❌ Faltam SUPABASE_URL e/ou SUPABASE_ANON_KEY no .env.local (ver .env.example).");
  process.exit(1);
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const rest = (path) => fetch(`${URL}/rest/v1/${path}`, { headers });

let ok = true;
const line = (good, msg) => { console.log(`${good ? "✅" : "❌"} ${msg}`); if (!good) ok = false; };

// 1) hypotheses: existe + contagem
try {
  const r = await fetch(`${URL}/rest/v1/hypotheses?select=id`, {
    headers: { ...headers, Prefer: "count=exact", Range: "0-0" },
  });
  if (r.status === 404 || r.status === 400) {
    line(false, "Tabela `hypotheses` não encontrada (migration não aplicada?).");
  } else {
    const total = (r.headers.get("content-range") || "*/0").split("/")[1];
    line(total === "24", `Tabela \`hypotheses\` existe — ${total} linhas (esperado 24).`);
  }
} catch (e) { line(false, `Erro ao ler hypotheses: ${e.message}`); }

// 2) roadmap_snapshot: existe + colunas certas
try {
  const r = await rest("roadmap_snapshot?select=*&order=synced_at.desc&limit=1");
  if (r.status === 404 || r.status === 400) {
    line(false, "Tabela `roadmap_snapshot` não encontrada (migration não aplicada?).");
  } else {
    const rows = await r.json();
    line(true, "Tabela `roadmap_snapshot` existe.");
    if (rows.length === 0) {
      console.log("   ℹ️  Ainda sem snapshot — normal até o primeiro sync (botão / Edge Function).");
    } else {
      const s = rows[0];
      const hasCols = "statuses" in s && "summary" in s && "synced_at" in s;
      line(hasCols, hasCols
        ? `Snapshot mais recente: ${s.synced_at} · ${JSON.stringify(s.summary)}`
        : `Colunas inesperadas em roadmap_snapshot: ${Object.keys(s).join(", ")} (esperado statuses/summary).`);
    }
  }
} catch (e) { line(false, `Erro ao ler roadmap_snapshot: ${e.message}`); }

console.log(ok ? "\n🎉 Supabase configurado corretamente." : "\n⚠️  Há pendências acima.");
process.exit(ok ? 0 : 1);
