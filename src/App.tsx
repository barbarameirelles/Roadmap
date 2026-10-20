import { useState, useEffect } from "react";
import "./components/gantt/gantt.css";
import GanttTopbar from "./components/gantt/GanttTopbar";
import GanttGoalsView from "./components/gantt/GanttGoalsView";
import GanttExecView from "./components/gantt/GanttExecView";
import GanttKanbanView from "./components/gantt/GanttKanbanView";
import GanttHypothesesView from "./components/gantt/GanttHypothesesView";
import GanttOpsView from "./components/gantt/GanttOpsView";
import HomeScreen from "./components/HomeScreen";
import OmniView, { type OmniTab } from "./components/omni/OmniView";
import { RoadmapProvider } from "./lib/RoadmapContext";

type Screen = "home" | "xp" | "omni";
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
const OMNI_PATHS: Record<OmniTab, string> = {
  goals:  "/omni",
  kanban: "/omni/kanban",
  exec:   "/omni/executiva",
  pdv:    "/omni/pdv",
};
const PATH_OMNI: Record<string, OmniTab> = Object.fromEntries(
  Object.entries(OMNI_PATHS).map(([t, p]) => [p, t as OmniTab]),
);

interface Route { screen: Screen; tab: Tab; omniTab: OmniTab }

function parsePath(): Route {
  const p = (window.location.pathname.replace(/\/+$/, "") || "/").toLowerCase();
  if (p === "/pdv") return { screen: "omni", tab: "goals", omniTab: "pdv" }; // link antigo
  if (PATH_OMNI[p]) return { screen: "omni", tab: "goals", omniTab: PATH_OMNI[p] };
  if (PATH_TABS[p]) return { screen: "xp", tab: PATH_TABS[p], omniTab: "goals" };
  return { screen: "home", tab: "goals", omniTab: "goals" };
}

function pathFor(screen: Screen, tab: Tab, omniTab: OmniTab): string {
  if (screen === "home") return "/";
  if (screen === "omni") return OMNI_PATHS[omniTab];
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
      />
    );
  }

  if (screen === "omni") {
    return <OmniView tab={omniTab} onTab={t => go("omni", "goals", t)} onHome={() => go("home")} />;
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
