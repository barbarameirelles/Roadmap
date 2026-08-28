// Roadmap data — épicos 2.0 · Q1 2026 → Q1 2027
// Months are 0-indexed from Jan 2026 (month 0 = Jan 2026, month 14 = Mar 2027)
// "Today" snapshot = Ago 2026 = month 7

export const TODAY_MONTH = 7;

export interface Month {
  idx: number;
  label: string;
  year: number;
  q: string;
}

export const MONTHS: Month[] = [
  { idx: 0,  label: "Jan", year: 2026, q: "Q1 2026" },
  { idx: 1,  label: "Fev", year: 2026, q: "Q1 2026" },
  { idx: 2,  label: "Mar", year: 2026, q: "Q1 2026" },
  { idx: 3,  label: "Abr", year: 2026, q: "Q2 2026" },
  { idx: 4,  label: "Mai", year: 2026, q: "Q2 2026" },
  { idx: 5,  label: "Jun", year: 2026, q: "Q2 2026" },
  { idx: 6,  label: "Jul", year: 2026, q: "Q3 2026" },
  { idx: 7,  label: "Ago", year: 2026, q: "Q3 2026" },
  { idx: 8,  label: "Set", year: 2026, q: "Q3 2026" },
  { idx: 9,  label: "Out", year: 2026, q: "Q4 2026" },
  { idx: 10, label: "Nov", year: 2026, q: "Q4 2026" },
  { idx: 11, label: "Dez", year: 2026, q: "Q4 2026" },
  { idx: 12, label: "Jan", year: 2027, q: "Q1 2027" },
  { idx: 13, label: "Fev", year: 2027, q: "Q1 2027" },
  { idx: 14, label: "Mar", year: 2027, q: "Q1 2027" },
];

export interface Quarter {
  id: string;
  label: string;
  sub: string;
  start: number;
  end: number;
}

export const QUARTERS: Quarter[] = [
  { id: "Q1-2026", label: "Q1 2026", sub: "Jan-Mar", start: 0,  end: 2  },
  { id: "Q2-2026", label: "Q2 2026", sub: "Abr-Jun", start: 3,  end: 5  },
  { id: "Q3-2026", label: "Q3 2026", sub: "Jul-Set", start: 6,  end: 8  },
  { id: "Q4-2026", label: "Q4 2026", sub: "Out-Dez", start: 9,  end: 11 },
  { id: "Q1-2027", label: "Q1 2027", sub: "Jan-Mar", start: 12, end: 14 },
];

export type FeatureStatus =
  | "concluido"
  | "no-prazo"
  | "em-andamento"
  | "atrasado"
  | "atrasado-em-andamento"
  | "replanejado"
  | "despriorizado";

export interface Subtask {
  key: string;
  title: string;
  status: "Done" | "In Progress" | "To Do";
  points: number;
  sprint?: number;
  blocked?: boolean; // BLOQUEADO/BLOCKED no Jira — atualizado no sync semanal
}

// ─── Objetivos estratégicos (tracks) ─────────────────────────────────────────
export type Track = "migracao" | "evolucao" | "cdp";

export const TRACK_META: Record<Track, { label: string; short: string; color: string; bg: string }> = {
  migracao: { label: "Migração da plataforma 1.0 → 2.0", short: "Migração 1.0 → 2.0", color: "#2563eb", bg: "#eff6ff" },
  evolucao: { label: "Evolução da plataforma 2.0",       short: "Evolução 2.0",       color: "#7c3aed", bg: "#f5f3ff" },
  cdp:      { label: "Audience + CDP",                   short: "Audience + CDP",     color: "#0d9488", bg: "#f0fdfa" },
};

// Objetivos de cada feature (tags) — um épico pode pertencer a mais de um
// objetivo, e os % de conclusão por objetivo consideram todos os seus épicos.
export const TRACKS_BY_ID: Record<string, Track[]> = {
  // Migração 1.0 → 2.0 (paridade)
  f1: ["migracao"], f3: ["migracao"], f4: ["migracao"], f5: ["migracao"],
  f6: ["migracao"], f8: ["migracao"], f9: ["migracao"],
  f17: ["migracao"], f19: ["migracao"], f20: ["migracao"],
  f21b: ["migracao"], f24: ["migracao"], f25: ["migracao"], f33: ["migracao"],
  f40: ["migracao"],
  // Telas de paridade com componente CDP/Audience
  f10: ["migracao", "cdp"], f13: ["migracao", "cdp"],
  // Visão resumida dos clientes: evolução + CDP
  f2: ["evolucao", "cdp"],
  f39: ["migracao", "cdp"],
  // Evolução da 2.0 (melhorias contínuas + evoluções pós-migração)
  f30: ["evolucao"], f34: ["evolucao"],
  f36: ["evolucao", "migracao"],
  f35: ["evolucao", "cdp"],
  // Capacidades futuras da plataforma → migração
  f22: ["migracao"], f26: ["migracao"], f27: ["migracao"], f28: ["migracao"],
  // BTG
  f11: ["migracao"],
  // Audience + CDP
  "cdp-1": ["cdp"], "cdp-2a": ["cdp"], "cdp-3": ["cdp"], "cdp-4": ["cdp"], f38: ["cdp"],
  f29: ["cdp", "migracao"],
  // Omni + dados de loja física: integração da plataforma alimentando a CDP
  "cdp-2b": ["migracao", "cdp"],
};

export const tracksOf = (f: Feature): Track[] => TRACKS_BY_ID[f.id] ?? ["migracao"];
export const hasTrack = (f: Feature, t: Track): boolean => tracksOf(f).includes(t);

// Sprint number → month index (0 = Jan 2026). Sprint 44 = Jul 1–14.
export const SPRINT_TO_MONTH: Record<number, number> = {
  31: 0, 32: 0,        // Jan 2026
  33: 0, 34: 1,        // Jan/Feb 2026
  35: 1, 36: 2,        // Feb/Mar 2026
  37: 2, 38: 3,        // Mar/Apr 2026
  39: 3, 40: 4,        // Apr/May 2026
  41: 4, 42: 5,        // May/Jun 2026
  43: 5, 44: 6,        // Jun/Jul 2026
  45: 6, 46: 7,        // Jul/Aug 2026
  47: 7, 48: 8,        // Aug/Sep 2026
  49: 8, 50: 9,        // Sep/Oct 2026
};

export const CURRENT_SPRINT = 48;

export const THIS_MONTH_SPRINTS: number[] = Object.entries(SPRINT_TO_MONTH)
  .filter(([, m]) => Number(m) === TODAY_MONTH)
  .map(([s]) => Number(s));

export const CURRENT_MONTH_LABEL = MONTHS[TODAY_MONTH]?.label ?? "";

export const SPRINT_DATES: Record<number, { start: string; end: string }> = {
  36: { start: "10/mar", end: "23/mar" },
  37: { start: "24/mar", end: "06/abr" },
  38: { start: "07/abr", end: "20/abr" },
  39: { start: "21/abr", end: "04/mai" },
  40: { start: "05/mai", end: "18/mai" },
  41: { start: "19/mai", end: "01/jun" },
  42: { start: "02/jun", end: "15/jun" },
  43: { start: "16/jun", end: "30/jun" },
  44: { start: "01/jul", end: "14/jul" },
  45: { start: "15/jul", end: "28/jul" },
  46: { start: "29/jul", end: "11/ago" },
  47: { start: "12/ago", end: "25/ago" },
  48: { start: "26/ago", end: "08/set" },
};

export interface Feature {
  id: string;
  jiraKey: string;
  jiraKeys?: string[];
  name: string;
  subtitle?: string;
  epic: string;
  project?: "platform" | "cdp";
  tags?: string[];
  planned: { start: number; end: number };
  executed: { start: number; end: number } | null;
  evolution?: { start: number; end: number };
  milestone?: { month: number; label: string };
  flagged?: boolean;
  excludeFromStats?: boolean;
  note?: string;
  status: FeatureStatus;
  progress: number;
  owner: { name: string; initials: string; color: string };
  storyPoints: number;
  subtasks: Subtask[];
}

// Épico ainda não iniciado (sem execução e sem progresso) → fica no backlog,
// fora da linha do tempo, independente do trimestre planejado.
export const isBacklog = (f: Feature): boolean =>
  f.executed === null && f.progress === 0;

export const STATUS_META: Record<
  FeatureStatus,
  { label: string; bg: string; fg: string; dot: string; icon: string }
> = {
  "concluido":             { label: "Concluído",              bg: "#dcfce7", fg: "#15803d", dot: "#16a34a", icon: "✓" },
  "no-prazo":              { label: "No prazo",               bg: "#dbeafe", fg: "#1d4ed8", dot: "#2563eb", icon: "→" },
  "em-andamento":          { label: "Em andamento",           bg: "#fef3c7", fg: "#a16207", dot: "#eab308", icon: "↻" },
  "atrasado":              { label: "Atrasado",               bg: "#fee2e2", fg: "#b91c1c", dot: "#dc2626", icon: "!" },
  "atrasado-em-andamento": { label: "Atrasado · Em andamento", bg: "#ffedd5", fg: "#c2410c", dot: "#f97316", icon: "⚠" },
  "replanejado":           { label: "Replanejado",             bg: "#ede9fe", fg: "#6d28d9", dot: "#7c3aed", icon: "↪" },
  "despriorizado":         { label: "Despriorizado",           bg: "#f1f5f9", fg: "#475569", dot: "#94a3b8", icon: "⏸" },
};

