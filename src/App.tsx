import { useState } from "react";
import "./components/gantt/gantt.css";
import GanttTopbar from "./components/gantt/GanttTopbar";
import GanttGoalsView from "./components/gantt/GanttGoalsView";
import GanttExecView from "./components/gantt/GanttExecView";
import GanttKanbanView from "./components/gantt/GanttKanbanView";
import GanttHypothesesView from "./components/gantt/GanttHypothesesView";
import HomeScreen from "./components/HomeScreen";
import { RoadmapProvider } from "./lib/RoadmapContext";

type Screen = "home" | "xp";
type Tab = "goals" | "exec" | "kanban" | "hypotheses";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [tab, setTab] = useState<Tab>("goals");

  if (screen === "home") {
    return <HomeScreen onEnterXP={() => setScreen("xp")} />;
  }

  return (
    <RoadmapProvider>
      <div className="gantt-page">
        <GanttTopbar activeTab={tab} onTab={setTab} onHome={() => setScreen("home")} />
        {tab === "goals"       && <GanttGoalsView />}
        {tab === "exec"        && <GanttExecView />}
        {tab === "kanban"      && <GanttKanbanView />}
        {tab === "hypotheses"  && <GanttHypothesesView />}
      </div>
    </RoadmapProvider>
  );
}
