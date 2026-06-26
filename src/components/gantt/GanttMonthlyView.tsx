import { useMemo } from "react";
import { FEATURES, MONTHS, TODAY_MONTH, type Feature } from "@/data/ganttData";

// ── Helpers ───────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

// Where the plan says a feature *should* be (0..1) by month m — ramps linearly
// across its planned window.
function plannedFrac(f: Feature, m: number): number {
  const span = Math.max(f.planned.end - f.planned.start + 1, 1);
  return clamp((m - f.planned.start + 1) / span, 0, 1);
}

// Actual progress (0..1) attributed up to month m, spread over the execution
// window. Orphan progress (no executed window) lands at "today".
function realizedFrac(f: Feature, m: number): number {
  const p = f.progress / 100;
  if (f.executed) {
    const span = Math.max(f.executed.end - f.executed.start + 1, 1);
    return p * clamp((m - f.executed.start + 1) / span, 0, 1);
  }
  return m >= TODAY_MONTH ? p : 0;
}

// Is the feature meaningfully behind where the plan expects it to be?
function isBehind(f: Feature): boolean {
  if (f.progress >= 100) return false;
  return f.progress / 100 < plannedFrac(f, TODAY_MONTH) * 0.7;
}

// Forecast progress (0..1) for months after today. Behind features slip ~40%
// of their duration before reaching 100%.
function forecastFrac(f: Feature, m: number): number {
  if (f.progress >= 100) return 1;
  const span = f.planned.end - f.planned.start + 1;
  const due = f.planned.end + (isBehind(f) ? Math.ceil(0.4 * span) : 0);
  const base = f.progress / 100;
  return clamp(base + (1 - base) * clamp((m - TODAY_MONTH) / Math.max(due - TODAY_MONTH, 1), 0, 1), 0, 1);
}

// ── Layout constants ───────────────────────────────────────────────────────────
const PAD_L = 44;
const PAD_T = 16;
const PLOT_H = 200;
const COL = 72;
const PLOT_W = COL * MONTHS.length;
const SVG_W = PAD_L + PLOT_W + 12;
const SVG_H = PAD_T + PLOT_H + 36;

const C_PLAN = "#2563eb";
const C_REAL = "#16a34a";
const C_FCST = "#7c3aed";

