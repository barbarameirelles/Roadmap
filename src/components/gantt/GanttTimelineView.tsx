import { useMemo } from "react";
import {
  FEATURES, MONTHS, QUARTERS, TODAY_MONTH,
  type Feature,
} from "@/data/ganttData";

// ── Display-name overrides (this view only) ──────────────────────────────────
const NAME_OVERRIDE: Record<string, string> = {
  "f11":  "BTG Motor",
  "f17":  "IP dedicado para envio de e-mail",
};

// IDs excluded from this view
const EXCLUDED = new Set(["f31", "cdp-3", "cdp-5", "f30"]);

// IDs merged/deduplicated (drop the second occurrence)
const MERGED_DROP = new Set<string>([]);

// Features that span across quarter boundaries: rendered as a cross-quarter chip at row 0
// startMonth/endMonth are month indices (0-based)
const SPANNING: Record<string, { startMonth: number; endMonth: number }> = {
  "cdp-1": { startMonth: 3, endMonth: 6 }, // Q2 Apr → Jul (first month of Q3)
};

// Quarter IDs that need row-0 reserved (because a spanning chip crosses them)
const SPANNING_AFFECTED: Set<string> = (() => {
  const s = new Set<string>();
  for (const span of Object.values(SPANNING)) {
    for (const q of QUARTERS) {
      if (span.startMonth <= q.end && span.endMonth >= q.start) s.add(q.id);
    }
  }
  return s;
})();

// ── Layout constants ─────────────────────────────────────────────────────────
const COL_W   = 76;
const TOTAL_W = COL_W * MONTHS.length;
const Q_W     = COL_W * 3;
const CHIP_H  = 30;
const CHIP_GAP = 5;
const HEADER_H = 72;
const TIMELINE_Y = HEADER_H;
const CHIPS_TOP  = TIMELINE_Y + 28;
const VTEX_MONTH = 8;

// ── Status styles ─────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, { border: string; label: string }> = {
  "concluido":             { border: "#16a34a", label: "Concluído" },
  "no-prazo":              { border: "#2563eb", label: "No prazo" },
  "em-andamento":          { border: "#d97706", label: "Em andamento" },
  "atrasado":              { border: "#dc2626", label: "Atrasado" },
  "atrasado-em-andamento": { border: "#f97316", label: "Atrasado · Em andamento" },
};

// ── Group regular (non-spanning) features by quarter ─────────────────────────
function groupByQuarter(features: Feature[]): Map<string, Feature[]> {
  const map = new Map<string, Feature[]>();
  for (const q of QUARTERS) map.set(q.id, []);
  for (const f of features) {
    if (SPANNING[f.id]) continue; // spanning chips rendered separately
    const q = QUARTERS.find(q => f.planned.end >= q.start && f.planned.end <= q.end);
    if (q) map.get(q.id)!.push(f);
  }
  return map;
}

function svgHeight(byQuarter: Map<string, Feature[]>): number {
  let max = 0;
  byQuarter.forEach((items, qId) => {
    const rowOffset = SPANNING_AFFECTED.has(qId) ? 1 : 0;
    const rows = items.length + rowOffset;
    if (rows > max) max = rows;
  });
  // also account for spanning chips alone (1 row)
  if (Object.keys(SPANNING).length > 0 && max < 1) max = 1;
  return CHIPS_TOP + max * (CHIP_H + CHIP_GAP) + 40;
}

