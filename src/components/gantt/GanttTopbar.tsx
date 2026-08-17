type Tab = "goals" | "exec" | "kanban";

interface Props {
  activeTab: Tab;
  onTab: (tab: Tab) => void;
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

export default function GanttTopbar({ activeTab, onTab }: Props) {
  const TABS: { id: Tab; title: string; sub: string; Icon: () => JSX.Element }[] = [
    { id: "goals",   title: "Entrega do Mês",  sub: "Objetivo mensal por frente",       Icon: GoalsIcon   },
    { id: "exec",    title: "Visão Executiva", sub: "Os 3 objetivos · evolução mensal", Icon: ExecIcon    },
    { id: "kanban",  title: "Kanban",          sub: "Visão operacional do time",        Icon: KanbanIcon  },
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
