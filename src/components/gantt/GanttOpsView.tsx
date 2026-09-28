import { useMemo, useState } from "react";
import {
  OPS_MONTHS, OPS_TRACKS, BROWSE,
  type TrackData, type MonthStats, type OpsTicket, type OpsStatus,
} from "@/data/opsTicketsData";
import { useRoadmap } from "@/lib/RoadmapContext";

// ── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<OpsStatus, { label: string; bg: string; color: string; dot: string }> = {
  "Blocked":     { label: "Bloqueado",    bg: "#fee2e2", color: "#b91c1c", dot: "#dc2626" },
  "In Progress": { label: "Em andamento", bg: "#dbeafe", color: "#1e40af", dot: "#2563eb" },
  "To Do":       { label: "Pendente",     bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  "Done":        { label: "Concluído",    bg: "#dcfce7", color: "#166534", dot: "#16a34a" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function businessDays(start: string, end: string | null): number {
  const s = new Date(start.split("T")[0] + "T12:00:00");
  const e = end ? new Date(end.split("T")[0] + "T12:00:00") : new Date();
  if (e < s) return 0;
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function avgResolutionDays(tickets: OpsTicket[]): number | null {
  const done = tickets.filter(t => t.status === "Done" && t.resdate);
  if (!done.length) return null;
  const sum = done.reduce((acc, t) => acc + businessDays(t.created, t.resdate), 0);
  return Math.round(sum / done.length);
}

function avgColor(avg: number | null): string {
  if (avg === null) return "#94a3b8";
  if (avg <= 3) return "#16a34a";
  if (avg <= 5) return "#d97706";
  return "#dc2626";
}

// ── SlideOver ────────────────────────────────────────────────────────────────

function TrackSlideOver({
  track, stats, onClose,
}: {
  track: TrackData; stats: MonthStats; onClose: () => void;
}) {
  const avg = avgResolutionDays(stats.tickets);
  const mainColor = avgColor(avg);

  const byStatus: Record<OpsStatus, OpsTicket[]> = {
    Blocked:      stats.tickets.filter(t => t.status === "Blocked"),
    "In Progress": stats.tickets.filter(t => t.status === "In Progress"),
    "To Do":      stats.tickets.filter(t => t.status === "To Do"),
    Done:         stats.tickets.filter(t => t.status === "Done"),
  };

  const hasTickets = stats.tickets.length > 0;

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(15,23,42,0.42)", zIndex: 200, backdropFilter: "blur(2px)",
      }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 580,
        background: "#fff", zIndex: 201,
        overflowY: "auto", boxShadow: "-4px 0 32px rgba(15,23,42,0.14)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Sticky header */}
        <div style={{
          padding: "18px 24px 16px", borderBottom: "1px solid #e2e8f0",
          borderTop: `4px solid ${track.color}`, position: "sticky", top: 0,
          background: "#fff", zIndex: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
                textTransform: "uppercase", color: track.color,
                background: `${track.color}18`, borderRadius: 999, padding: "3px 10px",
              }}>
                {stats.label}{stats.isLive ? " · Abertos agora" : ""}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>
                Tempo médio de resolução
              </span>
            </div>
            <button onClick={onClose} style={{
              width: 28, height: 28, border: "1px solid #e2e8f0", borderRadius: 6,
              background: "#f8fafc", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "#64748b", fontSize: 18, lineHeight: 1, flexShrink: 0,
            }}>×</button>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
            {track.label}
          </h2>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            {track.description}
          </p>
        </div>

        {/* Avg resolution */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: mainColor }}>
              {avg !== null ? `${avg}du` : "—"}
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              {avg !== null
                ? `média de ${stats.done} tickets resolvidos`
                : "sem tickets resolvidos no período"}
            </span>
          </div>
          {stats.blocked > 0 ? (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c" }}>
                ⚠ {stats.blocked} bloqueio{stats.blocked > 1 ? "s" : ""}
              </span>
            </div>
          ) : (
            <div style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>✓ Sem bloqueios</div>
          )}
        </div>

        {/* Tickets list */}
        <div style={{ padding: "16px 24px", flex: 1 }}>
          {!hasTickets ? (
            <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", paddingTop: 32 }}>
              Dados históricos · sem lista individual de tickets
            </div>
          ) : (
            (["Blocked", "In Progress", "To Do", "Done"] as OpsStatus[]).map(st => {
              const items = byStatus[st];
              if (items.length === 0) return null;
              const cfg = STATUS_CFG[st];
              return (
                <div key={st} style={{ marginBottom: 20 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", color: cfg.color,
                    marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                    {cfg.label} ({items.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {items.map(ticket => {
                      const bd = ticket.resdate ? null : businessDays(ticket.created, null);
                      return (
                        <div key={ticket.key} style={{
                          display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px",
                          background: st === "Blocked" ? "#fef2f2" : "#fafbfd",
                          borderRadius: 8,
                          border: `1px solid ${st === "Blocked" ? "#fecaca" : "#f1f5f9"}`,
                        }}>
                          <a
                            href={`${BROWSE}${ticket.key}`}
                            target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{
                              fontSize: 11, fontWeight: 600, color: "#2563eb",
                              background: "#eff6ff", borderRadius: 4, padding: "2px 6px",
                              flexShrink: 0, textDecoration: "none", whiteSpace: "nowrap",
                              marginTop: 1,
                            }}
                          >
                            {ticket.key}
                          </a>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                              fontSize: 12, color: st === "Done" ? "#94a3b8" : "#334155",
                              textDecoration: st === "Done" ? "line-through" : "none",
                              display: "block", lineHeight: 1.4,
                            }}>
                              {ticket.title}
                            </span>
                            {ticket.assignee && (
                              <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, display: "block" }}>
                                {ticket.assignee}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 600, color: cfg.color,
                              background: cfg.bg, borderRadius: 4, padding: "2px 7px",
                              whiteSpace: "nowrap",
                            }}>
                              {cfg.label}
                            </span>
                            {bd !== null && (
                              <span style={{
                                fontSize: 10, color: bd > 5 ? "#dc2626" : "#64748b",
                                fontWeight: bd > 5 ? 700 : 400,
                              }}>
                                {bd}du aberto
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function KpiTile({ label, value, sub, color, accent }: {
  label: string; value: string | number; sub?: string; color?: string; accent?: string;
}) {
  return (
    <div className={`g-kpi${accent ? ` accent-${accent}` : ""}`}>
      <div className="g-kpi-label">{label}</div>
      <div className={`g-kpi-value${color ? ` ${color}` : ""}`}>{value}</div>
      {sub && <div className="g-kpi-sub">{sub}</div>}
    </div>
  );
}

function TrackColumn({
  track, stats, onOpen,
}: {
  track: TrackData; stats: MonthStats; onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const avg = avgResolutionDays(stats.tickets);
  const openAtRisk = stats.atRisk > 0;

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--g-bg-elev)",
        border: `1px solid ${hovered ? track.color : "var(--g-border)"}`,
        borderTop: `3px solid ${track.color}`,
        borderRadius: "var(--g-radius-lg)",
        padding: "24px 24px 20px",
        display: "flex", flexDirection: "column",
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: hovered ? `0 4px 20px ${track.color}22` : "none",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--g-ink)" }}>{track.label}</span>
            <span style={{ fontSize: 12, color: "var(--g-ink-3)", fontWeight: 500 }}>{track.description}</span>
          </div>
          {stats.isLive && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: track.color,
              background: `${track.color}18`, borderRadius: 999,
              padding: "2px 8px", letterSpacing: "0.04em", textTransform: "uppercase",
            }}>
              Abertos agora
            </span>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="g-kpi-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 20 }}>
        <KpiTile label="Total no mês" value={stats.volume} sub={`${stats.done} concluídos`} />
        <KpiTile
          label="Tempo médio"
          value={avg !== null ? `${avg}du` : "—"}
          sub={avg !== null ? "para concluir" : "sem resoluções"}
          color={avg !== null ? (avg <= 3 ? "green" : avg <= 5 ? "amber" : "red") : undefined}
          accent={avg !== null ? (avg <= 3 ? "green" : avg <= 5 ? "amber" : "red") : undefined}
        />
        <KpiTile
          label="Em aberto"
          value={stats.open}
          sub={openAtRisk ? `${stats.atRisk} passaram do prazo` : stats.open === 0 ? "tudo resolvido" : "dentro do prazo"}
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

      {/* CTA */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--g-border)" }}>
        <span style={{
          fontSize: 12, color: hovered ? track.color : "var(--g-ink-4)",
          fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4,
          transition: "color 0.15s",
        }}>
          {stats.tickets.length > 0
            ? `Ver ${stats.tickets.length} tickets`
            : "Ver detalhes"}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 12, height: 12 }}>
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}

// ── Main view ────────────────────────────────────────────────────────────────

export default function GanttOpsView() {
  const { opsSnapshot } = useRoadmap();
  const [selectedMonth, setSelectedMonth] = useState(OPS_MONTHS[OPS_MONTHS.length - 1].month);
  const [drawer, setDrawer] = useState<{ track: TrackData; stats: MonthStats } | null>(null);

  // Sobrepõe os dados ao vivo do Supabase no mês corrente (isLive=true)
  const tracks = useMemo(() =>
    OPS_TRACKS.map(track => ({
      ...track,
      months: track.months.map(m =>
        m.isLive && opsSnapshot?.[track.id]
          ? { ...opsSnapshot[track.id] as MonthStats, label: m.label, isLive: true as const }
          : m
      ),
    })),
  [opsSnapshot]);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--g-ink)", margin: 0 }}>
          Tickets Operacionais
        </h1>
        <p style={{ fontSize: 13, color: "var(--g-ink-3)", marginTop: 4, margin: 0 }}>
          Demandas de suporte e operação por trilha · tempo médio em dias úteis
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
            {m.isLive && (
              <span style={{
                marginLeft: 6, fontSize: 9, fontWeight: 700,
                background: selectedMonth === m.month ? "rgba(255,255,255,0.25)" : "var(--g-blue)",
                color: selectedMonth === m.month ? "#fff" : "#fff",
                borderRadius: 999, padding: "1px 5px",
              }}>
                AO VIVO
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Track columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {tracks.map(track => {
          const stats = track.months.find(m => m.month === selectedMonth);
          if (!stats) return null;
          return (
            <TrackColumn
              key={track.id}
              track={track}
              stats={stats}
              onOpen={() => setDrawer({ track, stats })}
            />
          );
        })}
      </div>

      {/* Drawer */}
      {drawer && (
        <TrackSlideOver
          track={drawer.track}
          stats={drawer.stats}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  );
}
