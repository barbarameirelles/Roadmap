// Helpers compartilhados entre GanttExecView e GanttMonthlyView.
// Fonte única de cálculo: qualquer mudança de fórmula reflete em todo lugar.
import { TODAY_MONTH, type Feature } from "./ganttData";

export function plannedFrac(f: Feature, m: number): number {
  const span = Math.max(f.planned.end - f.planned.start + 1, 1);
  return Math.min(Math.max((m - f.planned.start + 1) / span, 0), 1);
}

// ── Fórmula única de % (todas as abas) ───────────────────────────────────────
// Done vale 1; In Progress e Bloqueado valem 0,5 (bloqueado é trabalho iniciado
// que parou); To Do vale 0. Assim o % anda junto com o trabalho em curso.
export const IN_PROGRESS_WEIGHT = 0.5;

type ProgressItem = { status: string; blocked?: boolean };

export function progressBreakdown(subs: ProgressItem[]) {
  const total = subs.length;
  const done = subs.filter(s => s.status === "Done").length;
  const inProgress = subs.filter(s => s.status === "In Progress" && !s.blocked).length;
  // Bloqueio chega como status "Blocked" (Entrega do Mês) ou flag `blocked` (épicos).
  const blocked = subs.filter(s => s.status !== "Done" && (s.blocked || s.status === "Blocked")).length;
  if (total === 0) return { total, done, inProgress, blocked, donePct: 0, inProgressPct: 0, progress: 0 };
  const progress = Math.round((done + IN_PROGRESS_WEIGHT * (inProgress + blocked)) / total * 100);
  const donePct = Math.round(done / total * 100);
  // Fatia da barra do andamento = parte ponderada, então barra total = progress.
  const inProgressPct = Math.max(progress - donePct, 0);
  return { total, done, inProgress, blocked, donePct, inProgressPct, progress };
}

export function weightedProgress(subs: ProgressItem[]): number {
  return progressBreakdown(subs).progress;
}

// Progresso real baseado em tasks (ponderado). Concluídos = 100%.
// Sem tasks: usa o campo progress manual (sync Jira).
export function taskProgress(f: Feature): number {
  if (f.status === "concluido") return 100;
  // Backlog parkado (executed:null + progress:0) enquanto nenhuma tarefa começou;
  // com tarefa entregue/em andamento vale o % real (consistente com o overlay).
  const started = f.subtasks.some(s => s.status === "Done" || s.status === "In Progress");
  if (f.executed === null && f.progress === 0 && !started) return f.progress;
  const n = f.subtasks.length;
  if (n === 0) return f.progress;
  return weightedProgress(f.subtasks);
}

export function isBehind(f: Feature): boolean {
  const tp = taskProgress(f);
  if (tp >= 100) return false;
  return tp / 100 < plannedFrac(f, TODAY_MONTH) * 0.7;
}

// Distribui o taskProgress ao longo da janela de execução (para o S-curve).
export function realizedFrac(f: Feature, m: number): number {
  const p = taskProgress(f) / 100;
  if (f.executed) {
    const span = Math.max(f.executed.end - f.executed.start + 1, 1);
    return p * Math.min(Math.max((m - f.executed.start + 1) / span, 0), 1);
  }
  return m >= TODAY_MONTH ? p : 0;
}

// Velocidade de progresso mensal — reflete drag da CDP em Jul-Dez/26.
export function monthVel(mm: number): number {
  if (mm >= 7) return 0.25;
  return mm === 6 ? 0.3 : 1;
}

export function forecastFrac(f: Feature, targetMonth: number): number {
  const tp = taskProgress(f);
  if (tp >= 100) return 1;
  const span = f.planned.end - f.planned.start + 1;
  const due = f.planned.end + (isBehind(f) ? Math.ceil(0.6 * span) : 0);
  const nominal = (1 - tp / 100) / Math.max(due - TODAY_MONTH, 1);
  let prog = tp / 100;
  for (let mm = TODAY_MONTH + 1; mm <= targetMonth; mm++) {
    prog = Math.min(Math.max(prog + nominal * monthVel(mm), 0), 1);
  }
  return prog;
}

// "READY TO DEPLOY" → "Ready to Deploy"; siglas curtas (QA) e nomes já formatados ficam como estão.
const SMALL_WORDS = new Set(["to", "de", "do", "da", "em", "e", "of", "in"]);
export function stageLabel(name: string): string {
  const n = name.trim();
  if (n !== n.toUpperCase() || n.length <= 3) return n;
  return n.toLowerCase().split(/\s+/)
    .map((w, i) => i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
