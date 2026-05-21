type Tab = "roadmap" | "exec";

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


export default function GanttTopbar({ activeTab, onTab }: Props) {
  const TABS: { id: Tab; title: string; sub: string; Icon: () => JSX.Element }[] = [
    { id: "roadmap", title: "Roadmap",        sub: "Visualização mensal do projeto",   Icon: RoadmapIcon },
    { id: "exec",    title: "Visão Executiva", sub: "% planejado vs % entregue",        Icon: ExecIcon    },
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
