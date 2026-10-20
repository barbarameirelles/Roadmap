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
  start?: string;
  due?: string;
  gitlabStatus?: string;  // status escrito no próprio épico
  items: OmniItem[];
  adjust: string[];
}

export interface OmniData {
  generatedAt: string;
  initiatives: OmniInitiative[];
}
