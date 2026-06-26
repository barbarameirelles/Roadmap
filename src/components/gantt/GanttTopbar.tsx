type Tab = "roadmap" | "exec" | "monthly" | "kanban" | "sprint" | "timeline";

interface Props {
  activeTab: Tab;
  onTab: (tab: Tab) => void;
}

function RoadmapIcon() {
  return (
    <svg className="g-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="6" width="9" height="3" rx="1" />
      <rect x="7" y="11" width="11" height="3" rx="1" />
      <rect x="5" y="16" width="14" height="3" rx="1" />
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

function MonthlyIcon() {
  return (
    <svg className="g-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l5-6 4 3 5-7 4 4" />
      <path d="M3 21h18" />
      <circle cx="8" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" stroke="none" />
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

function SprintIcon() {
  return (
    <svg className="g-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="7" y1="13" x2="10" y2="13" />
      <line x1="7" y1="17" x2="12" y2="17" />
    </svg>
  );
}

function TimelineIcon() {
  return (
    <svg className="g-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <circle cx="7"  cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="13" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="2" fill="currentColor" stroke="none" />
      <line x1="7"  y1="12" x2="7"  y2="7"  />
      <line x1="13" y1="12" x2="13" y2="17" />
      <line x1="19" y1="12" x2="19" y2="7"  />
      <rect x="4"  y="4"  width="6" height="3" rx="1" />
      <rect x="10" y="17" width="6" height="3" rx="1" />
      <rect x="16" y="4"  width="6" height="3" rx="1" />
    </svg>
  );
}

export default function GanttTopbar({ activeTab, onTab }: Props) {
  const TABS: { id: Tab; title: string; sub: string; Icon: () => JSX.Element }[] = [
    { id: "roadmap",  title: "Roadmap",        sub: "Visualização mensal do projeto",   Icon: RoadmapIcon  },
    { id: "exec",     title: "Visão Executiva", sub: "% planejado vs % entregue",        Icon: ExecIcon     },
    { id: "monthly",  title: "Evolução Mensal", sub: "Planejado vs realizado · forecast", Icon: MonthlyIcon  },
    { id: "timeline", title: "Timeline",        sub: "Entregas em linha do tempo",        Icon: TimelineIcon },
    { id: "kanban",   title: "Kanban",          sub: "To do · In progress · Done",       Icon: KanbanIcon   },
    { id: "sprint",   title: "Sprints",         sub: "Entregas por sprint",               Icon: SprintIcon   },
  ];

  return (
    <div className="g-topbar">
      <div className="g-topbar-inner">
        <div className="g-brand">
          <div className="g-brand-logo">R</div>
          <span>Roadmap</span>
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
      </div>
    </div>
  );
}
