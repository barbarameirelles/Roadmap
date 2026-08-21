import { useState, useMemo, useEffect } from "react";
import {
  FEATURES, QUARTERS, STATUS_META, MONTHS, THIS_MONTH_SPRINTS, CURRENT_MONTH_LABEL,
  TRACK_META, hasTrack, tracksOf, type FeatureStatus, type Feature, type Track, type Subtask,
} from "@/data/ganttData";
import { taskProgress } from "@/data/ganttUtils";

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
  if (feat.status === "replanejado" || feat.status === "despriorizado") return "blocked";
  if (activeBlocked(feat) > 0) return "blocked";
  const tp = taskProgress(feat);
  if (tp >= 80) return "validation";
  const hasSprintWork = feat.subtasks.some(
    s => THIS_MONTH_SPRINTS.includes(s.sprint ?? -1) && s.status === "In Progress",
  );
  if (hasSprintWork) return "in-progress";
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

// ── Subtask status helpers ────────────────────────────────────────────────────

type SubStatus = "entregue" | "em-andamento" | "bloqueada" | "backlog";

function subStatus(s: Subtask): SubStatus {
  if (s.status === "Done") return "entregue";
  if (s.blocked) return "bloqueada";
  if (s.status === "In Progress") return "em-andamento";
  return "backlog";
}

const SUB_STATUS_META: Record<SubStatus, { label: string; color: string; bg: string; icon: string }> = {
  "entregue":     { label: "Entregue",     color: "#15803d", bg: "#dcfce7", icon: "✓" },
  "em-andamento": { label: "Em andamento", color: "#a16207", bg: "#fef3c7", icon: "↻" },
  "bloqueada":    { label: "Bloqueada",    color: "#b91c1c", bg: "#fee2e2", icon: "⚠" },
  "backlog":      { label: "Backlog",      color: "#475569", bg: "#f1f5f9", icon: "·" },
};

// ── Epic Detail Modal ─────────────────────────────────────────────────────────

