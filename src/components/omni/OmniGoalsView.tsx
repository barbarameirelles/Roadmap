import { useMemo, useState } from "react";
import type { OmniInitiative } from "@/data/omni/types";
import { summaryFor } from "@/data/omni/omniSummaries";
import {
  AdjustFlag, InitiativeSlideOver, PRODUCT_META, ProductTags, ProgressBar, STATUS_CFG,
  initiativeStats, monthText, productList, useOmniArea, useOmniInitiatives, type OmniFilter,
} from "./omniShared";

const NOW = new Date();
const CUR = { year: NOW.getFullYear(), month: NOW.getMonth() + 1 };
const key = (m: { year: number; month: number }) => m.year * 100 + m.month;

function Card({ i, onClick }: { i: OmniInitiative; onClick: () => void }) {
  const s = initiativeStats(i);
  const active = i.items.filter(x => x.status === "Blocked" || x.status === "In Progress").slice(0, 3);
  const sum = summaryFor(i);
  return (
    <div className="om-card" role="button" tabIndex={0} onClick={onClick}
      onKeyDown={e => e.key === "Enter" && onClick()}>
      <div className="om-row-between">
        <ProductTags i={i} />
        <AdjustFlag notes={i.adjust} />
      </div>
      <div className="om-card-title">{i.title}</div>
      {sum && <div className="om-card-desc">{sum.description}</div>}
      {sum?.context && <div className="om-card-why" style={{ borderLeftColor: `${PRODUCT_META[i.products[0]]?.color ?? "#94a3b8"}44` }}>{sum.context}</div>}
      <div>
        <div className="om-row-between" style={{ alignItems: "baseline", marginBottom: 6 }}>
          <span className="om-pct">{s.progress}%</span>
          <span className="om-meta">{s.done}/{s.total} concluídas</span>
        </div>
        <ProgressBar i={i} />
      </div>
      <div className="om-pills">
        {s.blocked > 0 && <span className="om-pill" style={{ color: "#b91c1c", background: "#fee2e2" }}>⚠ {s.blocked} bloqueio{s.blocked > 1 ? "s" : ""}</span>}
        {s.inProgress > 0 && <span className="om-pill" style={{ color: "#1e40af", background: "#dbeafe" }}>{s.inProgress} em andamento</span>}
        {s.todo > 0 && <span className="om-pill" style={{ color: "#475569", background: "#f1f5f9" }}>{s.todo} a fazer</span>}
      </div>
      {active.length > 0 && (
        <ul className="om-preview">
          {active.map(x => (
            <li key={x.ref}><span className="om-dot" style={{ background: STATUS_CFG[x.status].dot }} />{x.title}</li>
          ))}
        </ul>
      )}
      <div className="om-cta">Ver todas as tarefas →</div>
    </div>
  );
}

function MonthSection({ title, badge, items, defaultOpen, flag }: {
  title: string; badge?: string; items: OmniInitiative[]; defaultOpen: boolean; flag?: string[];
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [sel, setSel] = useState<OmniInitiative | null>(null);
  const avg = items.length ? Math.round(items.reduce((t, i) => t + initiativeStats(i).progress, 0) / items.length) : 0;
  return (
    <section style={{ marginBottom: 20 }}>
      <button className={"om-month" + (open ? " open" : "")} onClick={() => setOpen(o => !o)}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}>
          <polyline points="9 6 15 12 9 18" />
        </svg>
        <h2>{title}</h2>
        {badge && <span className="om-month-badge">{badge}</span>}
        {flag && <AdjustFlag notes={flag} />}
        <span className="om-meta" style={{ marginLeft: "auto" }}>{items.length} iniciativa{items.length !== 1 ? "s" : ""} · {avg}% médio</span>
      </button>
      {open && (
        <div className="om-grid">
          {items.map(i => <Card key={i.id} i={i} onClick={() => setSel(i)} />)}
        </div>
      )}
      {sel && <InitiativeSlideOver i={sel} onClose={() => setSel(null)} />}
    </section>
  );
}

export default function OmniGoalsView({ filter }: { filter: OmniFilter }) {
  const { products } = useOmniArea();
  const all = useOmniInitiatives(filter);
  const { months, noMonth } = useMemo(() => {
    // Sem tarefas só entra se foi planejado para o mês (Objetivo::<Mês>).
    const withTasks = all.filter(i => i.items.length > 0 || i.objective);
    const by = new Map<number, OmniInitiative[]>();
    for (const i of withTasks.filter(i => i.month)) {
      const k = key(i.month!);
      by.set(k, [...(by.get(k) ?? []), i]);
    }
    return {
      months: [...by.entries()].sort((a, b) => b[0] - a[0]),
      noMonth: withTasks.filter(i => !i.month),
    };
  }, [all]);

  return (
    <div className="g-page">
      <div className="g-page-head">
        <h1 className="g-page-title">Entrega do Mês</h1>
        <p className="g-page-sub">
          Iniciativas de {productList(products)} agrupadas pelo mês de entrega · % = concluídas + metade das em andamento e bloqueadas · clique em um card para ver as tarefas
        </p>
        <p className="g-page-note">
          O <span className="om-flag om-flag--inline">(!)</span> marca o que ainda será ajustado no GitLab. Passe o mouse para ver o ajuste.
          O mês vem da etiqueta <code>Objetivo::&lt;Mês&gt;</code> do épico; sem ela, é deduzido do título, da iteration ou do prazo.
        </p>
      </div>
      {months.length === 0 && noMonth.length === 0 && <div className="om-empty">Nenhuma iniciativa com esses filtros.</div>}
      {months.map(([k, items]) => {
        const m = { year: Math.floor(k / 100), month: k % 100 };
        const isCur = k === key(CUR), isNext = k === key(CUR) + 1 || (CUR.month === 12 && k === (CUR.year + 1) * 100 + 1);
        const past = k < key(CUR);
        return (
          <MonthSection key={k} title={monthText(m)} items={items}
            badge={isCur ? "Mês atual" : isNext ? "Planejamento" : undefined}
            defaultOpen={isCur || isNext}
            flag={past && items.some(i => initiativeStats(i).progress < 100)
              ? ["Mês já passou com entregas abertas — replanejar o mês dessas iniciativas"] : undefined} />
        );
      })}
      {noMonth.length > 0 && (
        <MonthSection title="Sem mês definido" items={noMonth} defaultOpen={false}
          flag={["Essas iniciativas não têm mês no GitLab — adicionar etiqueta Objetivo::<Mês> no épico"]} />
      )}
    </div>
  );
}
