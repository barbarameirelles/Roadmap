import { useState, useMemo, useEffect } from "react";
import type React from "react";
import { TRACK_META, type Track } from "@/data/ganttData";
import {
  HYPOTHESES, HYPO_STATUS_META, PRIORITY_META,
  type HypothesisStatus, type HypothesisItem, type HypothesisPriority,
} from "@/data/hypothesesData";
import { fetchPriorities, upsertPriority, type PriorityMap } from "@/lib/hypothesisPriorities";

// ── Priority Dropdown ─────────────────────────────────────────────────────────

const PRIORITY_ORDER: (HypothesisPriority | null)[] = [null, "baixa", "media", "alta", "urgente"];

function PriorityDropdown({
  current, onSelect,
}: {
  current: HypothesisPriority | null;
  onSelect: (p: HypothesisPriority | null) => void;
}) {
  return (
    <div style={{
      position: "absolute", top: "calc(100% + 2px)", left: 0, zIndex: 300,
      background: "var(--g-card, #fff)",
      border: "1px solid var(--g-border, #e2e8f0)",
      borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.14)",
      minWidth: 148, overflow: "hidden",
    }}>
      {PRIORITY_ORDER.map(p => {
        const meta = p ? PRIORITY_META[p] : null;
        const active = current === p;
        return (
          <button
            key={p ?? "none"}
            onClick={e => { e.stopPropagation(); onSelect(p); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "7px 12px",
              background: active ? "var(--g-surface, #f8fafc)" : "none",
              border: "none", cursor: "pointer", textAlign: "left",
              fontSize: 12, fontWeight: active ? 700 : 400,
              color: meta ? meta.color : "var(--g-muted, #64748b)",
            }}
          >
            <span style={{ width: 14, textAlign: "center", flexShrink: 0 }}>
              {meta ? meta.icon : "—"}
            </span>
            {meta ? meta.label : "Nenhuma"}
            {active && <span style={{ marginLeft: "auto", opacity: 0.5, fontSize: 11 }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Priority Badge ─────────────────────────────────────────────────────────────

function PriorityBadge({ p }: { p: HypothesisPriority }) {
  const m = PRIORITY_META[p];
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color: m.color,
      background: m.bg, borderRadius: 999, padding: "2px 10px",
      border: `1px solid ${m.border}`, whiteSpace: "nowrap",
    }}>
      {m.icon} {m.label}
    </span>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function HypothesisModal({
  item, priority, onClose,
}: {
  item: HypothesisItem;
  priority: HypothesisPriority | null;
  onClose: () => void;
}) {
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
                {priority && <PriorityBadge p={priority} />}
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

function HypRow({
  item, priority, isDropdownOpen, onOpen, onToggleDropdown, onSetPriority,
}: {
  item: HypothesisItem;
  priority: HypothesisPriority | null;
  isDropdownOpen: boolean;
  onOpen: () => void;
  onToggleDropdown: (e: React.MouseEvent) => void;
  onSetPriority: (p: HypothesisPriority | null) => void;
}) {
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

      {/* ── Priority cell ── */}
      <td
        style={{ padding: "10px 12px", verticalAlign: "middle", position: "relative" }}
        onClick={onToggleDropdown}
      >
        {priority ? (
          <PriorityBadge p={priority} />
        ) : (
          <span style={{
            fontSize: 11, color: "var(--g-muted, #94a3b8)",
            cursor: "pointer", userSelect: "none",
          }}>— definir</span>
        )}
        {isDropdownOpen && (
          <PriorityDropdown
            current={priority}
            onSelect={p => { onSetPriority(p); }}
          />
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

type SortCol = "title" | "status" | "objetivo" | "priority";
type SortDir = "asc" | "desc";

const PRIORITY_SORT: Record<string, number> = { urgente: 0, alta: 1, media: 2, baixa: 3 };

export default function GanttHypothesesView() {
  const [trackFilter,    setTrackFilter]    = useState<Track | "all">("all");
  const [statusFilter,   setStatusFilter]   = useState<HypothesisStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<HypothesisPriority | "all">("all");
  const [clienteOnly,    setClienteOnly]    = useState(false);
  const [selected,       setSelected]       = useState<HypothesisItem | null>(null);
  const [sortCol,        setSortCol]        = useState<SortCol>("title");
  const [sortDir,        setSortDir]        = useState<SortDir>("asc");
  const [openDropdown,   setOpenDropdown]   = useState<string | null>(null);
  const [overrides,      setOverrides]      = useState<PriorityMap>({});

  useEffect(() => { fetchPriorities().then(setOverrides); }, []);

  function effectivePriority(item: HypothesisItem): HypothesisPriority | null {
    return overrides[item.id] ?? item.priority ?? null;
  }

  function setPriority(id: string, p: HypothesisPriority | null) {
    // atualiza UI imediatamente (otimista), persiste no Supabase em background
    setOverrides(prev => {
      const next = { ...prev };
      if (p === null) delete next[id]; else next[id] = p;
      return next;
    });
    upsertPriority(id, p);
    setOpenDropdown(null);
  }

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  const STATUS_ORDER: Record<HypothesisStatus, number> = { "em-andamento": 0, "planejado": 1, "a-avaliar": 2, "backlog": 3 };

  const filtered = useMemo(() => {
    return HYPOTHESES
      .filter(item => {
        if (trackFilter !== "all" && !item.type.includes(trackFilter)) return false;
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        if (clienteOnly && !item.clienteTags) return false;
        if (priorityFilter !== "all") {
          const p = overrides[item.id] ?? item.priority ?? null;
          if (p !== priorityFilter) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortCol === "title")    cmp = a.title.localeCompare(b.title, "pt");
        if (sortCol === "status")   cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (sortCol === "objetivo") cmp = a.type[0].localeCompare(b.type[0]);
        if (sortCol === "priority") {
          const pa = PRIORITY_SORT[effectivePriority(a) ?? ""] ?? 99;
          const pb = PRIORITY_SORT[effectivePriority(b) ?? ""] ?? 99;
          cmp = pa - pb;
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackFilter, statusFilter, priorityFilter, clienteOnly, sortCol, sortDir, overrides]);

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

  const PRIORITIES: { id: HypothesisPriority | "all"; label: string }[] = [
    { id: "all",     label: "Todas" },
    { id: "urgente", label: "🚨 Urgente" },
    { id: "alta",    label: "⚡ Alta" },
    { id: "media",   label: "🔵 Média" },
    { id: "baixa",   label: "↓ Baixa" },
  ];

  return (
    <div className="g-page" onClick={() => setOpenDropdown(null)}>
      {/* Overlay para fechar dropdown ao clicar fora */}
      {openDropdown && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200 }}
          onClick={e => { e.stopPropagation(); setOpenDropdown(null); }}
        />
      )}

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
          <span className="g-filter-label">Prioridade:</span>
          {PRIORITIES.map(({ id, label }) => (
            <button
              key={id}
              className={"g-pill" + (priorityFilter === id ? " active" : "")}
              onClick={() => setPriorityFilter(id)}
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
                  { col: "title",    label: "Item",       style: { paddingLeft: 16 } },
                  { col: "objetivo", label: "Objetivo",   style: { width: 260 } },
                  { col: "status",   label: "Status",     style: { width: 200 } },
                  { col: "priority", label: "Prioridade", style: { width: 130 } },
                  { col: null,       label: "Cliente",    style: { width: 160, paddingRight: 16 } },
                ] as { col: SortCol | null; label: string; style: React.CSSProperties }[]).map(({ col, label, style }) => (
                  <th
                    key={label}
                    onClick={col ? () => handleSort(col) : undefined}
                    style={{
                      textAlign: "left", padding: "10px 12px",
                      color: "var(--g-muted, #64748b)",
                      fontWeight: 600, fontSize: 11,
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      cursor: col ? "pointer" : "default",
                      userSelect: "none", whiteSpace: "nowrap",
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
                <HypRow
                  key={item.id}
                  item={item}
                  priority={effectivePriority(item)}
                  isDropdownOpen={openDropdown === item.id}
                  onOpen={() => { if (!openDropdown) setSelected(item); }}
                  onToggleDropdown={e => {
                    e.stopPropagation();
                    setOpenDropdown(prev => prev === item.id ? null : item.id);
                  }}
                  onSetPriority={p => setPriority(item.id, p)}
                />
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
        <HypothesisModal
          item={selected}
          priority={effectivePriority(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
