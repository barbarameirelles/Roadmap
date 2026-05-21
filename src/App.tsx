import { useState } from "react";
import "./components/gantt/gantt.css";
import GanttTopbar from "./components/gantt/GanttTopbar";
import GanttRoadmapView from "./components/gantt/GanttRoadmapView";
import GanttExecView from "./components/gantt/GanttExecView";

type Tab = "roadmap" | "exec";

export default function App() {
  const [tab, setTab] = useState<Tab>("roadmap");

  return (
    <div className="gantt-page">
      <GanttTopbar activeTab={tab} onTab={setTab} />
      {tab === "roadmap" && <GanttRoadmapView />}
      {tab === "exec"    && <GanttExecView />}
    </div>
  );
}
