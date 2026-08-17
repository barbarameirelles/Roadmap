// Objetivos mensais por track — cadastrado no fim de cada mês para o mês seguinte.
// O % de conclusão e os bloqueios são calculados ao vivo a partir das jiraKeys
// vinculadas (statuses alimentados pelo sync semanal com o Jira).

import type { Track } from "./ganttData";

export interface MonthlyGoal {
  month: number;          // idx em MONTHS (0 = Jan/2026). Ex.: 8 = Set/2026
  track: Track;
  title: string;          // o que será entregue, em linguagem de negócio
  description: string;    // 1–2 frases explicando o objetivo
  jiraKeys: string[];     // subtasks que compõem a entrega (progress automático)
  extraBlockers?: string[]; // bloqueios de contexto não mapeados em issues
}

export const MONTHLY_GOALS: MonthlyGoal[] = [
  // ── Setembro/2026 ──────────────────────────────────────────────────────────
  {
    month: 8,
    track: "migracao",
    title: "Receita e exportações CSV nas campanhas",
    description:
      "Concluir a disponibilização de receita por campanha e as exportações de relatórios CSV (envios pontuais, automáticos e segmentos) via central de notificações.",
    jiraKeys: ["FRONT-310", "FRONT-407", "FRONT-419", "FRONT-448", "POS-3928", "FRONT-369"],
  },
  {
    month: 8,
    track: "evolucao",
    title: "Pente fino da plataforma 2.0",
    description:
      "Rodada de refinamento das telas já migradas: Landing Pages, On-Site, Studio, Home e Segmentador — correções de UX e consistência antes da ampliação da base de clientes.",
    jiraKeys: ["FRONT-851", "FRONT-855", "FRONT-857", "FRONT-873"],
  },
  {
    month: 8,
    track: "cdp",
    title: "Dados do Commerce fluindo na CDP",
    description:
      "Ingestão de dados do commerce via webhook operacional e visão de clientes alimentada com dados reais, destravando o segmentador para a base commerce.",
    jiraKeys: ["POS-4249", "FRONT-854", "FRONT-872", "FRONT-770", "FRONT-774", "FRONT-779"],
  },
];
