// Peças compartilhadas pelas abas de Iniciativas Omni: filtros, "(!)" de ajuste,
// barra de progresso e slide-over com as tarefas de uma iniciativa.
import { useEffect, useMemo, useState } from "react";
import { progressBreakdown } from "@/data/ganttUtils";
import type { IssueStatus } from "@/data/labeledDeliveries";
import { useOmniData } from "@/lib/omniSync";
import type { OmniInitiative, OmniKind, OmniProduct } from "@/data/omni/types";

export const PRODUCT_META: Record<OmniProduct, { color: string; bg: string }> = {
  "OMS":    { color: "#0369a1", bg: "#e0f2fe" },
  "Wake U": { color: "#9d174d", bg: "#fce7f3" },
  "PDV":    { color: "#7c3aed", bg: "#f5f3ff" },
};
export const PROJECT_META = { color: "#b45309", bg: "#ffedd5" };

export const STATUS_CFG: Record<IssueStatus, { label: string; bg: string; color: string; dot: string }> = {
  "Done":        { label: "Concluído",    bg: "#dcfce7", color: "#166534", dot: "#16a34a" },
  "In Progress": { label: "Em andamento", bg: "#dbeafe", color: "#1e40af", dot: "#2563eb" },
  "To Do":       { label: "A fazer",      bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  "Blocked":     { label: "Bloqueado",    bg: "#fee2e2", color: "#b91c1c", dot: "#dc2626" },
};

export const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho",
  "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// ── Filtros (produto + tipo) ─────────────────────────────────────────────────
export type ProductFilter = "Todos" | OmniProduct;
export type KindFilter = "Tudo" | OmniKind;
export interface OmniFilter { product: ProductFilter; kind: KindFilter }

export function useOmniInitiatives(f: OmniFilter): OmniInitiative[] {
  const { data } = useOmniData();
  return useMemo(() => data.initiatives.filter(i =>
    (f.product === "Todos" || i.products.includes(f.product)) &&
    (f.kind === "Tudo" || i.kind === f.kind)), [data, f.product, f.kind]);
}

export function OmniFilterBar({ value, onChange, showKind = true }: {
  value: OmniFilter; onChange: (f: OmniFilter) => void; showKind?: boolean;
}) {
  const products: ProductFilter[] = ["Todos", "OMS", "Wake U", "PDV"];
  const kinds: { id: KindFilter; label: string }[] = [
    { id: "Tudo", label: "Tudo" }, { id: "roadmap", label: "Roadmap" }, { id: "projeto", label: "Projetos de cliente" },
  ];
  return (
    <div className="om-filters">
      <div className="om-filter-grp" role="group" aria-label="Produto">
        <span className="om-filter-lbl">Produto</span>
        {products.map(p => (
          <button key={p} className="om-chip" aria-pressed={value.product === p}
            onClick={() => onChange({ ...value, product: p })}>{p}</button>
        ))}
      </div>
      {showKind && <div className="om-filter-grp" role="group" aria-label="Tipo">
        <span className="om-filter-lbl">Tipo</span>
        {kinds.map(k => (
          <button key={k.id} className="om-chip" aria-pressed={value.kind === k.id}
            onClick={() => onChange({ ...value, kind: k.id })}>{k.label}</button>
        ))}
      </div>}
    </div>
  );
}

// ── "(!)" — o que ainda será ajustado no GitLab ──────────────────────────────
// Tooltip em position: fixed, para não ser cortado por colunas com scroll.
export function AdjustFlag({ notes, size = "md" }: { notes: string[]; size?: "sm" | "md" }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  if (!notes.length) return null;
  const show = (e: { currentTarget: HTMLElement }) => {
    const r = e.currentTarget.getBoundingClientRect();
    const w = Math.min(300, window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8));
    const below = r.bottom + 6;
    setPos({ top: below + 160 > window.innerHeight ? Math.max(8, r.top - 6 - 160) : below, left });
  };
  return (
    <span className={`om-flag om-flag--${size}`} tabIndex={0} role="note"
      aria-label={`A ajustar: ${notes.join("; ")}`} onClick={e => e.stopPropagation()}
      onMouseEnter={show} onFocus={show} onMouseLeave={() => setPos(null)} onBlur={() => setPos(null)}>
      (!)
      {pos && (
        <span className="om-flag-tip" role="tooltip" style={{ top: pos.top, left: pos.left }}>
          <strong>A ajustar no GitLab</strong>
          <ul>{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </span>
      )}
    </span>
  );
}

// ── Stats + barra (fórmula única: Done + 0,5×(andamento+bloqueado)) ─────────
export function initiativeStats(i: OmniInitiative) {
  const b = progressBreakdown(i.items);
  const todo = b.total - b.done - b.inProgress - b.blocked;
  return { ...b, todo };
}

export function ProgressBar({ i }: { i: OmniInitiative }) {
  const s = initiativeStats(i);
  return (
    <div className="om-bar">
      <div style={{ width: `${s.donePct}%`, background: "#16a34a" }} />
      <div style={{ width: `${s.inProgressPct}%`, background: "#3b82f6" }} />
    </div>
  );
}

export function ProductTags({ i }: { i: OmniInitiative }) {
  return (
    <span className="om-tags">
      {i.products.map(p => (
        <span key={p} className="om-tag" style={{ color: PRODUCT_META[p].color, background: PRODUCT_META[p].bg }}>{p}</span>
      ))}
      {i.kind === "projeto" && (
        <span className="om-tag" style={{ color: PROJECT_META.color, background: PROJECT_META.bg }}>
          Projeto{i.client ? ` · ${i.client}` : ""}
        </span>
      )}
    </span>
  );
}

export const monthText = (m: OmniInitiative["month"]) => m ? `${MONTH_NAMES[m.month - 1]}/${m.year}` : "Sem mês";
const fmtDate = (d?: string) => d ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : "";

// ── Slide-over com as tarefas ────────────────────────────────────────────────
export function InitiativeSlideOver({ i, onClose }: { i: OmniInitiative; onClose: () => void }) {
  const s = initiativeStats(i);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);
  const order: IssueStatus[] = ["Blocked", "In Progress", "To Do", "Done"];
  return (
    <>
      <div className="om-scrim" onClick={onClose} />
      <aside className="om-slide" aria-label={i.title}>
        <div className="om-slide-head">
          <div className="om-row-between">
            <ProductTags i={i} />
            <button className="om-close" onClick={onClose} aria-label="Fechar">×</button>
          </div>
          <h2 className="om-slide-title">
            {i.title} <AdjustFlag notes={i.adjust} />
          </h2>
          <div className="om-meta">
            Entrega: {monthText(i.month)}
            {i.start || i.due ? ` · ${fmtDate(i.start) || "?"} → ${fmtDate(i.due) || "?"}` : ""}
            {i.gitlabStatus ? ` · No GitLab: ${i.gitlabStatus}` : ""}
            {" · "}<a href={i.url} target="_blank" rel="noreferrer">Abrir no GitLab ↗</a>
          </div>
        </div>
        <div className="om-slide-sec">
          <div className="om-row-between" style={{ alignItems: "baseline" }}>
            <span className="om-pct">{s.progress}%</span>
            <span className="om-meta">{s.done} de {s.total} concluídas{s.inProgress ? ` · ${s.inProgress} em andamento` : ""}{s.blocked ? ` · ${s.blocked} bloqueadas` : ""}</span>
          </div>
          <ProgressBar i={i} />
        </div>
        <div className="om-slide-sec">
          {i.items.length === 0 && <p className="om-meta">Nenhuma tarefa neste épico ainda.</p>}
          {order.map(st => {
            const items = i.items.filter(x => x.status === st);
            if (!items.length) return null;
            const cfg = STATUS_CFG[st];
            return (
              <div key={st} style={{ marginBottom: 18 }}>
                <div className="om-group-lbl" style={{ color: cfg.color }}>
                  <span className="om-dot" style={{ background: cfg.dot }} /> {cfg.label} ({items.length})
                </div>
                {items.map(x => (
                  <div key={x.ref} className="om-item" data-status={st}>
                    <a className="om-key" href={x.url} target="_blank" rel="noreferrer">{x.ref.split("/").pop()}</a>
                    <span className="om-item-title">
                      <span className={st === "Done" ? "om-done" : ""}>{x.title}</span>
                      {x.parent && <span className="om-item-sub">em: {x.parent}</span>}
                    </span>
                    <AdjustFlag notes={x.adjust} size="sm" />
                    <span className="om-status" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}

export function useSelected() {
  return useState<OmniInitiative | null>(null);
}
