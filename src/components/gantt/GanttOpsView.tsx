import { useState } from "react";
import { OPS_MONTHS, OPS_TRACKS, type TrackData, type MonthStats, slaPercent, slaColor } from "@/data/opsTicketsData";

function SlaBar({ pct, color }: { pct: number | null; color: "green" | "amber" | "red" | "gray" }) {
  const colorMap = { green: "var(--g-green)", amber: "var(--g-orange)", red: "var(--g-red)", gray: "var(--g-border-strong)" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <div style={{ flex: 1, height: 6, background: "var(--g-border)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct ?? 0}%`, background: colorMap[color], borderRadius: 999, transition: "width 0.4s ease" }} />
      </div>
      <span style={{
        fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", minWidth: 42, textAlign: "right",
        color: pct === null ? "var(--g-ink-4)" : colorMap[color],
      }}>
        {pct === null ? "—" : `${pct}%`}
      </span>
    </div>
  );
}

function TrendDots({ track, selectedMonth }: { track: TrackData; selectedMonth: string }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 20 }}>
      {track.months.map(m => {
        const pct = slaPercent(m);
        const color = slaColor(pct);
        const isSelected = m.month === selectedMonth;
        const colorMap = { green: "var(--g-green)", amber: "var(--g-orange)", red: "var(--g-red)", gray: "var(--g-ink-4)" };
        return (
          <div key={m.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{
              width: isSelected ? 10 : 7, height: isSelected ? 10 : 7,
              borderRadius: "50%", background: colorMap[color],
              opacity: isSelected ? 1 : 0.45,
              transition: "all 0.2s",
            }} />
            <span style={{ fontSize: 10, color: isSelected ? "var(--g-ink-2)" : "var(--g-ink-4)", fontWeight: isSelected ? 600 : 400 }}>
              {m.label.substring(0, 3)}
            </span>
          </div>
        );
      })}
      <span style={{ fontSize: 11, color: "var(--g-ink-4)", marginLeft: 4 }}>histórico SLA</span>
    </div>
  );
}

function KpiTile({
  label, value, sub, color, accent,
}: {
  label: string; value: string | number; sub?: string; color?: string; accent?: string;
}) {
  const colorClass = color ? ` ${color}` : "";
  const accentClass = accent ? ` accent-${accent}` : "";
  return (
    <div className={`g-kpi${accentClass}`}>
      <div className="g-kpi-label">{label}</div>
      <div className={`g-kpi-value${colorClass}`}>{value}</div>
      {sub && <div className="g-kpi-sub">{sub}</div>}
    </div>
  );
}

function TrackColumn({ track, stats }: { track: TrackData; stats: MonthStats }) {
  const pct = slaPercent(stats);
  const color = slaColor(pct);
  const colorClass = { green: "green", amber: "amber", red: "red", gray: "" }[color];
  const openAtRisk = stats.atRisk > 0;
  const measuredBase = stats.withinSla + stats.outsideSla;
  const noDate = stats.done - measuredBase;

  return (
    <div style={{
      background: "var(--g-bg-elev)",
      border: "1px solid var(--g-border)",
      borderRadius: "var(--g-radius-lg)",
      padding: "24px 24px 20px",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--g-ink)" }}>{track.label}</span>
          <span style={{ fontSize: 12, color: "var(--g-ink-3)", fontWeight: 500 }}>{track.description}</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--g-ink-4)" }}>
          SLA: 5 dias úteis
        </div>
      </div>

      {/* SLA bar */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--g-ink-4)", marginBottom: 6 }}>
          Aderência ao SLA
        </div>
        <SlaBar pct={pct} color={color} />
      </div>

      {/* Trend */}
      <TrendDots track={track} selectedMonth={stats.month} />

      {/* KPIs */}
      <div className="g-kpi-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        <KpiTile label="Tickets no mês" value={stats.volume} sub={`${stats.done} concluídos`} />
        <KpiTile
          label="Dentro do SLA"
          value={pct !== null ? `${pct}%` : "—"}
          sub={measuredBase > 0 ? `${stats.withinSla} de ${measuredBase} medidos${noDate > 0 ? ` · ${noDate} s/ data` : ""}` : "sem dados"}
          color={colorClass || undefined}
          accent={color !== "gray" ? color : undefined}
        />
        <KpiTile
          label="Em aberto"
          value={stats.open}
          sub={openAtRisk ? `${stats.atRisk} fora do SLA` : stats.open === 0 ? "tudo resolvido" : "dentro do prazo"}
          color={openAtRisk ? "red" : stats.open > 0 ? "amber" : "green"}
          accent={openAtRisk ? "red" : stats.open > 0 ? "amber" : undefined}
        />
        <KpiTile
          label="Bloqueados"
          value={stats.blocked}
          sub={stats.blocked > 0 ? "requer ação externa" : "sem bloqueios"}
          color={stats.blocked > 0 ? "red" : "green"}
          accent={stats.blocked > 0 ? "red" : undefined}
        />
      </div>

      {/* Link to Jira */}
      <div style={{ marginTop: 8 }}>
        <a
          href={stats.jiraUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12, color: "var(--g-blue)", textDecoration: "none", fontWeight: 500,
            display: "inline-flex", alignItems: "center", gap: 4,
          }}
        >
          Ver tickets no Jira
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 12, height: 12 }}>
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default function GanttOpsView() {
  const [selectedMonth, setSelectedMonth] = useState(OPS_MONTHS[OPS_MONTHS.length - 1].month);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--g-ink)", margin: 0 }}>
          Tickets Operacionais
        </h1>
        <p style={{ fontSize: 13, color: "var(--g-ink-3)", marginTop: 4, margin: 0 }}>
          Demandas de suporte e operação por trilha · SLA de 5 dias úteis
        </p>
      </div>

      {/* Month selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {OPS_MONTHS.map(m => (
          <button
            key={m.month}
            onClick={() => setSelectedMonth(m.month)}
            style={{
              padding: "7px 18px", borderRadius: "var(--g-radius-sm)", border: "1px solid",
              borderColor: selectedMonth === m.month ? "var(--g-blue)" : "var(--g-border)",
              background: selectedMonth === m.month ? "var(--g-blue)" : "var(--g-bg-elev)",
              color: selectedMonth === m.month ? "#fff" : "var(--g-ink-2)",
              fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Track columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {OPS_TRACKS.map(track => {
          const stats = track.months.find(m => m.month === selectedMonth);
          if (!stats) return null;
          return <TrackColumn key={track.id} track={track} stats={stats} />;
        })}
      </div>
    </div>
  );
}
