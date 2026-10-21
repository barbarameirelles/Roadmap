import { useState } from "react";
import type { OmniInitiative } from "@/data/omni/types";
import {
  AdjustFlag, InitiativeSlideOver, ProductTags, ProgressBar,
  initiativeStats, monthText, useOmniInitiatives, type OmniFilter,
} from "./omniShared";

type Col = "todo" | "in-progress" | "blocked" | "validation" | "done";
const COLS: { id: Col; title: string; color: string }[] = [
  { id: "todo",        title: "A fazer",      color: "#64748b" },
  { id: "in-progress", title: "Em andamento", color: "#2563eb" },
  { id: "blocked",     title: "Bloqueado",    color: "#dc2626" },
  { id: "validation",  title: "Validação",    color: "#7c3aed" },
  { id: "done",        title: "Concluído",    color: "#16a34a" },
];

// Mesma regra do Kanban do XP: qualquer tarefa em andamento → "Em andamento";
// ≥80% → validação; só bloqueios → bloqueado.
function columnOf(i: OmniInitiative): Col {
  const s = initiativeStats(i);
  if (s.total > 0 && s.done === s.total) return "done";
  if (i.items.some(x => x.status === "In Progress")) return "in-progress";
  if (s.progress >= 80) return "validation";
  if (s.blocked > 0) return "blocked";
  return "todo";
}

function KCard({ i, onClick }: { i: OmniInitiative; onClick: () => void }) {
  const s = initiativeStats(i);
  return (
    <div className="om-kcard" role="button" tabIndex={0} onClick={onClick} onKeyDown={e => e.key === "Enter" && onClick()}>
      <div className="om-row-between"><ProductTags i={i} /><AdjustFlag notes={i.adjust} size="sm" /></div>
      <div className="om-kcard-title">{i.title}</div>
      <div className="om-row-between om-meta"><span>{monthText(i.month)}</span><span>{s.progress}% · {s.done}/{s.total}</span></div>
      <ProgressBar i={i} />
      {s.blocked > 0 && <div className="om-meta" style={{ color: "#b91c1c", fontWeight: 600 }}>⚠ {s.blocked} bloqueio{s.blocked > 1 ? "s" : ""}</div>}
    </div>
  );
}

export default function OmniKanbanView({ filter }: { filter: OmniFilter }) {
  const all = useOmniInitiatives(filter);
  const [sel, setSel] = useState<OmniInitiative | null>(null);
  // Épicos sem tarefas e sem andamento ficam só em Hipóteses (já filtrados na geração).
  const withTasks = all;

  return (
    <div className="g-page">
      <div className="g-page-head">
        <h1 className="g-page-title">Kanban</h1>
        <p className="g-page-sub">Uma iniciativa por card (épico do GitLab ou agrupamento sugerido) · coluna calculada pelas tarefas</p>
      </div>
      <div className="om-kanban">
        {COLS.map(c => {
          const items = withTasks.filter(i => columnOf(i) === c.id);
          return (
            <div key={c.id} className="om-kcol">
              <div className="om-kcol-head" style={{ borderTopColor: c.color }}>
                <span style={{ color: c.color }}>{c.title}</span><span className="om-meta">{items.length}</span>
              </div>
              <div className="om-kcol-body">
                {items.map(i => <KCard key={i.id} i={i} onClick={() => setSel(i)} />)}
              </div>
            </div>
          );
        })}
      </div>
      {sel && <InitiativeSlideOver i={sel} onClose={() => setSel(null)} />}
    </div>
  );
}
