// Dados dos tickets operacionais por trilha e mês.
// SLA = 5 dias úteis (criação → resolução; tickets em aberto são medidos até hoje).
// Aqui ficam só os meses FECHADOS (histórico congelado). O mês corrente vem ao vivo
// do snapshot do Supabase (Edge Function sync-jira, fase 3) e é anexado pela aba
// Sys-Ops automaticamente — não precisa cadastrar o mês novo aqui.
// Setembro = congelado a partir do último snapshot do mês (30/09 18:25): abertos
// naquele momento (qualquer data de criação) + resolvidos no mês.
// Fonte: POS-221 + FRONT-132 (Plataforma) | FRONT-124 (SMB)

export type OpsStatus = "Blocked" | "In Progress" | "To Do" | "Done";

export interface OpsTicket {
  key: string;
  title: string;
  status: OpsStatus;
  created: string;    // YYYY-MM-DD
  resdate: string | null;
  assignee: string | null;
}

export interface MonthStats {
  month: string;      // "2026-07"
  label: string;      // "Julho"
  isLive?: boolean;   // true = visão "o que está ativo agora", não só criados no mês
  volume: number;
  done: number;
  withinSla: number;
  outsideSla: number; // resolvidos fora do SLA + abertos já passados do prazo
  open: number;
  blocked: number;
  atRisk: number;     // subconjunto de open: já passaram de 5 dias úteis
  noDate: number;     // Concluído sem data de resolução — não mensurável
  tickets: OpsTicket[];
}

export interface TrackData {
  id: "smb" | "plataforma";
  label: string;
  description: string;
  color: string;
  months: MonthStats[];
}

export const BROWSE = "https://wake-experience.atlassian.net/browse/";

// ── Plataforma (POS-221 + FRONT-132) ────────────────────────────────────────

