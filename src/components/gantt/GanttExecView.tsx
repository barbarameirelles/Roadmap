import { useState, useMemo } from "react";
import { FEATURES, MONTHS, QUARTERS, TODAY_MONTH, TRACK_META, trackOf, isBacklog, type Feature, type Track } from "@/data/ganttData";
import GanttMonthlyView from "./GanttMonthlyView";

type QTag  = "past" | "current" | "future";
type Scope = "all" | Track;

// Posição planejada ponderada (0..1): rampa linear ao longo da janela planejada.
function plannedFrac(f: Feature, m: number): number {
  const span = Math.max(f.planned.end - f.planned.start + 1, 1);
  return Math.min(Math.max((m - f.planned.start + 1) / span, 0), 1);
}

function qTagFor(qStart: number, qEnd: number): QTag {
  if (qEnd < TODAY_MONTH)                          return "past";
  if (qStart <= TODAY_MONTH && TODAY_MONTH <= qEnd) return "current";
  return "future";
}

function riskOf(
  qTag:        QTag,
  concluidos:  number,
  total:       number,
  atrasados:   number,
  hasMilestone: boolean,
  scope:       Scope,
) {
  if (total === 0) return { color: "gray", label: "Futuro", note: "0 planejados" };

  if (qTag === "future") {
    if (hasMilestone && scope !== "cdp")
      return { color: "amber", label: "Atenção", note: "Marco Standalone + VTEX" };
    return { color: "gray", label: "Futuro", note: `${total} planejados` };
  }

  const ratio = concluidos / total;
  const note  = atrasados > 0
    ? `${atrasados} atraso · ${Math.round(ratio * 100)}% concluído`
    : `${concluidos}/${total} entregues`;

  if (qTag === "past") {
    if (ratio >= 0.8) return { color: "green", label: "Saudável", note };
    if (ratio >= 0.5) return { color: "amber", label: "Atenção",  note };
    return                   { color: "red",   label: "Crítico",  note };
  }

  // current quarter
  if (ratio >= 0.8)        return { color: "green", label: "Saudável", note };
  if (ratio < 0.5)         return { color: "red",   label: "Crítico",  note };
  return                          { color: "amber", label: "Atenção",  note };
}

