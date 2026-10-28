// Áreas que leem o GitLab: "Iniciativas Omni" (OMS + Wake U) e "Wake PDV".
// As duas têm as mesmas abas e regras; muda só o conjunto de produtos (e o PDV
// tem a aba extra de marcos). Filtro por produto e por tipo (roadmap x projeto).
import { useEffect, useState } from "react";
import "./omni.css";
import { OmniDataProvider, useOmniData } from "@/lib/omniSync";
import PdvRoadmapView from "@/components/pdv/PdvRoadmapView";
import OmniGoalsView from "./OmniGoalsView";
import OmniHypothesesView from "./OmniHypothesesView";
import OmniKanbanView from "./OmniKanbanView";
import OmniSupportView from "./OmniSupportView";
import { OmniAreaProvider, OmniFilterBar, type OmniArea, type OmniFilter } from "./omniShared";

export type OmniTab = "hypotheses" | "goals" | "kanban" | "support" | "milestones";
export type { OmniArea };

const TABS: { id: OmniTab; title: string; sub: string; areas: OmniArea[] }[] = [
  { id: "hypotheses", title: "Hipóteses",   sub: "Board de épicos",     areas: ["omni", "pdv"] },
  { id: "goals",  title: "Entrega do Mês",  sub: "Iniciativas por mês", areas: ["omni", "pdv"] },
  { id: "kanban", title: "Kanban",          sub: "Visão operacional",   areas: ["omni", "pdv"] },
  { id: "support", title: "Suporte",        sub: "Chamados · prazo",    areas: ["omni", "pdv"] },
  { id: "milestones", title: "Marcos PDV",  sub: "Roadmap estático",    areas: ["pdv"] },
];
const AREA_NAME: Record<OmniArea, string> = { omni: "Iniciativas Omni", pdv: "Wake PDV" };

function loadFilter(store: string): OmniFilter {
  try {
    const f = JSON.parse(localStorage.getItem(store) ?? "");
    if (f && f.product && f.kind && f.product !== "PDV") return f;
  } catch { /* sem filtro salvo */ }
  return { product: "Todos", kind: "Tudo" };
}

function dateText(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

// Mesmo botão do XP (g-sync-*), lendo o GitLab via Edge Function sync-gitlab.
function GitlabSyncButton() {
  const { data, sync, syncing, message } = useOmniData();
  return (
    <div className="g-sync">
      <button className="g-sync-btn" onClick={() => sync()} disabled={syncing} title="Sincronizar com o GitLab">
        <svg className={"g-sync-icon" + (syncing ? " spin" : "")} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-2.6-6.4" />
          <path d="M21 3v6h-6" />
        </svg>
        {syncing ? "Sincronizando…" : "Sincronizar"}
      </button>
      <span className="g-sync-meta">{message ?? `GitLab · ${dateText(data.generatedAt)}`}</span>
    </div>
  );
}

interface Props { area: OmniArea; tab: OmniTab; onTab: (t: OmniTab) => void; onHome: () => void }

export default function OmniView(props: Props) {
  return (
    <OmniDataProvider>
      <OmniAreaProvider value={props.area}><OmniScreen key={props.area} {...props} /></OmniAreaProvider>
    </OmniDataProvider>
  );
}

function OmniScreen({ area, tab, onTab, onHome }: Props) {
  const store = `${area}-filter`;
  const [filter, setFilter] = useState<OmniFilter>(() => loadFilter(store));
  useEffect(() => { try { localStorage.setItem(store, JSON.stringify(filter)); } catch { /* ok */ } }, [store, filter]);
  const tabs = TABS.filter(t => t.areas.includes(area));

  return (
    <div className="gantt-page">
      <div className="g-topbar">
        <div className="g-topbar-inner">
          <div className="g-brand">
            <button className="g-brand-logo g-brand-back" onClick={onHome} title="Voltar à tela inicial" aria-label="Voltar à tela inicial">←</button>
            <span>{AREA_NAME[area]}</span>
          </div>
          <div className="g-tabs">
            {tabs.map(t => (
              <button key={t.id} className={"g-tab" + (tab === t.id ? " active" : "")} onClick={() => onTab(t.id)}>
                <div className="g-tab-block">
                  <span className="g-tab-title">{t.title}</span>
                  <span className="g-tab-sub">{t.sub}</span>
                </div>
              </button>
            ))}
          </div>
          <GitlabSyncButton />
        </div>
      </div>
      {tab !== "milestones" && (
        <div className="om-filterbar"><OmniFilterBar value={filter} onChange={setFilter} showKind={tab !== "support"} showProduct={tab !== "hypotheses"} /></div>
      )}
      {tab === "hypotheses" && <OmniHypothesesView filter={filter} />}
      {tab === "goals"  && <OmniGoalsView filter={filter} />}
      {tab === "kanban" && <OmniKanbanView filter={filter} />}
      {tab === "support" && <OmniSupportView filter={filter} />}
      {tab === "milestones" && <PdvRoadmapView />}
    </div>
  );
}