export const PLATAFORMA: TrackData = {
  id: "plataforma",
  label: "Plataforma",
  description: "1.0 · 2.0 · Audience",
  color: "#2563eb",
  months: [
    {
      month: "2026-07", label: "Julho",
      volume: 45, done: 44, withinSla: 37, outsideSla: 7, open: 1, blocked: 0, atRisk: 1, noDate: 0,
      tickets: [],
    },
    {
      month: "2026-08", label: "Agosto",
      volume: 30, done: 30, withinSla: 26, outsideSla: 4, open: 0, blocked: 0, atRisk: 0, noDate: 0,
      tickets: [],
    },
    {
      month: "2026-09", label: "Setembro",
      volume: 34, done: 28, withinSla: 22, outsideSla: 11, open: 6, blocked: 0, atRisk: 2, noDate: 1,
      tickets: [
        // ── Abertos em 30/09 ──────────────────────────────────────────────────
        { key: "POS-4527", title: "Ticket #297850 - Fuel - Onsite", status: "To Do", created: "2026-09-21", resdate: null, assignee: "Anderson Silva" },
        { key: "POS-4532", title: "Ticket #298333 - SMS BAYARD de teste não estão disparando", status: "To Do", created: "2026-09-22", resdate: null, assignee: null },
        { key: "POS-4544", title: "Ticket #1125450 - Erro no Upload de e-mails - alliedempresas", status: "To Do", created: "2026-09-24", resdate: null, assignee: null },
        { key: "POS-4557", title: "Ticket #297572 - Erro Ao integrar com whatsapp - Trocafy", status: "In Progress", created: "2026-09-28", resdate: null, assignee: "Sávio" },
        { key: "POS-4565", title: "Ticket #1849212 - Erro - Subida de Base - Perfil Tokio Marine", status: "To Do", created: "2026-09-28", resdate: null, assignee: null },
        { key: "POS-4568", title: "Ticket #995973 - plugin do On Site está aparecendo repetidas vezes no site netlab -50646 - netlab", status: "To Do", created: "2026-09-29", resdate: null, assignee: null },
        // ── Concluídos no mês ─────────────────────────────────────────────────
        { key: "POS-4499", title: "Ticket #295625 - Ativação SMS - ID 50837 e 50841", status: "Done", created: "2026-09-01", resdate: "2026-09-03", assignee: "Sávio" },
        { key: "POS-4250", title: "Apoio Técnico - Envio de Pushs", status: "Done", created: "2026-06-16", resdate: "2026-09-03", assignee: "Sávio" },
        { key: "POS-4497", title: "Polipet - 50847 Problema para envios de PUSH IOS | #295279", status: "Done", created: "2026-08-28", resdate: "2026-09-03", assignee: "Ricardo Barretto" },
        { key: "POS-4506", title: "Ticket #296172 - Aumento de disparos de Whatsapp - Baw", status: "Done", created: "2026-09-04", resdate: "2026-09-04", assignee: "Sávio" },
        { key: "POS-4505", title: "Ticket #295280 - Inbrands Acesso a Wake Experience - PRIORIDADE", status: "Done", created: "2026-09-03", resdate: "2026-09-08", assignee: "Juliana Diniz" },
        { key: "POS-4500", title: "Ticket #295638 -Saída da requisição", status: "Done", created: "2026-09-02", resdate: "2026-09-09", assignee: "Gustavo Bium Donadon" },
        { key: "POS-4509", title: "Ticket #296195 - Cacay ID 50843 | Disparos de Workflow", status: "Done", created: "2026-09-09", resdate: "2026-09-11", assignee: "Sávio" },
        { key: "POS-4510", title: "Ticket #294941 - Falha de subida de base - ID 50543", status: "Done", created: "2026-09-01", resdate: "2026-09-15", assignee: "Sávio" },
        { key: "POS-4507", title: "Ticket #296500 - Relatorios diários via FTP - comvalemobi", status: "Done", created: "2026-09-09", resdate: "2026-09-16", assignee: "Ricardo Barretto" },
        { key: "POS-4508", title: "Ticket #296234 - Integração de dados entre Experience e Google Analytics - temnatrena", status: "Done", created: "2026-09-09", resdate: "2026-09-16", assignee: "Juliana Diniz" },
        { key: "POS-4511", title: "Ticket #296763 - BAW: Dash sem dados de e-mail", status: "Done", created: "2026-09-10", resdate: "2026-09-18", assignee: "Sávio" },
        { key: "POS-4518", title: "#297675 Minhas Economias ID 50543 | Falha de subida de base", status: "Done", created: "2026-09-17", resdate: "2026-09-18", assignee: "Juliana Diniz" },
        { key: "POS-4513", title: "Ticket #297007 - Miess - Integração GA4", status: "Done", created: "2026-09-14", resdate: "2026-09-18", assignee: "Juliana Diniz" },
        { key: "POS-4520", title: "Dúvidas Painel - Minha Vida - ID 6699 - bug 2 #297623", status: "Done", created: "2026-09-18", resdate: "2026-09-21", assignee: "Juliana Diniz" },
        { key: "POS-4517", title: "Ticket #297629 - Problema emojis na plataforma - Minha Vida - ID 6699 - bug 3", status: "Done", created: "2026-09-16", resdate: "2026-09-21", assignee: "Juliana Diniz" },
        { key: "POS-4521", title: "Inclusão de Colaboradores - Troca de admin master #296617", status: "Done", created: "2026-09-18", resdate: "2026-09-23", assignee: null },
        { key: "POS-4528", title: "Solicitação de acesso aos relatórios de comunicados enviados pela Wake #297764", status: "Done", created: "2026-09-21", resdate: "2026-09-23", assignee: "Juliana Diniz" },
        { key: "POS-4523", title: "Whatsapp Trocafy - Wake | Limpeza de integração - #297572", status: "Done", created: "2026-09-21", resdate: "2026-09-24", assignee: "Sávio" },
        { key: "POS-4531", title: "Ticket #296617 - Inclusão de lojas no painel Troca de admin master", status: "Done", created: "2026-09-22", resdate: "2026-09-25", assignee: "Juliana Diniz" },
        { key: "POS-2450", title: "ID 8027 | CONECTCAR | Assunto sobre envio Push (personalização de ID da campanha)", status: "Done", created: "2025-08-25", resdate: "2026-09-25", assignee: "Bárbara Auguste Fernandes Meirelles" },
        { key: "POS-4037", title: "Valemobi 50420 | Campo personalizado relatório Diario", status: "Done", created: "2026-05-07", resdate: "2026-09-25", assignee: null },
        { key: "POS-4551", title: "Ticket# 297032 ID 50420 | 50543 Problema com o redirecionamento do e-mail", status: "Done", created: "2026-09-25", resdate: "2026-09-25", assignee: null },
        { key: "POS-4529", title: "Ticket #849428 - Segmentador de Audiência não captura dados - LojaYbera (commerce)", status: "Done", created: "2026-09-22", resdate: "2026-09-25", assignee: "Juliana Diniz" },
        { key: "POS-4555", title: "Ticket #297185 - Disparos de e-mails em looping infinito - conecta_entrerprise", status: "Done", created: "2026-09-28", resdate: "2026-09-28", assignee: "Juliana Diniz" },
        { key: "POS-4519", title: "Ticket #297032 - ID 50420 | 50543 Problema com o redirecionamento do e-mail", status: "Done", created: "2026-09-17", resdate: "2026-09-29", assignee: "Juliana Diniz" },
        { key: "POS-4564", title: "Ticket#1763163 - Baixar lista e clientes e e-mails - paoladavinci", status: "Done", created: "2026-09-28", resdate: "2026-09-29", assignee: "Juliana Diniz" },
        { key: "POS-4553", title: "Ticket #1801770 - Erro - Base com alto número de exclusão - Tokio Marine 15085", status: "Done", created: "2026-09-25", resdate: "2026-09-29", assignee: "Sávio" },
        { key: "FRONT-922", title: "Ticket #294768 - [Audience] Liberação beta tester dos Agentes", status: "Done", created: "2026-09-01", resdate: null, assignee: null },
      ],
    },
  ],
};

