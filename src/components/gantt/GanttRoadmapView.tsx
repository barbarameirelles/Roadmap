import { useState, useMemo } from "react";
import {
  FEATURES, MONTHS, QUARTERS, STATUS_META, TODAY_MONTH, THIS_MONTH_SPRINTS, CURRENT_MONTH_LABEL,
  type FeatureStatus, type Feature,
} from "@/data/ganttData";

function pct(start: number, end: number): [number, number] {
  const total = MONTHS.length;
  return [(start / total) * 100, ((end - start + 1) / total) * 100];
}

function monthLabel(idx: number) {
  const m = MONTHS[idx];
  return `${m.label}/${String(m.year).slice(2)}`;
}

interface TooltipData {
  x: number; y: number;
  title: string;
  rows: [string, string][];
  progress?: number;
}

function Tooltip({ data }: { data: TooltipData | null }) {
  if (!data) return null;
  return (
    <div className="g-tooltip" style={{ left: data.x + 14, top: data.y + 14 }}>
      <div className="tt-title">{data.title}</div>
      {data.rows.map((r, i) => (
        <div className="tt-row" key={i}>
          <span>{r[0]}</span>
          <b>{r[1]}</b>
        </div>
      ))}
      {typeof data.progress === "number" && (
        <div className="tt-bar"><div style={{ width: data.progress + "%" }} /></div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: FeatureStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="g-status-badge" style={{ background: m.bg, color: m.fg }}>
      <span style={{ fontSize: 11 }}>{m.icon}</span>
      {m.label}
    </span>
  );
}

function SubtaskList({ feat }: { feat: Feature }) {
  const done = feat.subtasks.filter(s => s.status === "Done").length;
  return (
    <div className="g-subtasks">
      <div className="g-subtasks-head">
        <div style={{ width: 80 }}>Issue</div>
        <div style={{ flex: 1 }}>Sub-tarefa</div>
        <div style={{ width: 110 }}>Status</div>
        <div style={{ width: 60, textAlign: "right" }}>SP</div>
        <div style={{ width: 90 }}>Progresso</div>
      </div>
      <div className="g-subtask-list">
        {feat.subtasks.map(s => {
          const cls = s.status === "Done" ? "done" : s.status === "In Progress" ? "in-progress" : "to-do";
          const fill = s.status === "Done" ? 100 : s.status === "In Progress" ? 50 : 0;
          return (
            <div className="g-subtask" key={s.key}>
              <span className="g-st-key">{s.key}</span>
              <span className="g-st-title">{s.title}</span>
              <span className={`g-st-status ${cls}`}>{s.status}</span>
              <span className="g-st-points">{s.points}</span>
              <span>
                <div className="g-progress-mini">
                  <div className="g-progress-mini-fill" style={{ width: fill + "%" }} />
                </div>
              </span>
            </div>
          );
        })}
      </div>
      <div className="g-subtasks-foot">
        <span>{done}/{feat.subtasks.length} sub-tarefas concluídas</span>
        <span>·</span>
        <span>Total: {feat.storyPoints} SP</span>
        <span>·</span>
        <span>Responsável: <b style={{ color: "#334155" }}>{feat.owner.name}</b></span>
        <span style={{ marginLeft: "auto" }}>
          <a href="#" onClick={e => e.preventDefault()}>Abrir no Jira ↗</a>
        </span>
      </div>
    </div>
  );
}

function GanttRow({
  feat, expanded, onToggle, setTooltip,
}: {
  feat: Feature;
  expanded: boolean;
  onToggle: (id: string) => void;
  setTooltip: (d: TooltipData | null) => void;
}) {
  const total = MONTHS.length;
  const [plLeft, plWidth] = pct(feat.planned.start, feat.planned.end);

  const onBarHover = (e: React.MouseEvent, kind: "planned" | "executed" | "evolution" | "milestone") => {
    let title = feat.name;
    let rows: [string, string][] = [];
    let progress: number | undefined;
    if (kind === "planned") {
      rows = [
        ["Planejado", `${monthLabel(feat.planned.start)} → ${monthLabel(feat.planned.end)}`],
        ["Jira", (feat.jiraKeys ?? [feat.jiraKey]).join(", ")],
        ["Responsável", feat.owner.name],
        ["Status", STATUS_META[feat.status].label],
        ...(feat.note ? [["Replanejamento", feat.note] as [string, string]] : []),
      ];
      progress = feat.progress;
    } else if (kind === "executed" && feat.executed) {
      rows = [
        ["Executado", `${monthLabel(feat.executed.start)} → ${monthLabel(feat.executed.end)}`],
        ["Progresso", feat.progress + "%"],
        ["Story Points", String(feat.storyPoints)],
      ];
      progress = feat.progress;
    } else if (kind === "evolution" && feat.evolution) {
      rows = [
        ["Evolução 2.0", `${monthLabel(feat.evolution.start)} → ${monthLabel(feat.evolution.end)}`],
        ["Fase", "Iteração Projeto 2.0"],
      ];
    } else if (kind === "milestone" && feat.milestone) {
      rows = [
        ["Marco", feat.milestone.label],
        ["Data", monthLabel(feat.milestone.month)],
      ];
    }
    setTooltip({ x: e.clientX, y: e.clientY, title, rows, progress });
  };

  return (
    <>
      <div className={"g-gantt-row" + (feat.project === "cdp" ? " cdp-row" : "")}>
        <div className="g-feat-cell">
          <button
            className={"g-feat-caret" + (expanded ? " open" : "")}
            onClick={() => onToggle(feat.id)}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
          <div className="g-feat-meta">
            <div className="g-feat-name">
              {feat.flagged && <span className="flag" title="Marco crítico">⚑</span>}
              <span className="g-feat-name-text">{feat.name}</span>
              {feat.tags?.includes("platform2") && (
                <span className="g-p2-tag">2.0</span>
              )}
              {(feat.project === "cdp" || feat.tags?.includes("cdp")) && (
                <span className="g-cdp-tag">Audience (CDP)</span>
              )}
            </div>
            {feat.subtitle && (
              <div className="g-feat-sub">{feat.subtitle}</div>
            )}
            {feat.note && (
              <div className="g-feat-replan-note">{STATUS_META.replanejado.icon} {feat.note}</div>
            )}
            {feat.subtasks.length > 0 && (() => {
              const total = feat.subtasks.length;
              const done  = feat.subtasks.filter(s => s.status === "Done").length;
              const inp   = feat.subtasks.filter(s => s.status === "In Progress").length;
              const donePct = feat.progress;
              const inpPct  = Math.min(Math.round((inp / total) * 100), 100 - donePct);
              return (
                <div className="g-feat-progress">
                  <div className="g-feat-progress-bar">
                    <div className="seg done"  style={{ width: donePct + "%" }} />
                    <div className="seg inp"   style={{ width: inpPct  + "%" }} />
                  </div>
                  <span className="g-feat-progress-label">{donePct}% concluído</span>
                </div>
              );
            })()}
            {(() => {
              const mTasks = feat.subtasks.filter(s => s.sprint !== undefined && THIS_MONTH_SPRINTS.includes(s.sprint));
              const mDone  = mTasks.filter(s => s.status === "Done").length;
              if (mTasks.length === 0) return null;
              const color = mDone === mTasks.length ? "#16a34a" : mDone > 0 ? "#d97706" : "#94a3b8";
              return (
                <div className="g-month-delivery">
                  <span className="g-month-tag">{CURRENT_MONTH_LABEL}</span>
                  <span className="g-month-stat" style={{ color }}>{mDone}/{mTasks.length} entregues</span>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="g-tl-cell">
          <div className="g-tl-grid">
            {MONTHS.map(m => {
              const qend = m.idx === 2 || m.idx === 5 || m.idx === 8 || m.idx === 11;
              return <div key={m.idx} className={"g-tl-month-bg" + (qend ? " qend" : "")} />;
            })}
          </div>
          <div
            className="g-tl-today"
            style={{ left: ((TODAY_MONTH + 0.5) / total) * 100 + "%" }}
          />
          <div className="g-tl-bars">
            <div
              className="g-bar planned"
              style={{ left: plLeft + "%", width: plWidth + "%" }}
              onMouseMove={e => onBarHover(e, "planned")}
              onMouseLeave={() => setTooltip(null)}
            />
            {feat.executed && (() => {
              const [l, w] = pct(feat.executed.start, feat.executed.end);
              return (
                <div
                  className="g-bar executed"
                  style={{ left: l + "%", width: w + "%" }}
                  onMouseMove={e => onBarHover(e, "executed")}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })()}
            {feat.evolution && (() => {
              const [l, w] = pct(feat.evolution.start, feat.evolution.end);
              return (
                <div
                  className="g-bar evolution"
                  style={{ left: l + "%", width: w + "%" }}
                  onMouseMove={e => onBarHover(e, "evolution")}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })()}
            {feat.milestone && (
              <div
                className="g-milestone-diamond"
                style={{ left: ((feat.milestone.month + 0.5) / total) * 100 + "%" }}
                onMouseMove={e => onBarHover(e, "milestone")}
                onMouseLeave={() => setTooltip(null)}
              />
            )}
          </div>
        </div>

        <div className="g-status-cell">
          <StatusBadge status={feat.status} />
        </div>
      </div>
      {expanded && <SubtaskList feat={feat} />}
    </>
  );
}

export default function GanttRoadmapView() {
  const [statusFilter, setStatusFilter] = useState<Set<FeatureStatus>>(new Set());
  const [quarterFilter, setQuarterFilter] = useState<Set<string>>(new Set());
  const [projectFilter, setProjectFilter] = useState<"all" | "platform" | "cdp">("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const isCdp = (f: { project?: string; tags?: string[] }) =>
    f.project === "cdp" || f.tags?.includes("cdp");

  const isPlatform2 = (f: { tags?: string[] }) => f.tags?.includes("platform2") ?? false;

  const counts = useMemo(() => {
    const base = projectFilter === "all"
      ? FEATURES
      : projectFilter === "cdp"
        ? FEATURES.filter(isCdp)
        : FEATURES.filter(isPlatform2);
    const c: Record<string, number> = { all: base.length };
    base.forEach(f => { c[f.status] = (c[f.status] || 0) + 1; });
    return c;
  }, [projectFilter]);

  const filtered = useMemo(() => {
    return FEATURES.filter(f => {
      if (projectFilter === "cdp"      && !isCdp(f))       return false;
      if (projectFilter === "platform" && !isPlatform2(f)) return false;
      if (statusFilter.size > 0 && !statusFilter.has(f.status)) return false;
      if (quarterFilter.size > 0) {
        const matchesAny = [...quarterFilter].some(qId => {
          const q = QUARTERS.find(q => q.id === qId);
          return q ? f.planned.end >= q.start && f.planned.start <= q.end : false;
        });
        if (!matchesAny) return false;
      }
      return true;
    });
  }, [statusFilter, quarterFilter, projectFilter]);

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const toggleStatus = (id: FeatureStatus) =>
    setStatusFilter(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleQuarter = (id: string) =>
    setQuarterFilter(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const projectFiltered = useMemo(() => {
    if (projectFilter === "cdp")      return FEATURES.filter(isCdp);
    if (projectFilter === "platform") return FEATURES.filter(isPlatform2);
    return FEATURES;
  }, [projectFilter]);

  const totalConcluidos   = projectFiltered.filter(f => f.status === "concluido").length;
  const totalEmAndamento  = projectFiltered.filter(f => f.status === "em-andamento" || f.status === "atrasado-em-andamento").length;
  const totalAtrasados    = projectFiltered.filter(f => f.status === "atrasado" || f.status === "atrasado-em-andamento").length;

  const statusPills: { id: FeatureStatus; label: string }[] = [
    { id: "concluido",             label: "Concluídos" },
    { id: "no-prazo",              label: "No prazo" },
    { id: "em-andamento",          label: "Em andamento" },
    { id: "atrasado",              label: "Atrasados" },
    { id: "atrasado-em-andamento", label: "Atrasados · Em andamento" },
    { id: "replanejado",           label: "Replanejados" },
  ];

  return (
    <div className="g-page">
      <div className="g-page-head">
        <h1 className="g-page-title">Roadmap de Produto</h1>
        <p className="g-page-sub">Acompanhamento de entregas · Planejado vs. Executado</p>
      </div>

      <div className="g-kpi-grid">
        <div className="g-kpi">
          <div className="g-kpi-label">Total de Itens</div>
          <div className="g-kpi-value g-tabular">{projectFiltered.length}</div>
        </div>
        <div className="g-kpi accent-green">
          <div className="g-kpi-label">Concluídos</div>
          <div className="g-kpi-value green g-tabular">{totalConcluidos}</div>
        </div>
        <div className="g-kpi accent-amber">
          <div className="g-kpi-label">Em Andamento</div>
          <div className="g-kpi-value amber g-tabular">{totalEmAndamento}</div>
        </div>
        <div className="g-kpi accent-red">
          <div className="g-kpi-label">Atrasados</div>
          <div className="g-kpi-value red g-tabular">{totalAtrasados}</div>
        </div>
      </div>

      <div className="g-filters">
        <div className="g-filter-group">
          <span className="g-filter-label">Filtrar por Projeto:</span>
          {(["all", "platform", "cdp"] as const).map(p => (
            <button
              key={p}
              className={"g-pill" + (projectFilter === p ? " active" : "") + (p === "cdp" ? " cdp-pill" : "")}
              onClick={() => setProjectFilter(p)}
            >
              {p === "all" ? "Todos" : p === "platform" ? "Plataforma 2.0" : "Audience (CDP)"}
            </button>
          ))}
        </div>
        <div className="g-filter-group">
          <span className="g-filter-label">Filtrar por Status:</span>
          <button
            className={"g-pill" + (statusFilter.size === 0 ? " active" : "")}
            onClick={() => setStatusFilter(new Set())}
          >
            Todos
            <span className="count">{counts.all || 0}</span>
          </button>
          {statusPills.map(({ id, label }) => (
            <button
              key={id}
              className={"g-pill" + (statusFilter.has(id) ? " active" : "")}
              onClick={() => toggleStatus(id)}
            >
              {label}
              <span className="count">{counts[id] || 0}</span>
            </button>
          ))}
        </div>
        <div className="g-filter-group">
          <span className="g-filter-label">Filtrar por Trimestre:</span>
          <button
            className={"g-pill" + (quarterFilter.size === 0 ? " active" : "")}
            onClick={() => setQuarterFilter(new Set())}
          >
            Todos os Trimestres
          </button>
          {QUARTERS.map(q => (
            <button
              key={q.id}
              className={"g-pill" + (quarterFilter.has(q.id) ? " active" : "")}
              onClick={() => toggleQuarter(q.id)}
            >
              {q.label} ({q.sub})
            </button>
          ))}
        </div>
      </div>

      <div className="g-gantt-card">
        {/* Header */}
        <div className="g-gantt-head">
          <div className="col-feature">Feature</div>
          <div className="col-timeline">
            <div className="g-gantt-quarters">
              {QUARTERS.map(q => (
                <div key={q.id} className="g-gantt-quarter">{q.label}</div>
              ))}
            </div>
            <div className="g-gantt-months">
              {MONTHS.map(m => (
                <div
                  key={m.idx}
                  className={"g-gantt-month" + (m.idx === TODAY_MONTH ? " is-today" : "")}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>
          <div className="col-status">Status</div>
        </div>

        {/* Legend */}
        <div className="g-legend-row">
          <div className="feature-col-spacer" />
          <div style={{ display: "flex", gap: 18 }}>
            <span className="g-legend"><span className="g-legend-swatch planned" />Planejado</span>
            <span className="g-legend"><span className="g-legend-swatch executed" />Executado</span>
            <span className="g-legend"><span className="g-legend-swatch evolution" />Evolução 2.0</span>
            <span className="g-legend">
              <span className="g-diamond-mini" />Marco
            </span>
          </div>
        </div>

        {/* Rows */}
        {filtered.map(f => (
          <GanttRow
            key={f.id}
            feat={f}
            expanded={!!expanded[f.id]}
            onToggle={toggle}
            setTooltip={setTooltip}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--g-ink-3)" }}>
            Nenhuma feature encontrada com esses filtros.
          </div>
        )}
      </div>

      <Tooltip data={tooltip} />
    </div>
  );
}
