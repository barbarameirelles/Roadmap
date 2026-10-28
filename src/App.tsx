import { useState, useEffect } from "react";
import "./components/gantt/gantt.css";
import GanttTopbar from "./components/gantt/GanttTopbar";
import GanttGoalsView from "./components/gantt/GanttGoalsView";
import GanttExecView from "./components/gantt/GanttExecView";
import GanttKanbanView from "./components/gantt/GanttKanbanView";
import GanttHypothesesView from "./components/gantt/GanttHypothesesView";
import GanttOpsView from "./components/gantt/GanttOpsView";
import HomeScreen from "./components/HomeScreen";
import OmniView, { type OmniArea, type OmniTab } from "./components/omni/OmniView";
import { RoadmapProvider } from "./lib/RoadmapContext";

type Screen = "home" | "xp" | OmniArea;
type Tab = "goals" | "exec" | "kanban" | "hypotheses" | "ops";

// ── Rotas (sub-caminhos) ──────────────────────────────────────────────────────
const TAB_PATHS: Record<Tab, string> = {
  goals:      "/entrega",
  kanban:     "/kanban",
  hypotheses: "/hipoteses",
  exec:       "/executiva",
  ops:        "/operacional",
};
const PATH_TABS: Record<string, Tab> = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([t, p]) => [p, t as Tab]),
);
// Omni (OMS + Wake U) e PDV: mesmas abas em /omni/… e /pdv/…; marcos só no PDV.
const AREA_PATHS: Record<OmniArea, Partial<Record<OmniTab, string>>> = {
  omni: { hypotheses: "/omni/hipoteses", goals: "/omni", kanban: "/omni/kanban", support: "/omni/suporte" },
  pdv:  { hypotheses: "/pdv/hipoteses", goals: "/pdv", kanban: "/pdv/kanban", support: "/pdv/suporte", milestones: "/pdv/marcos" },
};
const PATH_AREA: Record<string, [OmniArea, OmniTab]> = Object.fromEntries(
  (Object.entries(AREA_PATHS) as [OmniArea, Partial<Record<OmniTab, string>>][])
    .flatMap(([a, paths]) => Object.entries(paths).map(([t, p]) => [p, [a, t as OmniTab]])),
);

interface Route { screen: Screen; tab: Tab; omniTab: OmniTab }

function parsePath(): Route {
  const p = (window.location.pathname.replace(/\/+$/, "") || "/").toLowerCase();
  if (p === "/omni/pdv") return { screen: "pdv", tab: "goals", omniTab: "milestones" }; // link antigo
  if (p === "/omni/executiva") return { screen: "omni", tab: "goals", omniTab: "goals" }; // aba removida
  if (PATH_AREA[p]) return { screen: PATH_AREA[p][0], tab: "goals", omniTab: PATH_AREA[p][1] };
  if (PATH_TABS[p]) return { screen: "xp", tab: PATH_TABS[p], omniTab: "goals" };
  return { screen: "home", tab: "goals", omniTab: "goals" };
}

function pathFor(screen: Screen, tab: Tab, omniTab: OmniTab): string {
  if (screen === "home") return "/";
  if (screen === "omni" || screen === "pdv") return AREA_PATHS[screen][omniTab] ?? AREA_PATHS[screen].goals!;
  return TAB_PATHS[tab];
}

export default function App() {
  const [route, setRoute] = useState<Route>(parsePath);
  const { screen, tab, omniTab } = route;

  // Sincroniza o estado quando o usuário usa voltar/avançar do navegador.
  useEffect(() => {
    const onPop = () => setRoute(parsePath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function go(next: Screen, nextTab: Tab = "goals", nextOmni: OmniTab = "goals") {
    const path = pathFor(next, nextTab, nextOmni);
    if (window.location.pathname !== path) window.history.pushState({}, "", path);
    setRoute({ screen: next, tab: nextTab, omniTab: nextOmni });
  }

  if (screen === "home") {
    return (
      <HomeScreen
        onEnterXP={() => go("xp", "goals")}
        onEnterOmni={() => go("omni")}
        onEnterPdv={() => go("pdv")}
      />
    );
  }

  if (screen === "omni" || screen === "pdv") {
    const area = screen;
    return <OmniView area={area} tab={omniTab} onTab={t => go(area, "goals", t)} onHome={() => go("home")} />;
  }

  return (
    <RoadmapProvider>
      <div className="gantt-page">
        <GanttTopbar activeTab={tab} onTab={t => go("xp", t)} onHome={() => go("home")} />
        {tab === "goals"       && <GanttGoalsView />}
        {tab === "exec"        && <GanttExecView />}
        {tab === "kanban"      && <GanttKanbanView />}
        {tab === "hypotheses"  && <GanttHypothesesView />}
        {tab === "ops"         && <GanttOpsView />}
      </div>
    </RoadmapProvider>
  );
}
