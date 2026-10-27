// Área "Iniciativas Omni": OMS, Wake U e PDV num roadmap só, com filtro por
// produto e por tipo (roadmap x projeto de cliente). Fonte: GitLab.
import { useEffect, useState } from "react";
import "./omni.css";
import { OmniDataProvider, useOmniData } from "@/lib/omniSync";
import PdvRoadmapView from "@/components/pdv/PdvRoadmapView";
import OmniGoalsView from "./OmniGoalsView";
import OmniHypothesesView from "./OmniHypothesesView";
import OmniKanbanView from "./OmniKanbanView";
import OmniSupportView from "./OmniSupportView";
import { OmniFilterBar, type OmniFilter } from "./omniShared";

export type OmniTab = "hypotheses" | "goals" | "kanban" | "support" | "pdv";

const TABS: { id: OmniTab; title: string; sub: string }[] = [
  { id: "hypotheses", title: "Hipóteses",   sub: "Épicos sem tarefas" },
  { id: "goals",  title: "Entrega do Mês",  sub: "Iniciativas por mês" },
  { id: "kanban", title: "Kanban",          sub: "Visão operacional" },
  { id: "support", title: "Suporte",        sub: "Chamados · prazo" },
  { id: "pdv",    title: "Marcos PDV",      sub: "Roadmap estático" },
];

const STORE = "omni-filter";
function loadFilter(): OmniFilter {
  try {
    const f = JSON.parse(localStorage.getItem(STORE) ?? "");
    if (f && f.product && f.kind) return f;
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

export default function OmniView(props: { tab: OmniTab; onTab: (t: OmniTab) => void; onHome: () => void }) {
  return <OmniDataProvider><OmniScreen {...props} /></OmniDataProvider>;
}

function OmniScreen({ tab, onTab, onHome }: { tab: OmniTab; onTab: (t: OmniTab) => void; onHome: () => void }) {
  const [filter, setFilter] = useState<OmniFilter>(loadFilter);
  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(filter)); } catch { /* ok */ } }, [filter]);

  return (
    <div className="gantt-page">
      <div className="g-topbar">
        <div className="g-topbar-inner">
          <div className="g-brand">
            <button className="g-brand-logo g-brand-back" onClick={onHome} title="Voltar à tela inicial" aria-label="Voltar à tela inicial">←</button>
            <span>Iniciativas Omni</span>
          </div>
          <div className="g-tabs">
            {TABS.map(t => (
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
      {tab !== "pdv" && (
        <div className="om-filterbar"><OmniFilterBar value={filter} onChange={setFilter} showKind={tab !== "support"} /></div>
      )}
      {tab === "hypotheses" && <OmniHypothesesView filter={filter} />}
      {tab === "goals"  && <OmniGoalsView filter={filter} />}
      {tab === "kanban" && <OmniKanbanView filter={filter} />}
      {tab === "support" && <OmniSupportView filter={filter} />}
      {tab === "pdv"    && <PdvRoadmapView />}
    </div>
  );
}
