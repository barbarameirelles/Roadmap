// Entregas mensais organizadas por labels do Jira.
//
// REGRA PERMANENTE (a partir de Ago/2026):
//   - Toda issue com label de mês (Agosto, Setembro, …) + label de feature
//     (Evoluções, Pentefino, IPDedicado, Importaçãopedidos, ExportaçãoRelatório, etc.)
//     deve aparecer aqui, alocada no mês correto e no grupo de feature correto.
//   - NÃO usar épicos do Jira — apenas as labels.
//   - Sync semanal: re-buscar no Jira via JQL `labels in ("Agosto")` (e demais meses),
//     atualizar `status` e `blocked` de cada issue. Adicionar novas issues com as labels,
//     remover issues que perderam o label de mês.
//   - Quando uma feature atravessa meses, alocar TODAS as issues no mês de entrega final.

export type IssueStatus = "Done" | "In Progress" | "To Do" | "Blocked";

export interface LabelIssue {
  key: string;
  title: string;
  status: IssueStatus;
  blocked?: boolean;
}

export interface FeatureGroup {
  feature: string;        // label exata do Jira (ex: "Evoluções", "Pentefino")
  description: string;    // 1–2 frases descrevendo o que está sendo entregue
  context: string;        // por que isso importa — linguagem de negócio para audiência de marketing
  eta?: string;           // previsão de entrega (ex: "Final de setembro")
  issues: LabelIssue[];
}

export interface MonthDelivery {
  monthLabel: string; // "Agosto", "Setembro", …
  monthIdx: number;   // idx no array MONTHS (7 = Ago/2026, 8 = Set/2026)
  year: number;
  groups: FeatureGroup[];
}

// ── Mapeamento de label → nome de exibição + cor ─────────────────────────────
export const FEATURE_META: Record<string, { label: string; color: string; bg: string }> = {
  "Evoluções":           { label: "Evoluções",                color: "#7c3aed", bg: "#f5f3ff" },
  "Pentefino":           { label: "Pente Fino",               color: "#2563eb", bg: "#eff6ff" },
  "ExportaçãoRelatório": { label: "Exportação de Relatórios", color: "#0d9488", bg: "#f0fdfa" },
  "Importaçãopedidos":   { label: "Importação de Pedidos",    color: "#d97706", bg: "#fef3c7" },
  "IPDedicado":          { label: "IP Dedicado",              color: "#dc2626", bg: "#fee2e2" },
  "Ipdedicado":          { label: "IP Dedicado",              color: "#dc2626", bg: "#fee2e2" },
  "Novavisãocliente":    { label: "Nova Visão de Cliente",    color: "#4f46e5", bg: "#eef2ff" },
};

export const DEFAULT_FEATURE_META = { label: "Outros", color: "#64748b", bg: "#f8fafc" };

