import { useState } from "react";
import {
  CDP_EPICS, MONTHS, QUARTERS, STATUS_META, TODAY_MONTH,
  type FeatureStatus, type CDPEpic, type CDPSubItem,
} from "@/data/cdpData";

function pct(start: number, end: number): [number, number] {
  const total = MONTHS.length;
  return [(start / total) * 100, ((end - start + 1) / total) * 100];
}

interface TooltipData {
  x: number; y: number;
  title: string;
  rows: [string, string][];
  progress?: number;
}

function Tooltip({ data }: { data: TooltipData | null }) {
  if (!data) return null;
  return (
    <div className="g-tooltip" style={{ left: data.x + 14, top: data.y + 14 }}>
      <div className="tt-title">{data.title}</div>
      {data.rows.map((r, i) => (
        <div className="tt-row" key={i}>
          <span>{r[0]}</span>
          <b>{r[1]}</b>
        </div>
      ))}
      {typeof data.progress === "number" && (
        <div className="tt-bar"><div style={{ width: data.progress + "%" }} /></div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: FeatureStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="g-status-badge" style={{ background: m.bg, color: m.fg }}>
      <span style={{ fontSize: 11 }}>{m.icon}</span>
      {m.label}
    </span>
  );
}

function monthLabel(idx: number) {
  const m = MONTHS[idx];
  return `${m.label}/${String(m.year).slice(2)}`;
}

function SubItemRow({
  item,
  setTooltip,
}: {
  item: CDPSubItem;
  setTooltip: (d: TooltipData | null) => void;
}) {
  const total = MONTHS.length;
  const [l, w] = pct(item.planned.start, item.planned.end);

  const onHover = (e: React.MouseEvent) => {
    setTooltip({
      x: e.clientX, y: e.clientY,
      title: item.name,
      rows: [
        ["Período", `${monthLabel(item.planned.start)} → ${monthLabel(item.planned.end)}`],
        ["Status", STATUS_META[item.status].label],
      ],
      progress: item.progress,
    });
  };

  return (
    <div className="g-gantt-row cdp-subitem-row">
      <div className="g-feat-cell">
        <div className="g-feat-meta" style={{ paddingLeft: 32 }}>
          <div className="g-feat-name" style={{ fontSize: 13, color: "var(--g-ink-2)" }}>
            <span style={{ marginRight: 6, color: "var(--g-ink-3)" }}>↳</span>
            {item.name}
          </div>
          {item.progress > 0 && (
            <div className="g-feat-progress">
              <div className="g-feat-progress-bar">
                <div className="seg done" style={{ width: item.progress + "%" }} />
              </div>
              <span className="g-feat-progress-label">{item.progress}% concluído</span>
            </div>
          )}
        </div>
      </div>

      <div className="g-tl-cell">
        <div className="g-tl-grid">
          {MONTHS.map(m => {
            const qend = m.idx === 2 || m.idx === 5 || m.idx === 8 || m.idx === 11;
            return <div key={m.idx} className={"g-tl-month-bg" + (qend ? " qend" : "")} />;
          })}
        </div>
        <div
          className="g-tl-today"
          style={{ left: ((TODAY_MONTH + 0.5) / total) * 100 + "%" }}
        />
        <div className="g-tl-bars">
          <div
            className="g-bar planned"
            style={{ left: l + "%", width: w + "%" }}
            onMouseMove={onHover}
            onMouseLeave={() => setTooltip(null)}
          />
        </div>
      </div>

      <div className="g-status-cell">
        <StatusBadge status={item.status} />
      </div>
    </div>
  );
}

function EpicRow({
  epic,
  expanded,
  onToggle,
  setTooltip,
}: {
  epic: CDPEpic;
  expanded: boolean;
  onToggle: (id: string) => void;
  setTooltip: (d: TooltipData | null) => void;
}) {
  const total = MONTHS.length;
  const [l, w] = pct(epic.planned.start, epic.planned.end);
  const hasSubitems = epic.subitems.length > 0;

  const onHover = (e: React.MouseEvent) => {
    setTooltip({
      x: e.clientX, y: e.clientY,
      title: epic.name,
      rows: [
        ["Período", `${monthLabel(epic.planned.start)} → ${monthLabel(epic.planned.end)}`],
        ["Status", STATUS_META[epic.status].label],
        ...(epic.subitems.length > 0
          ? [["Sub-itens", String(epic.subitems.length)] as [string, string]]
          : []),
      ],
      progress: epic.progress,
    });
  };

  return (
    <>
      <div className="g-gantt-row cdp-epic-row">
        <div className="g-feat-cell">
          <button
            className={"g-feat-caret" + (expanded ? " open" : "") + (!hasSubitems ? " invisible" : "")}
            onClick={() => hasSubitems && onToggle(epic.id)}
            disabled={!hasSubitems}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
          <div className="g-feat-meta">
            <div className="g-feat-name" style={{ fontWeight: 600 }}>{epic.name}</div>
            {epic.subitems.length > 0 && (
              <div className="g-feat-sub">
                <span className="g-epic-tag">{epic.subitems.length} sub-itens</span>
              </div>
            )}
            {epic.progress > 0 && (
              <div className="g-feat-progress">
                <div className="g-feat-progress-bar">
                  <div className="seg done" style={{ width: epic.progress + "%" }} />
                </div>
                <span className="g-feat-progress-label">{epic.progress}% concluído</span>
              </div>
            )}
          </div>
        </div>

        <div className="g-tl-cell">
          <div className="g-tl-grid">
            {MONTHS.map(m => {
              const qend = m.idx === 2 || m.idx === 5 || m.idx === 8 || m.idx === 11;
              return <div key={m.idx} className={"g-tl-month-bg" + (qend ? " qend" : "")} />;
            })}
          </div>
          <div
            className="g-tl-today"
            style={{ left: ((TODAY_MONTH + 0.5) / total) * 100 + "%" }}
          />
          <div className="g-tl-bars">
            <div
              className="g-bar planned"
              style={{ left: l + "%", width: w + "%" }}
              onMouseMove={onHover}
              onMouseLeave={() => setTooltip(null)}
            />
          </div>
        </div>

        <div className="g-status-cell">
          <StatusBadge status={epic.status} />
        </div>
      </div>

      {expanded && epic.subitems.map(sub => (
        <SubItemRow key={sub.id} item={sub} setTooltip={setTooltip} />
      ))}
    </>
  );
}

export default function GanttCDPView() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const totalEmAndamento = CDP_EPICS.filter(
    e => e.status === "em-andamento" || e.status === "atrasado-em-andamento",
  ).length;
  const totalConcluidos = CDP_EPICS.filter(e => e.status === "concluido").length;

  return (
    <div className="g-page">
      <div className="g-page-head">
        <h1 className="g-page-title">Roadmap Audience (CDP)</h1>
        <p className="g-page-sub">Audience (CDP) · Épicos e iniciativas</p>
      </div>

      <div className="g-kpi-grid">
        <div className="g-kpi">
          <div className="g-kpi-label">Total de Épicos</div>
          <div className="g-kpi-value g-tabular">{CDP_EPICS.length}</div>
        </div>
        <div className="g-kpi accent-green">
          <div className="g-kpi-label">Concluídos</div>
          <div className="g-kpi-value green g-tabular">{totalConcluidos}</div>
        </div>
        <div className="g-kpi accent-amber">
          <div className="g-kpi-label">Em Andamento</div>
          <div className="g-kpi-value amber g-tabular">{totalEmAndamento}</div>
        </div>
        <div className="g-kpi accent-red">
          <div className="g-kpi-label">Atrasados</div>
          <div className="g-kpi-value red g-tabular">
            {CDP_EPICS.filter(e => e.status === "atrasado" || e.status === "atrasado-em-andamento").length}
          </div>
        </div>
      </div>

      <div className="g-gantt-card">
        {/* Header */}
        <div className="g-gantt-head">
          <div className="col-feature">Épico</div>
          <div className="col-timeline">
            <div className="g-gantt-quarters">
              {QUARTERS.map(q => (
                <div key={q.id} className="g-gantt-quarter">{q.label}</div>
              ))}
            </div>
            <div className="g-gantt-months">
              {MONTHS.map(m => (
                <div
                  key={m.idx}
                  className={"g-gantt-month" + (m.idx === TODAY_MONTH ? " is-today" : "")}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>
          <div className="col-status">Status</div>
        </div>

        {/* Legend */}
        <div className="g-legend-row">
          <div className="feature-col-spacer" />
          <div style={{ display: "flex", gap: 18 }}>
            <span className="g-legend"><span className="g-legend-swatch planned" />Planejado</span>
          </div>
        </div>

        {/* Rows */}
        {CDP_EPICS.map(epic => (
          <EpicRow
            key={epic.id}
            epic={epic}
            expanded={!!expanded[epic.id]}
            onToggle={toggle}
            setTooltip={setTooltip}
          />
        ))}
      </div>

      <Tooltip data={tooltip} />
    </div>
  );
}
