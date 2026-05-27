import { useState } from "react";
import "./components/gantt/gantt.css";
import GanttTopbar from "./components/gantt/GanttTopbar";
import GanttRoadmapView from "./components/gantt/GanttRoadmapView";
import GanttExecView from "./components/gantt/GanttExecView";
import GanttKanbanView from "./components/gantt/GanttKanbanView";

type Tab = "roadmap" | "exec" | "kanban";

export default function App() {
  const [tab, setTab] = useState<Tab>("roadmap");

  return (
    <div className="gantt-page">
      <GanttTopbar activeTab={tab} onTab={setTab} />
      {tab === "roadmap" && <GanttRoadmapView />}
      {tab === "exec"    && <GanttExecView />}
      {tab === "kanban"  && <GanttKanbanView />}
    </div>
  );
}
