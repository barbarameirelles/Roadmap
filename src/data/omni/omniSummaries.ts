// Resumo de cada iniciativa Omni para os cards de Entrega do Mês e o drawer,
// no mesmo modelo do XP/Audience (labeledDeliveries.ts):
//   description → o que está sendo entregue (1–2 frases)
//   context     → por que isso importa, em linguagem de negócio
// Escrito à mão a partir da descrição do épico no GitLab e do planejamento.
// A chave é o id da iniciativa ("ep-<iid>" ou "sug-<grupo>"). Iniciativa sem
// resumo aqui aparece só com o título — escrever o texto ao entrar no planejamento.

export interface OmniSummary {
  description: string;
  context: string;
}

export const OMNI_SUMMARIES: Record<string, OmniSummary> = {
  // ── Outubro / Novembro 2026 ────────────────────────────────────────────────
  "ep-104": {
    description: "Nova regra na integração do Wake OMS com o ERP Totvs Moda: pedidos de marketplace (ex.: Anymarket) deixam de enviar e-mail e telefone anonimizados, e o nome do destinatário passa a ser validado.",
    context: "Evita que dados mascarados do marketplace sobrescrevam o cadastro verdadeiro do cliente no ERP, o que quebrava comunicação e atendimento. Pedido do cliente Gregory, resolvido no dia a dia do time.",
  },
  "ep-103": {
    description: "Adequação às novas regras dos Correios: novo layout oficial de etiqueta, com código Data Matrix, e envio obrigatório da chave de acesso da NF-e na integração de postagem.",
    context: "É obrigação legal: sem a adequação, os lojistas deixam de conseguir postar pelos Correios. O novo layout é opcional para o cliente e reaproveita a integração que já existe.",
  },
  "ep-102": {
    description: "Discovery e protótipo para levar o agente de IA Khora ao painel Saúde do Atendimento, com alertas e sugestões de ação. Conduzido pelo Fernando em novembro.",
    context: "O painel hoje só mostra o problema (GMV em risco, taxa de recusa). Com o Khora, ele passa a sugerir o que fazer, acelerando a decisão do lojista e mostrando evolução contínua em IA no OMS.",
  },
  "ep-101": {
    description: "Primeira fase da correção das vulnerabilidades apontadas pela auditoria de segurança da LWSA (DOJO): os 6 itens de criticidade muito alta, como SQL injection, acesso entre lojistas e segredos expostos no código.",
    context: "Protege os dados dos clientes e impede que um lojista acesse informações de outro. Continua em novembro, porque a fila urgente do PDV não deixou o time atacar tudo em outubro.",
  },
  "ep-98": {
    description: "Discovery e refinamento técnico para o OMS atender mais de uma plataforma de e-commerce (Wake, VTEX e Shopify) no mesmo ambiente, conforme a configuração de cada conta. Conduzido pelo Felipe em novembro, com desenvolvimento a partir de dezembro.",
    context: "Destrava a migração faseada de clientes grandes com várias marcas, como o Grupo Soma, sem obrigá-los a operar dois OMS ao mesmo tempo. Pedido do Girelli e do time de vendas.",
  },
  "ep-89": {
    description: "Triangulação fiscal no Ship-from-Store para a Shoulder: a loja física separa e despacha o produto, mas a nota de venda sai de uma filial ou CD. Desenvolvido em outubro; ajustes e testes com o cliente até 17/11.",
    context: "Projeto vendido ao cliente. Reduz o custo total da operação omnichannel da marca sem mudar o processo físico da loja.",
  },
  "ep-35": {
    description: "Novo módulo Gestão de Entregas no Wake Insights: um painel com o desempenho das transportadoras (% no prazo, atrasos, frete subsidiado, pedidos retidos). A Isa começa a tela no início de novembro; o agente Khora entra numa segunda fase.",
    context: "Transforma dados logísticos soltos em evidência para o lojista cobrar as transportadoras e escolher melhor, evitando impacto na experiência do consumidor final.",
  },
  "ep-86": {
    description: "Módulo Saúde da Distribuição no Wake Insights: mostra como a rede de lojas atende a demanda e sugere, via Córtex, uma nova ordem de roteamento. Falta ajustar a reordenação para respeitar os blocos de região.",
    context: "Responde perguntas que hoje exigem extração manual (qual loja atende quanto, onde os carrinhos quebram, quanto frete a marca absorve) e indica como corrigir. Depende de uma API de regiões do Commerce.",
  },
  "sug-gregory": {
    description: "Ajuste da integração financeira do Wake OMS para pedidos com mais de uma origem (split), no projeto do cliente Gregory. Em homologação com o cliente.",
    context: "Projeto vendido ao cliente. Garante que o financeiro do ERP feche certo quando um pedido é atendido por mais de uma loja ou CD.",
  },

  // ── Demais iniciativas OMS ─────────────────────────────────────────────────
  "ep-97": {
    description: "Fluxo para tratar pedidos que ficam em \"problema na entrega\" e voltam à origem: registrar o novo endereço e reenviar o pedido pela transportadora.",
    context: "Hoje não há processo de devolução para esses casos e o pedido fica travado. Atende a Track&Field, que teve 35 casos em 3 meses, todos pelos Correios.",
  },
  "ep-96": {
    description: "Integração do Wake OMS com o Document Wake: o lojista cria entidades, envia dados do ERP e usa essas informações no front do site.",
    context: "Aproxima os produtos do grupo e abre novos usos de dados do ERP na loja virtual, sem desenvolvimento sob medida para cada cliente.",
  },
  "ep-94": {
    description: "Criação do pedido e importação da etiqueta do TikTok Shop para despachar no padrão exigido pela plataforma.",
    context: "Projeto vendido ao Grupo Soma. Sem a etiqueta oficial, os pedidos vindos do TikTok não podem ser despachados.",
  },
  "ep-93": {
    description: "Mudança no cálculo do reembolso de frete na logística reversa: os dados da TroqueCommerce passam a ser a única fonte para o ERP e para a nota de devolução.",
    context: "Projeto vendido à Osklen. Elimina diferenças financeiras entre o valor reembolsado ao cliente e o que vai para o ERP.",
  },
  "ep-92": {
    description: "Migração das aplicações do OMS de servidores EC2/IIS para containers no ECS, resolvendo os débitos técnicos que impediam a mudança.",
    context: "Reduz custo de infraestrutura e dá mais escalabilidade para aguentar picos como a Black Friday.",
  },
  "ep-88": {
    description: "Integração nativa do Wake OMS com a Shopify: catálogo (produtos, SKUs e fotos), estoque, ciclo completo de pedidos e Change Seller.",
    context: "Viabiliza o OMS para contas grandes que vendem pela Shopify, como Vix e Osklen, e acelera os go-lives.",
  },
  "ep-87": {
    description: "Troca de produto direto no detalhe do pedido, antes do faturamento: o operador substitui o item em falta por outro SKU do mesmo CD, com trava para não passar do valor pago.",
    context: "Acaba com o cancela-e-refaz em caso de ruptura de estoque, reduzindo retrabalho do SAC e pedidos perdidos.",
  },
  "ep-84": {
    description: "Pedidos de pré-venda no OMS: novo status \"Pré-Venda\" que segura a logística, data de lançamento por item e quebra do pedido por data, liberando a separação automaticamente.",
    context: "Permite vender lançamentos antes do estoque chegar, sem que a loja ou o CD separe o pedido cedo demais.",
  },
  "ep-83": {
    description: "Evolução da heurística de decisão de origem (Jaimito): o limite de 5 CDs na cotação de frete vira parâmetro e a priorização passa a combinar região e score da loja.",
    context: "Mais lojas no leilão de frete significa cotações mais baratas e rápidas, sem perder performance.",
  },
  "ep-79": {
    description: "Plano de resolução dos cerca de 400 apontamentos da análise de código da LWSA, organizado em fases por criticidade.",
    context: "Coloca a segurança no radar do time de forma planejada. A fase 1, com os itens mais críticos, está no objetivo de vulnerabilidades.",
  },
  "ep-78": {
    description: "Integração para enviar as vendas das lojas físicas do OMS para a API de Audiência da Wake Experience, começando pelo Linx POS.",
    context: "Uniria o comportamento de compra online e offline nas campanhas da Wake Experience. Saiu de outubro e voltou para o backlog.",
  },
  "sug-devolucoes": {
    description: "Evolução do módulo de devoluções: nova tela de detalhes, ações e filtros no grid, nota fiscal de devolução manual e sincronização com o operador logístico.",
    context: "Dá autonomia ao lojista para resolver devoluções dentro do OMS, sem planilhas nem chamados.",
  },
  "sug-aguard-fat": {
    description: "Intervenção manual em pedidos parados em \"Aguardando Faturamento\" e novo endpoint público para consultar esses pedidos.",
    context: "Destrava pedidos que ficam presos no faturamento e dá visibilidade para integrações externas.",
  },
  "sug-nova-ux": {
    description: "Nova experiência de uso no módulo de Pedidos do Wake OMS, com aviso do novo layout e correções.",
    context: "Tela mais clara para a operação diária da loja, onde o lojista passa a maior parte do tempo.",
  },
  "sug-fulfillment": {
    description: "Novos endpoints de fulfillment: sinalizar início e fim da separação, recusar e cancelar pedido (projeto Tommy / WMS Unlock).",
    context: "Permite que WMS e operadores externos conversem com o OMS em tempo real, sem atualização manual de status.",
  },
  "sug-observab": {
    description: "Correlation ID nos logs para rastrear uma operação de ponta a ponta entre os serviços do OMS.",
    context: "Investigação de erros mais rápida, o que reduz o tempo de resposta do suporte.",
  },
  "sug-multi-wh": {
    description: "Habilitar o Wake OMS a receber o estoque de várias warehouses do mesmo cliente.",
    context: "Atende operações com mais de um depósito sem precisar de contas separadas.",
  },
  "sug-reserva": {
    description: "Controle de Change Seller por segmentação de lojas para a Reserva.",
    context: "Projeto vendido ao cliente. Dá à marca controle sobre quais lojas podem assumir pedidos de outras.",
  },
  "sug-soma-cash": {
    description: "Mudança na integração de cashback do app Soma Box.",
    context: "Projeto vendido ao Grupo Soma. Mantém o benefício de cashback funcionando nas jornadas que passam pelo OMS.",
  },
  "sug-taco": {
    description: "Integração do Wake OMS e SinB2C com a transportadora Anjun Express.",
    context: "Projeto vendido à Taco. Amplia as opções de entrega da marca.",
  },

  // ── Wake U ─────────────────────────────────────────────────────────────────
  "ep-85": {
    description: "Integração do Venda Digital (Wake U) com o CRM Bônus, via byCoders, para consultar e usar o saldo de Giftback do cliente nos pedidos.",
    context: "O cliente usa o mesmo benefício no e-commerce e na loja física, o que eleva conversão e ticket médio no Venda Digital.",
  },
  "ep-82": {
    description: "Integração do Wake U com as maquininhas Smart POS da Getnet, via Eyemobile: cobrança, consulta e cancelamento, e depois estorno e cupom.",
    context: "Mais uma opção de meio de pagamento para as lojas. Desenvolvido junto com a Getnet, que está lançando o produto.",
  },
  "sug-vd-vtex": {
    description: "Venda Digital para clientes VTEX: cotação de frete, pagamento, cupons, on-hands e geração do pedido, mais gestão de vendedores.",
    context: "Leva o Wake U para a base de lojistas que usa VTEX, ampliando o mercado do produto.",
  },
  "sug-on-hands": {
    description: "Vendas presenciais (on-hands) no Wake U: emissão de NFC-e (cupom fiscal) e venda sem identificar o cliente.",
    context: "Permite que o vendedor feche a venda na loja pelo próprio app, com nota fiscal, sem passar pelo caixa.",
  },

  // ── PDV ────────────────────────────────────────────────────────────────────
  "ep-81": {
    description: "Primeira fase do Wake PDV: venda, caixa, preços sincronizados com o Commerce, cancelamento, estorno e nota fiscal.",
    context: "Novo produto de frente de caixa da Wake para as lojas físicas, integrado ao Commerce desde o primeiro dia.",
  },
  "ep-21": {
    description: "Arquitetura do Wake PDV: desenho da solução e schema do banco de dados da versão 1.",
    context: "Base técnica que sustenta todo o desenvolvimento do PDV.",
  },
};
