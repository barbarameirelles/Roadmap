// CDP Roadmap data
// Months are 0-indexed from Jan 2026 (shared with ganttData)

import { MONTHS, QUARTERS, TODAY_MONTH, STATUS_META } from "./ganttData";
export { MONTHS, QUARTERS, TODAY_MONTH, STATUS_META };
export type { FeatureStatus } from "./ganttData";

export interface CDPSubItem {
  id: string;
  name: string;
  planned: { start: number; end: number };
  status: import("./ganttData").FeatureStatus;
  progress: number;
}

export interface CDPEpic {
  id: string;
  name: string;
  planned: { start: number; end: number };
  status: import("./ganttData").FeatureStatus;
  progress: number;
  subitems: CDPSubItem[];
}

export const CDP_EPICS: CDPEpic[] = [
  {
    id: "cdp-1",
    name: "Estruturação da CDP",
    planned: { start: 0, end: 3 },
    status: "em-andamento",
    progress: 12,
    subitems: [],
  },
  {
    id: "cdp-2",
    name: "Enriquecimento de dados",
    planned: { start: 2, end: 7 },
    status: "em-andamento",
    progress: 0,
    subitems: [
      {
        id: "cdp-2-1",
        name: "Trazer dados do Commerce",
        planned: { start: 2, end: 4 },
        status: "em-andamento",
        progress: 0,
      },
      {
        id: "cdp-2-2",
        name: "Trazer dados de Loja física",
        planned: { start: 5, end: 7 },
        status: "no-prazo",
        progress: 0,
      },
    ],
  },
  {
    id: "cdp-3",
    name: "Criação de recomendação",
    planned: { start: 6, end: 10 },
    status: "no-prazo",
    progress: 0,
    subitems: [],
  },
  {
    id: "cdp-4",
    name: "Disponibilizar segmentador para o commerce",
    planned: { start: 8, end: 12 },
    status: "no-prazo",
    progress: 0,
    subitems: [],
  },
  {
    id: "cdp-5",
    name: "Base Analítica",
    planned: { start: 8, end: 12 },
    status: "no-prazo",
    progress: 0,
    subitems: [],
  },
];