function EpicDetailModal({ feat, onClose }: { feat: Feature; onClose: () => void }) {
  const tp = taskProgress(feat);
  const total = feat.subtasks.length;
  const counts = {
    entregue:     feat.subtasks.filter(s => subStatus(s) === "entregue").length,
    "em-andamento": feat.subtasks.filter(s => subStatus(s) === "em-andamento").length,
    bloqueada:    feat.subtasks.filter(s => subStatus(s) === "bloqueada").length,
    backlog:      feat.subtasks.filter(s => subStatus(s) === "backlog").length,
  };
  const col = getKanbanColumn(feat);
  const colCfg = COLUMN_CONFIG[col];
  const tracks = tracksOf(feat);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--g-card, #fff)", borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          width: "100%", maxWidth: 640, maxHeight: "85vh",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--g-border, #e2e8f0)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                <span className="g-jira-key" style={{ fontSize: 12 }}>{feat.jiraKey}</span>
                {tracks.map(t => (
                  <span key={t} className="kb-track-tag" style={{ background: TRACK_META[t].bg, color: TRACK_META[t].color }}>
                    {TRACK_META[t].short}
                  </span>
                ))}
                <span style={{
                  fontSize: 11, fontWeight: 600, color: colCfg.color,
                  background: colCfg.color + "18", borderRadius: 999,
                  padding: "2px 8px",
                }}>
                  {colCfg.title}
                </span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--g-ink, #0f172a)", lineHeight: 1.3 }}>
                {feat.flagged && <span style={{ color: "#f59e0b" }}>⚑ </span>}
                {feat.name}
              </div>
              {feat.subtitle && (
                <div style={{ fontSize: 13, color: "var(--g-muted, #64748b)", marginTop: 3 }}>{feat.subtitle}</div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                flexShrink: 0, background: "none", border: "none", cursor: "pointer",
                color: "var(--g-muted, #64748b)", fontSize: 20, lineHeight: 1,
                padding: "0 4px", borderRadius: 6,
              }}
            >×</button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <StatusBadge status={feat.status} />
            {feat.note && (
              <span style={{ fontSize: 11, color: "#92400e", background: "#fef3c7", borderRadius: 6, padding: "2px 8px" }}>
                {feat.note}
              </span>
            )}
          </div>

          {total > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{
                  flex: 1, height: 6, background: "var(--g-border, #e2e8f0)",
                  borderRadius: 999, overflow: "hidden",
                }}>
                  <div style={{
                    width: tp + "%", height: "100%",
                    background: tp === 100 ? "#16a34a" : "#2563eb",
                    borderRadius: 999, transition: "width 0.3s",
                  }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--g-ink, #0f172a)", whiteSpace: "nowrap" }}>
                  {tp}%
                </span>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {(["entregue", "em-andamento", "bloqueada", "backlog"] as SubStatus[]).map(s => {
                  const c = counts[s];
                  if (c === 0) return null;
                  const m = SUB_STATUS_META[s];
                  return (
                    <span key={s} style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>
                      {m.icon} {c} {m.label}{c > 1 ? "s" : ""}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Task list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px 20px" }}>
          {total === 0 ? (
            <div style={{ textAlign: "center", color: "var(--g-muted, #64748b)", padding: "32px 0", fontSize: 14 }}>
              Nenhuma subtask cadastrada
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--g-border, #e2e8f0)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px 6px 0", color: "var(--g-muted, #64748b)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Task</th>
                  <th style={{ textAlign: "left", padding: "6px 0", color: "var(--g-muted, #64748b)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", width: 110 }}>Status</th>
                  <th style={{ textAlign: "right", padding: "6px 0", color: "var(--g-muted, #64748b)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", width: 64 }}>Sprint</th>
                </tr>
              </thead>
              <tbody>
                {feat.subtasks.map(s => {
                  const ss = subStatus(s);
                  const m = SUB_STATUS_META[ss];
                  const isCurrentSprint = s.sprint !== undefined && THIS_MONTH_SPRINTS.includes(s.sprint);
                  return (
                    <tr
                      key={s.key}
                      style={{
                        borderBottom: "1px solid var(--g-border, #e2e8f0)",
                        background: isCurrentSprint && ss !== "entregue" ? m.bg + "66" : undefined,
                      }}
                    >
                      <td style={{ padding: "8px 8px 8px 0", verticalAlign: "top" }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: "var(--g-muted, #64748b)",
                            background: "var(--g-surface, #f8fafc)", border: "1px solid var(--g-border, #e2e8f0)",
                            borderRadius: 4, padding: "1px 5px", whiteSpace: "nowrap", flexShrink: 0,
                          }}>{s.key}</span>
                          <span style={{
                            color: ss === "entregue" ? "var(--g-muted, #64748b)" : "var(--g-ink, #0f172a)",
                            textDecoration: ss === "entregue" ? "line-through" : undefined,
                            lineHeight: 1.4,
                          }}>{s.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: "8px 0", verticalAlign: "top" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 11, fontWeight: 600, color: m.color,
                          background: m.bg, borderRadius: 999, padding: "2px 8px",
                          whiteSpace: "nowrap",
                        }}>
                          <span>{m.icon}</span>{m.label}
                        </span>
                      </td>
                      <td style={{ padding: "8px 0", textAlign: "right", verticalAlign: "top" }}>
                        {s.sprint !== undefined && (
                          <span style={{
                            fontSize: 11, fontWeight: isCurrentSprint ? 700 : 400,
                            color: isCurrentSprint ? "#2563eb" : "var(--g-muted, #64748b)",
                          }}>
                            {isCurrentSprint && "▸ "}S{s.sprint}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Kanban Card ───────────────────────────────────────────────────────────────

function KanbanCard({ feat, showDates = true, onOpen }: { feat: Feature; showDates?: boolean; onOpen: () => void }) {
  const total = feat.subtasks.length;
  const done  = feat.subtasks.filter(s => s.status === "Done").length;
  const inp   = feat.subtasks.filter(s => s.status === "In Progress").length;
  const tp    = taskProgress(feat);
  const inpPct = total > 0 ? Math.min(Math.round((inp / total) * 100), 100 - tp) : 0;

  const tracks = tracksOf(feat);

  return (
    <div
      className="kb-card"
      onClick={onOpen}
      style={{ cursor: "pointer" }}
      title="Clique para ver detalhes"
    >
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
            <div className="seg done" style={{ width: tp + "%" }} />
            <div className="seg inp"  style={{ width: inpPct + "%" }} />
          </div>
          <div className="kb-progress-foot">
            <span>{tp}% concluído</span>
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

// ── Kanban Column ─────────────────────────────────────────────────────────────

function KanbanCol({ col, features, onOpen }: { col: KanbanColumn; features: Feature[]; onOpen: (f: Feature) => void }) {
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
        {features.map(f => (
          <KanbanCard key={f.id} feat={f} showDates={col !== "todo"} onOpen={() => onOpen(f)} />
        ))}
        {features.length === 0 && (
          <div className="kb-empty">Nenhuma feature</div>
        )}
      </div>
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export default function GanttKanbanView() {
  const [statusFilter,  setStatusFilter]  = useState<Set<FeatureStatus>>(new Set());
  const [quarterFilter, setQuarterFilter] = useState<Set<string>>(new Set());
  const [trackFilter, setTrackFilter] = useState<"all" | Track>("all");
  const [selectedFeat, setSelectedFeat] = useState<Feature | null>(null);

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
          <KanbanCol key={col} col={col} features={byColumn[col]} onOpen={setSelectedFeat} />
        ))}
      </div>

      {selectedFeat && (
        <EpicDetailModal feat={selectedFeat} onClose={() => setSelectedFeat(null)} />
      )}
    </div>
  );
}