export default function GanttExecView() {
  const [scope, setScope] = useState<Scope>("all");

  const scopeFeatures = useMemo(() => {
    if (scope === "all") return FEATURES;
    return FEATURES.filter(f => trackOf(f) === scope);
  }, [scope]);

  // Resumo por objetivo estratégico. Épicos de backlog (não iniciados) contam
  // à parte para não diluir a média; f30 (excludeFromStats) entra no seu track.
  const trackStats = useMemo(() => (Object.keys(TRACK_META) as Track[]).map(t => {
    const feats   = FEATURES.filter(f => trackOf(f) === t);
    const ativos  = feats.filter(f => !isBacklog(f));
    const backlog = feats.length - ativos.length;
    const n = ativos.length;
    const entregues = ativos.filter(f => f.status === "concluido").length;
    const avg = n > 0 ? Math.round(ativos.reduce((s, f) => s + f.progress, 0) / n) : 0;
    const plan = n > 0 ? Math.round(ativos.reduce((s, f) => s + plannedFrac(f, TODAY_MONTH), 0) / n * 100) : 0;
    const bloqueios = feats.flatMap(f => f.subtasks).filter(s => s.blocked && s.status !== "Done").length;
    return { track: t, n, backlog, entregues, avg, plan, bloqueios };
  }), []);

  // Exclui épicos de melhoria contínua dos KPIs (ex: Evoluções e melhorias)
  const statsFeatures = useMemo(() => scopeFeatures.filter(f => !f.excludeFromStats), [scopeFeatures]);

  const total = statsFeatures.length;

  const perQ = useMemo(() => QUARTERS.map(q => {
    const items       = statsFeatures.filter(f => f.planned.start >= q.start && f.planned.start <= q.end);
    const concluidos  = items.filter(f => f.status === "concluido").length;
    const atrasados   = items.filter(f => f.status === "atrasado" || f.status === "atrasado-em-andamento").length;
    const emAndamento = items.filter(f => f.status === "em-andamento").length;
    const replanejados = items.filter(f => f.status === "replanejado").length;
    const planejados  = items.filter(f => f.status === "no-prazo").length;
    const avgProgress = items.length > 0
      ? Math.round(items.reduce((s, f) => s + f.progress, 0) / items.length)
      : 0;
    const tag          = qTagFor(q.start, q.end);
    const hasMilestone = statsFeatures.some(
      f => f.milestone && f.milestone.month >= q.start && f.milestone.month <= q.end
    );
    return { ...q, items, total: items.length, concluidos, atrasados, emAndamento, replanejados, planejados, avgProgress, tag, hasMilestone };
  }), [statsFeatures]);

  const milestone = scope !== "cdp" ? statsFeatures.find(f => f.milestone) : undefined;

  const todayLabel = `${MONTHS[TODAY_MONTH].label}/${MONTHS[TODAY_MONTH].year}`;

  const scopeLabels: Record<Scope, string> = {
    all:      "Geral",
    migracao: "Migração 1.0 → 2.0",
    evolucao: "Evolução 2.0",
    cdp:      "Audience + CDP",
  };

  return (
    <div className="g-page">
      {/* Head */}
      <div className="g-exec-head">
        <div>
          <h1 className="g-page-title">Visão Executiva do Roadmap</h1>
          <p className="g-page-sub">
            Planejado vs. Executado · Snapshot:{" "}
            <b style={{ color: "var(--g-ink)" }}>{todayLabel}</b>
            {" · "}mês {TODAY_MONTH + 1} de {MONTHS.length}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Scope toggle */}
          <div className="g-exec-scope-toggle">
            {(["all", "migracao", "evolucao", "cdp"] as Scope[]).map(s => (
              <button
                key={s}
                className={
                  "g-scope-btn" +
                  (scope === s  ? " active"  : "") +
                  (s === "cdp"  ? " cdp-btn" : "")
                }
                onClick={() => setScope(s)}
              >
                {scopeLabels[s]}
              </button>
            ))}
          </div>
          <div className="g-exec-snapshot">
            <span className="dash" /> Hoje: {todayLabel}
          </div>
        </div>
      </div>

      {/* Scope subtitle */}
      {scope !== "all" && (
        <div className="g-exec-scope-note">
          Exibindo {total} épicos · {scopeLabels[scope]}
        </div>
      )}

      {/* Os 3 objetivos estratégicos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 24 }}>
        {trackStats.map(ts => {
          const meta = TRACK_META[ts.track];
          const delta = ts.avg - ts.plan;
          return (
            <button
              key={ts.track}
              onClick={() => setScope(scope === ts.track ? "all" : ts.track)}
              style={{
                textAlign: "left", cursor: "pointer", background: "#fff",
                border: scope === ts.track ? `2px solid ${meta.color}` : "1px solid #e2e8f0",
                borderTop: `3px solid ${meta.color}`,
                borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{meta.label}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }} className="g-tabular">{ts.avg}%</span>
                <span style={{ fontSize: 12, color: delta >= 0 ? "#15803d" : "#b91c1c", fontWeight: 600 }}>
                  {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}pp vs plano ({ts.plan}%)
                </span>
              </div>
              <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden", position: "relative" }}>
                <div style={{ width: `${Math.max(ts.avg, 2)}%`, height: "100%", background: meta.color, borderRadius: 999 }} />
                <div style={{ position: "absolute", top: -2, bottom: -2, left: `${ts.plan}%`, width: 2, background: "#0f172a", opacity: 0.5 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
                <span>{ts.entregues} de {ts.n} épicos entregues{ts.backlog > 0 ? ` · ${ts.backlog} no backlog` : ""}</span>
                <span style={{ color: ts.bloqueios > 0 ? "#b91c1c" : "#15803d", fontWeight: 600 }}>
                  {ts.bloqueios > 0 ? `⚠ ${ts.bloqueios} bloqueios` : "✓ sem bloqueios"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Risk strip */}
      <h2 className="g-q-section-title">Saúde por trimestre</h2>
      <div className="g-risk-strip">
        {perQ.map(q => {
          const r = riskOf(q.tag, q.concluidos, q.total, q.atrasados, q.hasMilestone, scope);
          return (
            <div className="g-risk-cell" key={q.id}>
              <span className={"g-risk-bullet " + r.color} />
              <div className="g-risk-meta">
                <div className="label">{q.label}</div>
                <div className="val">{r.label}</div>
                <div className="label" style={{ marginTop: 2 }}>{r.note}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Big timeline card */}
      <div className="g-exec-timeline-card">
        {/* Timeline header */}
        <div className="g-gantt-head" style={{ gridTemplateColumns: "160px 1fr" }}>
          <div className="col-feature" style={{ display: "flex", alignItems: "center" }}>Período</div>
          <div className="col-timeline" style={{ padding: 0 }}>
            <div className="g-gantt-quarters">
              {QUARTERS.map(q => <div key={q.id} className="g-gantt-quarter">{q.label}</div>)}
            </div>
            <div className="g-exec-month-band">
              {MONTHS.map(m => {
                const isToday     = m.idx === TODAY_MONTH;
                const isMilestone = milestone?.milestone?.month === m.idx;
                return (
                  <div
                    key={m.idx}
                    className={
                      "g-exec-month" +
                      (isToday     ? " today"       : "") +
                      (isMilestone ? " milestone-m" : "")
                    }
                  >
                    {m.label}
                    {isToday     && <div className="sub">hoje</div>}
                    {isMilestone && <div className="sub">marco</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 1 — Entregas Planejadas */}
        <div className="g-exec-row">
          <div className="row-label">Entregas<br />Planejadas</div>
          <div className="qrow" style={{ position: "relative" }}>
            {perQ.map(q => (
              <div key={q.id} className={"g-exec-qcell" + (q.tag === "current" ? " is-current" : "")}>
                <div className="val g-tabular">{q.total} itens</div>
                <div className="g-progress"><div className="planned" style={{ width: "100%" }} /></div>
              </div>
            ))}
            <div
              className="g-exec-today-line"
              style={{ left: ((TODAY_MONTH + 0.5) / MONTHS.length) * 100 + "%" }}
            />
            {milestone && (
              <>
                <div
                  className="g-exec-milestone-line"
                  style={{ left: ((milestone.milestone!.month + 0.5) / MONTHS.length) * 100 + "%" }}
                />
                <div
                  className="g-exec-milestone-diamond"
                  style={{
                    left: ((milestone.milestone!.month + 0.5) / MONTHS.length) * 100 + "%",
                    top: "50%",
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* Row 2 — Entregas Realizadas */}
        <div className="g-exec-row">
          <div className="row-label">Entregas<br />Realizadas</div>
          <div className="qrow">
            {perQ.map(q => {
              const isFuture  = q.start > TODAY_MONTH;
              const isCurrent = q.tag === "current";
              let valNode: React.ReactNode;
              let barColor = "planned";
              let barWidth  = 0;

              if (isFuture) {
                valNode  = <span style={{ color: "var(--g-ink-4)" }}>—</span>;
              } else if (isCurrent) {
                valNode  = <span className="val red g-tabular">{q.concluidos}/{q.total}</span>;
                barColor = "red";
                barWidth = q.total > 0 ? (q.concluidos / q.total) * 100 : 0;
              } else {
                const ratio = q.total > 0 ? q.concluidos / q.total : 0;
                const color = ratio >= 0.8 ? "green" : ratio >= 0.5 ? "amber" : "red";
                valNode  = <span className={"val " + color + " g-tabular"}>{q.concluidos}/{q.total}</span>;
                barColor = color;
                barWidth = ratio * 100;
              }

              return (
                <div key={q.id} className={"g-exec-qcell" + (isCurrent ? " is-current" : "")}>
                  <div className="val g-tabular">{valNode}</div>
                  <div className="g-progress"><div className={barColor} style={{ width: barWidth + "%" }} /></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 3 — Variação */}
        <div className="g-exec-row">
          <div className="row-label">Variação</div>
          <div className="qrow">
            {perQ.map(q => {
              const isFuture = q.start > TODAY_MONTH;
              let text = "";
              let color = "var(--g-ink-3)";
              if (isFuture) {
                text = "Futuro";
              } else {
                const diff = q.concluidos - q.total;
                if (diff === 0) {
                  text = "No prazo"; color = "var(--g-green)";
                } else {
                  text = `${diff} item${diff < -1 ? "s" : ""}`;
                  color = "var(--g-orange)";
                }
              }
              return (
                <div key={q.id} className={"g-exec-qcell" + (q.tag === "current" ? " is-current" : "")}>
                  <div style={{ fontWeight: 600, fontSize: 13, color }}>{text}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="g-exec-legend">
          <div className="g-legend-section"><span className="g-legend-dot planned" /> Planejado</div>
          <div className="g-legend-section"><span className="g-legend-dot green" /> Entregue (≥80%)</div>
          <div className="g-legend-section"><span className="g-legend-dot amber" /> Parcial (50–79%)</div>
          <div className="g-legend-section"><span className="g-legend-dot red" /> Crítico (&lt; 50%)</div>
          <div className="g-legend-spacer" />
          <div className="g-legend-section">
            <span className="g-today-dashes" />
            Hoje (Mês {TODAY_MONTH + 1})
          </div>
          {milestone && (
            <div className="g-legend-section">
              <span className="g-legend-dot milestone-d" />
              Marco: Standalone + VTEX (Set/26)
            </div>
          )}
        </div>
      </div>

      {/* Evolução mensal (planejado vs realizado + forecast) */}
      <h2 className="g-q-section-title" style={{ marginTop: 28 }}>Evolução mensal</h2>
      <GanttMonthlyView embedded />
    </div>
  );
}
