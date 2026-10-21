// Hipóteses Omni: épicos sem tarefas e sem andamento. Ficam só aqui; a etapa é
// a coluna do board de épicos "Roadmap" do GitLab.
import { useEffect, useMemo, useState } from "react";
import { OMNI_DATA } from "@/data/omni/omniData";
import type { OmniHypoColumn, OmniHypothesis, OmniPriority } from "@/data/omni/types";
import { AdjustFlag, PRODUCT_META, type OmniFilter } from "./omniShared";

const COLUMN_META: Record<OmniHypoColumn, { label: string; color: string; bg: string; order: number }> = {
  "To-Do":       { label: "To-Do",            color: "#047857", bg: "#ecfdf5", order: 0 },
  "Refinamento": { label: "2. Refinamento",   color: "#1d4ed8", bg: "#eff6ff", order: 1 },
  "Triagem":     { label: "1. Triagem",       color: "#b45309", bg: "#fef3c7", order: 2 },
  "Backlog":     { label: "1.1 Backlog",      color: "#475569", bg: "#f1f5f9", order: 3 },
  "Open":        { label: "Open · sem etapa", color: "#7c3aed", bg: "#f5f3ff", order: 4 },
};
const PRIORITY_META: Record<OmniPriority, { label: string; color: string; bg: string; order: number }> = {
  urgente: { label: "Muito alta", color: "#b91c1c", bg: "#fef2f2", order: 0 },
  alta:    { label: "Alta",       color: "#7c3aed", bg: "#f5f3ff", order: 1 },
  media:   { label: "Média",      color: "#1d4ed8", bg: "#eff6ff", order: 2 },
  baixa:   { label: "Baixa",      color: "#475569", bg: "#f1f5f9", order: 3 },
};

type SortCol = "title" | "column" | "priority" | "created";

function Badge({ text, color, bg }: { text: string; color: string; bg: string }) {
  return <span className="om-tag" style={{ color, background: bg }}>{text}</span>;
}

function HypoModal({ h, onClose }: { h: OmniHypothesis; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);
  const col = COLUMN_META[h.column];
  return (
    <>
      <div className="om-scrim" onClick={onClose} />
      <aside className="om-slide" aria-label={h.title}>
        <div className="om-slide-head">
          <div className="om-row-between">
            <span className="om-tags">
              {h.products.map(p => <Badge key={p} text={p} {...PRODUCT_META[p]} />)}
              <Badge text={col.label} color={col.color} bg={col.bg} />
              {h.priority && <Badge text={`Prioridade ${PRIORITY_META[h.priority].label}`} {...PRIORITY_META[h.priority]} />}
              {h.client && <Badge text={`⭐ ${h.client}`} color="#92400e" bg="#fef3c7" />}
            </span>
            <button className="om-close" onClick={onClose} aria-label="Fechar">×</button>
          </div>
          <h2 className="om-slide-title">{h.title} <AdjustFlag notes={h.adjust} /></h2>
          <div className="om-meta">
            Épico #{h.iid} · criado em {h.created.split("-").reverse().join("/")}
            {h.origin ? ` · Origem: ${h.origin}` : ""}{h.type ? ` · Tipo: ${h.type}` : ""}
            {" · "}<a href={h.url} target="_blank" rel="noreferrer">Abrir no GitLab ↗</a>
          </div>
        </div>
        <div className="om-slide-sec">
          <div className="om-group-lbl" style={{ color: "var(--g-ink-3)" }}>Descrição no GitLab</div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--g-ink-2)" }}>
            {h.description || "Sem descrição no épico."}
          </p>
        </div>
      </aside>
    </>
  );
}

