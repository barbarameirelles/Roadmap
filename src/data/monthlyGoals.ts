// Objetivos mensais — cadastrado no fim de cada mês para o mês seguinte.
// O % de conclusão e os bloqueios são calculados ao vivo a partir das jiraKeys
// vinculadas (statuses alimentados pelo sync semanal com o Jira).

import type { Track } from "./ganttData";

export interface Delivery {
  text: string;
  epic: string;          // épico/feature a que a entrega pertence
  pending?: boolean;     // ainda em andamento
}

export interface MonthlyGoal {
  month: number;          // idx em MONTHS (0 = Jan/2026). Ex.: 8 = Set/2026
  track: Track;           // define a cor do card
  label?: string;         // rótulo do badge (default: nome do objetivo/track)
  title: string;          // o que será/foi entregue, em linguagem de negócio
  description: string;    // 1–2 frases explicando o objetivo
  eta?: string;           // previsão de entrega (ex.: "Final de setembro")
  jiraKeys: string[];     // subtasks que compõem a entrega (progress automático)
  deliveries?: Delivery[]; // detalhamento item a item, conectado aos épicos
  extraBlockers?: string[]; // bloqueios de contexto não mapeados em issues
}

export const MONTHLY_GOALS: MonthlyGoal[] = [
  // ── Agosto/2026 — entregas do mês ──────────────────────────────────────────
  {
    month: 7,
    track: "cdp",
    label: "Audience",
    title: "Importação de pedidos",
    description:
      "Pedidos do Commerce entrando na CDP: histórico dos clientes beta e automação para novos clientes Audience.",
    jiraKeys: ["POS-4249", "POS-4345"],
    deliveries: [
      { text: "Importação dos pedidos históricos dos clientes beta", epic: "Importação de pedidos", pending: true },
      { text: "Automação de entrada de pedidos históricos — novo cliente Audience entra, histórico e vendas novas entram na CDP automaticamente", epic: "Importação de pedidos", pending: true },
    ],
  },
  {
    month: 7,
    track: "cdp",
    label: "XP + Audience",
    title: "Segmentação e atributos mais ricos",
    description:
      "Segmentador com segmentos pré-definidos, atributos personalizados de ponta a ponta e dados de localidade.",
    jiraKeys: ["FRONT-876", "FRONT-872", "POS-4296", "FRONT-592", "POS-3261", "POS-3205", "POS-4131"],
    deliveries: [
      { text: "Aba de segmentos pré-definidos no segmentador", epic: "Pente fino / Ajustes 2.0" },
      { text: "Início da migração do sistema de disparo de e-mail", epic: "Evolução - IP dedicado", pending: true },
      { text: "Atributos personalizados: tela de cadastro, segmentador e subida de lista", epic: "Relatórios e Exportações" },
      { text: "Campos de localidade (cidade e estado) no segmentador", epic: "Dados CDP" },
      { text: "Exclusão manual de cliente", epic: "Evoluções e melhorias" },
    ],
  },
  {
    month: 7,
    track: "migracao",
    label: "Apenas XP",
    title: "Evoluções da plataforma",
    description:
      "Melhorias nas Landing Pages, visão de cliente, modais on-site e templates de e-mail.",
    jiraKeys: ["FRONT-388", "FRONT-389", "FRONT-703", "FRONT-704", "FRONT-154", "FRONT-591", "FRONT-739", "FRONT-740"],
    deliveries: [
      { text: "Landing Page: redirect após cadastro, modal de agradecimento e mudança de URL", epic: "Evoluções e melhorias" },
      { text: "Visão de cliente: ajustes na ordenação", epic: "Evoluções e melhorias" },
      { text: "Mudança da tela de SDK", epic: "Evoluções e melhorias" },
      { text: "Modais on-site: modal por audiência/segmento e modal de agradecimento", epic: "Gestão de Campanhas - Fase 2" },
      { text: "Importação de HTML para e-mail", epic: "Gestão de Campanhas - Fase 2" },
      { text: "Template de produto para o e-mail (parte do BTG)", epic: "BTG" },
    ],
  },

  // ── Setembro/2026 — planejamento ───────────────────────────────────────────
  {
    month: 8,
    track: "evolucao",
    title: "IP Dedicado para E-mail",
    eta: "Final de setembro",
    description:
      "Infraestrutura de envio de e-mail com IP dedicado, garantindo maior reputação e entregabilidade para os disparos da plataforma.",
    jiraKeys: ["FRONT-871", "POS-4296", "POS-4342", "POS-4456", "POS-4457", "POS-4458", "POS-4459", "POS-4460", "POS-4461", "POS-4462", "POS-4463", "POS-4464", "POS-4465"],
  },
  {
    month: 8,
    track: "cdp",
    title: "Nova página de perfil de clientes",
    eta: "Final de setembro",
    description:
      "Refatoração da tela de visão única de cliente trazendo mais dados relativos ao pedido, como forma de pagamento, entrega etc.",
    jiraKeys: ["FRONT-744", "FRONT-808", "FRONT-764"],
  },
  {
    month: 8,
    track: "migracao",
    title: "Receita e exportações CSV nas campanhas",
    description:
      "Concluir a disponibilização de receita por campanha e as exportações de relatórios CSV (envios pontuais, automáticos e segmentos) via central de notificações.",
    jiraKeys: ["FRONT-310", "FRONT-407", "FRONT-419", "FRONT-448", "POS-3928", "FRONT-369"],
  },
];
