import { useState, useMemo } from "react";
import {
  FEATURES, QUARTERS, STATUS_META, MONTHS, THIS_MONTH_SPRINTS, CURRENT_MONTH_LABEL,
  TRACK_META, hasTrack, tracksOf, type FeatureStatus, type Feature, type Track,
} from "@/data/ganttData";

const activeBlocked = (f: Feature) =>
  f.subtasks.filter(s => s.blocked && s.status !== "Done").length;

type KanbanColumn = "todo" | "in-progress" | "blocked" | "validation" | "done";

const COLUMN_CONFIG: Record<KanbanColumn, { title: string; color: string }> = {
  "todo":        { title: "To do",                    color: "#64748b" },
  "in-progress": { title: "In progress",              color: "#2563eb" },
  "blocked":     { title: "Bloqueado/Despriorizado",  color: "#dc2626" },
  "validation":  { title: "Validation",               color: "#7c3aed" },
  "done":        { title: "Done",                     color: "#16a34a" },
};

function getKanbanColumn(feat: Feature): KanbanColumn {
  if (feat.status === "concluido") return "done";
  if (feat.status === "replanejado" || feat.status === "despriorizado") return "blocked";      // despriorizado
  if (activeBlocked(feat) > 0) return "blocked";            // bloqueio ativo no Jira
  if (feat.progress >= 80) return "validation";
  if (feat.progress > 0 || feat.status === "em-andamento" || feat.status === "atrasado-em-andamento") return "in-progress";
  return "todo";
}

function monthLabel(idx: number) {
  const m = MONTHS[idx];
  return `${m.label}/${String(m.year).slice(2)}`;
}

function StatusBadge({ status }: { status: FeatureStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="g-status-badge" style={{ background: m.bg, color: m.fg }}>
      <span style={{ fontSize: 10 }}>{m.icon}</span>
      {m.label}
    </span>
  );
}