export default function OmniHypothesesView({ filter }: { filter: OmniFilter }) {
  const [column, setColumn] = useState<OmniHypoColumn | "all">("all");
  const [priority, setPriority] = useState<OmniPriority | "none" | "all">("all");
  const [clientOnly, setClientOnly] = useState(false);
  const [sort, setSort] = useState<{ col: SortCol; dir: 1 | -1 }>({ col: "column", dir: 1 });
  const [sel, setSel] = useState<OmniHypothesis | null>(null);

  const base = useMemo(() => OMNI_DATA.hypotheses.filter(h =>
    (filter.product === "Todos" || h.products.includes(filter.product)) &&
    (filter.kind === "Tudo" || (filter.kind === "projeto") === (h.origin === "Projeto"))), [filter]);

  const rows = useMemo(() => base
    .filter(h => (column === "all" || h.column === column) &&
      (priority === "all" || (priority === "none" ? !h.priority : h.priority === priority)) &&
      (!clientOnly || !!h.client))
    .sort((a, b) => {
      const pr = (h: OmniHypothesis) => h.priority ? PRIORITY_META[h.priority].order : 9;
      const c = sort.col === "title" ? a.title.localeCompare(b.title, "pt")
        : sort.col === "column" ? COLUMN_META[a.column].order - COLUMN_META[b.column].order || pr(a) - pr(b)
        : sort.col === "priority" ? pr(a) - pr(b)
        : a.created.localeCompare(b.created);
      return c * sort.dir;
    }), [base, column, priority, clientOnly, sort]);

  const count = (f: (h: OmniHypothesis) => boolean) => base.filter(f).length;
  const th = (col: SortCol | null, label: string, width?: number) => (
    <th style={{ width, cursor: col ? "pointer" : "default" }}
      onClick={col ? () => setSort(s => ({ col, dir: s.col === col ? (-s.dir as 1 | -1) : 1 })) : undefined}>
      {label}{col && <span style={{ marginLeft: 4, opacity: sort.col === col ? 1 : 0.3 }}>{sort.col === col ? (sort.dir === 1 ? "↑" : "↓") : "↕"}</span>}
    </th>
  );

  return (
    <div className="g-page">
      <div className="g-page-head">
        <h1 className="g-page-title">Hipóteses</h1>
        <p className="g-page-sub">
          Épicos que ainda não têm tarefas nem estão em andamento · a etapa é a coluna do board de épicos "Roadmap" no GitLab
        </p>
        <p className="g-page-note">
          Quando o épico ganha a primeira tarefa ou entra em andamento, ele sai daqui e passa para Entrega do Mês e Kanban.
          A prioridade vem da etiqueta <code>priority::</code> do GitLab. Épicos de outros produtos (B2B, B2C, SinTalk, SinHub…) não aparecem.
        </p>
      </div>

      <div className="om-hypo-filters">
        <div className="om-filter-grp">
          <span className="om-filter-lbl">Etapa</span>
          <button className="om-chip" aria-pressed={column === "all"} onClick={() => setColumn("all")}>Todas · {base.length}</button>
          {(Object.keys(COLUMN_META) as OmniHypoColumn[]).filter(c => count(h => h.column === c) > 0).map(c => (
            <button key={c} className="om-chip" aria-pressed={column === c} onClick={() => setColumn(c)}>
              {COLUMN_META[c].label} · {count(h => h.column === c)}
            </button>
          ))}
        </div>
        <div className="om-filter-grp">
          <span className="om-filter-lbl">Prioridade</span>
          <button className="om-chip" aria-pressed={priority === "all"} onClick={() => setPriority("all")}>Todas</button>
          {(Object.keys(PRIORITY_META) as OmniPriority[]).map(p => (
            <button key={p} className="om-chip" aria-pressed={priority === p} onClick={() => setPriority(p)}>{PRIORITY_META[p].label}</button>
          ))}
          <button className="om-chip" aria-pressed={priority === "none"} onClick={() => setPriority("none")}>
            Sem prioridade · {count(h => !h.priority)}
          </button>
        </div>
        <div className="om-filter-grp">
          <span className="om-filter-lbl">Cliente</span>
          <button className="om-chip" aria-pressed={clientOnly} onClick={() => setClientOnly(v => !v)}>
            ⭐ Pedidos de clientes · {count(h => !!h.client)}
          </button>
        </div>
      </div>

      <div className="om-panel" style={{ padding: 0 }}>
        <div className="om-table-wrap">
          <table className="om-table om-hypo-table">
            <thead>
              <tr>
                {th("title", "Item")}
                {th(null, "Produto", 110)}
                {th("column", "Etapa", 150)}
                {th("priority", "Prioridade", 120)}
                {th(null, "Cliente · origem", 170)}
                {th("created", "Criado", 100)}
                {th(null, "", 50)}
              </tr>
            </thead>
            <tbody>
              {rows.map(h => {
                const col = COLUMN_META[h.column];
                return (
                  <tr key={h.id} className="om-hypo-row" tabIndex={0} onClick={() => setSel(h)}
                    onKeyDown={e => e.key === "Enter" && setSel(h)}>
                    <td>
                      <div className="om-hypo-title">{h.title}</div>
                      {h.description && <div className="om-hypo-desc">{h.description}</div>}
                    </td>
                    <td><span className="om-tags">{h.products.map(p => <Badge key={p} text={p} {...PRODUCT_META[p]} />)}</span></td>
                    <td><Badge text={col.label} color={col.color} bg={col.bg} /></td>
                    <td>{h.priority ? <Badge text={PRIORITY_META[h.priority].label} {...PRIORITY_META[h.priority]} /> : <span className="om-meta">—</span>}</td>
                    <td>
                      {h.client && <Badge text={`⭐ ${h.client}`} color="#92400e" bg="#fef3c7" />}
                      {h.origin && <div className="om-meta" style={{ marginTop: 3 }}>{h.origin}</div>}
                      {!h.client && !h.origin && <span className="om-meta">—</span>}
                    </td>
                    <td className="om-meta">{h.created.split("-").reverse().join("/")}</td>
                    <td><AdjustFlag notes={h.adjust} size="sm" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <div className="om-empty">Nenhuma hipótese com esses filtros.</div>}
        </div>
      </div>
      {sel && <HypoModal h={sel} onClose={() => setSel(null)} />}
    </div>
  );
}
