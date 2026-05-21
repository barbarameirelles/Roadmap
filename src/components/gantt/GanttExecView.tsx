import { useMemo } from "react";
import { FEATURES, MONTHS, QUARTERS, TODAY_MONTH } from "@/data/ganttData";

type QTag = "past" | "current" | "future";

function qTagFor(qStart: number, qEnd: number): QTag {
  if (qEnd < TODAY_MONTH) return "past";
  if (qStart <= TODAY_MONTH && TODAY_MONTH <= qEnd) return "current";
  return "future";
}

function qLabelFor(tag: QTag) {
  return tag === "past" ? "Passado" : tag === "current" ? "Atual" : "Futuro";
}

function riskOf(qId: string, concluidos: number, total: number, atrasados: number) {
  if (qId === "Q1-2026") return { color: "green", label: "Saudável",   note: `${concluidos}/${total} entregues` };
  if (qId === "Q2-2026") return { color: "red",   label: "Crítico",    note: `${atrasados} atraso · 0% concluído` };
  if (qId === "Q3-2026") return { color: "amber", label: "Atenção",    note: "Marco Standalone + VTEX" };
  if (qId === "Q4-2026") return { color: "gray",  label: "Futuro",     note: `${total} planejados` };
  return                        { color: "gray",  label: "Futuro",     note: `${total} planejados` };
}

