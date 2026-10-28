// Tipos da área Iniciativas Omni (OMS, Wake U, PDV — fonte: GitLab).
import type { IssueStatus } from "@/data/labeledDeliveries";

export type OmniProduct = "OMS" | "Wake U" | "PDV";
export type OmniKind = "roadmap" | "projeto";

export interface OmniItem {
  ref: string;            // "projeto/caminho#123"
  url: string;
  title: string;
  status: IssueStatus;
  blocked?: boolean;
  parent?: string;        // título da issue-mãe quando o item é uma task
  due?: string;
  iteration?: string;
  adjust: string[];       // pendências no GitLab → "(!)"
}

export interface OmniInitiative {
  id: string;             // "ep-81" (épico) ou "sug-…" (agrupamento sugerido)
  title: string;
  url: string;
  products: OmniProduct[];
  kind: OmniKind;
  client?: string;
  month: { year: number; month: number } | null;
  objective?: boolean;    // tem etiqueta Objetivo::<Mês> (planejado para o mês)
  start?: string;
  due?: string;
  gitlabStatus?: string;  // status escrito no próprio épico
  items: OmniItem[];
  adjust: string[];
}

// Hipótese = épico nas colunas Open/Triagem/Backlog/Refinamento do board de épicos "Roadmap"
// (qualquer produto), ou épico sem tarefas e sem andamento em qualquer coluna.
export type OmniHypoColumn = "Open" | "Triagem" | "Backlog" | "Refinamento" | "To-Do";
export type OmniPriority = "urgente" | "alta" | "media" | "baixa";

export interface OmniHypothesis {
  id: string;
  iid: number;
  title: string;
  url: string;
  column: OmniHypoColumn;
  products: OmniProduct[];
  lines: string[];           // produtos pelas etiquetas prod:: (OMS, B2B, Hub de integração…); o 1º é o principal
  kind: OmniKind;
  vertical?: string;         // vertical:: (Commerce, Logística…)
  tasks: number;
  done: number;
  inDelivery: boolean;       // também aparece em Entrega do Mês / Kanban (já tem tarefas)
  priority?: OmniPriority;   // etiqueta priority:: do GitLab
  client?: string;
  origin?: string;           // orig:: (Suporte, Solicitação Cliente, Projeto…)
  type?: string;             // type:: (Feature, Melhoria…)
  description: string;
  created: string;
  adjust: string[];
}

// Chamado do projeto suporte-produtos do GitLab.
export interface OmniTicket {
  ref: string;
  url: string;
  title: string;
  product: OmniProduct;
  status: IssueStatus;
  blocked?: boolean;
  priority?: OmniPriority;
  created: string;           // YYYY-MM-DD
  closed: string | null;
  assignee: string | null;
  type?: string;
  adjust: string[];
}

export interface OmniData {
  generatedAt: string;
  initiatives: OmniInitiative[];
  hypotheses: OmniHypothesis[];
  support: OmniTicket[];
}
