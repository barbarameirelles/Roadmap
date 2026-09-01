import { useState, useMemo } from "react";
import type React from "react";
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
                {item.priority && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "#7c3aed",
                    background: "#f5f3ff", borderRadius: 999, padding: "2px 10px",
                    border: "1px solid #ddd6fe",
                  }}>⚡ Alta prioridade</span>
                )}
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

// ── Table Row ─────────────────────────────────────────────────────────────────

function HypRow({ item, onOpen }: { item: HypothesisItem; onOpen: () => void }) {
  return (
    <tr
      onClick={onOpen}
      style={{ cursor: "pointer", borderBottom: "1px solid var(--g-border, #e2e8f0)" }}
      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--g-surface, #f8fafc)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ""; }}
    >
      <td style={{ padding: "10px 12px 10px 16px", verticalAlign: "middle" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--g-ink, #0f172a)", lineHeight: 1.35, marginBottom: 2 }}>
          {item.title}
        </div>
        {item.subitems && item.subitems.length > 0 && (
          <div style={{ fontSize: 11, color: "var(--g-muted, #64748b)" }}>
            +{item.subitems.length} itens
          </div>
        )}
      </td>
      <td style={{ padding: "10px 12px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {item.type.map(t => (
            <span key={t} className="kb-track-tag" style={{ background: TRACK_META[t].bg, color: TRACK_META[t].color }}>
              {TRACK_META[t].short}
            </span>
          ))}
        </div>
      </td>
      <td style={{ padding: "10px 12px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
        <span style={{
          fontSize: 11, fontWeight: 600,
          color: HYPO_STATUS_META[item.status].color,
          background: HYPO_STATUS_META[item.status].bg,
          borderRadius: 999, padding: "2px 8px",
        }}>{HYPO_STATUS_META[item.status].label}</span>
        {item.previsao && (
          <span style={{
            marginLeft: 6, fontSize: 11, fontWeight: 600, color: "#1d4ed8",
            background: "#eff6ff", borderRadius: 999, padding: "2px 8px",
          }}>📅 {item.previsao}</span>
        )}
      </td>
      <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
        {item.priority && (
          <span style={{
            fontSize: 11, fontWeight: 700, color: "#7c3aed",
            background: "#f5f3ff", borderRadius: 999, padding: "2px 10px",
            border: "1px solid #ddd6fe", whiteSpace: "nowrap",
          }}>⚡ Alta</span>
        )}
      </td>
      <td style={{ padding: "10px 0 10px 12px", verticalAlign: "middle" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {item.clienteTags?.map(c => (
            <span key={c} style={{
              fontSize: 11, fontWeight: 700, color: "#92400e",
              background: "#fef3c7", borderRadius: 999, padding: "2px 8px",
              border: "1px solid #fcd34d", whiteSpace: "nowrap",
            }}>⭐ {c}</span>
          ))}
        </div>
      </td>
    </tr>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

type SortCol = "title" | "status" | "objetivo";
type SortDir = "asc" | "desc";

export default function GanttHypothesesView() {
  const [trackFilter, setTrackFilter] = useState<Track | "all">("all");
  const [statusFilter, setStatusFilter] = useState<HypothesisStatus | "all">("all");
  const [clienteOnly, setClienteOnly] = useState(false);
  const [selected, setSelected] = useState<HypothesisItem | null>(null);
  const [sortCol, setSortCol] = useState<SortCol>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  const filtered = useMemo(() => {
    const STATUS_ORDER: Record<HypothesisStatus, number> = { "em-andamento": 0, "planejado": 1, "a-avaliar": 2, "backlog": 3 };

    return HYPOTHESES
      .filter(item => {
        if (trackFilter !== "all" && !item.type.includes(trackFilter)) return false;
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        if (clienteOnly && !item.clienteTags) return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortCol === "title")   cmp = a.title.localeCompare(b.title, "pt");
        if (sortCol === "status")  cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (sortCol === "objetivo") cmp = a.type[0].localeCompare(b.type[0]);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [trackFilter, statusFilter, clienteOnly, sortCol, sortDir]);

  const counts = useMemo(() => ({
    total:    HYPOTHESES.length,
    migracao: HYPOTHESES.filter(h => h.type.includes("migracao")).length,
    evolucao: HYPOTHESES.filter(h => h.type.includes("evolucao")).length,
    cdp:      HYPOTHESES.filter(h => h.type.includes("cdp")).length,
    clientes: HYPOTHESES.filter(h => !!h.clienteTags).length,
  }), []);

  const STATUSES: { id: HypothesisStatus | "all"; label: string }[] = [
    { id: "all",          label: "Todos" },
    { id: "em-andamento", label: "Em andamento" },
    { id: "planejado",    label: "Planejado" },
    { id: "a-avaliar",    label: "A avaliar" },
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
        background: "var(--g-card, #fff)",
        border: "1px solid var(--g-border, #e2e8f0)",
        borderRadius: 12,
        overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ background: "var(--g-surface, #f8fafc)" }}>
              <tr style={{ borderBottom: "1px solid var(--g-border, #e2e8f0)" }}>
                {([
                  { col: "title",   label: "Item",       style: { paddingLeft: 16 } },
                  { col: "objetivo",label: "Objetivo",   style: { width: 260 } },
                  { col: "status",  label: "Status",     style: { width: 200 } },
                  { col: null,      label: "Prioridade", style: { width: 110 } },
                  { col: null,      label: "Cliente",    style: { width: 160, paddingRight: 16 } },
                ] as { col: SortCol | null; label: string; style: React.CSSProperties }[]).map(({ col, label, style }) => (
                  <th
                    key={label}
                    onClick={col ? () => handleSort(col) : undefined}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      color: "var(--g-muted, #64748b)",
                      fontWeight: 600, fontSize: 11,
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      cursor: col ? "pointer" : "default",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      ...style,
                    }}
                  >
                    {label}
                    {col && (
                      <span style={{ marginLeft: 4, opacity: sortCol === col ? 1 : 0.3 }}>
                        {sortCol === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <HypRow key={item.id} item={item} onOpen={() => setSelected(item)} />
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--g-muted, #64748b)", padding: "48px 0", fontSize: 14 }}>
              Nenhum item encontrado com os filtros selecionados
            </div>
          )}
        </div>
      </div>

      {selected && (
        <HypothesisModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
