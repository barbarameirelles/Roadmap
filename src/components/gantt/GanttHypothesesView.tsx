import { useState, useMemo } from "react";
import { TRACK_META, type Track } from "@/data/ganttData";
import {
  HYPOTHESES, HYPO_STATUS_META,
  type HypothesisStatus, type HypothesisItem,
} from "@/data/hypothesesData";

// ── Detail Modal ──────────────────────────────────────────────────────────────

function HypothesisModal({ item, onClose }: { item: HypothesisItem; onClose: () => void }) {
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
          width: "100%", maxWidth: 600, maxHeight: "85vh",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--g-border, #e2e8f0)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {item.type.map(t => (
                  <span key={t} className="kb-track-tag" style={{ background: TRACK_META[t].bg, color: TRACK_META[t].color }}>
                    {TRACK_META[t].short}
                  </span>
                ))}
                {item.status !== "backlog" && (
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: HYPO_STATUS_META[item.status].color,
                    background: HYPO_STATUS_META[item.status].bg,
                    borderRadius: 999, padding: "2px 8px",
                  }}>{HYPO_STATUS_META[item.status].label}</span>
                )}
                {item.clienteTags?.map(c => (
                  <span key={c} style={{
                    fontSize: 11, fontWeight: 700, color: "#92400e",
                    background: "#fef3c7", borderRadius: 999, padding: "2px 8px",
                    border: "1px solid #fcd34d",
                  }}>⭐ {c}</span>
                ))}
                {item.previsao && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "#1d4ed8",
                    background: "#eff6ff", borderRadius: 999, padding: "2px 8px",
                  }}>📅 {item.previsao}</span>
                )}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--g-ink, #0f172a)", lineHeight: 1.3 }}>
                {item.title}
              </div>
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
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
          <p style={{ fontSize: 14, color: "var(--g-ink-2, #334155)", lineHeight: 1.6, margin: "0 0 16px" }}>
            {item.description}
          </p>
          {item.subitems && item.subitems.length > 0 && (
            <ul style={{ margin: 0, padding: "0 0 0 20px", listStyle: "disc" }}>
              {item.subitems.map((sub, i) => (
                <li key={i} style={{ fontSize: 13, color: "var(--g-ink-2, #334155)", marginBottom: 6, lineHeight: 1.5 }}>
                  {sub}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function HypCard({ item, onOpen }: { item: HypothesisItem; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      style={{
        background: "var(--g-card, #fff)",
        border: "1px solid var(--g-border, #e2e8f0)",
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#cbd5e1";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--g-border, #e2e8f0)";
      }}
    >
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {item.type.map(t => (
          <span key={t} className="kb-track-tag" style={{ background: TRACK_META[t].bg, color: TRACK_META[t].color }}>
            {TRACK_META[t].short}
          </span>
        ))}
        {item.clienteTags?.map(c => (
          <span key={c} style={{
            fontSize: 11, fontWeight: 700, color: "#92400e",
            background: "#fef3c7", borderRadius: 999, padding: "2px 8px",
            border: "1px solid #fcd34d",
          }}>⭐ {c}</span>
        ))}
        {item.status !== "backlog" && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: HYPO_STATUS_META[item.status].color,
            background: HYPO_STATUS_META[item.status].bg,
            borderRadius: 999, padding: "2px 8px",
          }}>{HYPO_STATUS_META[item.status].label}</span>
        )}
        {item.previsao && (
          <span style={{
            fontSize: 11, fontWeight: 600, color: "#1d4ed8",
            background: "#eff6ff", borderRadius: 999, padding: "2px 8px",
          }}>📅 {item.previsao}</span>
        )}
      </div>

      <div style={{
        fontSize: 14, fontWeight: 700, color: "var(--g-ink, #0f172a)",
        marginBottom: 6, lineHeight: 1.35,
      }}>
        {item.title}
      </div>

      <div style={{
        fontSize: 12, color: "var(--g-muted, #64748b)", lineHeight: 1.5,
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {item.description}
      </div>

      {item.subitems && item.subitems.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--g-muted, #64748b)" }}>
          +{item.subitems.length} itens — clique para ver
        </div>
      )}
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export default function GanttHypothesesView() {
  const [trackFilter, setTrackFilter] = useState<Track | "all">("all");
  const [statusFilter, setStatusFilter] = useState<HypothesisStatus | "all">("all");
  const [clienteOnly, setClienteOnly] = useState(false);
  const [selected, setSelected] = useState<HypothesisItem | null>(null);

  const filtered = useMemo(() => {
    return HYPOTHESES.filter(item => {
      if (trackFilter !== "all" && !item.type.includes(trackFilter)) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (clienteOnly && !item.clienteTags) return false;
      return true;
    });
  }, [trackFilter, statusFilter, clienteOnly]);

  const counts = useMemo(() => ({
    total:    HYPOTHESES.length,
    migracao: HYPOTHESES.filter(h => h.type.includes("migracao")).length,
    evolucao: HYPOTHESES.filter(h => h.type.includes("evolucao")).length,
    cdp:      HYPOTHESES.filter(h => h.type.includes("cdp")).length,
    clientes: HYPOTHESES.filter(h => !!h.clienteTags).length,
  }), []);

  const STATUSES: { id: HypothesisStatus | "all"; label: string }[] = [
    { id: "all",       label: "Todos" },
    { id: "planejado", label: "Planejado" },
    { id: "a-avaliar", label: "A avaliar" },
  ];

  return (
    <div className="g-page">
      <div className="g-page-head">
        <h1 className="g-page-title">Hipóteses · Próxima Sprint</h1>
        <p className="g-page-sub">Backlog de itens e pedidos de clientes para priorização futura</p>
      </div>

      <div className="g-filters">
        <div className="g-filter-group">
          <span className="g-filter-label">Filtrar por Objetivo:</span>
          <button
            className={"g-pill" + (trackFilter === "all" ? " active" : "")}
            onClick={() => setTrackFilter("all")}
          >Todos <span className="count">{counts.total}</span></button>
          {(["migracao", "evolucao", "cdp"] as Track[]).map(t => (
            <button
              key={t}
              className={"g-pill" + (trackFilter === t ? " active" : "")}
              style={trackFilter === t ? { background: TRACK_META[t].color, borderColor: TRACK_META[t].color } : undefined}
              onClick={() => setTrackFilter(t)}
            >
              {TRACK_META[t].short} <span className="count">{counts[t]}</span>
            </button>
          ))}
        </div>

        <div className="g-filter-group">
          <span className="g-filter-label">Status:</span>
          {STATUSES.map(({ id, label }) => (
            <button
              key={id}
              className={"g-pill" + (statusFilter === id ? " active" : "")}
              onClick={() => setStatusFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="g-filter-group">
          <span className="g-filter-label">Cliente:</span>
          <button
            className={"g-pill" + (clienteOnly ? " active" : "")}
            style={clienteOnly ? { background: "#b45309", borderColor: "#b45309" } : undefined}
            onClick={() => setClienteOnly(prev => !prev)}
          >
            ⭐ Pedidos especiais de clientes <span className="count">{counts.clientes}</span>
          </button>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 12,
      }}>
        {filtered.map(item => (
          <HypCard key={item.id} item={item} onOpen={() => setSelected(item)} />
        ))}
        {filtered.length === 0 && (
          <div style={{
            gridColumn: "1 / -1", textAlign: "center",
            color: "var(--g-muted, #64748b)", padding: "48px 0", fontSize: 14,
          }}>
            Nenhum item encontrado com os filtros selecionados
          </div>
        )}
      </div>

      {selected && (
        <HypothesisModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