export default function GanttExecView() {
  const total = FEATURES.length;

  const perQ = useMemo(() => QUARTERS.map(q => {
    const items = FEATURES.filter(f => f.planned.start >= q.start && f.planned.start <= q.end);
    const concluidos         = items.filter(f => f.status === "concluido").length;
    const atrasados          = items.filter(f => f.status === "atrasado" || f.status === "atrasado-em-andamento").length;
    const emAndamento        = items.filter(f => f.status === "em-andamento").length;
    const planejados         = items.filter(f => f.status === "no-prazo").length;
    const avgProgress        = items.length > 0
      ? Math.round(items.reduce((s, f) => s + f.progress, 0) / items.length)
      : 0;
    const tag = qTagFor(q.start, q.end);
    return { ...q, items, total: items.length, concluidos, atrasados, emAndamento, planejados, avgProgress, tag };
  }), []);

  const plannedByToday    = FEATURES.filter(f => f.planned.end <= TODAY_MONTH);
  const concluidosTotal   = FEATURES.filter(f => f.status === "concluido").length;
  const atrasadosCount    = FEATURES.filter(f => f.status === "atrasado" || f.status === "atrasado-em-andamento").length;
  const emAndamentoTotal  = FEATURES.filter(f => f.status === "em-andamento" || f.status === "atrasado-em-andamento").length;
  const pctPlanned        = Math.round((plannedByToday.length / total) * 100);
  const pctDelivered      = Math.round((concluidosTotal / total) * 100);
  const avgProgressTotal  = Math.round(FEATURES.reduce((s, f) => s + f.progress, 0) / total);
  const milestone         = FEATURES.find(f => f.milestone);

  const todayLabel = `${MONTHS[TODAY_MONTH].label}/${MONTHS[TODAY_MONTH].year}`;

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
        <div className="g-exec-snapshot">
          <span className="dash" /> Hoje: {todayLabel}
        </div>
      </div>

      {/* KPIs */}
      <div className="g-kpi-grid">
        <div className="g-kpi accent-blue">
          <div className="g-kpi-label">% Planejado até hoje</div>
          <div className="g-kpi-value blue g-tabular">{pctPlanned}%</div>
          <div className="g-kpi-sub">{plannedByToday.length} de {total} itens previstos para esta data</div>
        </div>
        <div className="g-kpi accent-red">
          <div className="g-kpi-label">% Entregue (fechados)</div>
          <div className="g-kpi-value red g-tabular">{pctDelivered}%</div>
          <div className="g-kpi-sub">{concluidosTotal} de {total} épicos 100% concluídos</div>
        </div>
        <div className="g-kpi accent-green">
          <div className="g-kpi-label">Progresso médio</div>
          <div className="g-kpi-value green g-tabular">{avgProgressTotal}%</div>
          <div className="g-kpi-sub">média de evolução dos {total} épicos</div>
        </div>
        <div className="g-kpi accent-amber">
          <div className="g-kpi-label">Com atraso</div>
          <div className="g-kpi-value amber g-tabular">{atrasadosCount}</div>
          <div className="g-kpi-sub">{emAndamentoTotal} itens em andamento no total</div>
        </div>
      </div>

      {/* Risk strip */}
      <h2 className="g-q-section-title">Saúde por trimestre</h2>
      <div className="g-risk-strip">
        {perQ.map(q => {
          const r = riskOf(q.id, q.concluidos, q.total, q.atrasados);
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
                      (isToday     ? " today"      : "") +
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
                barWidth = (q.concluidos / q.total) * 100;
              } else {
                const ratio = q.concluidos / q.total;
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
          <div className="g-legend-section">
            <span className="g-legend-dot milestone-d" />
            Marco: Standalone + VTEX (Set/26)
          </div>
        </div>
      </div>

      {/* Quarter cards */}
      <h2 className="g-q-section-title">Progresso por trimestre</h2>
      <div className="g-q-cards">
        {perQ.map(q => {
          const ratio     = q.total > 0 ? q.concluidos / q.total : 0;
          const conclusao = Math.round(ratio * 100);
          const barColor  = conclusao >= 80 ? "var(--g-green)" : conclusao >= 50 ? "var(--g-orange)" : conclusao > 0 ? "var(--g-red)" : "#94a3b8";
          const valClass  = conclusao >= 80 ? "green" : conclusao >= 50 ? "amber" : conclusao > 0 ? "red" : "gray";

          return (
            <div key={q.id} className={"g-q-card" + (q.tag === "current" ? " is-current" : "")}>
              <div className="g-q-card-head">
                <span className="g-q-card-title">{q.label}</span>
                <span className={"g-q-card-tag " + q.tag}>{qLabelFor(q.tag)}</span>
              </div>
              <div className="g-q-stats">
                {q.concluidos > 0 && (
                  <div className="g-q-stat">
                    <span className="lbl"><span className="ic" style={{ color: "var(--g-green)" }}>✓</span>Concluídos</span>
                    <span className="v g-tabular">{q.concluidos}</span>
                  </div>
                )}
                {q.atrasados > 0 && (
                  <div className="g-q-stat">
                    <span className="lbl"><span className="ic" style={{ color: "var(--g-orange)" }}>⚠</span>Atrasados</span>
                    <span className="v g-tabular">{q.atrasados}</span>
                  </div>
                )}
                {q.emAndamento > 0 && (
                  <div className="g-q-stat">
                    <span className="lbl"><span className="ic" style={{ color: "var(--g-amber)" }}>↻</span>Em andamento</span>
                    <span className="v g-tabular">{q.emAndamento}</span>
                  </div>
                )}
                {q.planejados > 0 && (
                  <div className="g-q-stat">
                    <span className="lbl"><span className="ic" style={{ color: "var(--g-ink-4)" }}>→</span>Planejados</span>
                    <span className="v g-tabular">{q.planejados}</span>
                  </div>
                )}
              </div>
              {(q.tag !== "future" || q.concluidos > 0 || q.avgProgress > 0) && (
                <div className="g-q-conclusao">
                  <div className="row">
                    <span style={{ color: "var(--g-ink-3)" }}>Fechados</span>
                    <span className={"v g-tabular " + valClass}>{conclusao}%</span>
                  </div>
                  <div style={{ height: 6, background: "#e2e8f0", borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ width: Math.max(conclusao, 2) + "%", height: "100%", borderRadius: 999, background: barColor }} />
                  </div>
                  {(() => {
                    const avgColor = q.avgProgress >= 80 ? "var(--g-green)" : q.avgProgress >= 50 ? "var(--g-orange)" : q.avgProgress > 0 ? "var(--g-red)" : "#94a3b8";
                    const avgClass = q.avgProgress >= 80 ? "green" : q.avgProgress >= 50 ? "amber" : q.avgProgress > 0 ? "red" : "gray";
                    return (
                      <>
                        <div className="row">
                          <span style={{ color: "var(--g-ink-3)" }}>Progresso médio</span>
                          <span className={"v g-tabular " + avgClass}>{q.avgProgress}%</span>
                        </div>
                        <div style={{ height: 6, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ width: Math.max(q.avgProgress, 2) + "%", height: "100%", borderRadius: 999, background: avgColor }} />
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
