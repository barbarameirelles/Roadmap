import "./pdv.css";
import { AdjustFlag } from "@/components/omni/omniShared";

// Divergências do roadmap estático com o GitLab (19/10/2026) → "(!)" com tooltip.
const GITLAB_ADJUST: Record<string, string[]> = {
  "m1": ["No GitLab o épico \"Wake PDV - MVP Fase 1\" terminava em 10/09/2026 (prazo vencido) — alinhar a data do M1"],
  "Cadastro e consulta de cliente": ["GitLab: \"Cadastro de Cliente PDV\" e a tela ainda estão A fazer; sincronização de clientes em homologação"],
  "Produto e tipo de venda": ["GitLab: catálogo e marcas prontos; preços no backlog; desconto e tipo de venda ainda \"a especificar\""],
  "Cashback completo (CRM Bônus)": ["Não há tarefa de cashback no PDV — só existe no Wake U (épico CRM&Bonus). Criar no PDV ou tirar do M1"],
  "Cartão de crédito, Pix, dinheiro vivo": ["GitLab: \"TEF Fiserv\" A fazer e \"Registrar pagamento (múltiplo)\" a especificar; Pix e dinheiro não aparecem"],
  "Emissão de NFCe": ["GitLab: estrutura de documentos fiscais em análise; Omnitax não aparece em nenhuma tarefa"],
  "Contingência offline": ["Sem tarefa explícita no GitLab (só o worker de sincronização e a \"Recuperação de venda\", aguardando detalhamento)"],
  "Abertura/fechamento de caixa": ["Já está concluído no GitLab, dentro do MVP Fase 1 (M1) — mover para o M1"],
  "Login e perfis de acesso": ["Só a estrutura de operadores e vendedores está concluída; login não aparece no GitLab"],
  "Troca e devolução": ["Sem tarefa no GitLab"],
  "Campanhas e promoções": ["Sem tarefa no GitLab"],
  "Referenciamento de nota multicanal": ["Sem tarefa no GitLab"],
  "m2": ["Não existe épico do M2 no GitLab"],
  "rollout": ["Não existe épico de Roll out no GitLab"],
  "futuro": ["Fases seguintes ainda não estão no GitLab"],
};

interface Milestone {
  id: string;
  date: string;
  color: string;
  colorSoft: string;
  tag?: string;
  title: string;
  items?: string[];
  rollout?: { packages: string[]; note: string };
}

const MILESTONES: Milestone[] = [
  {
    id: "m1",
    date: "Out/26",
    color: "#16a34a",
    colorSoft: "#dcfce7",
    tag: "M1",
    title: "Showroom Matriz Shoulder",
    items: [
      "Cadastro e consulta de cliente",
      "Produto e tipo de venda",
      "Cashback completo (CRM Bônus)",
      "Cartão de crédito, Pix, dinheiro vivo",
      "Emissão de NFCe",
      "Contingência offline",
    ],
  },
  {
    id: "m2",
    date: "Dez/26",
    color: "#C505F2",
    colorSoft: "#f6dbfd",
    tag: "M2",
    title: "Showroom Matriz Shoulder",
    items: [
      "Login e perfis de acesso",
      "Troca e devolução",
      "Campanhas e promoções",
      "Abertura/fechamento de caixa",
      "Referenciamento de nota multicanal",
    ],
  },
  {
    id: "rollout",
    date: "Fev/27",
    color: "#2563eb",
    colorSoft: "#dbeafe",
    tag: "Roll out",
    title: "Roll out",
    rollout: {
      packages: ["Pacote entrega 1", "Pacote entrega 2"],
      note: "Consolidação dos dois pacotes do Showroom em operação de produção.",
    },
  },
  {
    id: "futuro",
    date: "Futuro",
    color: "#f97316",
    colorSoft: "#ffedd5",
    tag: "Fases seguintes",
    title: "Fases seguintes",
    items: [
      "Comissionamento multicanal",
      "Pedidos vitrine (e-commerce)",
      "Mercado Pago",
      "Cancelamento (até 30 min e após)",
      "Prateleira infinita · Gift Card",
    ],
  },
];

interface Detail {
  title: string;
  body: string;
}

