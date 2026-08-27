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
  context?: string;       // por que isso importa — linguagem de negócio para audiências não-técnicas
  eta?: string;           // previsão de entrega (ex.: "Final de setembro")
  jiraKeys: string[];     // subtasks que compõem a entrega (progress automático)
  excludeFeatureIds?: string[]; // épicos a omitir do slide-over (mesmo que tenham jiraKeys em comum)
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
    context:
      "Com o histórico de compras disponível na CDP, o time de marketing passa a criar segmentos baseados em comportamento real de compra — quem comprou X vezes, gastou acima de determinado valor ou adquiriu produtos de uma categoria específica. Sem esse dado, as campanhas operam sem visibilidade transacional.",
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
    context:
      "Expande o que é possível segmentar: além de dados cadastrais, a plataforma passa a suportar atributos personalizados criados pela própria loja e filtros de localidade (cidade e estado). Resultado: campanhas hiper-segmentadas por região e perfil de cliente sem precisar de integrações externas.",
    jiraKeys: ["FRONT-592", "POS-3261", "POS-3205", "POS-4131"],
    excludeFeatureIds: ["f6"], // Dados e Relatórios (f14 foi unificado em f6) não é entrega de ago/26
    deliveries: [
      { text: "Aba de segmentos pré-definidos no segmentador", epic: "Pente fino / Ajustes 2.0" },
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
      "Melhorias nas Landing Pages, visão de cliente, modais on-site, templates de e-mail e início da migração do disparo.",
    context:
      "Melhorias solicitadas pelas lojas XP já na 2.0 — do fluxo de cadastro nas landing pages às opções de template de e-mail. Reduz atrito para o usuário final da loja e amplia as possibilidades de comunicação disponíveis para campanhas.",
    jiraKeys: ["FRONT-388", "FRONT-389", "FRONT-591", "FRONT-739", "FRONT-740"],
    excludeFeatureIds: ["f11"], // Envios comportamentais BTG (POS-3696) não é entrega de ago/26
    deliveries: [
      { text: "Landing Page: redirect após cadastro, modal de agradecimento e mudança de URL", epic: "Evoluções e melhorias" },
      { text: "Visão de cliente: ajustes na ordenação", epic: "Evoluções e melhorias" },
      { text: "Mudança da tela de SDK", epic: "Evoluções e melhorias" },
      { text: "Modais on-site: modal por audiência/segmento e modal de agradecimento", epic: "Gestão de Campanhas - Fase 2" },
      { text: "Importação de HTML para e-mail", epic: "Gestão de Campanhas - Fase 2" },
      { text: "Template de produto para o e-mail (parte do BTG)", epic: "BTG" },
    ],
  },

  {
    month: 7,
    track: "evolucao",
    title: "Pente fino da plataforma 2.0",
    description:
      "Rodada de refinamento das telas já migradas: Landing Pages, On-Site, Studio, Home e Segmentador — correções de UX e consistência antes da ampliação da base de clientes.",
    context:
      "Antes de migrar mais lojas para a 2.0, o time está corrigindo inconsistências de UX nas telas já entregues. A ideia é garantir que a experiência seja coerente e profissional quando a base de clientes crescer — sem retrabalho depois.",
    jiraKeys: ["FRONT-851", "FRONT-855", "FRONT-857", "FRONT-873", "FRONT-876", "FRONT-872"],
  },

  // ── Setembro/2026 — planejamento ───────────────────────────────────────────
  {
    month: 8,
    track: "evolucao",
    title: "IP Dedicado para E-mail",
    eta: "Final de setembro",
    description:
      "Infraestrutura de envio de e-mail com IP dedicado, garantindo maior reputação e entregabilidade para os disparos da plataforma.",
    context:
      "E-mails enviados por IPs compartilhados têm reputação instável — um único cliente mal configurado prejudica a entregabilidade de todos. Com IP dedicado, a Wake controla a reputação do próprio domínio de envio, o que é pré-requisito para escalar o volume de campanhas sem cair em spam.",
    jiraKeys: ["FRONT-871", "FRONT-703", "FRONT-704", "FRONT-154", "POS-4296", "POS-4342", "POS-4456", "POS-4457", "POS-4458", "POS-4459", "POS-4460", "POS-4461", "POS-4462", "POS-4463", "POS-4464", "POS-4465"],
    excludeFeatureIds: ["f17"], // Evolução de campanhas (FRONT-675) não é entrega de set/26
    deliveries: [
      { text: "Início da migração do sistema de disparo de e-mail", epic: "Evolução - IP dedicado", pending: true },
    ],
  },
  {
    month: 8,
    track: "cdp",
    title: "Nova página de perfil de clientes",
    eta: "Final de setembro",
    description:
      "Refatoração da tela de visão única de cliente trazendo mais dados relativos ao pedido, como forma de pagamento, entrega etc.",
    context:
      "A tela atual mostra dados cadastrais limitados. A nova versão reúne em um só lugar histórico de pedidos, forma de pagamento, dados de entrega e outras informações relevantes — facilitando o atendimento ao cliente e dando mais contexto para decisões comerciais e de CS.",
    jiraKeys: ["FRONT-744", "FRONT-808", "FRONT-764"],
  },
  {
    month: 8,
    track: "migracao",
    title: "Receita e exportações CSV nas campanhas",
    description:
      "Concluir a disponibilização de receita por campanha e as exportações de relatórios CSV (envios pontuais, automáticos e segmentos) via central de notificações.",
    context:
      "Fecha uma lacuna crítica da migração: o time de marketing ainda não consegue ver a receita gerada por cada campanha, nem exportar os dados de envio para análise. Essas funcionalidades existiam na 1.0 e estão sendo reativadas — sem elas, é difícil provar o ROI das campanhas.",
    jiraKeys: ["FRONT-310", "FRONT-407", "FRONT-419", "FRONT-448", "POS-3928", "FRONT-369"],
  },
];