// ── SMB (FRONT-124) ───────────────────────────────────────────────────────────

export const SMB: TrackData = {
  id: "smb",
  label: "SMB",
  description: "Tray · Bagy · KingHost · Delivery Direto",
  color: "#7c3aed",
  months: [
    {
      month: "2026-07", label: "Julho",
      volume: 5, done: 4, withinSla: 0, outsideSla: 3, open: 1, blocked: 1, atRisk: 1, noDate: 2,
      tickets: [],
    },
    {
      month: "2026-08", label: "Agosto",
      volume: 28, done: 12, withinSla: 1, outsideSla: 24, open: 16, blocked: 9, atRisk: 16, noDate: 3,
      tickets: [],
    },
    {
      month: "2026-09", label: "Setembro",
      volume: 44, done: 13, withinSla: 13, outsideSla: 31, open: 31, blocked: 7, atRisk: 23, noDate: 0,
      tickets: [
        // ── Abertos em 30/09 ──────────────────────────────────────────────────
        { key: "FRONT-821", title: "Ticket #291509 - [SMB] Wake Smart - Puxar dados do Bling para Wake", status: "Blocked", created: "2026-07-30", resdate: null, assignee: "Gustavo Bium Donadon" },
        { key: "FRONT-844", title: "Delivery direto- vinculação manual| criação API #292099", status: "Blocked", created: "2026-08-06", resdate: null, assignee: "Gustavo Bium Donadon" },
        { key: "FRONT-846", title: "Ticket #292203 - [SMB] Trat Marketing: campanhas não disparam e comportamento de contatos inseridos via API de Newsletter", status: "In Progress", created: "2026-08-06", resdate: null, assignee: "Anderson Silva" },
        { key: "FRONT-853", title: "[SMB] Tray - Campanhas de wpp não estão sendo disparadas #292555", status: "Blocked", created: "2026-08-10", resdate: null, assignee: "Anderson Silva" },
        { key: "FRONT-859", title: "[SMB] Tray Atualizar WhatsApp API - # 292680", status: "Blocked", created: "2026-08-11", resdate: null, assignee: null },
        { key: "FRONT-874", title: "[SMB] Bagy - Problema na sincronização de contatos #292819", status: "Blocked", created: "2026-08-13", resdate: null, assignee: null },
        { key: "FRONT-891", title: "Bagy - Emails não enviados #293385", status: "In Progress", created: "2026-08-17", resdate: null, assignee: "Anderson Silva" },
        { key: "FRONT-892", title: "Kinghost | Problema na gestão de listas #293444", status: "To Do", created: "2026-08-17", resdate: null, assignee: null },
        { key: "FRONT-899", title: "[SMB] Bagy Contatos não sincronizados #293611", status: "Blocked", created: "2026-08-18", resdate: null, assignee: null },
        { key: "FRONT-902", title: "[SMB] Tray - Problema ao reconectar WhatsApp #293816", status: "Blocked", created: "2026-08-19", resdate: null, assignee: null },
        { key: "FRONT-905", title: "[SMB] Tray - disparo configurado não chegou na caixa #294073", status: "In Progress", created: "2026-08-20", resdate: null, assignee: "Anderson Silva" },
        { key: "FRONT-909", title: "[SMB] Tray - Problema ao configurar descadastro/ email automatico não funciona #294652", status: "To Do", created: "2026-08-26", resdate: null, assignee: null },
        { key: "FRONT-911", title: "[SMB] Tray - E-mail marketing não dispara corretamente para toda a base #294664", status: "In Progress", created: "2026-08-26", resdate: null, assignee: "Anderson Silva" },
        { key: "FRONT-917", title: "KingHost | Campanha E-mail Marketing Não Enviando #294975", status: "To Do", created: "2026-08-27", resdate: null, assignee: null },
        { key: "FRONT-928", title: "Ticket #295921 - Integração com Bling", status: "To Do", created: "2026-09-03", resdate: null, assignee: null },
        { key: "FRONT-932", title: "Ticket #296028 - Bling problema para conectar a plataforma wake Smart", status: "To Do", created: "2026-09-04", resdate: null, assignee: null },
        { key: "FRONT-934", title: "Ticket #296350 - [SMB - Kinghost] Instabilidade com a importação de planilha de contatos -", status: "To Do", created: "2026-09-09", resdate: null, assignee: null },
        { key: "FRONT-938", title: "Ticket #296460 - Problemas nos disparos automáticos de campanhas Bagy", status: "To Do", created: "2026-09-09", resdate: null, assignee: null },
        { key: "FRONT-945", title: "Ticket #297220 Solicitação de deleção de contatos e planilhas importadas", status: "To Do", created: "2026-09-14", resdate: null, assignee: null },
        { key: "FRONT-946", title: "Ticket #297570 -E-mail Marketing: Campanhas Automáticas Não Enviadas", status: "In Progress", created: "2026-09-16", resdate: null, assignee: "Anderson Silva" },
        { key: "FRONT-947", title: "[SMB] KIngHost Falha nos envios e exibição de resultados no relatório", status: "To Do", created: "2026-09-16", resdate: null, assignee: null },
        { key: "FRONT-948", title: "[SMB] Tray - Problema no disparo de campanha pontuais - #297903", status: "To Do", created: "2026-09-21", resdate: null, assignee: null },
        { key: "FRONT-949", title: "[SMB] Kinghost Falha nos envios e exibição de resultados Ticket #298359", status: "To Do", created: "2026-09-21", resdate: null, assignee: null },
        { key: "FRONT-952", title: "Ticket #1774163 - Disparo de e-mail divergente(e-mail marketing) - Loja Costa Leste", status: "To Do", created: "2026-09-25", resdate: null, assignee: null },
        { key: "FRONT-953", title: "Ticket #1776815 - Campanhas de e-mail gratuitas não estão sendo enviadas - Barbantes Olimpia", status: "To Do", created: "2026-09-25", resdate: null, assignee: null },
        { key: "FRONT-954", title: "Ticket #1778980 - Falha/Atraso em disparos automáticos de e-mail marketing - FITOESSÊNCIA PHARMA", status: "To Do", created: "2026-09-25", resdate: null, assignee: null },
        { key: "FRONT-955", title: "Ticket #1783584 - Remoção de clientes de campanhas de e-mail marketing - Le Farma - Fortalecendo a Vida", status: "To Do", created: "2026-09-25", resdate: null, assignee: null },
        { key: "FRONT-956", title: "Ticket #1785630 - Dúvida sobre disparo e relatórios de campanha de e-mail - Dona Beia", status: "To Do", created: "2026-09-25", resdate: null, assignee: null },
        { key: "FRONT-957", title: "Ticket #1781351 - [SMB] Tray Plugin E-mail Marketing não aparece no site - Miralis", status: "To Do", created: "2026-09-28", resdate: null, assignee: null },
        { key: "FRONT-959", title: "Ticket #3540729 [SMB] Delivery direto Criação de API - vinculação manual", status: "In Progress", created: "2026-09-29", resdate: null, assignee: "Gustavo Bium Donadon" },
        { key: "FRONT-960", title: "Ticket #3541296 [SMB] Delivery direto Criação de API - vinculação manual", status: "To Do", created: "2026-09-29", resdate: null, assignee: null },
        // ── Concluídos no mês ─────────────────────────────────────────────────
        { key: "FRONT-923", title: "Ticket #295566 - Falha no disparado E-mail Marketing - ID: 425479", status: "Done", created: "2026-09-01", resdate: "2026-09-01", assignee: null },
        { key: "FRONT-912", title: "[SMB] Tray- Problema em fluxo Pós compra com baixo disparo de emails #294804", status: "Done", created: "2026-08-27", resdate: "2026-09-14", assignee: "Gustavo Bium Donadon" },
        { key: "FRONT-900", title: "[SMB] Tray Campanha de e-mail \"Novos Cadastros\" não dispara #293629", status: "Done", created: "2026-08-18", resdate: "2026-09-14", assignee: "Anderson Silva" },
        { key: "FRONT-936", title: "Ticket #296276 - Solicitação de sincronização de clientes e desativação do Email Marketing", status: "Done", created: "2026-09-09", resdate: "2026-09-15", assignee: null },
        { key: "FRONT-937", title: "Ticket #296279 - Contatos não sincronizados (E-mail Marketing)", status: "Done", created: "2026-09-09", resdate: "2026-09-15", assignee: null },
        { key: "FRONT-939", title: "Ticket #296599 - Tray Campanhas pontuais sem envio no E-mail Marketing", status: "Done", created: "2026-09-09", resdate: "2026-09-15", assignee: null },
        { key: "FRONT-935", title: "Ticket #296271 - Disparos de e-mail marketing - All Natural Food", status: "Done", created: "2026-09-09", resdate: "2026-09-15", assignee: null },
        { key: "FRONT-920", title: "[SMB] Tray - Erro ao ativar plugin de e-mail marketing - #295562", status: "Done", created: "2026-08-31", resdate: "2026-09-15", assignee: null },
        { key: "FRONT-894", title: "Delivery direto - vinculação manual Criação de API #293542", status: "Done", created: "2026-08-17", resdate: "2026-09-29", assignee: "Gustavo Bium Donadon" },
        { key: "FRONT-895", title: "Delivery direto vinculação manual -Criação de API #293541", status: "Done", created: "2026-08-17", resdate: "2026-09-29", assignee: "Gustavo Bium Donadon" },
        { key: "FRONT-904", title: "[SMB] Delivery Direto - Vinculação manual (Criação de API) #291076", status: "Done", created: "2026-08-20", resdate: "2026-09-29", assignee: "Gustavo Bium Donadon" },
        { key: "FRONT-930", title: "Ticket #296058 - Delivery direto Criação de API -vinculação manual", status: "Done", created: "2026-09-03", resdate: "2026-09-29", assignee: "Gustavo Bium Donadon" },
        { key: "FRONT-942", title: "Ticket #296743 - Delivery direto - Criação de API vinculação manual", status: "Done", created: "2026-09-10", resdate: "2026-09-29", assignee: "Gustavo Bium Donadon" },
      ],
    },
  ],
};

export const OPS_TRACKS: TrackData[] = [PLATAFORMA, SMB];
export const OPS_MONTHS = PLATAFORMA.months.map(m => ({ month: m.month, label: m.label, isLive: m.isLive }));

export function slaPercent(stats: MonthStats): number | null {
  const measured = stats.withinSla + stats.outsideSla;
  if (measured === 0) return null;
  return Math.round((stats.withinSla / measured) * 100);
}

export function slaColor(pct: number | null): "green" | "amber" | "red" | "gray" {
  if (pct === null) return "gray";
  if (pct >= 80) return "green";
  if (pct >= 60) return "amber";
  return "red";
}
