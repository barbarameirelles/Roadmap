import { useState } from "react";
import "./components/gantt/gantt.css";
import GanttTopbar from "./components/gantt/GanttTopbar";
import GanttGoalsView from "./components/gantt/GanttGoalsView";
import GanttExecView from "./components/gantt/GanttExecView";
import GanttKanbanView from "./components/gantt/GanttKanbanView";
import GanttHypothesesView from "./components/gantt/GanttHypothesesView";

type Tab = "goals" | "exec" | "kanban" | "hypotheses";

export default function App() {
  const [tab, setTab] = useState<Tab>("goals");

  return (
    <div className="gantt-page">
      <GanttTopbar activeTab={tab} onTab={setTab} />
      {tab === "goals"       && <GanttGoalsView />}
      {tab === "exec"        && <GanttExecView />}
      {tab === "kanban"      && <GanttKanbanView />}
      {tab === "hypotheses"  && <GanttHypothesesView />}
    </div>
  );
}
