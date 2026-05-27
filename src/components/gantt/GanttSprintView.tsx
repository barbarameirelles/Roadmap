import { useState, useMemo } from "react";
import {
  FEATURES, STATUS_META, SPRINT_TO_MONTH, SPRINT_DATES, CURRENT_SPRINT, MONTHS,
  type Feature, type Subtask,
} from "@/data/ganttData";

const SPRINT_RANGE = [36, 37, 38, 39, 40, 41, 42, 43];

function sprintLabel(n: number) {
  const d = SPRINT_DATES[n];
  return d ? `${d.start} – ${d.end}` : "";
}

function stChip(status: Subtask["status"]) {
  if (status === "Done")        return { bg: "#dcfce7", fg: "#15803d", label: "Done" };
  if (status === "In Progress") return { bg: "#dbeafe", fg: "#1e40af", label: "In Progress" };
  return                               { bg: "#f1f5f9", fg: "#475569", label: "To Do" };
}

function OwnerAvatar({ owner }: { owner: Feature["owner"] }) {
  return (
    <div className="kb-owner-avatar" style={{ background: owner.color }} title={owner.name}>
      {owner.initials}
    </div>
  );
}

function FeatureSprintCard({ feat, subtasks }: { feat: Feature; subtasks: Subtask[] }) {
  const done   = subtasks.filter(s => s.status === "Done").length;
  const inp    = subtasks.filter(s => s.status === "In Progress").length;
  const spDone = subtasks.filter(s => s.status === "Done").reduce((a, s) => a + s.points, 0);
  const spTotal = subtasks.reduce((a, s) => a + s.points, 0);
  const donePct = subtasks.length > 0 ? Math.round((done / subtasks.length) * 100) : 0;
  const m = STATUS_META[feat.status];

  return (
    <div className="sp-feat-card">
      <div className="sp-feat-header">
        <div className="sp-feat-info">
          <div className="sp-feat-name">
            {feat.flagged && <span className="flag" title="Marco crítico">⚑ </span>}
            {feat.name}
            {feat.tags?.includes("platform2") && <span className="g-p2-tag">2.0</span>}
            {(feat.project === "cdp" || feat.tags?.includes("cdp")) && <span className="g-cdp-tag">CDP</span>}
          </div>
          <div className="sp-feat-meta">
            <span className="kb-epic-tag">{feat.epic}</span>
            <span className="g-status-badge" style={{ background: m.bg, color: m.fg }}>
              <span style={{ fontSize: 10 }}>{m.icon}</span>{m.label}
            </span>
          </div>
        </div>
        <div className="sp-feat-right">
          <OwnerAvatar owner={feat.owner} />
          <div className="sp-feat-delivery">
            <span className="sp-delivery-pct" style={{ color: donePct === 100 ? "#16a34a" : donePct > 0 ? "#2563eb" : "#94a3b8" }}>
              {donePct}%
            </span>
            <span className="sp-delivery-sub">{done}/{subtasks.length} tarefas</span>
            {spTotal > 0 && <span className="sp-delivery-sub">{spDone}/{spTotal} SP</span>}
          </div>
        </div>
      </div>

      <div className="sp-subtask-list">
        {subtasks.map(s => {
          const chip = stChip(s.status);
          return (
            <div key={s.key} className="sp-subtask-row">
              <span className="g-jira-key">{s.key}</span>
              <span className="sp-subtask-title">{s.title}</span>
              <span className="sp-st-chip" style={{ background: chip.bg, color: chip.fg }}>
                {chip.label}
              </span>
              {s.points > 0 && <span className="sp-subtask-pts">{s.points} SP</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GanttSprintView() {
  const [sprint, setSprint] = useState(CURRENT_SPRINT);

  const sprintData = useMemo(() => {
    const groups: { feat: Feature; subtasks: Subtask[] }[] = [];
    FEATURES.forEach(feat => {
      const inSprint = feat.subtasks.filter(s => s.sprint === sprint);
      if (inSprint.length > 0) groups.push({ feat, subtasks: inSprint });
    });
    return groups;
  }, [sprint]);

  const allSubtasks = sprintData.flatMap(g => g.subtasks);
  const totalDone   = allSubtasks.filter(s => s.status === "Done").length;
  const totalInp    = allSubtasks.filter(s => s.status === "In Progress").length;
  const totalTodo   = allSubtasks.filter(s => s.status === "To Do").length;
  const totalSP     = allSubtasks.reduce((a, s) => a + s.points, 0);
  const doneSP      = allSubtasks.filter(s => s.status === "Done").reduce((a, s) => a + s.points, 0);
  const donePct     = allSubtasks.length > 0 ? Math.round((totalDone / allSubtasks.length) * 100) : 0;

  const monthIdx  = SPRINT_TO_MONTH[sprint];
  const monthName = MONTHS[monthIdx]?.label ?? "";

  // Historical delivery rate per sprint (for sparkline)
  const history = useMemo(() => SPRINT_RANGE.map(s => {
    const tasks = FEATURES.flatMap(f => f.subtasks.filter(st => st.sprint === s));
    const done  = tasks.filter(st => st.status === "Done").length;
    return { sprint: s, total: tasks.length, done, pct: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0 };
  }), []);

  const prevSprint = SPRINT_RANGE[SPRINT_RANGE.indexOf(sprint) - 1];
  const nextSprint = SPRINT_RANGE[SPRINT_RANGE.indexOf(sprint) + 1];

  return (
    <div className="g-page">
      <div className="g-page-head">
        <h1 className="g-page-title">Entregas por Sprint</h1>
        <p className="g-page-sub">O que foi planejado e entregue em cada sprint</p>
      </div>

      {/* Sprint navigator */}
      <div className="sp-nav">
        <button
          className="sp-nav-btn"
          disabled={!prevSprint}
          onClick={() => prevSprint && setSprint(prevSprint)}
        >
          ←
        </button>
        <div className="sp-nav-center">
          <span className="sp-nav-label">
            Sprint {sprint}
            {sprint === CURRENT_SPRINT && <span className="sp-current-badge">atual</span>}
          </span>
          <span className="sp-nav-dates">{sprintLabel(sprint)} · {monthName}</span>
        </div>
        <button
          className="sp-nav-btn"
          disabled={!nextSprint}
          onClick={() => nextSprint && setSprint(nextSprint)}
        >
          →
        </button>
      </div>

      {/* Historical sparkline */}
      <div className="sp-history">
        {history.map(h => (
          <button
            key={h.sprint}
            className={"sp-hist-item" + (h.sprint === sprint ? " active" : "") + (h.sprint === CURRENT_SPRINT ? " current" : "")}
            onClick={() => setSprint(h.sprint)}
          >
            <div className="sp-hist-bar-wrap">
              <div
                className="sp-hist-bar"
                style={{ height: Math.max(4, (h.pct / 100) * 40) + "px", background: h.pct === 100 ? "#16a34a" : h.sprint > CURRENT_SPRINT ? "#e2e8f0" : "#3b82f6" }}
              />
            </div>
            <span className="sp-hist-label">S{h.sprint}</span>
            <span className="sp-hist-pct">{h.total > 0 ? h.pct + "%" : "—"}</span>
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="g-kpi-grid" style={{ marginBottom: 20 }}>
        <div className="g-kpi">
          <div className="g-kpi-label">Tarefas Planejadas</div>
          <div className="g-kpi-value g-tabular">{allSubtasks.length}</div>
          <div className="g-kpi-sub">{sprintData.length} épicos ativos</div>
        </div>
        <div className="g-kpi accent-green">
          <div className="g-kpi-label">Entregues</div>
          <div className="g-kpi-value green g-tabular">{totalDone}</div>
          <div className="g-kpi-sub">{donePct}% do planejado</div>
        </div>
        <div className="g-kpi accent-amber">
          <div className="g-kpi-label">Em Andamento</div>
          <div className="g-kpi-value amber g-tabular">{totalInp}</div>
          <div className="g-kpi-sub">{totalTodo} ainda pendentes</div>
        </div>
        <div className="g-kpi accent-blue">
          <div className="g-kpi-label">Story Points</div>
          <div className="g-kpi-value blue g-tabular">{doneSP}<span style={{ fontSize: 18, color: "#94a3b8" }}>/{totalSP}</span></div>
          <div className="g-kpi-sub">entregues / planejados</div>
        </div>
      </div>

      {/* Delivery bar */}
      {allSubtasks.length > 0 && (
        <div className="sp-delivery-bar-wrap">
          <div className="sp-delivery-bar">
            <div className="sp-db-done"  style={{ width: (totalDone / allSubtasks.length * 100) + "%" }} />
            <div className="sp-db-inp"   style={{ width: (totalInp  / allSubtasks.length * 100) + "%" }} />
          </div>
          <span className="sp-delivery-legend">
            <span style={{ color: "#16a34a" }}>■</span> Entregue
            <span style={{ color: "#3b82f6", marginLeft: 10 }}>■</span> Em andamento
            <span style={{ color: "#e2e8f0", marginLeft: 10 }}>■</span> Pendente
          </span>
        </div>
      )}

      {/* Feature cards */}
      {sprintData.length === 0 ? (
        <div className="sp-empty">Nenhuma tarefa mapeada para esta sprint.</div>
      ) : (
        <div className="sp-feat-list">
          {sprintData.map(({ feat, subtasks }) => (
            <FeatureSprintCard key={feat.id} feat={feat} subtasks={subtasks} />
          ))}
        </div>
      )}
    </div>
  );
}