// ── Chip renderer (shared between regular and spanning) ───────────────────────
function renderChip(
  feat: Feature,
  chipX: number,
  chipY: number,
  chipW: number,
) {
  const s = STATUS_STYLE[feat.status] ?? STATUS_STYLE["no-prazo"];
  const isVtex = feat.id === "f21b";
  const isSpanning = !!SPANNING[feat.id];
  const borderColor = isVtex ? "#f59e0b" : s.border;

  return (
    <g key={feat.id}>
      <rect x={chipX} y={chipY} width={chipW} height={CHIP_H} rx={5}
        fill={isVtex ? "#fffbeb" : "#fff"}
        stroke={isVtex ? "#fcd34d" : "#e2e8f0"}
        strokeWidth={isVtex ? 1.5 : 1}
      />
      <rect x={chipX} y={chipY} width={3} height={CHIP_H} rx={2} fill={borderColor} />
      {feat.progress > 0 && (
        <rect x={chipX + 3} y={chipY + CHIP_H - 3}
          width={(chipW - 3) * feat.progress / 100} height={3}
          rx={1} fill={borderColor} opacity={0.25} />
      )}
      <foreignObject x={chipX + 10} y={chipY + 3} width={chipW - (feat.progress > 0 ? 42 : 16)} height={CHIP_H - 6}>
        <div style={{
          fontSize: 11,
          fontWeight: isVtex || isSpanning ? 600 : 500,
          color: isVtex ? "#92400e" : "#334155",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          lineHeight: "24px",
        }}>
          {isVtex && "★ "}{feat.name}
        </div>
      </foreignObject>
      {feat.progress > 0 && (
        <text x={chipX + chipW - 6} y={chipY + CHIP_H / 2 + 4}
          textAnchor="end" fontSize={9} fill={isVtex ? "#92400e" : "#94a3b8"} fontWeight={500}>
          {feat.progress}%
        </text>
      )}
    </g>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GanttTimelineView() {
  const features = useMemo(() =>
    FEATURES
      .filter(f => !EXCLUDED.has(f.id) && !MERGED_DROP.has(f.id))
      .map(f => NAME_OVERRIDE[f.id] ? { ...f, name: NAME_OVERRIDE[f.id] } : f),
  []);

  const byQuarter = useMemo(() => groupByQuarter(features), [features]);
  const svgH = useMemo(() => svgHeight(byQuarter), [byQuarter]);

  // Look up spanning features from the full (filtered) features list
  const spanningFeatures = useMemo(() =>
    features.filter(f => !!SPANNING[f.id]),
  [features]);

  return (
    <div style={{ padding: "28px 28px 48px", maxWidth: 1440, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Linha do Tempo de Entregas
        </h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
          Visão executiva · entregas por trimestre · Jan 2026 – Mar 2027
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(STATUS_STYLE).map(([k, s]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
            <span style={{ width: 3, height: 14, borderRadius: 2, background: s.border, display: "inline-block" }} />
            {s.label}
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#92400e" }}>
          <span style={{ width: 10, height: 10, background: "#f59e0b", clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)", display: "inline-block" }} />
          Marco VTEX
        </div>
      </div>

      {/* Timeline SVG */}
      <div style={{
        overflowX: "auto",
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
      }}>
        <svg width={TOTAL_W} height={svgH} style={{ display: "block" }}>

          {/* Quarter bands */}
          {QUARTERS.map((q, qi) => (
            <rect key={q.id} x={q.start * COL_W} y={0} width={Q_W} height={svgH}
              fill={qi % 2 === 0 ? "#fafafa" : "#f8fafc"} />
          ))}

          {/* Quarter labels */}
          {QUARTERS.map(q => (
            <g key={q.id + "-label"}>
              <text x={q.start * COL_W + Q_W / 2} y={20} textAnchor="middle"
                fontSize={11} fontWeight={700} fill="#334155" letterSpacing={0.5}>
                {q.label.toUpperCase()}
              </text>
              <text x={q.start * COL_W + Q_W / 2} y={34} textAnchor="middle"
                fontSize={10} fill="#94a3b8">
                {q.sub}
              </text>
            </g>
          ))}

          {/* Quarter dividers */}
          {QUARTERS.map(q => (
            <line key={q.id + "-div"} x1={q.start * COL_W} y1={0} x2={q.start * COL_W} y2={svgH}
              stroke="#e2e8f0" strokeWidth={1} />
          ))}
          <line x1={TOTAL_W} y1={0} x2={TOTAL_W} y2={svgH} stroke="#e2e8f0" strokeWidth={1} />

          {/* Month labels */}
          {MONTHS.map(m => (
            <text key={m.idx} x={m.idx * COL_W + COL_W / 2} y={52} textAnchor="middle"
              fontSize={10} fontWeight={m.idx === TODAY_MONTH ? 700 : 400}
              fill={m.idx === TODAY_MONTH ? "#2563eb" : "#94a3b8"}>
              {m.label}
            </text>
          ))}

          {/* Timeline bar */}
          <line x1={0} y1={TIMELINE_Y} x2={TOTAL_W} y2={TIMELINE_Y} stroke="#e2e8f0" strokeWidth={1.5} />
          {MONTHS.map(m => (
            <line key={m.idx + "-tick"}
              x1={m.idx * COL_W + COL_W / 2} y1={TIMELINE_Y - 3}
              x2={m.idx * COL_W + COL_W / 2} y2={TIMELINE_Y + 3}
              stroke="#cbd5e1" strokeWidth={1} />
          ))}

          {/* Today marker */}
          {(() => {
            const cx = TODAY_MONTH * COL_W + COL_W / 2;
            return (
              <g>
                <line x1={cx} y1={TIMELINE_Y - 6} x2={cx} y2={svgH - 4}
                  stroke="#2563eb" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />
                <circle cx={cx} cy={TIMELINE_Y} r={5} fill="#2563eb" />
                <text x={cx} y={TIMELINE_Y + 16} textAnchor="middle" fontSize={9} fontWeight={700} fill="#2563eb">
                  HOJE
                </text>
              </g>
            );
          })()}


          {/* ── Spanning chips (row 0, cross-quarter) ── */}
          {spanningFeatures.map(feat => {
            const span = SPANNING[feat.id];
            const chipX = span.startMonth * COL_W + 8;
            const chipW = (span.endMonth - span.startMonth + 1) * COL_W - 16;
            return renderChip(feat, chipX, CHIPS_TOP, chipW);
          })}

          {/* ── Regular chips (row 0 reserved in affected quarters) ── */}
          {QUARTERS.map(q => {
            const items = byQuarter.get(q.id) ?? [];
            const rowOffset = SPANNING_AFFECTED.has(q.id) ? 1 : 0;
            const qX = q.start * COL_W;
            const chipW = Q_W - 16;

            return items.map((feat, i) => {
              const chipY = CHIPS_TOP + (i + rowOffset) * (CHIP_H + CHIP_GAP);
              return renderChip(feat, qX + 8, chipY, chipW);
            });
          })}

        </svg>
      </div>

      {/* Summary cards */}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {QUARTERS.map(q => {
          const regular = byQuarter.get(q.id) ?? [];
          const spanning = spanningFeatures.filter(f => {
            const s = SPANNING[f.id];
            return s.startMonth <= q.end && s.endMonth >= q.start;
          });
          const items = [...spanning, ...regular];
          const done = items.filter(f => f.status === "concluido").length;
          return (
            <div key={q.id} style={{
              background: "#fff", border: "1px solid #e2e8f0",
              borderRadius: 10, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.04em", marginBottom: 6 }}>
                {q.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>
                {items.length}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                {done > 0 ? `${done} concluída${done > 1 ? "s" : ""}` : "entregas planejadas"}
              </div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
                {items.map(f => {
                  const s = STATUS_STYLE[f.status];
                  const isVtex = f.id === "f21b";
                  return (
                    <div key={f.id} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      fontSize: 11, color: isVtex ? "#92400e" : "#475569",
                      fontWeight: isVtex ? 700 : 400,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: isVtex ? "#f59e0b" : s.border }} />
                      <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {isVtex && "★ "}{f.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