const M1_DETAILS: Detail[] = [
  {
    title: "Cadastro e consulta de cliente",
    body: "CPF como identificador central. Cadastro com nome, telefone e endereço. Consulta de histórico e categoria do cliente (entrada, chique, luxo, top).",
  },
  {
    title: "Produto e tipo de venda",
    body: "Leitura por código de barras ou código manual. Tipos de venda (varejo, funcionário, diretoria) vinculados a tabelas de preço específicas. Desconto automático por tipo (ex: funcionário = 40% sobre preço original).",
  },
  {
    title: "Cashback completo — CRM Bônus",
    body: "Consulta de saldo por telefone, validação de elegibilidade por preço de tabela, aplicação com limite percentual, token SMS para confirmar resgate, token da loja como contingência, e geração de novo cashback ao finalizar a venda.",
  },
  {
    title: "Pagamento: cartão, Pix e dinheiro vivo",
    body: "Múltiplas formas combinadas numa mesma venda. Integração via Fiserv (adquirência). Cálculo automático de troco para pagamentos em dinheiro.",
  },
  {
    title: "Emissão de NFCe",
    body: "Nota fiscal de consumidor eletrônica emitida automaticamente ao fechar a venda, via Omnitax. NF-e para transações acima do limite legal (~R$ 10.000). Exibição e impressão do documento.",
  },
  {
    title: "Contingência offline",
    body: "Operação com banco local quando a internet cai. Sincronização automática com retaguarda ao retomar conexão. Transmissão posterior de notas geradas offline.",
  },
];

const DETAIL_TO_ITEM: Record<string, string> = {
  "Cashback completo — CRM Bônus": "Cashback completo (CRM Bônus)",
  "Pagamento: cartão, Pix e dinheiro vivo": "Cartão de crédito, Pix, dinheiro vivo",
};

export default function PdvRoadmapView() {
  return (
    <div className="pdv-page">
      <div className="pdv-head">
        <h1 className="pdv-title">
          <span className="pdv-slash">//</span>Roadmap Wake PDV
        </h1>
        <p className="pdv-sub">Visão alto nível das entregas · do piloto no Showroom ao roll out</p>
        <p className="g-page-note" style={{ marginTop: 8 }}>
          <AdjustFlag notes={["Roadmap estático: não lê o GitLab. Os (!) mostram onde ele diverge do GitLab hoje"]} /> Os marcos abaixo são escritos à mão; o andamento real do PDV está nas abas Entrega do Mês e Kanban.
        </p>
      </div>

      {/* Timeline de marcos */}
      <div className="pdv-timeline">
        {MILESTONES.map((m) => (
          <div
            key={m.id}
            className="pdv-ms"
            style={{ ["--pdv-c" as string]: m.color, ["--pdv-c-soft" as string]: m.colorSoft }}
          >
            <div className="pdv-ms-top">
              <span className="pdv-ms-date" style={{ color: m.color }}>{m.date}</span>
              <span className="pdv-ms-dot" />
            </div>
            <div className="pdv-card">
              {m.tag && <span className="pdv-card-tag">{m.tag} <AdjustFlag notes={GITLAB_ADJUST[m.id] ?? []} size="sm" /></span>}
              {m.rollout ? (
                <>
                  <div className="pdv-card-rollout">
                    <span className="pdv-rollout-pkg">{m.rollout.packages[0]}</span>
                    <span className="pdv-rollout-plus">+</span>
                    <span className="pdv-rollout-pkg">{m.rollout.packages[1]}</span>
                  </div>
                  <p className="pdv-card-note">{m.rollout.note}</p>
                </>
              ) : (
                <>
                  <h3 className="pdv-card-title">{m.title}</h3>
                  <ul className="pdv-card-list">
                    {m.items!.map((it) => <li key={it}>{it} <AdjustFlag notes={GITLAB_ADJUST[it] ?? []} size="sm" /></li>)}
                  </ul>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detalhe M1 */}
      <div className="pdv-section">
        <div className="pdv-section-head">
          <h2 className="pdv-section-title">
            <span className="pdv-slash">//</span>M1 — Outubro 2026: o que será entregue
          </h2>
        </div>
        <div className="pdv-banner">
          <span className="dot" />
          Teste interno · Ambiente controlado · Loja Showroom Shoulder
        </div>
        <div className="pdv-detail-grid">
          {M1_DETAILS.map((d) => (
            <div className="pdv-detail" key={d.title}>
              <h4 className="pdv-detail-title">{d.title} <AdjustFlag notes={GITLAB_ADJUST[DETAIL_TO_ITEM[d.title] ?? d.title] ?? []} size="sm" /></h4>
              <p className="pdv-detail-body">{d.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
