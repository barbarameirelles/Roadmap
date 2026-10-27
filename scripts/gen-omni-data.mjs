// Gera src/data/omni/omniData.ts a partir do GitLab (dados de reserva, usados
// quando ainda não há sync no Supabase). As regras ficam em
// supabase/functions/sync-gitlab/omni.js — o mesmo código do botão Sincronizar.
//
// Rodar: GITLAB_TOKEN=... npm run sync:omni   (escopo read_api)
import fs from "fs";
import { buildOmniData } from "../supabase/functions/sync-gitlab/omni.js";

const TOKEN = process.env.GITLAB_TOKEN;
if (!TOKEN) { console.error("Defina GITLAB_TOKEN (escopo read_api)."); process.exit(1); }

const out = await buildOmniData(TOKEN, console.log);
if (!out?.initiatives) { console.error("Leitura do GitLab não retornou dados — omniData.ts não foi alterado."); process.exit(1); }
fs.mkdirSync("src/data/omni", { recursive: true });
fs.writeFileSync("src/data/omni/omniData.ts",
  `// GERADO por scripts/gen-omni-data.mjs — não editar à mão.\nimport type { OmniData } from "./types";\n\n` +
  `export const OMNI_DATA: OmniData = ${JSON.stringify(out, null, 1)};\n`);
const { initiatives, hypotheses, support } = out;
console.log(`omniData.ts: ${initiatives.length} iniciativas, ${initiatives.reduce((s, i) => s + i.items.length, 0)} tarefas, ${hypotheses.length} hipóteses, ${support.length} chamados`);
