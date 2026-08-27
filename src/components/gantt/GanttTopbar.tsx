import { useRoadmap } from "@/lib/RoadmapContext";

type Tab = "goals" | "exec" | "kanban" | "hypotheses";

interface Props {
  activeTab: Tab;
  onTab: (tab: Tab) => void;
  onHome?: () => void;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

function SyncButton() {
  const { sync, syncing, syncedAt, message, live } = useRoadmap();
  return (
    <div className="g-sync">
      <button className="g-sync-btn" onClick={() => sync()} disabled={syncing} title="Sincronizar com o Jira">
        <svg className={"g-sync-icon" + (syncing ? " spin" : "")} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-2.6-6.4" />
          <path d="M21 3v6h-6" />
        </svg>
        {syncing ? "Sincronizando…" : "Sincronizar"}
      </button>
      <span className="g-sync-meta">
        {message ? message : live && syncedAt ? `Atualizado ${relativeTime(syncedAt)}` : "Dados locais"}
      </span>
    </div>
  );
}

function GoalsIcon() {
  return (
    <svg className="g-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ExecIcon() {
  return (
    <svg className="g-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17l5-5 4 4 7-9" />
      <path d="M14 7h6v6" />
    </svg>
  );
}

function KanbanIcon() {
  return (
    <svg className="g-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2"  y="3" width="6" height="13" rx="1" />
      <rect x="9"  y="3" width="6" height="18" rx="1" />
      <rect x="16" y="3" width="6" height="9"  rx="1" />
    </svg>
  );
}

function HypothesesIcon() {
  return (
    <svg className="g-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a3 3 0 0 1 5.5 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function GanttTopbar({ activeTab, onTab, onHome }: Props) {
  const TABS: { id: Tab; title: string; sub: string; Icon: () => JSX.Element }[] = [
    { id: "hypotheses",  title: "Hipóteses",       sub: "Backlog · pedidos de clientes",    Icon: HypothesesIcon  },
    { id: "goals",       title: "Entrega do Mês",  sub: "Objetivo mensal por frente",       Icon: GoalsIcon       },
    { id: "kanban",      title: "Kanban",          sub: "Visão operacional do time",        Icon: KanbanIcon      },
    { id: "exec",        title: "Visão Executiva", sub: "Os 3 objetivos · evolução mensal", Icon: ExecIcon        },
  ];

  return (
    <div className="g-topbar">
      <div className="g-topbar-inner">
        <div className="g-brand">
          {onHome ? (
            <button
              className="g-brand-logo g-brand-back"
              onClick={onHome}
              title="Voltar à tela inicial"
              aria-label="Voltar à tela inicial"
            >
              ←
            </button>
          ) : (
            <div className="g-brand-logo">R</div>
          )}
          <span>Wake XP + Audience</span>
        </div>
        <div className="g-tabs">
          {TABS.map(({ id, title, sub, Icon }) => (
            <button
              key={id}
              className={"g-tab" + (activeTab === id ? " active" : "")}
              onClick={() => onTab(id)}
            >
              <Icon />
              <div className="g-tab-block">
                <span className="g-tab-title">{title}</span>
                <span className="g-tab-sub">{sub}</span>
              </div>
            </button>
          ))}
        </div>
        <SyncButton />
      </div>
    </div>
  );
}
