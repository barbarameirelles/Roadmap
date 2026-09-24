// Dados dos tickets operacionais por trilha e mês.
// SLA = 5 dias úteis. Fonte: POS-221 + FRONT-132 (Plataforma) | POS-3461 + FRONT-124 (SMB)

export interface MonthStats {
  month: string;   // "2026-07"
  label: string;   // "Julho"
  volume: number;
  done: number;
  withinSla: number;
  outsideSla: number;
  open: number;
  blocked: number;
  atRisk: number;  // abertos já fora do SLA (> 5 dias úteis)
  jiraUrl: string;
}

export interface TrackData {
  id: "smb" | "plataforma";
  label: string;
  description: string;
  months: MonthStats[];
}

const JIRA = "https://wake-experience.atlassian.net/issues?jql=";
const enc = encodeURIComponent;

export const PLATAFORMA: TrackData = {
  id: "plataforma",
  label: "Plataforma",
  description: "1.0 · 2.0 · Audience",
  months: [
    {
      month: "2026-07", label: "Julho",
      volume: 45, done: 44, withinSla: 37, outsideSla: 7, open: 1, blocked: 0, atRisk: 1,
      jiraUrl: JIRA + enc('parentEpic in (POS-221, FRONT-132) AND created >= "2026-07-01" AND created < "2026-08-01" ORDER BY created DESC'),
    },
    {
      month: "2026-08", label: "Agosto",
      volume: 30, done: 30, withinSla: 26, outsideSla: 4, open: 0, blocked: 0, atRisk: 0,
      jiraUrl: JIRA + enc('parentEpic in (POS-221, FRONT-132) AND created >= "2026-08-01" AND created < "2026-09-01" ORDER BY created DESC'),
    },
    {
      month: "2026-09", label: "Setembro",
      volume: 24, done: 20, withinSla: 16, outsideSla: 3, open: 4, blocked: 0, atRisk: 0,
      jiraUrl: JIRA + enc('parentEpic in (POS-221, FRONT-132) AND created >= "2026-09-01" AND created < "2026-10-01" ORDER BY created DESC'),
    },
  ],
};

export const SMB: TrackData = {
  id: "smb",
  label: "SMB",
  description: "Tray · Bagy · KingHost",
  months: [
    {
      month: "2026-07", label: "Julho",
      volume: 5, done: 4, withinSla: 0, outsideSla: 2, open: 1, blocked: 1, atRisk: 1,
      jiraUrl: JIRA + enc('parentEpic in (POS-3461, FRONT-124) AND created >= "2026-07-01" AND created < "2026-08-01" ORDER BY created DESC'),
    },
    {
      month: "2026-08", label: "Agosto",
      volume: 28, done: 12, withinSla: 1, outsideSla: 8, open: 16, blocked: 9, atRisk: 16,
      jiraUrl: JIRA + enc('parentEpic in (POS-3461, FRONT-124) AND created >= "2026-08-01" AND created < "2026-09-01" ORDER BY created DESC'),
    },
    {
      month: "2026-09", label: "Setembro",
      volume: 17, done: 6, withinSla: 5, outsideSla: 1, open: 11, blocked: 2, atRisk: 9,
      jiraUrl: JIRA + enc('parentEpic in (POS-3461, FRONT-124) AND created >= "2026-09-01" AND created < "2026-10-01" ORDER BY created DESC'),
    },
  ],
};

export const OPS_TRACKS: TrackData[] = [PLATAFORMA, SMB];
export const OPS_MONTHS = PLATAFORMA.months.map(m => ({ month: m.month, label: m.label }));

export function slaPercent(stats: MonthStats): number | null {
  const measured = stats.withinSla + stats.outsideSla;
  if (measured === 0) return null;
  return Math.round((stats.withinSla / measured) * 100);
}

export function slaColor(pct: number | null): "green" | "amber" | "red" | "gray" {
  if (pct === null) return "gray";
  if (pct >= 80) return "green";
  if (pct >= 60) return "amber";
  return "red";
}
