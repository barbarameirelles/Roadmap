// Gera label-config.json para a Edge Function sync-jira.
// Extrai meses e features do labeledDeliveries.ts + adiciona meses futuros relevantes.
// Rodar após adicionar novos meses ou grupos de feature: `npm run sync:labels`
import fs from "fs";

const src = fs.readFileSync("src/data/labeledDeliveries.ts", "utf8");

// Extrai monthLabels de MONTH_DELIVERIES
const monthMatches = [...src.matchAll(/monthLabel:\s*["']([^"']+)["']/g)];
const months = [...new Set(monthMatches.map(m => m[1]))];

// Garante meses futuros relevantes (para descobrir issues já tagueadas antes do mês existir)
const ALL_MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const lastIdx = Math.max(...months.map(m => ALL_MONTHS.indexOf(m)));
// inclui até 3 meses à frente do último mês presente na estrutura
for (let i = lastIdx + 1; i <= Math.min(lastIdx + 3, 11); i++) {
  if (!months.includes(ALL_MONTHS[i])) months.push(ALL_MONTHS[i]);
}

// Extrai feature labels (campo `feature:` nos grupos)
const featureMatches = [...src.matchAll(/feature:\s*["']([^"']+)["']/g)];
// filtra a linha da interface (feature: string)
const features = [...new Set(
  featureMatches.map(m => m[1]).filter(f => f !== "string")
)];

const config = { months, features };
fs.writeFileSync(
  "supabase/functions/sync-jira/label-config.json",
  JSON.stringify(config, null, 2)
);
console.log("label-config.json gerado:");
console.log("  meses:", months.join(", "));
console.log("  features:", features.join(", "));