function KanbanCard({ feat, showDates = true }: { feat: Feature; showDates?: boolean }) {
  const total = feat.subtasks.length;
  const done  = feat.subtasks.filter(s => s.status === "Done").length;
  const inp   = feat.subtasks.filter(s => s.status === "In Progress").length;
  const inpPct = total > 0 ? Math.min(Math.round((inp / total) * 100), 100 - feat.progress) : 0;

  const tracks = tracksOf(feat);

  return (
    <div className="kb-card">
      <div className="kb-card-top">
        <div className="kb-card-tags">
          <span className="g-jira-key">{feat.jiraKey}</span>
          {tracks.map(t => (
            <span key={t} className="kb-track-tag" style={{ background: TRACK_META[t].bg, color: TRACK_META[t].color }}>
              {TRACK_META[t].short}
            </span>
          ))}
        </div>
      </div>

      <div className="kb-card-name">
        {feat.flagged && <span className="flag" title="Marco crítico">⚑ </span>}
        {feat.name}
      </div>

      {feat.subtitle && <div className="kb-card-sub">{feat.subtitle}</div>}

      <div className="kb-card-meta">
        <span className="kb-epic-tag">{feat.epic}</span>
        {showDates && (
          <span className="kb-quarter-tag">
            {monthLabel(feat.planned.start)} → {monthLabel(feat.planned.end)}
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <StatusBadge status={feat.status} />
        {activeBlocked(feat) > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 700, color: "#b91c1c", background: "#fef2f2",
            border: "1px solid #fecaca", borderRadius: 999, padding: "2px 8px",
          }}>
            ⚠ {activeBlocked(feat)} bloqueada{activeBlocked(feat) > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {total > 0 && (
        <div className="kb-card-progress">
          <div className="kb-progress-bar">
            <div className="seg done" style={{ width: feat.progress + "%" }} />
            <div className="seg inp"  style={{ width: inpPct + "%" }} />
          </div>
          <div className="kb-progress-foot">
            <span>{feat.progress}% concluído</span>
            <span>{done}/{total} tarefas</span>
          </div>
        </div>
      )}
      {(() => {
        const mTasks = feat.subtasks.filter(s => s.sprint !== undefined && THIS_MONTH_SPRINTS.includes(s.sprint));
        const mDone  = mTasks.filter(s => s.status === "Done").length;
        if (mTasks.length === 0) return null;
        const pct   = Math.round((mDone / mTasks.length) * 100);
        const color = pct === 100 ? "#16a34a" : pct > 0 ? "#d97706" : "#94a3b8";
        return (
          <div className="kb-month-delivery">
            <div className="kb-month-bar-track">
              <div className="kb-month-bar-fill" style={{ width: pct + "%", background: color }} />
            </div>
            <div className="kb-month-foot">
              <span className="kb-month-tag">{CURRENT_MONTH_LABEL}</span>
              <span style={{ color }}>{mDone}/{mTasks.length} entregues</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function KanbanCol({ col, features }: { col: KanbanColumn; features: Feature[] }) {
  const cfg = COLUMN_CONFIG[col];

  return (
    <div className="kb-col">
      <div className="kb-col-header" style={{ borderTopColor: cfg.color }}>
        <div className="kb-col-title-row">
          <span className="kb-col-title" style={{ color: cfg.color }}>{cfg.title}</span>
          <span className="kb-col-count">{features.length}</span>
        </div>
      </div>
      <div className="kb-col-body">
        {features.map(f => <KanbanCard key={f.id} feat={f} showDates={col !== "todo"} />)}
        {features.length === 0 && (
          <div className="kb-empty">Nenhuma feature</div>
        )}
      </div>
    </div>
  );
}

export default function GanttKanbanView() {
  const [statusFilter,  setStatusFilter]  = useState<Set<FeatureStatus>>(new Set());
  const [quarterFilter, setQuarterFilter] = useState<Set<string>>(new Set());
  const [trackFilter, setTrackFilter] = useState<"all" | Track>("all");

  const counts = useMemo(() => {
    const base = trackFilter === "all" ? FEATURES : FEATURES.filter(f => hasTrack(f, trackFilter));
    const c: Record<string, number> = { all: base.length };
    base.forEach(f => { c[f.status] = (c[f.status] || 0) + 1; });
    return c;
  }, [trackFilter]);

  const filtered = useMemo(() => {
    return FEATURES.filter(f => {
      if (trackFilter !== "all" && !hasTrack(f, trackFilter)) return false;
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
  }, [statusFilter, quarterFilter, trackFilter]);

  const projectFiltered = useMemo(() => {
    if (trackFilter === "all") return FEATURES;
    return FEATURES.filter(f => hasTrack(f, trackFilter));
  }, [trackFilter]);

  const byColumn = useMemo(() => {
    const map: Record<KanbanColumn, Feature[]> = { "todo": [], "in-progress": [], "blocked": [], "validation": [], "done": [] };
    filtered.forEach(f => map[getKanbanColumn(f)].push(f));
    return map;
  }, [filtered]);

  const toggleStatus  = (id: FeatureStatus) =>
    setStatusFilter(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleQuarter = (id: string) =>
    setQuarterFilter(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const totalConcluidos  = projectFiltered.filter(f => f.status === "concluido").length;
  const totalEmAndamento = projectFiltered.filter(f => f.status === "em-andamento" || f.status === "atrasado-em-andamento").length;
  const totalAtrasados   = projectFiltered.filter(f => f.status === "atrasado" || f.status === "atrasado-em-andamento").length;

  const statusPills: { id: FeatureStatus; label: string }[] = [
    { id: "concluido",             label: "Concluídos" },
    { id: "no-prazo",              label: "No prazo" },
    { id: "em-andamento",          label: "Em andamento" },
    { id: "atrasado",              label: "Atrasados" },
    { id: "atrasado-em-andamento", label: "Atrasados · Em andamento" },
    { id: "replanejado",           label: "Replanejados" },
    { id: "despriorizado",         label: "Despriorizados" },
  ];

  const COLUMNS: KanbanColumn[] = ["todo", "in-progress", "blocked", "validation", "done"];

  return (
    <div className="g-page">
      <div className="g-page-head">
        <h1 className="g-page-title">Roadmap · Kanban</h1>
        <p className="g-page-sub">Acompanhamento por etapa de entrega</p>
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
          <span className="g-filter-label">Filtrar por Objetivo:</span>
          {(["all", "migracao", "evolucao", "cdp"] as const).map(p => (
            <button
              key={p}
              className={"g-pill" + (trackFilter === p ? " active" : "")}
              style={p !== "all" && trackFilter === p ? { background: TRACK_META[p].color, borderColor: TRACK_META[p].color } : undefined}
              onClick={() => setTrackFilter(p)}
            >
              {p === "all" ? "Todos" : TRACK_META[p].short}
            </button>
          ))}
        </div>
        <div className="g-filter-group">
          <span className="g-filter-label">Filtrar por Status:</span>
          <button
            className={"g-pill" + (statusFilter.size === 0 ? " active" : "")}
            onClick={() => setStatusFilter(new Set())}
          >
            Todos <span className="count">{counts.all || 0}</span>
          </button>
          {statusPills.map(({ id, label }) => (
            <button
              key={id}
              className={"g-pill" + (statusFilter.has(id) ? " active" : "")}
              onClick={() => toggleStatus(id)}
            >
              {label} <span className="count">{counts[id] || 0}</span>
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

      <div className="kb-board">
        {COLUMNS.map(col => (
          <KanbanCol key={col} col={col} features={byColumn[col]} />
        ))}
      </div>
    </div>
  );
}