export default function GanttMonthlyView() {
  // Escopo 2.0: tag platform2 (Dados CDP perdeu a tag e foi para o módulo CDP).
  const isPlatform2 = (f: Feature) => f.tags?.includes("platform2") ?? false;
  const features = useMemo(() => FEATURES.filter(f => !f.excludeFromStats && isPlatform2(f)), []);
  const T = features.length;

  // Interrupção: módulo Audience (CDP) — tudo que não é 2.0 (inclui Dados CDP).
  const interruption = useMemo(() => FEATURES.filter(f => !f.excludeFromStats && !isPlatform2(f)), []);
  // "Em execução" = push recente de CDP que puxou o time (Mai–Jun), não a fundação
  // Dados CDP, que roda em paralelo desde jan sem travar a 2.0.
  const cdpActiveMonth = (m: number) => interruption.some(f => f.executed && f.executed.start >= TODAY_MONTH - 1 && m >= f.executed.start && m <= f.executed.end);
  // Próxima janela de CDP planejada (futuro) — risco de nova interrupção.
  const cdpFutureMonths = useMemo(() => {
    const set = new Set<number>();
    interruption.forEach(f => { if (f.planned.start > TODAY_MONTH) for (let m = f.planned.start; m <= f.planned.end; m++) set.add(m); });
    return set;
  }, [interruption]);

  // Cumulative weighted series (in %)
  const series = useMemo(() => MONTHS.map(m => {
    const planned = features.reduce((s, f) => s + plannedFrac(f, m.idx), 0) / T * 100;
    const realized = m.idx <= TODAY_MONTH
      ? features.reduce((s, f) => s + realizedFrac(f, m.idx), 0) / T * 100
      : null;
    const forecast = m.idx >= TODAY_MONTH
      ? features.reduce((s, f) => s + (m.idx === TODAY_MONTH ? realizedFrac(f, m.idx) : forecastFrac(f, m.idx)), 0) / T * 100
      : null;
    return { idx: m.idx, label: m.label, year: m.year, planned, realized, forecast };
  }), [features, T]);

  const todayRow = series[TODAY_MONTH];
  const endForecast = series[MONTHS.length - 1].forecast ?? 0;

  // July (and August, for BTG context) delivery forecast
  const julyFeats = useMemo(() => features.filter(f => f.planned.end === 6), [features]);
  const augFeats  = useMemo(() => features.filter(f => f.planned.end === 7), [features]);

  const x = (m: number) => PAD_L + m * COL + COL / 2;
  const y = (pct: number) => PAD_T + (1 - pct / 100) * PLOT_H;
  const toPts = (key: "planned" | "realized" | "forecast") =>
    series.filter(s => s[key] !== null).map(s => `${x(s.idx)},${y(s[key] as number)}`).join(" ");

  return (
    <div style={{ padding: "28px 28px 48px", maxWidth: 1440, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Evolução Mensal
        </h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
          Escopo: {T} épicos da Plataforma 2.0 · progresso ponderado mês a mês · forecast por confiança · Jan 2026 – Mar 2027
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { lbl: "Planejado até hoje", val: `${Math.round(todayRow.planned)}%`, sub: "posição esperada pelo plano", color: C_PLAN },
          { lbl: "Realizado até hoje", val: `${Math.round(todayRow.realized ?? 0)}%`, sub: `progresso médio dos ${T} épicos 2.0`, color: C_REAL },
          { lbl: "Variação", val: `${(todayRow.realized ?? 0) - todayRow.planned >= 0 ? "+" : ""}${Math.round((todayRow.realized ?? 0) - todayRow.planned)} pts`, sub: "realizado − planejado", color: (todayRow.realized ?? 0) >= todayRow.planned ? C_REAL : "#dc2626" },
          { lbl: "Forecast fim do período", val: `${Math.round(endForecast)}%`, sub: "projeção Mar/27 por confiança", color: C_FCST },
        ].map(k => (
          <div key={k.lbl} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" }}>{k.lbl}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: k.color, marginTop: 4, lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* S-curve */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 16px 8px", boxShadow: "0 1px 4px rgba(15,23,42,0.06)", marginBottom: 20, overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 20, marginBottom: 8, flexWrap: "wrap" }}>
          {[["Planejado", C_PLAN, false], ["Realizado", C_REAL, false], ["Forecast", C_FCST, true]].map(([lbl, col, dash]) => (
            <div key={lbl as string} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
              <svg width={22} height={8}><line x1={0} y1={4} x2={22} y2={4} stroke={col as string} strokeWidth={2.5} strokeDasharray={dash ? "4 3" : undefined} /></svg>
              {lbl}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
            <span style={{ width: 14, height: 12, background: "#fff7ed", border: "1px solid #fed7aa", display: "inline-block", borderRadius: 2 }} />
            Interrupção CDP (em execução)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
            <span style={{ width: 14, height: 12, background: "#faf5ff", border: "1px solid #e9d5ff", display: "inline-block", borderRadius: 2 }} />
            Janela CDP planejada
          </div>
        </div>
        <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
          {/* Interrupção CDP — bandas de fundo */}
          {MONTHS.map(m => {
            const past = m.idx <= TODAY_MONTH && cdpActiveMonth(m.idx);
            const future = cdpFutureMonths.has(m.idx);
            if (!past && !future) return null;
            return (
              <rect key={"cdp" + m.idx} x={PAD_L + m.idx * COL} y={PAD_T} width={COL} height={PLOT_H}
                fill={past ? "#fff7ed" : "#faf5ff"} />
            );
          })}
          {(() => {
            const firstPast = MONTHS.find(m => m.idx <= TODAY_MONTH && cdpActiveMonth(m.idx));
            return firstPast ? (
              <text x={PAD_L + firstPast.idx * COL + 4} y={PAD_T + 12} fontSize={9} fontWeight={700} fill="#c2410c">↯ CDP</text>
            ) : null;
          })()}
          {/* Y gridlines */}
          {[0, 25, 50, 75, 100].map(p => (
            <g key={p}>
              <line x1={PAD_L} y1={y(p)} x2={PAD_L + PLOT_W} y2={y(p)} stroke="#f1f5f9" strokeWidth={1} />
              <text x={PAD_L - 8} y={y(p) + 4} textAnchor="end" fontSize={10} fill="#94a3b8">{p}%</text>
            </g>
          ))}
          {/* Today marker */}
          <line x1={x(TODAY_MONTH)} y1={PAD_T} x2={x(TODAY_MONTH)} y2={PAD_T + PLOT_H} stroke="#2563eb" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.4} />
          <text x={x(TODAY_MONTH)} y={PAD_T + PLOT_H + 30} textAnchor="middle" fontSize={9} fontWeight={700} fill="#2563eb">HOJE</text>
          {/* Lines */}
          <polyline points={toPts("planned")} fill="none" stroke={C_PLAN} strokeWidth={2.5} />
          <polyline points={toPts("realized")} fill="none" stroke={C_REAL} strokeWidth={2.5} />
          <polyline points={toPts("forecast")} fill="none" stroke={C_FCST} strokeWidth={2.5} strokeDasharray="5 3" />
          {/* Today dots */}
          <circle cx={x(TODAY_MONTH)} cy={y(todayRow.planned)} r={3.5} fill={C_PLAN} />
          <circle cx={x(TODAY_MONTH)} cy={y(todayRow.realized ?? 0)} r={3.5} fill={C_REAL} />
          {/* Month labels */}
          {MONTHS.map(m => (
            <text key={m.idx} x={x(m.idx)} y={PAD_T + PLOT_H + 16} textAnchor="middle"
              fontSize={9} fontWeight={m.idx === TODAY_MONTH ? 700 : 400}
              fill={m.idx === TODAY_MONTH ? "#2563eb" : "#94a3b8"}>
              {m.label}{(m.idx === 0 || m.label === "Jan") ? `/${String(m.year).slice(2)}` : ""}
            </text>
          ))}
        </svg>
      </div>

      {/* Forecast de Julho */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Forecast de Julho · 2.0</h3>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 14px" }}>Entregas 2.0 planejadas para Jul/26 e a confiança pelo progresso atual. Itens de CDP não contam como entrega 2.0 (são interrupção).</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {julyFeats.length === 0 && (
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Nenhuma entrega 2.0 com data em Jul/26.</div>
          )}
          {julyFeats.map(f => {
            const behind = isBehind(f);
            return (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: "0 0 18px", fontSize: 14 }}>{behind ? "⚠️" : "✅"}</div>
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                  <div style={{ height: 5, background: "#f1f5f9", borderRadius: 999, marginTop: 4, overflow: "hidden" }}>
                    <div style={{ width: `${f.progress}%`, height: "100%", background: behind ? "#f59e0b" : C_REAL, borderRadius: 999 }} />
                  </div>
                </div>
                <div style={{ flex: "0 0 56px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#475569" }}>{f.progress}%</div>
                <div style={{ flex: "0 0 96px", textAlign: "right", fontSize: 11, fontWeight: 700, color: behind ? "#b45309" : "#15803d" }}>
                  {behind ? "Em risco" : "Provável"}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 14, padding: "10px 12px", background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, fontSize: 12, color: "#6b21a8" }}>
          ↪ <b>Repriorização do BTG:</b> Estruturação do motor de recomendação e Primeiro grupo de regras saíram de Jul → <b>Ago/26</b>, porque o time de back priorizou a CDP. Agosto concentra a entrega do BTG ({augFeats.filter(f => f.status === "replanejado").map(f => `${f.progress}%`).join(" / ") || "—"}, alta confiança).
        </div>
      </div>

      {/* Tabela mensal */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "8px 4px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ color: "#64748b", textAlign: "right" }}>
              <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 700 }}>Mês</th>
              <th style={{ padding: "8px 12px", fontWeight: 700 }}>Planejado (cum.)</th>
              <th style={{ padding: "8px 12px", fontWeight: 700 }}>Realizado / Forecast (cum.)</th>
              <th style={{ padding: "8px 12px", fontWeight: 700 }}>Variação</th>
            </tr>
          </thead>
          <tbody>
            {series.map(s => {
              const actual = s.idx <= TODAY_MONTH ? s.realized : s.forecast;
              const isFcst = s.idx > TODAY_MONTH;
              const diff = (actual ?? 0) - s.planned;
              const isToday = s.idx === TODAY_MONTH;
              return (
                <tr key={s.idx} style={{ borderTop: "1px solid #f1f5f9", background: isToday ? "#eff6ff" : undefined, textAlign: "right" }}>
                  <td style={{ textAlign: "left", padding: "7px 12px", fontWeight: isToday ? 700 : 500, color: "#334155" }}>
                    {s.label}/{String(s.year).slice(2)}{isToday ? " · hoje" : ""}
                  </td>
                  <td style={{ padding: "7px 12px", color: C_PLAN, fontWeight: 600 }}>{Math.round(s.planned)}%</td>
                  <td style={{ padding: "7px 12px", color: isFcst ? C_FCST : C_REAL, fontWeight: 600 }}>
                    {Math.round(actual ?? 0)}%{isFcst ? " *" : ""}
                  </td>
                  <td style={{ padding: "7px 12px", fontWeight: 600, color: diff >= 0 ? "#15803d" : "#dc2626" }}>
                    {diff >= 0 ? "+" : ""}{Math.round(diff)} pts
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 11, color: "#94a3b8", padding: "6px 12px 4px" }}>* meses futuros são forecast (projeção por confiança).</div>
      </div>

    </div>
  );
}
