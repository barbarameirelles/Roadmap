// Helpers compartilhados entre GanttExecView e GanttMonthlyView.
// Fonte única de cálculo: qualquer mudança de fórmula reflete em todo lugar.
import { TODAY_MONTH, type Feature } from "./ganttData";

export function plannedFrac(f: Feature, m: number): number {
  const span = Math.max(f.planned.end - f.planned.start + 1, 1);
  return Math.min(Math.max((m - f.planned.start + 1) / span, 0), 1);
}

// ── Fórmula única de % (todas as abas) ───────────────────────────────────────
// Done vale 1, In Progress vale 0,5, To Do/Blocked vale 0. Assim o % anda junto
// com o trabalho em curso, e não só com o que já foi entregue.
export const IN_PROGRESS_WEIGHT = 0.5;

export function progressBreakdown(subs: { status: string }[]) {
  const total = subs.length;
  const done = subs.filter(s => s.status === "Done").length;
  const inProgress = subs.filter(s => s.status === "In Progress").length;
  if (total === 0) return { total, done, inProgress, donePct: 0, inProgressPct: 0, progress: 0 };
  const progress = Math.round((done + IN_PROGRESS_WEIGHT * inProgress) / total * 100);
  const donePct = Math.round(done / total * 100);
  // Fatia da barra do andamento = parte ponderada, então barra total = progress.
  const inProgressPct = Math.max(progress - donePct, 0);
  return { total, done, inProgress, donePct, inProgressPct, progress };
}

export function weightedProgress(subs: { status: string }[]): number {
  return progressBreakdown(subs).progress;
}

// Progresso real baseado em tasks (ponderado). Concluídos = 100%.
// Sem tasks: usa o campo progress manual (sync Jira).
export function taskProgress(f: Feature): number {
  if (f.status === "concluido") return 100;
  // Backlog parkado (executed:null + progress:0, ex.: cdp-2b): mantém o campo
  // (0), mesmo tendo subtasks Done herdadas — consistente com Kanban/overlay.
  if (f.executed === null && f.progress === 0) return f.progress;
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
