import { useMemo } from "react";
import {
  FEATURES, MONTHS, TODAY_MONTH, TRACK_META,
  type Track, type Subtask,
} from "@/data/ganttData";
import { MONTHLY_GOALS, type MonthlyGoal } from "@/data/monthlyGoals";

// Índice global key → subtask (status + blocked), alimentado pelo sync semanal
function useSubtaskIndex(): Map<string, Subtask> {
  return useMemo(() => {
    const map = new Map<string, Subtask>();
    for (const f of FEATURES) for (const s of f.subtasks) if (!map.has(s.key)) map.set(s.key, s);
    return map;
  }, []);
}

interface GoalStats {
  progress: number;
  done: number;
  total: number;
  blockedKeys: { key: string; title: string }[];
  missingKeys: string[];
}

function computeStats(goal: MonthlyGoal, index: Map<string, Subtask>): GoalStats {
  let done = 0, ip = 0, total = 0;
  const blockedKeys: { key: string; title: string }[] = [];
  const missingKeys: string[] = [];
  for (const key of goal.jiraKeys) {
    const s = index.get(key);
    if (!s) { missingKeys.push(key); continue; }
    total++;
    if (s.status === "Done") done++;
    else if (s.status === "In Progress") ip++;
    if (s.blocked && s.status !== "Done") blockedKeys.push({ key: s.key, title: s.title });
  }
  const progress = total > 0 ? Math.round(((done + 0.5 * ip) / total) * 100) : 0;
  return { progress, done, total, blockedKeys, missingKeys };
}

function monthName(idx: number): string {
  const m = MONTHS[idx];
  return m ? `${m.label === "Jan" ? "Janeiro" : m.label === "Fev" ? "Fevereiro" : m.label === "Mar" ? "Março" : m.label === "Abr" ? "Abril" : m.label === "Mai" ? "Maio" : m.label === "Jun" ? "Junho" : m.label === "Jul" ? "Julho" : m.label === "Ago" ? "Agosto" : m.label === "Set" ? "Setembro" : m.label === "Out" ? "Outubro" : m.label === "Nov" ? "Novembro" : "Dezembro"}/${m.year}` : "—";
}

function GoalCard({ goal, stats }: { goal: MonthlyGoal; stats: GoalStats }) {
  const meta = TRACK_META[goal.track];
  const barColor = stats.progress >= 80 ? "#16a34a" : stats.progress >= 40 ? meta.color : "#f59e0b";
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderTop: `3px solid ${meta.color}`,
      borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
          textTransform: "uppercase", color: meta.color, background: meta.bg,
          borderRadius: 999, padding: "3px 10px",
        }}>
          {goal.label ?? meta.short}
        </span>
        {goal.eta && (
          <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>
            Previsão: {goal.eta}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{goal.title}</div>
        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{goal.description}</div>
      </div>

      {goal.deliveries && goal.deliveries.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {goal.deliveries.map((d, i) => (
            <li key={i} style={{ display: "flex", gap: 8, alignItems: "baseline", fontSize: 12.5, lineHeight: 1.45 }}>
              <span style={{ color: d.pending ? "#d97706" : "#16a34a", fontWeight: 700, flexShrink: 0 }}>
                {d.pending ? "↻" : "✓"}
              </span>
              <span style={{ color: "#334155", flex: 1 }}>
                {d.text}
                {d.pending && <em style={{ color: "#d97706", fontStyle: "normal", fontWeight: 600 }}> · em andamento</em>}
              </span>
              <span style={{
                flexShrink: 0, fontSize: 10.5, fontWeight: 600, color: "#64748b",
                background: "#f1f5f9", borderRadius: 999, padding: "2px 8px", whiteSpace: "nowrap",
              }}>
                {d.epic}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: barColor }}>{stats.progress}%</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>{stats.done} de {stats.total} tarefas concluídas</span>
        </div>
        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${Math.max(stats.progress, 2)}%`, height: "100%", background: barColor, borderRadius: 999 }} />
        </div>
      </div>

      {(stats.blockedKeys.length > 0 || (goal.extraBlockers?.length ?? 0) > 0) ? (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c", marginBottom: 4 }}>
            ⚠ {stats.blockedKeys.length + (goal.extraBlockers?.length ?? 0)} bloqueio{stats.blockedKeys.length + (goal.extraBlockers?.length ?? 0) > 1 ? "s" : ""}
          </div>
          {stats.blockedKeys.map(b => (
            <div key={b.key} style={{ fontSize: 12, color: "#991b1b", lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>{b.key}</span> · {b.title}
            </div>
          ))}
          {goal.extraBlockers?.map((t, i) => (
            <div key={i} style={{ fontSize: 12, color: "#991b1b", lineHeight: 1.5 }}>{t}</div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>✓ Sem bloqueios</div>
      )}
    </div>
  );
}

export default function GanttGoalsView() {
  const index = useSubtaskIndex();

  const byMonth = useMemo(() => {
    const map = new Map<number, MonthlyGoal[]>();
    for (const g of MONTHLY_GOALS) {
      if (!map.has(g.month)) map.set(g.month, []);
      map.get(g.month)!.push(g);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]); // mês atual (entregas) antes do planejamento
  }, []);

  const TRACK_ORDER: Track[] = ["migracao", "evolucao", "cdp"];

  return (
    <div className="g-page">
      <div className="g-page-head">
        <h1 className="g-page-title">Entrega do Mês</h1>
        <p className="g-page-sub">
          Objetivo mensal por frente de trabalho · % de conclusão e bloqueios calculados ao vivo do Jira
        </p>
      </div>

      {byMonth.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
          Nenhum objetivo cadastrado ainda — registre os objetivos do próximo mês em src/data/monthlyGoals.ts.
        </div>
      )}

      {byMonth.map(([month, goals]) => {
        const isNext = month === TODAY_MONTH + 1;
        const isCurrent = month === TODAY_MONTH;
        const badge = isNext ? "Planejamento" : isCurrent ? "Mês atual · entregas" : null;
        const sorted = [...goals].sort(
          (a, b) => TRACK_ORDER.indexOf(a.track) - TRACK_ORDER.indexOf(b.track)
        );
        return (
          <section key={month} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>{monthName(month)}</h2>
              {badge && (
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3,
                  color: isNext ? "#1d4ed8" : "#a16207",
                  background: isNext ? "#dbeafe" : "#fef3c7",
                  borderRadius: 999, padding: "3px 10px",
                }}>
                  {badge}
                </span>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
              {sorted.map(g => (
                <GoalCard key={`${g.month}-${g.track}`} goal={g} stats={computeStats(g, index)} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
