import { useState, useMemo } from "react";
import { FEATURES, MONTHS, TODAY_MONTH, hasTrack, type Feature, type Track } from "@/data/ganttData";
import { plannedFrac, taskProgress, realizedFrac, forecastFrac } from "@/data/ganttUtils";
import GanttMonthlyView from "./GanttMonthlyView";

type Scope = "all" | Track;

function monthHealthColor(concluidos: number, total: number): string {
  if (total === 0) return "#cbd5e1";
  const ratio = concluidos / total;
  if (ratio >= 0.8) return "#16a34a";
  if (ratio >= 0.5) return "#d97706";
  return "#dc2626";
}

export default function GanttExecView() {
  const [scope, setScope] = useState<Scope>("all");

  const scopeFeatures = useMemo(() => {
    if (scope === "all") return FEATURES;
    return FEATURES.filter(f => hasTrack(f, scope));
  }, [scope]);

  const statsFeatures = useMemo(
    () => scopeFeatures.filter(f => !f.excludeFromStats),
    [scopeFeatures],
  );

  const total = statsFeatures.length;

  // ── KPIs do snapshot ────────────────────────────────────────────────────────
  const concluidosTotal  = statsFeatures.filter(f => f.status === "concluido").length;
  const pctPlanned       = total > 0
    ? Math.round(statsFeatures.reduce((s, f) => s + plannedFrac(f, TODAY_MONTH), 0) / total * 100)
    : 0;
  const pctDelivered     = total > 0 ? Math.round(concluidosTotal / total * 100) : 0;
  // Realizado = mesma fórmula que o S-curve (realizedFrac com base em taskProgress)
  const avgProgress      = total > 0
    ? Math.round(statsFeatures.reduce((s, f) => s + realizedFrac(f, TODAY_MONTH), 0) / total * 100)
    : 0;
  const delta            = avgProgress - pctPlanned;

  // Forecast Dez/26 — mesma fórmula que a tabela do S-curve
  const DEC26 = 11;
  const forecastDec26 = useMemo(() => {
    if (total === 0) return 0;
    return Math.round(
      statsFeatures.reduce((s, f) => s + forecastFrac(f, DEC26), 0) / total * 100,
    );
  }, [statsFeatures, total]);

  // ── Strip mensal ────────────────────────────────────────────────────────────
  const perM = useMemo(() => MONTHS.map(m => {
    const items      = statsFeatures.filter(f => f.planned.end === m.idx);
    const concluidos = items.filter(f => f.status === "concluido").length;
    const atrasados  = items.filter(f => f.status === "atrasado" || f.status === "atrasado-em-andamento").length;
    const isPast     = m.idx < TODAY_MONTH;
    const isCurrent  = m.idx === TODAY_MONTH;
    const color      = isPast || isCurrent
      ? monthHealthColor(concluidos, items.length)
      : "#cbd5e1";
    return { ...m, items, total: items.length, concluidos, atrasados, isPast, isCurrent, color };
  }), [statsFeatures]);

  const todayLabel = `${MONTHS[TODAY_MONTH].label}/${MONTHS[TODAY_MONTH].year}`;

  const scopeLabels: Record<Scope, string> = {
    all:      "Geral",
    migracao: "Migração 1.0 → 2.0",
    evolucao: "Evolução 2.0",
    cdp:      "Audience + CDP",
  };

  return (
    <div className="g-page">

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
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
          <div className="g-exec-scope-toggle">
            {(["all", "migracao", "evolucao", "cdp"] as Scope[]).map(s => (
              <button
                key={s}
                className={
                  "g-scope-btn" +
                  (scope === s ? " active"  : "") +
                  (s === "cdp" ? " cdp-btn" : "")
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

      {scope !== "all" && (
        <div className="g-exec-scope-note">
          Exibindo {total} épicos · {scopeLabels[scope]}
        </div>
      )}

      {/* ── 1. Onde estamos hoje (4 KPIs) ─────────────────────────────────── */}
      <div className="g-kpi-grid" style={{ marginBottom: 28 }}>

        <div className="g-kpi accent-blue">
          <div className="g-kpi-label">% Planejado até hoje</div>
          <div className="g-kpi-value blue g-tabular">{pctPlanned}%</div>
          <div className="g-kpi-sub">posição ponderada esperada pelo plano</div>
        </div>

        <div className="g-kpi accent-green">
          <div className="g-kpi-label">Progresso médio</div>
          <div className="g-kpi-value green g-tabular">{avgProgress}%</div>
          <div className="g-kpi-sub">
            <span style={{ color: delta >= 0 ? "#15803d" : "#b91c1c", fontWeight: 600 }}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}pp vs plano
            </span>
            {" · "}conclusão de tasks nos {total} épicos
          </div>
        </div>

        <div className="g-kpi accent-red">
          <div className="g-kpi-label">% Entregue (fechados)</div>
          <div className="g-kpi-value red g-tabular">{pctDelivered}%</div>
          <div className="g-kpi-sub">{concluidosTotal} de {total} épicos 100% concluídos</div>
        </div>

        <div className="g-kpi" style={{ borderColor: "#e9d5ff" }}>
          <div className="g-kpi-label">Forecast Dez/26</div>
          <div className="g-kpi-value g-tabular" style={{ color: "#7c3aed" }}>{forecastDec26}%</div>
          <div className="g-kpi-sub">projeção de progresso ao fim de 2026</div>
        </div>

      </div>

      {/* ── 2. Saúde por mês ──────────────────────────────────────────────── */}
      <h2 className="g-q-section-title">Saúde por mês</h2>

      <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 8, marginBottom: 28 }}>
        {perM.map(m => {
          const isNewYear = m.idx > 0 && m.year !== MONTHS[m.idx - 1].year;
          const pct = m.total > 0 ? (m.concluidos / m.total) * 100 : 0;

          return (
            <div key={m.idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
              {/* separador de ano */}
              {isNewYear
                ? <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", marginBottom: 3, letterSpacing: "0.05em" }}>2027</div>
                : <div style={{ height: 15 }} />
              }
              <div style={{
                flex: "0 0 auto",
                width: 64,
                background: m.isCurrent ? "#eff6ff" : "#fff",
                border: `1px solid ${m.isCurrent ? "#93c5fd" : "#e2e8f0"}`,
                borderTop: `3px solid ${m.color}`,
                borderRadius: 8,
                padding: "7px 8px 8px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: m.isCurrent ? "#2563eb" : "#64748b" }}>
                  {m.label}
                </div>
                {m.isCurrent && (
                  <div style={{ fontSize: 9, color: "#2563eb", fontWeight: 700, letterSpacing: "0.04em" }}>HOJE</div>
                )}
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4, color: m.color }}>
                  {m.total === 0
                    ? <span style={{ color: "#cbd5e1" }}>—</span>
                    : m.isPast || m.isCurrent
                      ? `${m.concluidos}/${m.total}`
                      : <span style={{ color: "#94a3b8" }}>{m.total}</span>
                  }
                </div>
                {m.total > 0 && (
                  <div style={{ marginTop: 5, height: 3, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                    {(m.isPast || m.isCurrent) && (
                      <div style={{ width: `${pct}%`, height: "100%", background: m.color, borderRadius: 999 }} />
                    )}
                  </div>
                )}
                {m.atrasados > 0 && (
                  <div style={{ fontSize: 9, color: "#dc2626", marginTop: 3, fontWeight: 600 }}>
                    ⚠ {m.atrasados}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Tendência e forecast (S-curve) ─────────────────────────────── */}
      <h2 className="g-q-section-title">Tendência e forecast</h2>
      <GanttMonthlyView embedded features={statsFeatures} />

    </div>
  );
}
