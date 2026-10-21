// Área "Iniciativas Omni": OMS, Wake U e PDV num roadmap só, com filtro por
// produto e por tipo (roadmap x projeto de cliente). Fonte: GitLab.
import { useEffect, useState } from "react";
import "./omni.css";
import { OMNI_DATA } from "@/data/omni/omniData";
import PdvRoadmapView from "@/components/pdv/PdvRoadmapView";
import OmniGoalsView from "./OmniGoalsView";
import OmniHypothesesView from "./OmniHypothesesView";
import OmniKanbanView from "./OmniKanbanView";
import OmniSupportView from "./OmniSupportView";
import { AdjustFlag, OmniFilterBar, type OmniFilter } from "./omniShared";

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

const generated = new Date(OMNI_DATA.generatedAt);
const generatedText = `${generated.toLocaleDateString("pt-BR")} ${generated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

export default function OmniView({ tab, onTab, onHome }: { tab: OmniTab; onTab: (t: OmniTab) => void; onHome: () => void }) {
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
          <div className="g-sync">
            <span className="g-sync-meta">
              GitLab · {generatedText}{" "}
              <AdjustFlag size="sm" notes={[
                "Ainda não há botão Sincronizar para o GitLab: os dados são de quando o script rodou (npm run sync:omni)",
              ]} />
            </span>
          </div>
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
