// Hipóteses Omni: espelho das colunas Open, Triagem, Backlog e Refinamento do board
// de épicos "Roadmap" do GitLab, de todos os produtos, agrupado por produto e
// separando projetos de cliente do roadmap.
import { useEffect, useMemo, useState } from "react";
import { useOmniData } from "@/lib/omniSync";
import type { OmniHypoColumn, OmniHypothesis, OmniPriority } from "@/data/omni/types";
import { AdjustFlag, PRODUCT_META, PROJECT_META, type OmniFilter } from "./omniShared";

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

// Produtos na ordem de exibição; os que não estão aqui vão para o fim.
const LINE_META: Record<string, { color: string; bg: string }> = {
  "OMS": PRODUCT_META.OMS, "Wake U": PRODUCT_META["Wake U"], "PDV": PRODUCT_META.PDV,
  "Hub de integração": { color: "#0f766e", bg: "#ccfbf1" },
  "SinTalk":           { color: "#4d7c0f", bg: "#ecfccb" },
  "B2B":               { color: "#a16207", bg: "#fef9c3" },
  "B2C":               { color: "#c2410c", bg: "#ffedd5" },
  "API":               { color: "#4338ca", bg: "#e0e7ff" },
  "Segurança":         { color: "#b91c1c", bg: "#fee2e2" },
  "Sem produto":       { color: "#64748b", bg: "#f1f5f9" },
};
const LINE_ORDER = Object.keys(LINE_META);
const lineMeta = (l: string) => LINE_META[l] ?? { color: "#475569", bg: "#f1f5f9" };
const lineRank = (l: string) => { const k = LINE_ORDER.indexOf(l); return k < 0 ? 99 : k; };

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
              {h.lines.map(l => <Badge key={l} text={l} {...lineMeta(l)} />)}
              {h.kind === "projeto" && <Badge text="Projeto de cliente" {...PROJECT_META} />}
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
            {h.vertical ? ` · Vertical: ${h.vertical}` : ""}
            {h.tasks > 0 ? ` · ${h.done}/${h.tasks} tarefas concluídas` : " · sem tarefas"}
            {h.inDelivery ? " · também aparece em Entrega do Mês e Kanban" : ""}
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
  const [line, setLine] = useState<string | "all">("all");
  const [column, setColumn] = useState<OmniHypoColumn | "all">("all");
  const [clientOnly, setClientOnly] = useState(false);
  const [sort, setSort] = useState<{ col: SortCol; dir: 1 | -1 }>({ col: "column", dir: 1 });
  const [sel, setSel] = useState<OmniHypothesis | null>(null);

  const { data } = useOmniData();
  // O filtro global de produto (OMS/U/PDV) não vale aqui: a aba tem o próprio, com todos os produtos.
  const base = useMemo(() => data.hypotheses.filter(h =>
    filter.kind === "Tudo" || h.kind === filter.kind), [data, filter.kind]);
  const lines = useMemo(() => [...new Set(base.map(h => h.lines[0]))].sort((a, b) => lineRank(a) - lineRank(b)), [base]);

  const rows = useMemo(() => base
    .filter(h => (line === "all" || h.lines[0] === line) &&
      (column === "all" || h.column === column) &&
      (!clientOnly || !!h.client))
    .sort((a, b) => {
      const pr = (h: OmniHypothesis) => h.priority ? PRIORITY_META[h.priority].order : 9;
      const c = sort.col === "title" ? a.title.localeCompare(b.title, "pt")
        : sort.col === "column" ? COLUMN_META[a.column].order - COLUMN_META[b.column].order || pr(a) - pr(b)
        : sort.col === "priority" ? pr(a) - pr(b)
        : a.created.localeCompare(b.created);
      return c * sort.dir;
    }), [base, line, column, clientOnly, sort]);

  // Seções por produto; dentro de cada uma, roadmap primeiro e projetos de cliente depois.
  const sections = lines.map(l => {
    const list = rows.filter(h => h.lines[0] === l);
    return { line: l, roadmap: list.filter(h => h.kind === "roadmap"), projects: list.filter(h => h.kind === "projeto") };
  }).filter(s => s.roadmap.length + s.projects.length > 0);

  const scoped = base.filter(h => line === "all" || h.lines[0] === line);
  const count = (f: (h: OmniHypothesis) => boolean) => scoped.filter(f).length;
  const th = (col: SortCol | null, label: string, width?: number) => (
    <th style={{ width, cursor: col ? "pointer" : "default" }}
      onClick={col ? () => setSort(s => ({ col, dir: s.col === col ? (-s.dir as 1 | -1) : 1 })) : undefined}>
      {label}{col && <span style={{ marginLeft: 4, opacity: sort.col === col ? 1 : 0.3 }}>{sort.col === col ? (sort.dir === 1 ? "↑" : "↓") : "↕"}</span>}
    </th>
  );
  const row = (h: OmniHypothesis) => {
    const col = COLUMN_META[h.column];
    return (
      <tr key={h.id} className="om-hypo-row" tabIndex={0} onClick={() => setSel(h)}
        onKeyDown={e => e.key === "Enter" && setSel(h)}>
        <td>
          <div className="om-hypo-title">{h.title}</div>
          {h.description && <div className="om-hypo-desc">{h.description}</div>}
          <div className="om-tags" style={{ marginTop: 5 }}>
            {h.lines.slice(1).map(l => <Badge key={l} text={`+ ${l}`} {...lineMeta(l)} />)}
            {h.type === "Segurança" && h.lines[0] !== "Segurança" && <Badge text="Segurança" {...LINE_META["Segurança"]} />}
            {h.vertical && <span className="om-hypo-chip">{h.vertical}</span>}
            {h.inDelivery && <span className="om-hypo-chip om-hypo-chip--live">Também em Entrega · {h.done}/{h.tasks} tarefas</span>}
          </div>
        </td>
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
  };

  return (
    <div className="g-page">
      <div className="g-page-head">
        <h1 className="g-page-title">Hipóteses</h1>
        <p className="g-page-sub">
          Tudo que está nas colunas Open, Triagem, Backlog e Refinamento do board de épicos "Roadmap" no GitLab, de todos os produtos
        </p>
        <p className="g-page-note">
          O produto vem da etiqueta <code>prod::</code> do épico e a prioridade, da <code>priority::</code>.
          Épicos que já têm tarefas aparecem aqui e também em Entrega do Mês e Kanban. Épicos sem tarefa e parados ficam só aqui.
        </p>
      </div>

      <div className="om-hypo-filters">
        <div className="om-filter-grp">
          <span className="om-filter-lbl">Produto</span>
          <button className="om-chip" aria-pressed={line === "all"} onClick={() => setLine("all")}>Todos · {base.length}</button>
          {lines.map(l => (
            <button key={l} className="om-chip" aria-pressed={line === l} onClick={() => setLine(l)}>
              {l} · {base.filter(h => h.lines[0] === l).length}
            </button>
          ))}
        </div>
        <div className="om-filter-grp">
          <span className="om-filter-lbl">Etapa</span>
          <button className="om-chip" aria-pressed={column === "all"} onClick={() => setColumn("all")}>Todas · {scoped.length}</button>
          {(Object.keys(COLUMN_META) as OmniHypoColumn[]).filter(c => count(h => h.column === c) > 0).map(c => (
            <button key={c} className="om-chip" aria-pressed={column === c} onClick={() => setColumn(c)}>
              {COLUMN_META[c].label} · {count(h => h.column === c)}
            </button>
          ))}
        </div>
        <div className="om-filter-grp">
          <span className="om-filter-lbl">Cliente</span>
          <button className="om-chip" aria-pressed={clientOnly} onClick={() => setClientOnly(v => !v)}>
            ⭐ Cita cliente · {count(h => !!h.client)}
          </button>
        </div>
      </div>

      {sections.map(sec => {
        const m = lineMeta(sec.line);
        const total = sec.roadmap.length + sec.projects.length;
        return (
          <section key={sec.line} className="om-panel om-hypo-sec" style={{ padding: 0, borderTopColor: m.color }}>
            <div className="om-hypo-sec-head">
              <h2 className="om-h2"><span className="om-dot" style={{ background: m.color }} />{sec.line}</h2>
              <span className="om-meta">
                {total} {total === 1 ? "hipótese" : "hipóteses"}
                {sec.projects.length > 0 && ` · ${sec.projects.length} ${sec.projects.length === 1 ? "projeto" : "projetos"} de cliente`}
              </span>
            </div>
            <div className="om-table-wrap">
              <table className="om-table om-hypo-table">
                <thead>
                  <tr>
                    {th("title", "Item")}
                    {th("column", "Etapa", 150)}
                    {th("priority", "Prioridade", 120)}
                    {th(null, "Cliente · origem", 170)}
                    {th("created", "Criado", 100)}
                    {th(null, "", 50)}
                  </tr>
                </thead>
                <tbody>
                  {sec.projects.length > 0 && sec.roadmap.length > 0 && (
                    <tr className="om-hypo-sub"><td colSpan={6}>Roadmap · {sec.roadmap.length}</td></tr>
                  )}
                  {sec.roadmap.map(row)}
                  {sec.projects.length > 0 && (
                    <tr className="om-hypo-sub om-hypo-sub--proj"><td colSpan={6}>Projetos de cliente · {sec.projects.length}</td></tr>
                  )}
                  {sec.projects.map(row)}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
      {sections.length === 0 && <div className="om-panel"><div className="om-empty">Nenhuma hipótese com esses filtros.</div></div>}
      {sel && <HypoModal h={sel} onClose={() => setSel(null)} />}
    </div>
  );
}
