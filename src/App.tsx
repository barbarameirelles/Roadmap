import { useState } from "react";
import "./components/gantt/gantt.css";
import GanttTopbar from "./components/gantt/GanttTopbar";
import GanttRoadmapView from "./components/gantt/GanttRoadmapView";
import GanttExecView from "./components/gantt/GanttExecView";
import GanttKanbanView from "./components/gantt/GanttKanbanView";
import GanttTimelineView from "./components/gantt/GanttTimelineView";
import GanttMonthlyView from "./components/gantt/GanttMonthlyView";

type Tab = "roadmap" | "exec" | "monthly" | "kanban" | "timeline";

export default function App() {
  const [tab, setTab] = useState<Tab>("roadmap");

  return (
    <div className="gantt-page">
      <GanttTopbar activeTab={tab} onTab={setTab} />
      {tab === "roadmap"  && <GanttRoadmapView />}
      {tab === "exec"     && <GanttExecView />}
      {tab === "monthly"  && <GanttMonthlyView />}
      {tab === "kanban"   && <GanttKanbanView />}
      {tab === "timeline" && <GanttTimelineView />}
    </div>
  );
}