export const MONTH_DELIVERIES: MonthDelivery[] = [
  // ── Agosto/2026 ──────────────────────────────────────────────────────────────
  {
    monthLabel: "Agosto",
    monthIdx: 7,
    year: 2026,
    groups: [
      {
        feature: "Evoluções",
        description: "Novas funcionalidades na plataforma 2.0: atributos personalizados de ponta a ponta, audiências pré-definidas, integração BTG, feature de SMS e configuração de domínio de e-mail.",
        context: "Com essas evoluções, as lojas ganham ferramentas mais ricas para segmentar e se comunicar com os clientes — desde atributos criados pela própria loja até novos canais como SMS e e-mail personalizado por domínio. Mais recursos disponíveis significa mais possibilidades de campanhas sem precisar de integrações externas.",
        issues: [
          { key: "FRONT-154", title: "Importação de HTML para E-mail e Unificação da Biblioteca de Templates", status: "Done" },
          { key: "FRONT-591", title: "BTG: Feature de template de produto", status: "Done" },
          { key: "FRONT-592", title: "Tela de atributos personalizados", status: "Done" },
          { key: "FRONT-639", title: "Importação de Lista com Atributos Personalizados", status: "Done" },
          { key: "FRONT-684", title: "Audiências Pré-definidas em Campanhas Automáticas", status: "Done" },
          { key: "FRONT-690", title: "Configurações gerais BTG - Pressão de comunicação (apenas front)", status: "Done" },
          { key: "FRONT-701", title: "Integração do Editor Beefree com Templates de Produto", status: "Done" },
          { key: "FRONT-703", title: "Novas Audiências no On-site Pop-up", status: "Done" },
          { key: "FRONT-714", title: "Atributos Personalizados no bloco Formulário do BeeFree (Studio)", status: "Done" },
          { key: "FRONT-722", title: "Atributos Personalizados no Segmentador", status: "Done" },
          { key: "FRONT-729", title: "[UX] Feature de SMS", status: "Done" },
          { key: "FRONT-871", title: "[UX] Configuração de Domínio e Remetentes de E-mail", status: "Done" },
          { key: "POS-3261",  title: "[BACK] Permitir que qualquer campo através do lista vire um atributo do cliente", status: "Done" },
          { key: "POS-4402",  title: "Provisionamento nova conta de cliente", status: "Done" },
          { key: "POS-4413",  title: "Criação/adaptação de end-point para nomes dos clientes segmentados", status: "Done" },
          { key: "POS-4417",  title: "Estudo de réguas para campanhas", status: "Done" },
          { key: "POS-4424",  title: "Cadastrar novas regras dentro do Unomi", status: "Done" },
          { key: "POS-4443",  title: "Criar endpoint de listagem de audiências pré-definidas", status: "Done" },
          { key: "POS-4445",  title: "Criar endpoint de listagem de clientes de um segmento", status: "Done" },
        ],
      },
      {
        feature: "Pentefino",
        description: "Rodada de refinamento e correções nas telas já migradas: Landing Pages, On-Site, Studio, Segmentador e Visão de Cliente — bug fixes e melhorias de UX.",
        context: "Antes de ampliar a base de clientes na plataforma 2.0, o time corrige inconsistências de UX e bugs reportados pelas lojas em produção. O objetivo é garantir que a experiência seja estável e profissional quando mais lojas migrarem — sem acumular dívida de qualidade.",
        issues: [
          { key: "FRONT-215", title: "Visão única do cliente: Origem do lead", status: "Done" },
          { key: "FRONT-388", title: "Landing Page - redirect do botão", status: "Done" },
          { key: "FRONT-389", title: "Landing Page e On Site - Modal de agradecimento", status: "In Progress" },
          { key: "FRONT-704", title: "Alinhar componentes no On-site Pop-up", status: "Done" },
          { key: "FRONT-710", title: "Segmentador - Ajustar réguas automáticas", status: "Done" },
          { key: "FRONT-725", title: "Voltar com a telas para produção", status: "Done" },
          { key: "FRONT-738", title: "Paginação de visao de cliente nao está funcionando", status: "Done" },
          { key: "FRONT-739", title: "Ajuste no segmentador \"está entre\"", status: "Done" },
          { key: "FRONT-740", title: "Ajuste de nomes de audiência", status: "Done" },
          { key: "FRONT-741", title: "Botao excluir em lista nao funciona", status: "Done" },
          { key: "FRONT-742", title: "Não está aparecendo nome da lista na visão do cliente", status: "Done" },
          { key: "FRONT-743", title: "Busca com espaço na visão de cliente não funciona", status: "Done" },
          { key: "FRONT-748", title: "Mudança de url de landing page", status: "Done" },
          { key: "FRONT-760", title: "Inclusão do Clarity na plataforma 2.0", status: "In Progress" },
          { key: "FRONT-768", title: "Excluir Visao de cliente", status: "Done" },
          { key: "FRONT-769", title: "Erro ao pausar segmentação", status: "Done" },
          { key: "FRONT-776", title: "Atualizar SDK", status: "In Progress" },
          { key: "FRONT-782", title: "Pente fino - Início de commerce", status: "Done" },
          { key: "FRONT-803", title: "Visão de clientes - Ajuste da ordenação", status: "Done" },
          { key: "FRONT-804", title: "Ajuste SMS/WhatsAPP", status: "Done" },
          { key: "FRONT-805", title: "Ajustes: Segmentador, Visão única de cliente, Gestão de listas", status: "Done" },
          { key: "FRONT-806", title: "Alterar label de compra finalizada em eventos (visão do cliente)", status: "Done" },
          { key: "FRONT-807", title: "Visão de Clientes - Corrigir Visualização", status: "Done" },
          { key: "FRONT-826", title: "Ajuste no direcionamento de templates HTML do Studio", status: "To Do" },
          { key: "FRONT-827", title: "Instabilidade ao conectar conta do Google Analytics - tokiomarine", status: "Done" },
          { key: "FRONT-828", title: "Erro ao despublicar LP", status: "Done" },
          { key: "FRONT-829", title: "Ao submeter um form na Landing Page, o botao nao funciona", status: "Done" },
          { key: "FRONT-830", title: "Ajustes para lançamento de campanhas", status: "Done" },
          { key: "FRONT-850", title: "Pente Fino: Envios Pontuais e Automáticos", status: "In Progress" },
          { key: "FRONT-851", title: "Pente Fino: Landing Pages e On-Site Pop-up", status: "In Progress" },
          { key: "FRONT-852", title: "Pente Fino: Gestão de Listas + Atributos Personalizados", status: "In Progress" },
          { key: "FRONT-854", title: "Pente Fino: Clientes (Listagem + Visão Única)", status: "To Do" },
          { key: "FRONT-855", title: "Pente Fino: Studio", status: "In Progress" },
          { key: "FRONT-857", title: "Pente Fino: Início (Home) e Evolução de Contatos", status: "To Do" },
          { key: "FRONT-872", title: "Tirar dados Mocados Segmentos pré definidos", status: "Done" },
          { key: "FRONT-873", title: "Pente Fino: Segmentador", status: "To Do" },
          { key: "FRONT-876", title: "Padronização de Segmentos Pré-definidos e Exibição de Listas em Envios Automáticos", status: "Done" },
          { key: "FRONT-877", title: "Ajuste - Filtro de Tipos em Envios Automáticos", status: "To Do" },
          { key: "FRONT-889", title: "Bug criação de campanha com repique", status: "To Do" },
          { key: "FRONT-901", title: "Dificuldade em conectar com a conta do Google Analytics", status: "Done" },
          { key: "FRONT-903", title: "Chave incorreta no payload do channelData para WhatsApp", status: "To Do" },
          { key: "POS-4340",  title: "Validar fluxo completo, paridade e cutover em homologação", status: "Done" },
          { key: "POS-4352",  title: "TO DOS Para Liberação: Visualizar lista arquivada", status: "Done" },
          { key: "POS-4380",  title: "Landing page nao abre", status: "Done" },
          { key: "POS-4382",  title: "Está faltando campo de origem do lead", status: "Done" },
          { key: "POS-4396",  title: "Corrigir Duplicidade de cadastro", status: "Done" },
          { key: "POS-4397",  title: "Ajustar Busca por CPF", status: "Done" },
          { key: "POS-4401",  title: "Envios automáticos - Agendamento de Frequência de Envio", status: "To Do" },
          { key: "POS-4421",  title: "Erro de envio de teste", status: "Done" },
          { key: "POS-4437",  title: "Adicionar indicação do tipo de template nos endpoints de templates", status: "In Progress" },
          { key: "POS-4438",  title: "Erro ao tentar despublicar Landing Page", status: "In Progress" },
          { key: "POS-4446",  title: "Origem do Lead - Rodar script retroativos", status: "To Do" },
          { key: "POS-4447",  title: "Ajustes pós deploy", status: "In Progress" },
          { key: "POS-4450",  title: "Ajustes Lista", status: "In Progress" },
          { key: "POS-4468",  title: "Erro ao submeter formulário LP", status: "Done" },
        ],
      },
      {
        feature: "Importaçãopedidos",
        description: "Ingestão dos pedidos do Commerce na CDP: histórico dos clientes beta e automação para novos clientes Audience.",
        context: "Com o histórico de compras disponível na CDP, o time de marketing passa a criar segmentos baseados em comportamento real de compra — quem comprou X vezes, gastou acima de determinado valor ou adquiriu produtos de uma categoria específica. Sem esse dado, as campanhas operam sem visibilidade transacional.",
        issues: [
          { key: "POS-4249", title: "Ingerir dados de commerce por webhook", status: "Blocked", blocked: true },
          { key: "POS-4345", title: "Organizar importação de pedidos históricos", status: "Blocked", blocked: true },
        ],
      },
    ],
  },

  // ── Setembro/2026 ─────────────────────────────────────────────────────────────
  {
    monthLabel: "Setembro",
    monthIdx: 8,
    year: 2026,
    groups: [
      {
        feature: "Ipdedicado",
        description: "Migração do sistema de disparo de e-mail para Amazon SES com IP dedicado, garantindo maior reputação e entregabilidade para os disparos da plataforma.",
        context: "E-mails enviados por IPs compartilhados têm reputação instável — um único cliente mal configurado prejudica a entregabilidade de todos. Com IP dedicado, a Wake controla a reputação do próprio domínio de envio, o que é pré-requisito para escalar o volume de campanhas sem cair em spam.",
        eta: "Final de setembro",
        issues: [
          { key: "POS-4342",  title: "IP Dedicado: Alterações na API", status: "Done" },
          { key: "FRONT-809", title: "IP Dedicado e Entregabilidade de E-mail", status: "Blocked", blocked: true },
          { key: "POS-4296",  title: "Mover disparador de campanha do NiFi para Worker", status: "In Progress" },
          { key: "POS-4343",  title: "IP Dedicado: Adequação do disparador", status: "To Do" },
          { key: "POS-4456",  title: "[SES] - Criar dominio na cloudflare (back + infra)", status: "To Do" },
          { key: "POS-4457",  title: "[SES] - Gera chaves DKIM (Configuração necessária para AWS)", status: "To Do" },
          { key: "POS-4458",  title: "[SES] - Modelagem de banco e relacionamento cliente x dominio", status: "To Do" },
          { key: "POS-4459",  title: "[SES] - Cadastrar o dominio no Amazon SES", status: "To Do" },
          { key: "POS-4460",  title: "[SES] - Tenant, group, chaves DKIM retornadas da cloudflare", status: "To Do" },
          { key: "POS-4461",  title: "[SES] - Sincronização de status (até 72h)", status: "To Do" },
          { key: "POS-4462",  title: "[SES Disparando] - Ajustar disparador para considerar somente o SES", status: "To Do" },
          { key: "POS-4463",  title: "[SES Disparando] - Usar configuração de domínio configurada na campanha", status: "To Do" },
          { key: "POS-4464",  title: "[SES] - Rota para DNS Check", status: "To Do" },
          { key: "POS-4465",  title: "[SES] - Rota para Antispam check", status: "To Do" },
        ],
      },
      {
        feature: "ExportaçãoRelatório",
        description: "Disponibilização de receita por campanha e exportações CSV de envios pontuais, automáticos e segmentos via central de notificações.",
        context: "Fecha uma lacuna crítica da migração: o time de marketing ainda não consegue ver a receita gerada por cada campanha, nem exportar os dados de envio para análise. Essas funcionalidades existiam na 1.0 e estão sendo reativadas — sem elas, é difícil provar o ROI das campanhas e justificar investimento em comunicação.",
        eta: "Final de setembro",
        issues: [
          { key: "POS-3928",  title: "Dados de receita - Fazer deploy e testes", status: "Done" },
          { key: "POS-4403",  title: "Integração do relatório de receita por campanha com endpoint de downloads", status: "Done" },
          { key: "FRONT-443", title: "Envios pontuais e automáticos — Receita no card Performance por Canal", status: "Done" },
          { key: "FRONT-750", title: "Dados nao estao refletindo na campanha", status: "Done" },
          { key: "POS-3929",  title: "Dados de receita por campanha - Gerar arquivo de download", status: "Done" },
          { key: "POS-3973",  title: "Implementação do Sistema de Notificação de Downloads", status: "Done" },
          { key: "FRONT-310", title: "Exportação de Relatórios CSV: Envios Pontuais (Via Central de Notificações)", status: "Blocked", blocked: true },
          { key: "FRONT-370", title: "Disponibilizar CSV com dados das campanhas para download", status: "Done" },
          { key: "FRONT-407", title: "Exportação de Relatórios CSV: Envios Automáticos (Via Central de Notificações)", status: "Blocked", blocked: true },
          { key: "FRONT-419", title: "Exportação de Relatórios CSV: Segmentos (Via Central de Notificações)", status: "Blocked", blocked: true },
          { key: "FRONT-448", title: "Colocar receita e exportar CSV nas campanhas pontuais e automaticas", status: "Blocked", blocked: true },
          { key: "FRONT-812", title: "Home - card de Receita Total e coluna Receita em Performance de Campanhas", status: "To Do" },
        ],
      },
      {
        feature: "Novavisãocliente",
        description: "Refatoração completa da tela de perfil do cliente com histórico de pedidos, forma de pagamento, eventos e filtros avançados.",
        context: "A tela atual mostra dados cadastrais limitados. A nova versão reúne em um só lugar histórico de pedidos, forma de pagamento, dados de entrega e eventos de comportamento — facilitando o atendimento ao cliente e dando mais contexto para decisões comerciais e de CS.",
        eta: "Final de setembro",
        issues: [
          { key: "FRONT-764", title: "[UX] Visão do cliente: Tela de pedidos e sessões", status: "Done" },
          { key: "FRONT-744", title: "Perfil do Cliente: Informações Pessoais, Visão Geral, Listas e Segmentos", status: "Blocked", blocked: true },
          { key: "FRONT-808", title: "Perfil de Cliente - Eventos, Pedidos e Filtros", status: "To Do" },
        ],
      },
    ],
  },
];
