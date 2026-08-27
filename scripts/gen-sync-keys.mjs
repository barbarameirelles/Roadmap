// Gera a lista de issue keys que a Edge Function sync-jira consulta no Jira.
// Fonte: ganttData.ts (épicos/subtasks) + labeledDeliveries.ts (Entrega do Mês).
// Rodar após mudanças editoriais que adicionem/removam issues: `node scripts/gen-sync-keys.mjs`
import fs from "fs";
const read = p => fs.readFileSync(p, "utf8");
const KEY = /\b((?:FRONT|POS)-\d+)\b/g;
const collect = s => new Set(s.match(KEY) ?? []);

const gantt = collect(read("src/data/ganttData.ts"));
const labeled = collect(read("src/data/labeledDeliveries.ts"));
// remove keys que são jiraKey de épico mas não subtask? não — épicos também podem ter status útil.
const all = [...new Set([...gantt, ...labeled])].sort();
fs.writeFileSync("supabase/functions/sync-jira/keys.json", JSON.stringify(all));
console.log("keys.json:", all.length, "keys (gantt:", gantt.size, "labeled:", labeled.size, ")");
