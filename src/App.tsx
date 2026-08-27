import { useState, useEffect } from "react";
import "./components/gantt/gantt.css";
import GanttTopbar from "./components/gantt/GanttTopbar";
import GanttGoalsView from "./components/gantt/GanttGoalsView";
import GanttExecView from "./components/gantt/GanttExecView";
import GanttKanbanView from "./components/gantt/GanttKanbanView";
import GanttHypothesesView from "./components/gantt/GanttHypothesesView";
import HomeScreen from "./components/HomeScreen";
import PdvTopbar from "./components/pdv/PdvTopbar";
import PdvRoadmapView from "./components/pdv/PdvRoadmapView";
import { RoadmapProvider } from "./lib/RoadmapContext";

type Screen = "home" | "xp" | "pdv";
type Tab = "goals" | "exec" | "kanban" | "hypotheses";

// ── Rotas (sub-caminhos) ──────────────────────────────────────────────────────
const TAB_PATHS: Record<Tab, string> = {
  goals:      "/entrega",
  kanban:     "/kanban",
  hypotheses: "/hipoteses",
  exec:       "/executiva",
};
const PATH_TABS: Record<string, Tab> = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([t, p]) => [p, t as Tab]),
);

interface Route { screen: Screen; tab: Tab }

function parsePath(): Route {
  const p = (window.location.pathname.replace(/\/+$/, "") || "/").toLowerCase();
  if (p === "/pdv") return { screen: "pdv", tab: "goals" };
  if (PATH_TABS[p]) return { screen: "xp", tab: PATH_TABS[p] };
  return { screen: "home", tab: "goals" };
}

function pathFor(screen: Screen, tab: Tab): string {
  if (screen === "home") return "/";
  if (screen === "pdv") return "/pdv";
  return TAB_PATHS[tab];
}

export default function App() {
  const [route, setRoute] = useState<Route>(parsePath);
  const { screen, tab } = route;

  // Sincroniza o estado quando o usuário usa voltar/avançar do navegador.
  useEffect(() => {
    const onPop = () => setRoute(parsePath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function go(next: Screen, nextTab: Tab = "goals") {
    const path = pathFor(next, nextTab);
    if (window.location.pathname !== path) window.history.pushState({}, "", path);
    setRoute({ screen: next, tab: nextTab });
  }

  if (screen === "home") {
    return (
      <HomeScreen
        onEnterXP={() => go("xp", "goals")}
        onEnterPDV={() => go("pdv")}
      />
    );
  }

  if (screen === "pdv") {
    return (
      <div className="gantt-page">
        <PdvTopbar onHome={() => go("home")} />
        <PdvRoadmapView />
      </div>
    );
  }

  return (
    <RoadmapProvider>
      <div className="gantt-page">
        <GanttTopbar activeTab={tab} onTab={t => go("xp", t)} onHome={() => go("home")} />
        {tab === "goals"       && <GanttGoalsView />}
        {tab === "exec"        && <GanttExecView />}
        {tab === "kanban"      && <GanttKanbanView />}
        {tab === "hypotheses"  && <GanttHypothesesView />}
      </div>
    </RoadmapProvider>
  );
}