export const FEATURES: Feature[] = [

  // ─── Q1 2026 ──────────────────────────────────────────────────────────────
  {
    id: "f1", jiraKey: "FRONT-362", jiraKeys: ["FRONT-362", "POS-3888"],
    name: "2.0 Campanhas",
    subtitle: "Campanhas por e-mail e WhatsApp",
    epic: "2.0 Campanhas",
    tags: ["platform2"],
    planned: { start: 0, end: 2 }, executed: { start: 0, end: 2 },
    status: "concluido", progress: 100,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#2563eb" },
    storyPoints: 46,
    subtasks: [
      { key: "FRONT-11",  title: "Validação de Nome Duplicado em Campanhas", status: "Done", points: 3, sprint: 34 },
      { key: "FRONT-10",  title: "Possibilidade de salvar campanhas em rascunho", status: "Done", points: 0, sprint: 34 },
      { key: "FRONT-15",  title: "Envio de teste de WhatsApp", status: "Done", points: 0, sprint: 36 },
      { key: "FRONT-33",  title: "Emoticon em Mensagem de WhatsApp e Título de e-mail", status: "Done", points: 0, sprint: 36 },
      { key: "FRONT-29",  title: "Validação de WABA na criação de templates e campanhas", status: "Done", points: 0, sprint: 36 },
      { key: "FRONT-86",  title: "Regra de envio de teste - email e whats", status: "Done", points: 0, sprint: 36 },
      { key: "POS-3021",  title: "Desenvolvimento de fluxo de envio pontual - E-mail", status: "Done", points: 0 },
      { key: "POS-3022",  title: "Desenvolvimento de fluxo de envio pontual - WhatsApp", status: "Done", points: 0 },
      { key: "POS-3023",  title: "Desenvolvimento de envio pontual - Tela de campanhas", status: "Done", points: 0 },
      { key: "POS-3024",  title: "Desenvolvimento de envio automático - E-mail", status: "Done", points: 0 },
      { key: "POS-3025",  title: "Desenvolvimento de envio automático - WhatsApp", status: "Done", points: 0 },
      { key: "POS-3026",  title: "Desenvolvimento de envio automático - Tela inicial", status: "Done", points: 0 },
      { key: "POS-3030",  title: "Ajustes de Rotas de BFF - Envio Automático", status: "Done", points: 0 },
      { key: "POS-3031",  title: "Ajustes de Rotas de BFF - Envio Pontual", status: "Done", points: 0 },
      { key: "POS-3137",  title: "Normalização do DDI +55", status: "Done", points: 0 },
      { key: "POS-3174",  title: "Ajuste nas campanhas Propensos a comprar", status: "Done", points: 0 },
      { key: "POS-3175",  title: "Mandar synapse id para o provider ID em campanhas", status: "Done", points: 0 },
      { key: "POS-3177",  title: "Inclusão de opt out obrigatório na criação de templates de e-mail", status: "Done", points: 0 },
      { key: "POS-3183",  title: "Integração da waba para clientes do commerce", status: "Done", points: 0 },
      { key: "POS-3201",  title: "Novos ações e status de envios pontuais (back)", status: "Done", points: 5 },
      { key: "POS-3202",  title: "Possibilidade de salvar campanhas em rascunho (back)", status: "Done", points: 0 },
      { key: "POS-3203",  title: "Novas ações e status envios automáticos (back)", status: "Done", points: 8 },
      { key: "POS-3241",  title: "Validação de Nome Duplicado em Campanhas (back)", status: "Done", points: 0, sprint: 33 },
      { key: "POS-3254",  title: "Nova API do Meta", status: "Done", points: 13, sprint: 33 },
      { key: "POS-3255",  title: "Possibilitar Repique de e-mail e WhatsApp (back)", status: "Done", points: 8, sprint: 33 },
      { key: "POS-3259",  title: "Envio de teste de WhatsApp (back)", status: "Done", points: 0, sprint: 33 },
      { key: "POS-3311",  title: "Possibilitar Repique de e-mail e WhatsApp (front)", status: "Done", points: 0, sprint: 34 },
      { key: "POS-3315",  title: "Ativar whatsapp em todas as regras automáticas", status: "Done", points: 1, sprint: 33 },
      { key: "POS-3346",  title: "Envio de teste de e-mail Pontual e automático não está funcionando", status: "Done", points: 0, sprint: 33 },
      { key: "POS-3347",  title: "Erro na ativação de carrinho abandonado", status: "Done", points: 0, sprint: 33 },
      { key: "POS-3438",  title: "Nova API Meta (front)", status: "Done", points: 0, sprint: 34 },
      { key: "POS-3468",  title: "Ajuste de UTMs", status: "Done", points: 0, sprint: 35 },
      { key: "POS-3556",  title: "Discovery: Voltar com envio de teste de e-mail", status: "Done", points: 3, sprint: 35 },
      { key: "POS-3849",  title: "Bloqueio de campanhas duplicadas por régua e canal", status: "Done", points: 2, sprint: 37 },
      { key: "POS-4403",  title: "Integração do relatório de receita por campanha com endpoint de downloads", status: "Done", points: 0, sprint: 48 },
    ],
  },

  {
    id: "f2", jiraKey: "POS-3964", jiraKeys: ["POS-3964", "FRONT-361"],
    name: "2.0 Visão do cliente — resumida",
    subtitle: "Perfil resumido de cada cliente",
    epic: "2.0 Visão do cliente",
    tags: ["platform2", "cdp"],
    planned: { start: 0, end: 2 }, executed: { start: 0, end: 2 },
    status: "concluido", progress: 100,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#9333ea" },
    storyPoints: 0,
    subtasks: [
      { key: "POS-3027", title: "Desenvolvimento de Visão de cliente - visão geral", status: "Done", points: 0 },
      { key: "POS-3028", title: "Desenvolvimento de visão de cliente - Integrações", status: "Done", points: 0 },
      { key: "POS-3032", title: "Ajustes de Rotas de BFF - Visão de cliente", status: "Done", points: 0 },
      { key: "POS-3033", title: "Discovery dos recursos do Unomi disponíveis via API SMB", status: "Done", points: 0 },
      { key: "FRONT-764", title: "[UX] Visão do cliente: Tela de pedidos e sessões", status: "Done", points: 0, sprint: 43 },
      { key: "FRONT-808", title: "Perfil de Cliente - Eventos, Pedidos e Filtros", status: "To Do", points: 0, sprint: 46 },
      { key: "FRONT-725", title: "Voltar com as telas de visão de clientes para produção", status: "Done", points: 0 },
      { key: "FRONT-215", title: "Visão única do cliente: Origem do lead", status: "Done", points: 0 },
      { key: "FRONT-771", title: "[UX] Visão do cliente: Ajustes de UI", status: "Done", points: 0, sprint: 44 },
    ],
  },

  {
    id: "f3", jiraKey: "FRONT-364", jiraKeys: ["FRONT-364", "POS-2892"],
    name: "2.0 On Site",
    subtitle: "Pop-ups e banners no site",
    epic: "2.0 On Site",
    tags: ["platform2"],
    planned: { start: 0, end: 2 }, executed: { start: 0, end: 2 },
    status: "concluido", progress: 100,
    owner: { name: "Bruno Cruz Silva", initials: "BC", color: "#dc2626" },
    storyPoints: 3,
    subtasks: [
      { key: "FRONT-5",   title: "INTEGRAÇÃO: On Site na nova plataforma", status: "Done", points: 3, sprint: 32 },
      { key: "FRONT-7",   title: "APENAS TELAS: On Site na nova plataforma", status: "Done", points: 3 },
      { key: "FRONT-308", title: "Ativação do Componente Countdown no Editor Beefree", status: "Done", points: 3, sprint: 38 },
    ],
  },

  {
    id: "f4", jiraKey: "FRONT-365", jiraKeys: ["POS-3887", "FRONT-365"],
    name: "2.0 Landing Page",
    subtitle: "Páginas de captura e conversão",
    epic: "2.0 Landing Page",
    tags: ["platform2"],
    planned: { start: 0, end: 2 }, executed: { start: 0, end: 2 },
    status: "concluido", progress: 100,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#0891b2" },
    storyPoints: 5,
    subtasks: [
      { key: "FRONT-8",   title: "Trazer LP para dentro da nova plataforma", status: "Done", points: 3 },
      { key: "FRONT-14",  title: "Disponibilizar templates pré prontos no Studio", status: "Done", points: 3, sprint: 34 },
      { key: "FRONT-268", title: "Disponibilizar templates de LP como Modelos Prontos", status: "Done", points: 3, sprint: 38 },
      { key: "FRONT-311", title: "Ajuste de Responsividade e Visualização do Editor Beefree", status: "Done", points: 3, sprint: 38 },
      { key: "POS-3269",  title: "BUG: Erro ao criar Landing Page - Inclusão de templates", status: "Done", points: 3, sprint: 32 },
      { key: "FRONT-496", title: "Ajustar tamanho do card da LP pra ficar igual ao das demais features", status: "Done", points: 0 },
      { key: "FRONT-828", title: "Erro ao despublicar LP", status: "Done", points: 0, sprint: 46 },
      { key: "FRONT-829", title: "Ao submeter um form na Landing Page, o botão não funciona", status: "Done", points: 0, sprint: 46 },
      { key: "FRONT-748", title: "Mudança de url de landing page", status: "Done", points: 0, sprint: 48 },
    ],
  },

  {
    id: "f5", jiraKey: "FRONT-363", jiraKeys: ["FRONT-363", "POS-3894"],
    name: "2.0 Studio",
    subtitle: "Editor de templates e-mail e WhatsApp",
    epic: "2.0 Studio",
    tags: ["platform2"],
    planned: { start: 0, end: 2 }, executed: { start: 0, end: 2 },
    status: "concluido", progress: 100,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#059669" },
    storyPoints: 14,
    subtasks: [
      { key: "POS-2898",  title: "Discovery de Studio", status: "Done", points: 2 },
      { key: "POS-2937",  title: "Criação de telas de Studio", status: "Done", points: 5 },
      { key: "POS-2957",  title: "Desenvolvimento Studio (back)", status: "Done", points: 5 },
      { key: "POS-2960",  title: "Trazer Studio para a BFF do SMB Commerce", status: "Done", points: 3 },
      { key: "POS-3120",  title: "Subir Studio em produção", status: "Done", points: 3 },
      { key: "POS-3140",  title: "Templates pré prontos de email (back)", status: "Done", points: 3 },
      { key: "POS-3172",  title: "Studio: Implementar SynapseId no retorno de Templates", status: "Done", points: 2 },
      { key: "POS-3176",  title: "Filtro para retornar templates com Botão de URL", status: "Done", points: 2 },
      { key: "POS-3218",  title: "Discovery: templates pré prontos de whatsapp", status: "Done", points: 2 },
      { key: "POS-3242",  title: "Não permitir criação de templates com nome duplicado (back)", status: "Done", points: 3, sprint: 33 },
      { key: "POS-3303",  title: "Não permitir criação de templates com nome duplicado (front)", status: "Done", points: 3, sprint: 34 },
      { key: "POS-3344",  title: "Ajuste de status/ações na tela de Studio", status: "Done", points: 3, sprint: 33 },
      { key: "POS-3704",  title: "Disponibilizar templates pré prontos no Studio", status: "Done", points: 3, sprint: 35 },
      { key: "POS-3730",  title: "Update do Template do Whatsapp em Studio não sincroniza", status: "Done", points: 3, sprint: 36 },
      { key: "FRONT-581", title: "STUDIO: Visualização dos templates criados está quebrada", status: "Done", points: 0 },
      { key: "FRONT-278", title: "Padronização de duplicação de templates no Studio", status: "Done", points: 0 },
      { key: "FRONT-241", title: "Bloquear edição de templates de WhatsApp com status pendente", status: "Done", points: 0 },
    ],
  },

  {
    id: "f6", jiraKey: "POS-3889", jiraKeys: ["POS-3889", "FRONT-366", "FRONT-595"],
    name: "2.0 Dados e Relatórios",
    subtitle: "Infraestrutura e ajustes técnicos",
    epic: "2.0 Dados e Relatórios",
    tags: ["platform2"],
    planned: { start: 0, end: 11 }, executed: { start: 0, end: 4 },
    status: "concluido", progress: 100,
    owner: { name: "Renato Novaes", initials: "RN", color: "#7c3aed" },
    storyPoints: 4,
    subtasks: [
      { key: "POS-3122",  title: "Discovery: criação de novas propriedades dentro do Unomi", status: "Done", points: 0 },
      { key: "POS-3128",  title: "Tela de evolução de base (back)", status: "Done", points: 0 },
      { key: "POS-3139",  title: "Integração com GA4 (back)", status: "Done", points: 0 },
      { key: "POS-3182",  title: "Tela de evolução de base (front)", status: "Done", points: 0 },
      { key: "POS-3195",  title: "Tela de Relatórios (back)", status: "To Do", points: 0 },
      { key: "POS-3205",  title: "Permitir que campos das LPs e On Site virem atributo do cliente", status: "Done", points: 5 },
      { key: "POS-3261",  title: "Permitir que qualquer campo de lista vire atributo do cliente", status: "Done", points: 5, sprint: 42 },
      { key: "POS-3300",  title: "Integração GA4 com XP", status: "Done", points: 0, sprint: 33 },
      { key: "POS-3301",  title: "Integração GA4 - Uso de dados para relatórios", status: "Done", points: 3, sprint: 33 },
      { key: "POS-4039",  title: "Criar tabela com dados de Receita das campanhas", status: "Done", points: 0, sprint: 39 },
      { key: "FRONT-18",  title: "Integração GA4 (frontend)", status: "Done", points: 0, sprint: 38 },
      { key: "FRONT-367", title: "Criação de relatório de campanhas automáticas", status: "To Do", points: 0 },
      { key: "FRONT-368", title: "Criação de relatório de campanhas pontuais", status: "To Do", points: 0 },
      { key: "FRONT-382", title: "Matriz RFV", status: "Done", points: 0 },
      { key: "FRONT-383", title: "Mostrar alteração de volume de um segmento", status: "Done", points: 0 },
      { key: "FRONT-628", title: "Relatório de envios transacionais", status: "To Do", points: 0 },
      { key: "FRONT-629", title: "Relatórios de performance", status: "To Do", points: 0 },
      { key: "FRONT-630", title: "Relatório de pessoas", status: "To Do", points: 0 },
      { key: "FRONT-631", title: "Relatório de provedores", status: "To Do", points: 0 },
      { key: "FRONT-632", title: "Relatório de On site", status: "To Do", points: 0 },
      { key: "FRONT-633", title: "Relatório de Web Push", status: "To Do", points: 0 },
      { key: "FRONT-761", title: "UX Revisao da feature de optout", status: "To Do", points: 0, sprint: 43 },
      { key: "FRONT-592", title: "Tela de atributos personalizados", status: "Done", points: 0, sprint: 41 },
    ],
  },

  {
    id: "f8", jiraKey: "POS-3967",
    name: "2.0 Listas",
    subtitle: "Importação e gerenciamento de listas",
    epic: "2.0 Listas",
    tags: ["platform2"],
    planned: { start: 0, end: 2 }, executed: { start: 0, end: 2 },
    status: "concluido", progress: 100,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#9333ea" },
    storyPoints: 8,
    subtasks: [
      { key: "POS-2952",  title: "Criação de tela de gestão de listas", status: "Done", points: 3 },
      { key: "POS-2963",  title: "Adaptação da gestão de listas na BFF", status: "Done", points: 3 },
      { key: "POS-3135",  title: "Melhorias na Gestão de Listas: Ações por Status e Arquivo (back)", status: "Done", points: 3 },
      { key: "POS-3194",  title: "Implementar filtro de campos dinâmicos na listagem de templates", status: "Done", points: 2 },
      { key: "POS-3268",  title: "Erro ao importar lista usando modelo padrão da plataforma", status: "Done", points: 2, sprint: 32 },
      { key: "POS-3313",  title: "Melhorias na Gestão de Listas: Ações por Status e Arquivo (front)", status: "Done", points: 3, sprint: 33 },
      { key: "POS-3373",  title: "Lista não está refletindo na visão do cliente", status: "Done", points: 2, sprint: 33 },
      { key: "POS-3590",  title: "Criação de Rota para Consultas de Listas do Email", status: "Done", points: 3, sprint: 35 },
    ],
  },

  {
    id: "f9", jiraKey: "POS-912", jiraKeys: ["POS-912", "FRONT-125", "FRONT-371", "POS-3966", "FRONT-596", "POS-3965"],
    name: "2.0 Integrações",
    subtitle: "Configuração inicial da plataforma",
    epic: "2.0 Setup inicial",
    tags: ["platform2"],
    planned: { start: 0, end: 11 }, executed: { start: 0, end: 4 },
    status: "concluido", progress: 100,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#7c3aed" },
    storyPoints: 20,
    subtasks: [
      { key: "POS-2854",  title: "Autenticação cortex BFF", status: "Done", points: 2 },
      { key: "POS-2894",  title: "Criação de estrutura base do projeto no mono repo", status: "Done", points: 3 },
      { key: "POS-2895",  title: "FRONT: Layout do menu e conteúdo", status: "Done", points: 3 },
      { key: "POS-2897",  title: "FRONT: Criação de pipeline e DNS", status: "Done", points: 3 },
      { key: "POS-2900",  title: "Criação de pipeline para a BFF", status: "Done", points: 3 },
      { key: "POS-2932",  title: "POC Keycloak Federation", status: "Done", points: 5 },
      { key: "POS-2962",  title: "Integração do keycloak", status: "Done", points: 5 },
      { key: "POS-3034",  title: "BACK: Rotas de BFF - Área do cliente", status: "Done", points: 0 },
      { key: "POS-3035",  title: "BACK: Area do Cliente (planos, dados,..). Discovery dos recursos disponíveis na API do SMB.", status: "Done", points: 0 },
      { key: "POS-3036",  title: "Subir BFF do cortex em produção", status: "Done", points: 3 },
      { key: "POS-3037",  title: "Criação dos registros de Plataforma de Commerce no SMB", status: "Done", points: 3 },
      { key: "POS-3038",  title: "Testes finais integrados", status: "Done", points: 3 },
      { key: "POS-3057",  title: "Padronização de componentes para design system", status: "Done", points: 3 },
      { key: "POS-3118",  title: "Discovery: SDK para o Commerce", status: "Done", points: 0 },
      { key: "POS-3200",  title: "Ajustes de UI", status: "Done", points: 2 },
      { key: "POS-3221",  title: "Tela inicial da plataforma", status: "Done", points: 3 },
      { key: "POS-3235",  title: "BACK: Rota da BFF para gráfico da tela de integrações", status: "Done", points: 0, sprint: 32 },
      { key: "POS-3252",  title: "Rota Custom para Tela Inicial da Plataforma", status: "Done", points: 3, sprint: 32 },
      { key: "POS-3267",  title: "Ajustar responsividade na seleção de audiência", status: "Done", points: 2, sprint: 32 },
      { key: "POS-3270",  title: "[MUST] Criação do SDK para captação de eventos com commerce", status: "Done", points: 0, sprint: 33 },
      { key: "POS-3275",  title: "Seleção de Conta após Login", status: "Done", points: 3, sprint: 33 },
      { key: "POS-3284",  title: "Scroll para o topo da página", status: "Done", points: 1, sprint: 33 },
      { key: "POS-3420",  title: "Landing Page de integração com o Commerce", status: "Done", points: 5, sprint: 34 },
      { key: "POS-3423",  title: "Atualização do sidebar", status: "Done", points: 2, sprint: 33 },
      { key: "POS-3603",  title: "Tornar a criação de Customer idempotente para múltiplos envios", status: "Done", points: 3, sprint: 35 },
      { key: "POS-3604",  title: "[BACK] Criação de rota para consulta do token da SDK", status: "Done", points: 0, sprint: 35 },
      { key: "FRONT-6",   title: "Tela do SDK", status: "Done", points: 0, sprint: 34 },
      { key: "FRONT-600", title: "Importação de XML", status: "To Do", points: 3 },
      { key: "FRONT-601", title: "Integrações via API", status: "To Do", points: 3 },
      { key: "FRONT-602", title: "Google Drive", status: "To Do", points: 3 },
      { key: "FRONT-604", title: "Integração Tray Commerce", status: "To Do", points: 3 },
      { key: "FRONT-605", title: "Parametrização", status: "To Do", points: 3 },
      { key: "FRONT-28",  title: "Ajustes pós validação", status: "Done", points: 2, sprint: 34 },
      { key: "FRONT-158", title: "Ajustes pós pente fino: SECUNDÁRIOS", status: "Done", points: 3, sprint: 36 },
      { key: "FRONT-213", title: "Ajustes pós pente fino: PRIORITÁRIOS", status: "Done", points: 3, sprint: 36 },
      { key: "FRONT-487", title: "Rotação de chaves AWS - API e NiFi", status: "Done", points: 3, sprint: 39 },
      { key: "FRONT-603", title: "Integração VTEX", status: "To Do", points: 3 },
      { key: "FRONT-225", title: "Ajustes pós pente fino: TERCEÁRIOS", status: "Done", points: 0, sprint: 39 },
      { key: "FRONT-760", title: "Inclusão do Clarity na plataforma 2.0", status: "Done", points: 0, sprint: 48 },
    ],
  },

  {
    id: "f10", jiraKey: "FRONT-360", jiraKeys: ["FRONT-360", "POS-3886"],
    name: "2.0 Segmentador",
    subtitle: "Segmentação básica de clientes",
    epic: "2.0 Segmentador",
    tags: ["platform2", "cdp"],
    planned: { start: 1, end: 5 }, executed: { start: 1, end: 4 },
    status: "concluido", progress: 100,
    owner: { name: "Renato Novaes", initials: "RN", color: "#059669" },
    storyPoints: 48,
    subtasks: [
      { key: "POS-3265",  title: "Discovery para viabilizar o Segmentador", status: "Done", points: 13, sprint: 33 },
      { key: "POS-3538",  title: "Construção do back do segmentador", status: "Done", points: 13, sprint: 35 },
      { key: "POS-3539",  title: "Estruturação de motor do segmentador - PARTE 1", status: "Done", points: 8, sprint: 35 },
      { key: "POS-3711",  title: "Estruturação de motor do segmentador - PARTE 2", status: "Done", points: 5, sprint: 36 },
      { key: "POS-3841",  title: "Ajustes segmentador", status: "Done", points: 0, sprint: 37 },
      { key: "POS-3861",  title: "Ajustes adicionais segmentador", status: "Done", points: 0, sprint: 38 },
      { key: "POS-3879",  title: "Consolidador e normalização de gêneros para o segmentador", status: "Done", points: 0, sprint: 38 },
      { key: "POS-3885",  title: "Ajuste Segmentador - Audiência Pré Definida", status: "Done", points: 0, sprint: 38 },
      { key: "POS-3900",  title: "Erro 400 - Segmentador", status: "Done", points: 0, sprint: 38 },
      { key: "POS-3903",  title: "Listagem do segmentador não traz o total de clientes", status: "Done", points: 0, sprint: 38 },
      { key: "POS-3927",  title: "Segmentador: critérios de origem com janela de tempo (back)", status: "Done", points: 5, sprint: 39 },
      { key: "POS-3937",  title: "Segmentador - Ajustes pós validação", status: "Done", points: 3, sprint: 38 },
      { key: "POS-4004",  title: "Segmentador - Alteração da rota de duplicação", status: "Done", points: 1, sprint: 39 },
      { key: "POS-4023",  title: "Deploy segmentador", status: "Done", points: 0, sprint: 39 },
      { key: "POS-4093",  title: "CDP - Erro ao estimar segmentação muito grande", status: "Done", points: 0, sprint: 40 },
      { key: "FRONT-12",  title: "Construção de Front do segmentador", status: "Done", points: 0, sprint: 35 },
      { key: "FRONT-267", title: "Segmentador: critérios de origem com janela de tempo", status: "Done", points: 0, sprint: 39 },
      { key: "FRONT-280", title: "Ajustes segmentador", status: "Done", points: 0, sprint: 37 },
      { key: "FRONT-458", title: "Segmentador - Ajustes pós validação", status: "Done", points: 0, sprint: 38 },
      { key: "FRONT-509", title: "Segmentador - Modal de Configuração ao Duplicar Segmento", status: "Done", points: 0, sprint: 39 },
      { key: "POS-4260",  title: "[CDP] Validar Desempenho da Unomi em Segmentação e Atribuição de Profiles", status: "Done", points: 0 },
      { key: "FRONT-769", title: "Erro ao pausar segmentação", status: "Done", points: 0, sprint: 44 },
    ],
  },


  // ─── CDP ────────────────────────────────────────────────────────────────────
  {
    id: "cdp-1", jiraKey: "FRONT-668", jiraKeys: ["FRONT-668", "POS-3304"],
    name: "2.0 Dados CDP",
    subtitle: "Estruturação e ingestão de dados na CDP",
    epic: "CDP",
    project: "cdp",
    tags: ["cdp"],
    planned: { start: 3, end: 6 }, executed: { start: 0, end: 4 },
    status: "em-andamento", progress: 90,
    note: "POS-4129 (Consolidar dados de Campanhas) bloqueada no Jira.",
    owner: { name: "Pedro Dib", initials: "PD", color: "#0891b2" },
    storyPoints: 24,
    subtasks: [
      { key: "POS-4069", title: "Eventos de register não sendo emitidos no SDK", status: "Done", points: 0 },
      { key: "POS-4096", title: "[CDP] Ingerir o dado via API - Dados da SDK", status: "Done", points: 3, sprint: 41 },
      { key: "POS-4097", title: "[CDP] Unificação dos SDK: Juntar SDK On site + SDK SMB", status: "Done", points: 5, sprint: 41 },
      { key: "POS-4098", title: "[CDP] Unificação dos SDK: Usar API para a ingestão de dados", status: "Done", points: 5, sprint: 41 },
      { key: "POS-4106", title: "[CDP] Liberar audiências pré definidas (SMB) para todo/qualquer cliente", status: "Done", points: 8, sprint: 41 },
      { key: "POS-4109", title: "Estruturação de Consumo - Catálogo de produtos Commerce", status: "Done", points: 0, sprint: 42 },
      { key: "POS-4115", title: "[CDP] Unificação dos SDKs: Unificar SDK de plug-ins dentro da SDK nova criada", status: "Done", points: 0, sprint: 41 },
      { key: "POS-4116", title: "Obter profile por ID", status: "Done", points: 3, sprint: 41 },
      { key: "POS-4130", title: "Consolidar Compras", status: "Done", points: 0, sprint: 41 },
      { key: "POS-4131", title: "Consolidar Cidade e Estado", status: "Done", points: 0, sprint: 41 },
      { key: "POS-4132", title: "Segmentador não deve buscar dados em eventos", status: "Done", points: 0, sprint: 41 },
      { key: "POS-4162", title: "[CDP] Back: Listagem de profiles na API da CDP", status: "Done", points: 0 },
      { key: "POS-4163", title: "[CDP] Back: Filtros de profiles na API da CDP", status: "Done", points: 0 },
      { key: "POS-4164", title: "[CDP] Back: Obter eventos do profile na API da CDP", status: "Done", points: 0 },
      { key: "POS-4165", title: "[CDP] Back: Excluir o profile na API da CDP", status: "Done", points: 0 },
      { key: "POS-4195", title: "[CDP] Alterar um endpoint específico para disponibilizar segmentos criados pelo cliente", status: "Done", points: 0, sprint: 41 },
      { key: "POS-4402", title: "Provisionamento nova conta de cliente", status: "Done", points: 0, sprint: 46 },
      { key: "POS-4216",  title: "Segmentador: Campos Custom", status: "Done", points: 0 },
    ],
  },


  // ─── Q2 2026 ──────────────────────────────────────────────────────────────
  {
    id: "f13", jiraKey: "POS-3964", jiraKeys: ["POS-3964", "FRONT-361"],
    name: "2.0 Visão do cliente — comportamental",
    subtitle: "Dados comportamentais e de compras",
    epic: "2.0 Visão única do cliente",
    tags: ["platform2", "cdp"],
    planned: { start: 4, end: 5 }, executed: { start: 3, end: 4 },
    status: "concluido", progress: 100,
    owner: { name: "Renato Novaes", initials: "RN", color: "#9333ea" },
    storyPoints: 3,
    subtasks: [
      { key: "FRONT-215", title: "Visão única do cliente: Origem do lead", status: "Done", points: 0, sprint: 38 },
      { key: "FRONT-216", title: "Implementar aba Compras na visão do cliente", status: "Done", points: 0, sprint: 38 },
      { key: "FRONT-217", title: "Visão única de Clientes: filtros multi-seleção, colunas Origem e LTV", status: "Done", points: 3, sprint: 39 },
      { key: "FRONT-390", title: "Visão única: Campos custom", status: "Done", points: 0, sprint: 39 },
      { key: "FRONT-585", title: "Visão Única de Clientes - Ajustar remoção de filtro", status: "Done", points: 0, sprint: 41 },
      { key: "FRONT-636", title: "Investigar captação de leads na Visão Única de Clientes", status: "Done", points: 0, sprint: 41 },
      { key: "POS-4067", title: "Visão única de Clientes: filtros multi-seleção, colunas Origem e LTV (back)", status: "Done", points: 0, sprint: 40 },
    ],
  },


  // ── BTG frente 1: Motor de recomendação ──────────────────────────────────
  {
    id: "f11", jiraKey: "POS-3696", jiraKeys: ["POS-3696", "FRONT-152", "FRONT-524"],
    name: "2.0 BTG",
    subtitle: "Motor de recomendação + grupos de regras",
    epic: "2.0 BTG",
    tags: ["platform2", "cdp"],
    planned: { start: 4, end: 7 }, executed: { start: 3, end: 4 },
    status: "despriorizado", progress: 62,
    note: "Épico unificado (motor + grupos de regras). Replanejado para início de Agosto/26 — o back-end precisou priorizar a CDP. POS-3770 e POS-4063 bloqueadas no Jira.",
    owner: { name: "Ricardo Barretto", initials: "RB", color: "#dc2626" },
    storyPoints: 160,
    subtasks: [
      { key: "POS-3397", title: "Discovery para trazer BTG para nova estrutura", status: "Done", points: 8, sprint: 34 },
      { key: "POS-3558", title: "Estruturação/criação de motor do XML", status: "Done", points: 13, sprint: 35 },
      { key: "POS-3691", title: "[BTG] Conector do Unomi no Nabucodonosor", status: "Done", points: 5, sprint: 36 },
      { key: "POS-3694", title: "[BTG] Migração de processamento de regras (18 Regras)", status: "Done", points: 0, sprint: 40 },
      { key: "POS-3693", title: "[BTG] Migração de recomendação de produtos", status: "Done", points: 13, sprint: 36 },
      { key: "POS-3772", title: "Estruturação do motor de consolidação de dados", status: "Done", points: 0, sprint: 37 },
      { key: "POS-3773", title: "Criação da estruturação de eventos", status: "Done", points: 0, sprint: 37 },
      { key: "POS-3788", title: "Criar endpoints novos na API de Recomendação", status: "Done", points: 8, sprint: 37 },
      { key: "POS-3796", title: "[NABUCO] Implementar Tracker de ciclo de vida e concorrência", status: "Done", points: 3, sprint: 37 },
      { key: "POS-3797", title: "[NABUCO] Implementar Scheduler nativo (APScheduler)", status: "Done", points: 3, sprint: 37 },
      { key: "POS-3832", title: "Criação do Worker de Inserção de Eventos na CDP", status: "Done", points: 0, sprint: 38 },
      { key: "POS-3837", title: "Provisionar ambiente de Prod do Segmentador", status: "Done", points: 8, sprint: 38 },
      { key: "POS-4040", title: "Disponibilizar na BFF dados de produtos e categorias para o BTG", status: "Done", points: 5, sprint: 40 },
      { key: "POS-4041", title: "Discovery: como puxar dados de produtos direto do commerce", status: "Done", points: 0, sprint: 40 },
      { key: "POS-4046", title: "BTG - Alterações nas regras", status: "Done", points: 3, sprint: 40 },
      { key: "POS-4074", title: "Criar endpoint de campanhas ativas por tipo e canal", status: "Done", points: 3, sprint: 40 },
      { key: "FRONT-591", title: "BTG: Feature de template de produto", status: "Done", points: 0, sprint: 41 },
      { key: "POS-4168",  title: "[BTG] Teste de carga da aplicação", status: "To Do", points: 0 },
      { key: "POS-4169",  title: "[BTG] Entender o consumo para definir limites e preços da aplicação", status: "To Do", points: 0 },
      { key: "FRONT-701", title: "Integração do Editor Beefree com Templates de Produto", status: "Done", points: 0 },
      { key: "POS-4238",  title: "Ligar recomendação dos produtos com disparo de campanha", status: "To Do", points: 0 },
      { key: "POS-3833", title: "Criação da Regra de Pós Compra", status: "Done", points: 5, sprint: 38 },
      { key: "POS-3834", title: "Criação da Regra de Decididos", status: "Done", points: 5, sprint: 38 },
      { key: "POS-3835", title: "Criação do Service de Consolidação de Navegação Semanal", status: "Done", points: 0, sprint: 38 },
      { key: "POS-3836", title: "Criação do Service de Consolidação de Navegação Mensal", status: "Done", points: 0, sprint: 38 },
      { key: "POS-3838", title: "Segmentação de Decididos", status: "Done", points: 3, sprint: 38 },
      { key: "POS-3839", title: "Segmentação de Pos Compra", status: "Done", points: 0, sprint: 38 },
      { key: "POS-3921", title: "Consolidação dos Dados de Indecisos", status: "Done", points: 5, sprint: 39 },
      { key: "POS-3922", title: "Consolidação dos Dados de Inativos", status: "Done", points: 0, sprint: 39 },
      { key: "POS-3923", title: "Consolidação dos Dados de Reconquista", status: "Done", points: 0, sprint: 39 },
      { key: "POS-3925", title: "Segmentação de Inativos", status: "Done", points: 3, sprint: 40 },
      { key: "POS-3926", title: "Segmentação de Reconquista", status: "Done", points: 3, sprint: 40 },
      { key: "POS-4005", title: "Consolidação dos Dados de Redução de Preços", status: "Done", points: 5, sprint: 40 },
      { key: "POS-4006", title: "Consolidação dos Dados de Novidades", status: "Done", points: 0, sprint: 40 },
      { key: "POS-4058", title: "Segmentação Aniversário", status: "To Do", points: 0 },
      { key: "POS-4059", title: "Consolidação Aniversário", status: "Done", points: 3, sprint: 41 },
      { key: "FRONT-534", title: "BTG - Regra de Decididos", status: "Done", points: 0, sprint: 40 },
      { key: "FRONT-376", title: "BTG - Navegação Semanal", status: "Done", points: 0, sprint: 40 },
      { key: "FRONT-535", title: "BTG - Regra Navegação Mensal", status: "Done", points: 0, sprint: 40 },
      { key: "FRONT-548", title: "BTG - Regra de Navegação", status: "Done", points: 0, sprint: 40 },
      { key: "FRONT-150", title: "BTG - Abandono – Disparo e Conteúdo", status: "Done", points: 0, sprint: 39 },
      { key: "FRONT-153", title: "BTG - Pós-Compra – Disparo e Conteúdo", status: "Done", points: 0, sprint: 40 },
      { key: "FRONT-220", title: "BTG - Regra de Inativos", status: "Done", points: 0, sprint: 41 },
      { key: "FRONT-537", title: "BTG - Regra Reconquista", status: "Done", points: 0, sprint: 41 },
      { key: "FRONT-542", title: "BTG - Regra de Indecisos", status: "Done", points: 0, sprint: 41 },
      { key: "FRONT-544", title: "BTG - Regra de Novidades", status: "Done", points: 0, sprint: 41 },
      { key: "FRONT-545", title: "BTG - Regra Redução de Preços", status: "In Progress", points: 0, sprint: 41 },
      { key: "FRONT-221", title: "BTG - Regra de Aniversário", status: "To Do", points: 0, sprint: 42 },
      { key: "POS-3770",  title: "Construção das regras: Navegações e abandono de carrinho", status: "To Do", points: 5, sprint: 37, blocked: true },
      { key: "POS-3924",  title: "Segmentação de Indecisos", status: "Done", points: 3, sprint: 41 },
      { key: "POS-4050",  title: "Segmentação dos Dados de Redução de Preços", status: "Done", points: 3, sprint: 41 },
      { key: "POS-4051",  title: "Segmentação dos Dados de Novidades", status: "To Do", points: 3, sprint: 42 },
      { key: "POS-4060",  title: "Segmentação Propensos a comprar", status: "Done", points: 0 },
      { key: "POS-4061",  title: "Consolidação propensos a comprar", status: "Done", points: 3, sprint: 41 },
      { key: "FRONT-536", title: "BTG - Regra Propensos a Comprar", status: "Done", points: 3, sprint: 42 },
      { key: "POS-4062", title: "Segmentação Recorrência", status: "To Do", points: 0 },
      { key: "POS-4063", title: "Consolidação Recorrência", status: "To Do", points: 0, sprint: 42, blocked: true },
      { key: "POS-4075", title: "Segmentação Novos Cadastros", status: "To Do", points: 0 },
      { key: "POS-4076", title: "Consolidação Novos Cadastros", status: "To Do", points: 0 },
      { key: "POS-4077", title: "Segmentação Envio por Data", status: "To Do", points: 0 },
      { key: "POS-4078", title: "Consolidação Envio por Data", status: "To Do", points: 0 },
      { key: "POS-4079", title: "Segmentação Busca", status: "To Do", points: 0 },
      { key: "POS-4080", title: "Consolidação Busca", status: "To Do", points: 0 },
      { key: "POS-4081", title: "Segmentação Lista de Desejos", status: "To Do", points: 0 },
      { key: "POS-4082", title: "Consolidação Lista de Desejos", status: "To Do", points: 0 },
      { key: "POS-4083", title: "Segmentação Redução de Preços Similares", status: "To Do", points: 0 },
      { key: "POS-4084", title: "Consolidação Redução de Preços Similares", status: "To Do", points: 0 },
      { key: "POS-4085", title: "Segmentação Tendências", status: "To Do", points: 0 },
      { key: "POS-4086", title: "Consolidação Tendências", status: "To Do", points: 0 },
      { key: "POS-4087", title: "Segmentação Avise-me", status: "To Do", points: 0 },
      { key: "POS-4088", title: "Consolidação Avise-me", status: "To Do", points: 0 },
      { key: "POS-4089", title: "Segmentação Fidelidade", status: "To Do", points: 0 },
      { key: "POS-4090", title: "Consolidação Fidelidade", status: "To Do", points: 0 },
      { key: "FRONT-538", title: "BTG - Regra Recorrência", status: "To Do", points: 3, sprint: 42 },
      { key: "FRONT-539", title: "BTG - Regra Novos Cadastros", status: "Done", points: 3, sprint: 42 },
      { key: "FRONT-540", title: "BTG - Regra Envio por Data", status: "To Do", points: 3, sprint: 42 },
      { key: "FRONT-541", title: "BTG - Regra de Busca", status: "To Do", points: 3, sprint: 42 },
      { key: "FRONT-543", title: "BTG - Regra Lista de Desejos", status: "Done", points: 3, sprint: 42 },
      { key: "FRONT-546", title: "BTG - Regra Redução de Preços Similares", status: "To Do", points: 3, sprint: 42 },
      { key: "FRONT-547", title: "BTG - Regra de Tendências", status: "Done", points: 3, sprint: 42 },
      { key: "FRONT-549", title: "BTG - Regra Avise-me", status: "To Do", points: 3, sprint: 42 },
      { key: "FRONT-550", title: "BTG - Regra de Fidelidade", status: "To Do", points: 3, sprint: 42 },
      { key: "FRONT-151", title: "BTG - Discovery para como usar templatize para recomendação de produtos", status: "Done", points: 0, sprint: 37 },
      { key: "FRONT-690", title: "Configurações gerais BTG - Pressão de comunicação", status: "Done", points: 0 },
      { key: "FRONT-727", title: "[UX] Revisar usabilidade de feature de pressão de comunicação", status: "Done", points: 0 },
    ],
  },


  // ── BTG frente 2: Primeiro grupo de regras ──────────────────────────────

  // ── BTG frente 3: Segundo grupo de regras ───────────────────────────────
  {
    id: "f21b", jiraKey: "POS-4476",
    name: "2.0 Integração VTEX",
    subtitle: "Conexão nativa com a plataforma VTEX",
    epic: "2.0 Integrações",
    tags: ["platform2"],
    planned: { start: 6, end: 8 }, executed: null,
    milestone: { month: 8, label: "Marco: Standalone + VTEX (Set/26)" },
    status: "no-prazo", progress: 0,
    note: "Despriorizado — foco será em Wake Commerce.",
    owner: { name: "isabela.beatriz", initials: "IB", color: "#7c3aed" },
    storyPoints: 0,
    subtasks: [
      { key: "POS-3264",  title: "Discovery Integração com VTEX", status: "To Do", points: 0 },
      { key: "FRONT-813", title: "Discovery - Autenticação para fora do commerce", status: "Done", points: 0, sprint: 46 },
    ],
  },


  // ─── CDP – Enriquecimento ────────────────────────────────────────────────
  {
    id: "cdp-2a", jiraKey: "POS-4158", jiraKeys: ["POS-4158", "FRONT-692"],
    name: "2.0 Audience: Enriquecimento de dados Commerce",
    subtitle: "Pedidos do Commerce ingeridos na CDP (Audience)",
    epic: "CDP",
    project: "cdp",
    planned: { start: 5, end: 6 }, executed: { start: 4, end: 5 },
    status: "em-andamento", progress: 54,
    note: "FRONT-770, FRONT-774 e FRONT-779 bloqueadas no Jira (segmentador: UF, interesse/navegação, lojas via API).",
    owner: { name: "Pedro Dib", initials: "PD", color: "#0891b2" },
    storyPoints: 0,
    subtasks: [
      { key: "POS-4249", title: "Ingerir dados de commerce por webhook", status: "To Do", points: 0, blocked: true },
      { key: "POS-4345", title: "TO DOS Para Liberação: Organizar importação", status: "To Do", points: 0, sprint: 47, blocked: true },
      { key: "POS-4175", title: "[Commerce] Back: Adequação de contrato da ingestão dos dados", status: "Done", points: 0 },
      { key: "POS-4176", title: "[Commerce] Aumentar ingestão de eventos", status: "Done", points: 0 },
      { key: "POS-4177", title: "[Commerce] Definir o que deverá ser consolidado (Sávio)", status: "Done", points: 0 },
      { key: "POS-4178", title: "[Commerce] Back: Ju cadastra a regra e irá refletir no front", status: "Done", points: 0 },
      { key: "POS-4180", title: "[Commerce] Enriquecer dados de pedido buscando informações no ETL (Jimmy)", status: "Done", points: 0 },
      { key: "POS-4181", title: "[Commerce] Consumir API de produtos do commerce (Barreto)", status: "Done", points: 0 },
      { key: "FRONT-695", title: "[Commerce] Front: Exibir dados Commerce na visão do cliente", status: "Done", points: 0 },
      { key: "FRONT-806", title: "Alterar label de compra finalizada em eventos (visão do cliente)", status: "Done", points: 0 },
      { key: "FRONT-807", title: "Visão de Clientes - Corrigir Visualização", status: "Done", points: 0 },
      { key: "FRONT-811", title: "Segmentador - Forma de pagamento", status: "To Do", points: 0 },
      { key: "POS-4399",  title: "Consolidar Carrinho", status: "To Do", points: 0 },
      { key: "FRONT-770", title: "Incluir campo de UF no segmentador", status: "To Do", points: 0, blocked: true },
      { key: "FRONT-774", title: "Front Segmentador: Interesse e navegação", status: "To Do", points: 0, blocked: true },
      { key: "FRONT-779", title: "Segmentador: Canal / Loja: carregar lojas e site via API", status: "To Do", points: 0, blocked: true },
      { key: "FRONT-780", title: "Segmentador: Comprou: carregar produtos via API no Segmentador", status: "To Do", points: 0 },
      { key: "POS-4493",  title: "[Audiences] Provisionamento de lojas e regras de retenção de dados do SDK", status: "To Do", points: 0, sprint: 47 },
      { key: "FRONT-803", title: "Visão de clientes - Ajuste da ordenação", status: "Done", points: 0, sprint: 48 },
      { key: "FRONT-804", title: "Ajuste SMS/WhatsAPP", status: "Done", points: 0, sprint: 48 },
      { key: "FRONT-805", title: "Ajustes: Segmentador, Visão única de cliente, Gestão de listas", status: "Done", points: 0, sprint: 48 },
      { key: "POS-4313",  title: "Consolidação de ticket médio e LTV", status: "In Progress", points: 0, sprint: 48 },
      { key: "POS-4444",  title: "Implementar exportação CSV da audiência/segmento", status: "To Do", points: 0, sprint: 48 },
      { key: "POS-4129", title: "Consolidar dados de Campanhas", status: "To Do", points: 0, sprint: 41, blocked: true },
      { key: "POS-4170", title: "[Loja física + commerce] Definir quais dados serão enviados via API do Dib", status: "Done", points: 0 },
      { key: "FRONT-726", title: "Trazer dados de loja física e do commerce para a visão do cliente", status: "Done", points: 0 },
      { key: "FRONT-744", title: "Perfil do Cliente: Informações Pessoais, Visão Geral, Listas e Segmentos", status: "To Do", points: 0, sprint: 46, blocked: true },
    ],
  },

  {
    id: "cdp-2b", jiraKey: "POS-4157", jiraKeys: ["POS-4157", "FRONT-691"],
    name: "2.0 Audience: Enriquecimento de dados loja física",
    subtitle: "LINX Microvix, LINX POS, TOTVS Moda + API aberta para dados de loja física na CDP",
    epic: "CDP",
    project: "cdp",
    planned: { start: 9, end: 11 }, executed: null,
    status: "no-prazo", progress: 0,
    note: "Backlog — ainda não iniciado; tarefas herdadas da fase Omni/Loja física serão revisadas.",
    owner: { name: "Pedro Dib", initials: "PD", color: "#0891b2" },
    storyPoints: 0,
    subtasks: [
      { key: "POS-4172", title: "[OMS/Loja física] Definir o que deverá ser consolidado", status: "To Do", points: 0 },
      { key: "POS-4173", title: "[OMS/loja física] Back: Cadastrar as regras no segmentador", status: "Done", points: 0 },
      { key: "FRONT-694", title: "[OMS] Front: Exibir dados loja física na visão do cliente", status: "Done", points: 0 },
      { key: "FRONT-626", title: "Trazer dados de loja física", status: "Done", points: 0 },
    ],
  },

  {
    id: "f38", jiraKey: "POS-4477",
    name: "2.0 API na CDP",
    subtitle: "Perfil unificado acessível via API para CRMs, ERPs e BI",
    epic: "CDP · API",
    project: "cdp",
    planned: { start: 9, end: 11 }, executed: null,
    status: "no-prazo", progress: 0,
    owner: { name: "Pedro Dib", initials: "PD", color: "#0891b2" },
    storyPoints: 0,
    subtasks: [
      { key: "POS-4166", title: "[CDP] Back: Exportar o profile na API da CDP", status: "To Do", points: 0 },
      { key: "POS-4167", title: "[CDP] Back: End-points para fornecer a CDP como API", status: "To Do", points: 0 },
    ],
  },

  {
    id: "f39", jiraKey: "FRONT-814", jiraKeys: ["FRONT-814", "POS-4478"],
    name: "2.0 Matriz RFV",
    subtitle: "Segmentação automática por Recência, Frequência e Valor de compra",
    epic: "2.0 Matriz RFV",
    tags: ["platform2", "cdp"],
    planned: { start: 9, end: 11 }, executed: null,
    status: "no-prazo", progress: 0,
    owner: { name: "A definir", initials: "AD", color: "#6366f1" },
    storyPoints: 0,
    subtasks: [
      { key: "FRONT-732", title: "[UX] Matriz RFV", status: "To Do", points: 0 },
    ],
  },

  {
    id: "f40", jiraKey: "FRONT-919", jiraKeys: ["FRONT-919", "POS-4496"],
    name: "2.0 App Push",
    subtitle: "Notificações push em aplicativos mobile — disparos pontuais e automáticos",
    epic: "2.0 App Push",
    tags: ["platform2"],
    planned: { start: 12, end: 14 }, executed: null,
    status: "no-prazo", progress: 0,
    note: "Épico recém-criado no Jira (FRONT/POS) — ainda sem histórias vinculadas.",
    owner: { name: "A definir", initials: "AD", color: "#6366f1" },
    storyPoints: 0,
    subtasks: [],
  },

  {
    id: "cdp-4", jiraKey: "POS-4159", jiraKeys: ["POS-4159", "FRONT-693"],
    name: "2.0 Audience: Segmentador no Commerce",
    subtitle: "Segmentos CDP disponíveis no commerce",
    epic: "CDP",
    project: "cdp",
    planned: { start: 5, end: 5 }, executed: { start: 4, end: 7 },
    status: "concluido", progress: 100,
    owner: { name: "Pedro Dib", initials: "PD", color: "#0891b2" },
    storyPoints: 0,
    subtasks: [
      { key: "POS-4183", title: "[Segmentador Commerce] Definir processo de onboarding: acesso, cadastro e permissões", status: "Done", points: 0 },
      { key: "POS-4248", title: "Mudança de autenticação da API para usar o keycloak do commerce", status: "Done", points: 0 },
      { key: "FRONT-696", title: "[Segmentador Commerce] Front: Implementar autenticação específica", status: "Done", points: 0 },
      { key: "FRONT-697", title: "[Segmentador Commerce] Front: Suprimir menu e header do segmentador", status: "Done", points: 0 },
      { key: "FRONT-710", title: "Segmentador - Ajustar réguas automáticas", status: "Done", points: 0 },
      { key: "FRONT-736", title: "Autenticação para segmentador no commerce", status: "Done", points: 0 },
      { key: "POS-4347", title: "TO DOS Para Liberação: Ajustar Segmentador", status: "Done", points: 0, sprint: 45 },
      { key: "POS-4348", title: "TO DOS Para Liberação: Fornecer IDs", status: "Done", points: 0, sprint: 45 },
      { key: "POS-4349", title: "TO DOS Para Liberação: Atualizar Documentação", status: "Done", points: 0, sprint: 45 },
      { key: "POS-4350", title: "TO DOS Para Liberação: Ajustar Pipeline", status: "Done", points: 0, sprint: 45 },
      { key: "POS-4352", title: "TO DOS Para Liberação: Visualizar lista arquivada", status: "Done", points: 0, sprint: 45 },
      { key: "POS-4379", title: "PRIORITÁRIO: Divergência número da base", status: "Done", points: 0, sprint: 45 },
      { key: "POS-4380", title: "PRIORITÁRIA: Landing page não abre", status: "Done", points: 0, sprint: 45 },
      { key: "POS-4381", title: "PRIORITÁRIA: Ordenação quebrando", status: "Done", points: 0, sprint: 45 },
      { key: "POS-4382", title: "PRIORITÁRIO: Está faltando campo de origem do lead", status: "Done", points: 0, sprint: 45 },
      { key: "POS-4383", title: "PRIORITÁRIO: Nome das audiências em Inglês", status: "Done", points: 0, sprint: 45 },
      { key: "POS-4384", title: "PRIORITÁRIO: Filtros de visão de cliente não funcionam", status: "Done", points: 0, sprint: 45 },
      { key: "POS-4397", title: "Ajustar Busca por CPF", status: "Done", points: 0, sprint: 46 },
      { key: "POS-4398", title: "Redefinir quais status serão utilizados na LTV", status: "Done", points: 0, sprint: 46 },
      { key: "POS-4346", title: "TO DOS Para Liberação: Validar carga", status: "To Do", points: 0, sprint: 45 },
      { key: "POS-4453",  title: "Segmentação com atributos personalizado", status: "To Do", points: 0, sprint: 47, blocked: true },
      { key: "POS-4413",  title: "Criação/adaptação de end-point para nomes dos clientes segmentados", status: "Done", points: 0, sprint: 48 },
    ],
  },


  // ─── Q3 2026 ──────────────────────────────────────────────────────────────
  {
    id: "f17", jiraKey: "FRONT-675", jiraKeys: ["FRONT-675", "POS-4134"],
    name: "2.0 Gestão de Campanhas - Fase 2",
    subtitle: "Campanhas avançadas com IP dedicado",
    epic: "2.0 Gestão de Campanhas - Fase 2",
    tags: ["platform2"],
    planned: { start: 6, end: 8 }, executed: { start: 4, end: 5 },
    status: "em-andamento", progress: 62,
    note: "FRONT-809 (IP Dedicado e Entregabilidade) bloqueada no Jira.",
    owner: { name: "isabela.beatriz", initials: "IB", color: "#2563eb" },
    storyPoints: 4,
    subtasks: [
      { key: "POS-3723",  title: "Inserção de HTML externo para template de e-mail (back)", status: "Done", points: 3, sprint: 42 },
      { key: "FRONT-154", title: "Importação de HTML para E-mail e Unificação da Biblioteca de Templates", status: "Done", points: 0, sprint: 41 },
      { key: "FRONT-673", title: "Gestão de Opt-out (Importação em Lote e Manual)", status: "To Do", points: 0, sprint: 43 },
      { key: "POS-4056",  title: "Ajustar Status em envios pontuais e automáticos", status: "Done", points: 0, sprint: 42 },
      { key: "FRONT-704", title: "Alinhar componentes no On-site Pop-up", status: "Done", points: 0 },
      { key: "FRONT-728", title: "[UX] Revisão feature de IP dedicado", status: "Done", points: 0 },
      { key: "POS-4417",  title: "Estudo de réguas para campanhas", status: "Done", points: 0, sprint: 46 },
      { key: "POS-4424",  title: "Cadastrar novas regras dentro do Unomi", status: "Done", points: 0, sprint: 46 },
      { key: "FRONT-809", title: "IP Dedicado e Entregabilidade de E-mail", status: "To Do", points: 0, sprint: 46, blocked: true },
      { key: "FRONT-830", title: "Ajustes para lançamento de campanhas", status: "Done", points: 0, sprint: 46 },
      { key: "POS-4421",  title: "Erro de envio de teste", status: "Done", points: 0, sprint: 46 },
      { key: "POS-4422",  title: "Corrigir validação de campanhas automáticas para audiências do tipo Segmento", status: "In Progress", points: 0, sprint: 46 },
      { key: "POS-3385",  title: "Criação de campanha multicanal - Pontual (back)", status: "To Do", points: 5, sprint: 42 },
      { key: "POS-4343",  title: "IP Dedicado: Adequação do disparador", status: "To Do", points: 0, sprint: 48 },
      { key: "FRONT-16",  title: "Novos ações e status de envios pontuais", status: "Done", points: 0, sprint: 36 },
      { key: "FRONT-17",  title: "Novas ações e status envios automáticos", status: "Done", points: 3, sprint: 36 },
      { key: "FRONT-394", title: "Inclusão de Segmentos Salvos como Audiência em Envios Pontuais", status: "Done", points: 0, sprint: 39 },
      { key: "FRONT-551", title: "Voltar com repique para as campanhas (E-mail e Whatsapp)", status: "Done", points: 0, sprint: 40 },
      { key: "FRONT-674", title: "Relatório de Opt-out", status: "To Do", points: 0, sprint: 43 },
      { key: "POS-4302", title: "BACK: Pressão de comunicação", status: "To Do", points: 0 },
      { key: "FRONT-843", title: "[UX] Pressão de Comunicação e consumo de SMS", status: "To Do", points: 0 },
      { key: "FRONT-683", title: "Segmentos Salvos em Campanhas Automáticas", status: "To Do", points: 0, sprint: 43, blocked: true },
      { key: "FRONT-685", title: "Listas em Campanhas Automáticas", status: "To Do", points: 0, sprint: 43, blocked: true },
    ],
  },

  {
    id: "f34", jiraKey: "FRONT-896", jiraKeys: ["FRONT-896", "POS-4473"],
    name: "2.0 Pente fino/Ajustes",
    subtitle: "Refinamento contínuo das telas migradas",
    epic: "2.0 Pente fino/Ajustes",
    tags: ["platform2"],
    planned: { start: 7, end: 9 }, executed: { start: 7, end: 7 },
    status: "em-andamento", progress: 50,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#7c3aed" },
    storyPoints: 0,
    subtasks: [
      { key: "FRONT-826", title: "Ajuste no direcionamento de templates HTML do Studio", status: "To Do", points: 0 },
      { key: "FRONT-850", title: "Pente Fino: Envios Pontuais e Automáticos", status: "In Progress", points: 0, sprint: 47 },
      { key: "FRONT-851", title: "Pente Fino: Landing Pages e On-Site Pop-up", status: "To Do", points: 0, sprint: 47, blocked: true },
      { key: "FRONT-852", title: "Pente Fino: Gestão de Listas + Atributos Personalizados", status: "To Do", points: 0, sprint: 47, blocked: true },
      { key: "FRONT-854", title: "Pente Fino: Clientes (Listagem + Visão Única)", status: "To Do", points: 0, sprint: 47 },
      { key: "FRONT-855", title: "Pente Fino: Studio", status: "Done", points: 0, sprint: 47 },
      { key: "FRONT-857", title: "Pente Fino: Início (Home) e Evolução de Contatos", status: "In Progress", points: 0, sprint: 47 },
      { key: "FRONT-872", title: "Tirar dados Mocados Segmentos pré definidos", status: "Done", points: 0, sprint: 47 },
      { key: "FRONT-873", title: "Pente Fino: Segmentador", status: "In Progress", points: 0, sprint: 47 },
      { key: "FRONT-876", title: "Padronização de Segmentos Pré-definidos e Exibição de Listas em Envios Automáticos", status: "Done", points: 0, sprint: 47 },
      { key: "FRONT-877", title: "Ajuste - Filtro de Tipos em Envios Automáticos", status: "In Progress", points: 0, sprint: 47 },
      { key: "FRONT-889", title: "Bug criação de campanha com repique", status: "In Progress", points: 0, sprint: 47 },
      { key: "POS-4437", title: "Adicionar indicação do tipo de template (Beefree ou HTML) nos endpoints de templates", status: "In Progress", points: 0, sprint: 47 },
      { key: "POS-4438", title: "Erro ao tentar despublicar Landing Page", status: "In Progress", points: 0, sprint: 47 },
      { key: "POS-4450", title: "Ajustes Lista", status: "Done", points: 0 },
      { key: "POS-4396", title: "Corrigir Duplicidade de cadastro", status: "Done", points: 0, sprint: 46 },
      { key: "POS-4447", title: "Ajustes pós deploy", status: "In Progress", points: 0, sprint: 47 },
      { key: "POS-4472", title: "Padronizar endpoints de Segmentos Pré-definidos", status: "In Progress", points: 0, sprint: 47 },
      { key: "POS-4446", title: "Origem do Lead - Rodar script retroativos", status: "To Do", points: 0, sprint: 48 },
      { key: "POS-4401",  title: "Envios automáticos - Agendamento de Frequência de Envio (Listas e Segmentos)", status: "To Do", points: 0, sprint: 46 },
    ],
  },

  {
    id: "f35", jiraKey: "FRONT-897",
    name: "2.0 Evolução - Audiências",
    subtitle: "Acompanhamento de crescimento e queda de segmentos",
    epic: "2.0 Evolução - Audiências",
    tags: ["platform2", "cdp"],
    planned: { start: 7, end: 9 }, executed: { start: 7, end: 7 },
    status: "em-andamento", progress: 50,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#0d9488" },
    storyPoints: 0,
    subtasks: [
      { key: "FRONT-730", title: "[UX] Como acompanhar crescimento e queda de um segmento/audiência", status: "In Progress", points: 0, sprint: 47 },
    ],
  },

  {
    id: "f36", jiraKey: "FRONT-898", jiraKeys: ["FRONT-898", "POS-4475"],
    name: "2.0 Evolução - IP dedicado",
    subtitle: "Domínio próprio, remetentes e disparo via SES",
    epic: "2.0 Evolução - IP dedicado",
    tags: ["platform2"],
    planned: { start: 7, end: 10 }, executed: { start: 7, end: 7 },
    status: "em-andamento", progress: 19,
    owner: { name: "Sávio", initials: "SV", color: "#2563eb" },
    storyPoints: 0,
    subtasks: [
      { key: "FRONT-871", title: "[UX] Configuração de Domínio e Remetentes de E-mail", status: "Done", points: 0, sprint: 47 },
      { key: "POS-4296", title: "Mover disparador de campanha do NiFi para Worker", status: "In Progress", points: 0, sprint: 47 },
      { key: "POS-4342", title: "IP Dedicado: Alterações na API", status: "Done", points: 0, sprint: 47 },
      { key: "POS-4456", title: "[SES] Criar domínio na Cloudflare (back + infra)", status: "To Do", points: 0 },
      { key: "POS-4457", title: "[SES] Gerar chaves DKIM (configuração AWS)", status: "To Do", points: 0 },
      { key: "POS-4458", title: "[SES] Modelagem de banco: cliente x (tenant_id, domínio)", status: "To Do", points: 0 },
      { key: "POS-4459", title: "[SES] Cadastrar o domínio no Amazon SES", status: "To Do", points: 0 },
      { key: "POS-4460", title: "[SES] Tenant, group e chaves DKIM retornadas da Cloudflare", status: "To Do", points: 0 },
      { key: "POS-4461", title: "[SES] Sincronização de status (até 72h)", status: "To Do", points: 0 },
      { key: "POS-4462", title: "[SES Disparando] Disparador considerar somente o SES", status: "To Do", points: 0 },
      { key: "POS-4463", title: "[SES Disparando] Usar configuração de domínio da campanha", status: "To Do", points: 0 },
      { key: "POS-4464", title: "[SES] Rota para DNS Check", status: "To Do", points: 0 },
      { key: "POS-4465", title: "[SES] Rota para Antispam Check", status: "To Do", points: 0 },
    ],
  },

  {
    id: "f20", jiraKey: "FRONT-593",
    name: "2.0 SMS",
    subtitle: "Canal de envio via SMS",
    epic: "2.0 SMS",
    tags: ["platform2"],
    planned: { start: 9, end: 11 }, executed: null,
    status: "no-prazo", progress: 0,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#dc2626" },
    storyPoints: 0,
    subtasks: [
      { key: "FRONT-729", title: "[UX] Feature de SMS", status: "Done", points: 0 },
    ],
  },

  {
    id: "f28", jiraKey: "FRONT-599",
    name: "2.0 Teste A/B",
    subtitle: "Testes de variação para campanhas e conteúdos",
    epic: "2.0 Teste A/B",
    tags: ["platform2"],
    planned: { start: 9, end: 11 }, executed: null,
    status: "no-prazo", progress: 0,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#059669" },
    storyPoints: 0,
    subtasks: [],
  },

  {
    id: "f29", jiraKey: "CDP-WAU",
    name: "Wake U — Agenda do Vendedor",
    subtitle: "Integração Wake U com a CDP",
    epic: "CDP · Wake U",
    project: "cdp",
    planned: { start: 9, end: 11 }, executed: null,
    status: "no-prazo", progress: 0,
    owner: { name: "Pedro Dib", initials: "PD", color: "#0891b2" },
    storyPoints: 0,
    subtasks: [],
  },


  {
    id: "f33", jiraKey: "FRONT-749", jiraKeys: ["FRONT-749", "POS-4479"],
    name: "2.0 Disponibilização de receita e exportação de dados",
    subtitle: "Receita e exportação CSV nas campanhas",
    epic: "2.0 Dados e Relatórios",
    tags: ["platform2"],
    planned: { start: 6, end: 8 }, executed: { start: 5, end: 5 },
    status: "em-andamento", progress: 60,
    note: "FRONT-310, FRONT-407, FRONT-419 e FRONT-448 bloqueadas no Jira (exportações CSV e receita).",
    owner: { name: "Pedro Dib", initials: "PD", color: "#0891b2" },
    storyPoints: 0,
    subtasks: [
      { key: "POS-3928",  title: "Dados de receita - Fazer deploy e testes", status: "Done", points: 0, sprint: 39 },
      { key: "POS-3929",  title: "Dados de receita - Gerar arquivo de download", status: "Done", points: 0, sprint: 39 },
      { key: "POS-3973",  title: "Implementação do Sistema de Notificação de Downloads", status: "Done", points: 0, sprint: 39 },
      { key: "FRONT-310", title: "Exportação de Relatórios CSV: Envios Pontuais", status: "To Do", points: 0, sprint: 38, blocked: true },
      { key: "FRONT-370", title: "Disponibilizar CSV com dados das campanhas para download", status: "Done", points: 0 },
      { key: "FRONT-407", title: "Exportação de Relatórios CSV: Envios Automáticos", status: "To Do", points: 0, sprint: 42, blocked: true },
      { key: "FRONT-419", title: "Exportação de Relatórios CSV: Segmentos", status: "To Do", points: 0, sprint: 43, blocked: true },
      { key: "FRONT-443", title: "Receita no card Performance por Canal (E-mail e WhatsApp)", status: "Done", points: 0, sprint: 42 },
      { key: "FRONT-448", title: "Colocar receita e exportar CSV nas campanhas", status: "To Do", points: 0, sprint: 42, blocked: true },
      { key: "FRONT-750", title: "Dados nao estao refletindo na campanha", status: "Done", points: 0 },
    ],
  },

  // ─── CDP – Recomendação / Base Analítica ─────────────────────────────────
  {
    id: "cdp-3", jiraKey: "CDP-3",
    name: "Disponibilizar recomendação para o commerce",
    subtitle: "Recomendação personalizada via CDP",
    epic: "CDP",
    project: "cdp",
    planned: { start: 8, end: 9 }, executed: null,
    status: "no-prazo", progress: 0,
    owner: { name: "Pedro Dib", initials: "PD", color: "#0891b2" },
    storyPoints: 0,
    subtasks: [],
  },


  // ─── Q4 2026 ──────────────────────────────────────────────────────────────
  {
    id: "f19", jiraKey: "POS-4121", jiraKeys: ["POS-4121", "FRONT-627"],
    name: "2.0 Envios Transacionais",
    subtitle: "Disparos automáticos pós-evento",
    epic: "2.0 Envios Transacionais",
    tags: ["platform2"],
    planned: { start: 9, end: 11 }, executed: null,
    status: "no-prazo", progress: 0,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#2563eb" },
    storyPoints: 2,
    subtasks: [
      { key: "POS-3138", title: "Possibilitar envios transacionais do commerce", status: "To Do", points: 8 },
      { key: "POS-3263",  title: "Template de Utility do Meta", status: "To Do", points: 3, sprint: 42 },
    ],
  },

  {
    id: "f26", jiraKey: "FRONT-594",
    name: "2.0 WebPush",
    subtitle: "Notificações push no navegador",
    epic: "2.0 WebPush",
    tags: ["platform2"],
    planned: { start: 9, end: 11 }, executed: null,
    status: "no-prazo", progress: 0,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#7c3aed" },
    storyPoints: 0,
    subtasks: [],
  },

  {
    id: "f27", jiraKey: "FRONT-634",
    name: "2.0 E-mail inteligente",
    subtitle: "E-mails personalizados com IA",
    epic: "2.0 E-mail inteligente",
    tags: ["platform2"],
    planned: { start: 12, end: 14 }, executed: null,
    status: "no-prazo", progress: 0,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#2563eb" },
    storyPoints: 0,
    subtasks: [],
  },

  {
    id: "f24", jiraKey: "FRONT-597",
    name: "2.0 Automatizador",
    subtitle: "Automação de fluxos e envios",
    epic: "2.0 Automatizador",
    tags: ["platform2"],
    planned: { start: 12, end: 14 }, executed: null,
    status: "em-andamento", progress: 9,
    note: "FRONT-683 e FRONT-685 bloqueadas no Jira.",
    owner: { name: "isabela.beatriz", initials: "IB", color: "#0891b2" },
    storyPoints: 8,
    subtasks: [
      { key: "FRONT-684", title: "Audiências Pré-definidas em Campanhas Automáticas", status: "Done", points: 0, sprint: 43 },
      { key: "FRONT-618", title: "Subir lista no FTP", status: "To Do", points: 3 },
      { key: "FRONT-619", title: "Subir lista no Google Drive", status: "To Do", points: 3 },
      { key: "FRONT-620", title: "Subir lista S3 Amazon", status: "To Do", points: 3 },
      { key: "FRONT-621", title: "Segmentação", status: "To Do", points: 3 },
      { key: "FRONT-622", title: "Envio automático", status: "To Do", points: 3 },
      { key: "FRONT-623", title: "Envio FTP", status: "To Do", points: 3 },
      { key: "FRONT-624", title: "Gerar lista FTP", status: "To Do", points: 3 },
      { key: "FRONT-625", title: "Workflow", status: "To Do", points: 3 },
    ],
  },


  // ─── Audience (CDP) ── CMS ────────────────────────────────────────────────

  // ─── Q1 2027 ──────────────────────────────────────────────────────────────
  {
    id: "f22", jiraKey: "POS-4122", jiraKeys: ["POS-4122", "FRONT-598"],
    name: "2.0 Workflow",
    subtitle: "Automação de jornadas de marketing",
    epic: "2.0 Workflow",
    tags: ["platform2"],
    planned: { start: 12, end: 14 }, executed: null,
    status: "no-prazo", progress: 0,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#059669" },
    storyPoints: 3,
    subtasks: [],
  },

  {
    id: "f25", jiraKey: "FRONT-606",
    name: "2.0 Conta",
    subtitle: "Configurações de conta e usuários",
    epic: "2.0 Conta",
    tags: ["platform2"],
    planned: { start: 12, end: 14 }, executed: null,
    status: "no-prazo", progress: 0,
    owner: { name: "isabela.beatriz", initials: "IB", color: "#059669" },
    storyPoints: 10,
    subtasks: [
      { key: "FRONT-607", title: "E-mail de teste", status: "To Do", points: 2 },
      { key: "FRONT-608", title: "Celular de teste", status: "To Do", points: 2 },
      { key: "FRONT-609", title: "Usuário consulta", status: "To Do", points: 2 },
      { key: "FRONT-610", title: "Cadastrar sub cliente", status: "To Do", points: 3 },
      { key: "FRONT-611", title: "Cadastrar termo", status: "To Do", points: 3 },
      { key: "FRONT-612", title: "Cadastrar sub login", status: "To Do", points: 3 },
      { key: "FRONT-613", title: "Cadastrar tags", status: "To Do", points: 2 },
      { key: "FRONT-614", title: "Meus dados", status: "To Do", points: 3 },
      { key: "FRONT-615", title: "Seedlist", status: "To Do", points: 3 },
      { key: "FRONT-616", title: "Configurações push ID", status: "To Do", points: 3 },
    ],
  },


  // ─── Evoluções ───────────────────────────────────────────────────────────
  {
    id: "f30", jiraKey: "FRONT-157", jiraKeys: ["FRONT-157", "FRONT-783", "POS-4351"],
    name: "2.0 Melhorias e evoluções",
    subtitle: "Melhorias incrementais e evoluções contínuas",
    epic: "2.0 Melhorias e evoluções",
    tags: ["platform2"],
    excludeFromStats: true,
    planned: { start: 12, end: 14 }, executed: null,
    status: "em-andamento", progress: 86,
    note: "POS-4453 (Segmentação com atributos personalizado) bloqueada no Jira.",
    owner: { name: "isabela.beatriz", initials: "IB", color: "#7c3aed" },
    storyPoints: 0,
    subtasks: [
      { key: "FRONT-388", title: "Landing Page - redirect do botão", status: "Done", points: 0 },
      { key: "FRONT-389", title: "Landing Page e On Site - Modal de agradecimento", status: "Done", points: 0, sprint: 47 },
      { key: "FRONT-737", title: "[UX] Revisão da parte de listas", status: "Done", points: 0 },
      { key: "FRONT-738", title: "Paginação de visão de cliente não funciona", status: "Done", points: 0 },
      { key: "FRONT-739", title: "Ajuste no segmentador \"está entre\"", status: "Done", points: 0 },
      { key: "FRONT-740", title: "Ajuste de nomes de audiência", status: "Done", points: 0 },
      { key: "FRONT-741", title: "Botão excluir em lista não funciona", status: "Done", points: 0 },
      { key: "FRONT-742", title: "Não está aparecendo nome da lista na visão do cliente", status: "Done", points: 0 },
      { key: "FRONT-743", title: "Busca com espaço na visão de cliente não funciona", status: "Done", points: 0 },
      { key: "FRONT-775", title: "Córtex: Conexão à API Real (Home + Segmentador)", status: "Done", points: 0 },
      { key: "FRONT-156", title: "Editor de templates WhatsApp – múltiplos tipos de botão", status: "To Do", points: 0 },
      { key: "FRONT-266", title: "Landing Pages: visualizar cadastros (leads) por LP, com perfil na CDP", status: "To Do", points: 0 },
      { key: "FRONT-277", title: "Filtro e categorização de templates no Studio (E-mail e WhatsApp)", status: "To Do", points: 0 },
      { key: "FRONT-776", title: "Atualizar SDK", status: "Done", points: 0, sprint: 48 },
      { key: "FRONT-703", title: "Novas Audiências no On-site Pop-up", status: "Done", points: 0 },
    ],
  },


];
