import { useMemo, useState } from "react";
import type { OmniInitiative, OmniProduct } from "@/data/omni/types";
import {
  AdjustFlag, InitiativeSlideOver, PRODUCT_META, PROJECT_META, ProductTags, ProgressBar,
  initiativeStats, monthText, useOmniInitiatives, type OmniFilter,
} from "./omniShared";

const TODAY = new Date().toISOString().slice(0, 10);
const PRODUCTS: OmniProduct[] = ["OMS", "Wake U", "PDV"];

function summary(list: OmniInitiative[]) {
  const st = list.map(initiativeStats);
  const n = list.length;
  return {
    n,
    done: st.filter(s => s.total > 0 && s.done === s.total).length,
    avg: n ? Math.round(st.reduce((t, s) => t + s.progress, 0) / n) : 0,
    blocked: st.reduce((t, s) => t + s.blocked, 0),
    open: st.reduce((t, s) => t + s.total - s.done, 0),
  };
}

export default function OmniExecView({ filter }: { filter: OmniFilter }) {
  const all = useOmniInitiatives(filter);
  const [sel, setSel] = useState<OmniInitiative | null>(null);
  const active = useMemo(() => all.filter(i => i.items.length > 0), [all]);
  const tot = summary(active);
  const roadmap = active.filter(i => i.kind === "roadmap");
  const projects = active.filter(i => i.kind === "projeto");
  // Capacidade: tarefas ainda abertas de roadmap x de projetos de cliente.
  const openR = summary(roadmap).open, openP = summary(projects).open;
  const projShare = openR + openP ? Math.round(openP / (openR + openP) * 100) : 0;
  const attention = active
    .filter(i => { const s = initiativeStats(i); return s.done < s.total && (s.blocked > 0 || (!!i.due && i.due < TODAY)); })
    .sort((a, b) => (a.due ?? "9").localeCompare(b.due ?? "9"));

  return (
    <div className="g-page">
      <div className="g-page-head">
        <h1 className="g-page-title">Visão Executiva</h1>
        <p className="g-page-sub">Resumo das iniciativas com tarefas · roadmap x projetos de cliente · o que pede atenção</p>
      </div>

      <div className="om-kpis">
        <div className="om-kpi"><b>{tot.n}</b><span>iniciativas com tarefas</span></div>
        <div className="om-kpi"><b>{tot.avg}%</b><span>progresso médio</span></div>
        <div className="om-kpi"><b>{tot.done}</b><span>concluídas</span></div>
        <div className="om-kpi"><b style={{ color: tot.blocked ? "#b91c1c" : undefined }}>{tot.blocked}</b><span>tarefas bloqueadas</span></div>
      </div>

      <section className="om-panel">
        <h2 className="om-h2">Roadmap x Projetos de cliente <AdjustFlag notes={[
          "Projeto = épico/issue com orig::Projeto ou código de projeto (AAAA.NNN.NN). Faltam as etiquetas cliente::Nome",
          "Alguns objetivos de OKR também têm código de projeto (ex.: Shopify) — decidir se são roadmap ou projeto",
        ]} /></h2>
        <p className="om-meta">Tarefas ainda abertas: quanto da fila do time é projeto vendido a cliente.</p>
        <div className="om-split">
          <div style={{ width: `${100 - projShare}%`, background: "#2563eb" }} />
          <div style={{ width: `${projShare}%`, background: PROJECT_META.color }} />
        </div>
        <div className="om-row-between om-meta">
          <span><span className="om-dot" style={{ background: "#2563eb" }} /> Roadmap · {roadmap.length} iniciativas · {openR} tarefas abertas</span>
          <span><span className="om-dot" style={{ background: PROJECT_META.color }} /> Projetos · {projects.length} iniciativas · {openP} tarefas abertas ({projShare}%)</span>
        </div>
      </section>

      <section className="om-panel">
        <h2 className="om-h2">Por produto</h2>
        <div className="om-table-wrap">
          <table className="om-table">
            <thead><tr><th>Produto</th><th>Iniciativas</th><th>Concluídas</th><th>Progresso médio</th><th>Tarefas abertas</th><th>Bloqueios</th></tr></thead>
            <tbody>
              {PRODUCTS.map(p => {
                const s = summary(active.filter(i => i.products.includes(p)));
                return (
                  <tr key={p}>
                    <td><span className="om-tag" style={{ color: PRODUCT_META[p].color, background: PRODUCT_META[p].bg }}>{p}</span></td>
                    <td>{s.n}</td><td>{s.done}</td><td>{s.avg}%</td><td>{s.open}</td>
                    <td style={{ color: s.blocked ? "#b91c1c" : undefined }}>{s.blocked}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="om-meta">Uma iniciativa que envolve dois produtos conta nos dois.</p>
      </section>

      <section className="om-panel">
        <h2 className="om-h2">Pede atenção · bloqueadas ou com prazo vencido</h2>
        {attention.length === 0 && <p className="om-meta">Nada bloqueado ou vencido com esses filtros.</p>}
        <div className="om-att">
          {attention.map(i => {
            const s = initiativeStats(i);
            return (
              <div key={i.id} className="om-att-row" role="button" tabIndex={0} onClick={() => setSel(i)}
                onKeyDown={e => e.key === "Enter" && setSel(i)}>
                <ProductTags i={i} />
                <span className="om-att-title">{i.title} <AdjustFlag notes={i.adjust} size="sm" /></span>
                <span className="om-meta">{monthText(i.month)}</span>
                <span className="om-att-bar"><ProgressBar i={i} /></span>
                <span className="om-meta" style={{ minWidth: 40, textAlign: "right" }}>{s.progress}%</span>
              </div>
            );
          })}
        </div>
      </section>
      {sel && <InitiativeSlideOver i={sel} onClose={() => setSel(null)} />}
    </div>
  );
}
