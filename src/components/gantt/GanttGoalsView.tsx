import { useMemo, useState } from "react";
import { TODAY_MONTH } from "@/data/ganttData";
import {
  FEATURE_META,
  DEFAULT_FEATURE_META,
  type MonthDelivery,
  type FeatureGroup,
  type IssueStatus,
} from "@/data/labeledDeliveries";
import { useRoadmap } from "@/lib/RoadmapContext";

// ── Helpers ──────────────────────────────────────────────────────────────────

function featureMeta(feature: string) {
  return FEATURE_META[feature] ?? DEFAULT_FEATURE_META;
}

function groupStats(group: FeatureGroup) {
  const total = group.issues.length;
  const done = group.issues.filter(i => i.status === "Done").length;
  const blocked = group.issues.filter(i => i.blocked).length;
  const inProgress = group.issues.filter(i => i.status === "In Progress").length;
  const todo = total - done - inProgress - blocked;
  const progress = total === 0 ? 0 : Math.round(done / total * 100);
  return { total, done, blocked, inProgress, todo, progress };
}

function monthName(monthLabel: string, year: number) {
  const names: Record<string, string> = {
    Agosto: "Agosto", Setembro: "Setembro", Outubro: "Outubro",
    Novembro: "Novembro", Dezembro: "Dezembro", Janeiro: "Janeiro",
    Fevereiro: "Fevereiro", Março: "Março", Abril: "Abril",
    Maio: "Maio", Junho: "Junho", Julho: "Julho",
  };
  return `${names[monthLabel] ?? monthLabel}/${year}`;
}

const STATUS_CFG: Record<IssueStatus, { label: string; bg: string; color: string; dot: string }> = {
  "Done":        { label: "Concluído",    bg: "#dcfce7", color: "#166534", dot: "#16a34a" },
  "In Progress": { label: "Em andamento", bg: "#dbeafe", color: "#1e40af", dot: "#2563eb" },
  "To Do":       { label: "A fazer",      bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  "Blocked":     { label: "Bloqueado",    bg: "#fee2e2", color: "#b91c1c", dot: "#dc2626" },
};

// ── Slide-over ───────────────────────────────────────────────────────────────

function FeatureSlideOver({ group, onClose }: { group: FeatureGroup; onClose: () => void }) {
  const meta = featureMeta(group.feature);
  const stats = groupStats(group);
  const barColor = stats.progress >= 80 ? "#16a34a" : stats.progress >= 40 ? meta.color : "#f59e0b";

  const byStatus: Record<IssueStatus, typeof group.issues> = {
    "Blocked":     group.issues.filter(i => i.status === "Blocked"),
    "In Progress": group.issues.filter(i => i.status === "In Progress"),
    "To Do":       group.issues.filter(i => i.status === "To Do"),
    "Done":        group.issues.filter(i => i.status === "Done"),
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(15,23,42,0.42)", zIndex: 200, backdropFilter: "blur(2px)",
      }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 580,
        background: "#fff", zIndex: 201,
        overflowY: "auto", boxShadow: "-4px 0 32px rgba(15,23,42,0.14)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Sticky header */}
        <div style={{
          padding: "18px 24px 16px", borderBottom: "1px solid #e2e8f0",
          borderTop: `4px solid ${meta.color}`, position: "sticky", top: 0,
          background: "#fff", zIndex: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
                textTransform: "uppercase", color: meta.color, background: meta.bg,
                borderRadius: 999, padding: "3px 10px",
              }}>
                {meta.label}
              </span>
              {group.eta && (
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>
                  Previsão: {group.eta}
                </span>
              )}
            </div>
            <button onClick={onClose} style={{
              width: 28, height: 28, border: "1px solid #e2e8f0", borderRadius: 6,
              background: "#f8fafc", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "#64748b", fontSize: 18, lineHeight: 1, flexShrink: 0,
            }}>×</button>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
            {meta.label}
          </h2>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0, lineHeight: 1.6, whiteSpace: "pre-line" }}>
            {group.description}
          </p>
        </div>

        {/* Contexto de negócio */}
        <div style={{ padding: "14px 24px", background: "#fafbfd", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.06em", color: "#64748b",
            marginBottom: 7, display: "flex", alignItems: "center", gap: 6,
          }}>
            <span>💡</span> Por que isso importa
          </div>
          <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.65, margin: 0 }}>
            {group.context}
          </p>
        </div>

        {/* Progresso */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: barColor }}>{stats.progress}%</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{stats.done} de {stats.total} concluídas</span>
          </div>
          <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ width: `${Math.max(stats.progress, 2)}%`, height: "100%", background: barColor, borderRadius: 999 }} />
          </div>
          {stats.blocked > 0 ? (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c" }}>
                ⚠ {stats.blocked} bloqueio{stats.blocked > 1 ? "s" : ""}
              </span>
            </div>
          ) : (
            <div style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>✓ Sem bloqueios</div>
          )}
        </div>

        {/* Issues por status */}
        <div style={{ padding: "16px 24px", flex: 1 }}>
          {(["Blocked", "In Progress", "To Do", "Done"] as IssueStatus[]).map(st => {
            const items = byStatus[st];
            if (items.length === 0) return null;
            const cfg = STATUS_CFG[st];
            return (
              <div key={st} style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.06em", color: cfg.color,
                  marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                  {cfg.label} ({items.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {items.map(issue => (
                    <div key={issue.key} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                      background: st === "Blocked" ? "#fef2f2" : "#fafbfd",
                      borderRadius: 8,
                      border: `1px solid ${st === "Blocked" ? "#fecaca" : "#f1f5f9"}`,
                    }}>
                      <a
                        href={`https://wake-experience.atlassian.net/browse/${issue.key}`}
                        target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          fontSize: 11, fontWeight: 600, color: "#2563eb",
                          background: "#eff6ff", borderRadius: 4, padding: "1px 6px",
                          flexShrink: 0, textDecoration: "none", whiteSpace: "nowrap",
                        }}
                      >
                        {issue.key}
                      </a>
                      <span style={{
                        flex: 1, fontSize: 12, color: st === "Done" ? "#94a3b8" : "#334155",
                        textDecoration: st === "Done" ? "line-through" : "none",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {issue.title}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg,
                        borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap", flexShrink: 0,
                      }}>
                        {cfg.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ group, onClick }: { group: FeatureGroup; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const meta = featureMeta(group.feature);
  const stats = groupStats(group);
  const barColor = stats.progress >= 80 ? "#16a34a" : stats.progress >= 40 ? meta.color : "#f59e0b";

  const activeIssues = group.issues.filter(i => i.status === "Blocked" || i.status === "In Progress").slice(0, 3);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderTop: `3px solid ${meta.color}`,
        borderRight:  `1px solid ${hovered ? meta.color + "55" : "#e2e8f0"}`,
        borderBottom: `1px solid ${hovered ? meta.color + "55" : "#e2e8f0"}`,
        borderLeft:   `1px solid ${hovered ? meta.color + "55" : "#e2e8f0"}`,
        borderRadius: 12, padding: "16px 18px",
        display: "flex", flexDirection: "column", gap: 12,
        cursor: "pointer",
        transition: "box-shadow 0.15s, border-color 0.15s",
        boxShadow: hovered ? "0 4px 18px rgba(15,23,42,0.10)" : "none",
      }}
    >
      {/* Badge + eta */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
          textTransform: "uppercase", color: meta.color, background: meta.bg,
          borderRadius: 999, padding: "3px 10px",
        }}>
          {meta.label}
        </span>
        {group.eta && (
          <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>
            Previsão: {group.eta}
          </span>
        )}
      </div>

      {/* Descrição */}
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55, whiteSpace: "pre-line" }}>
        {group.description}
      </div>

      {/* Contexto — preview */}
      <div style={{
        fontSize: 12, color: "#64748b", lineHeight: 1.5,
        borderLeft: `3px solid ${meta.color}44`, paddingLeft: 10,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {group.context}
      </div>

      {/* Progresso */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: barColor }}>{stats.progress}%</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>{stats.done}/{stats.total} concluídas</span>
        </div>
        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${Math.max(stats.progress, 2)}%`, height: "100%", background: barColor, borderRadius: 999 }} />
        </div>
      </div>

      {/* Status pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {stats.blocked > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "#b91c1c", background: "#fee2e2", borderRadius: 999, padding: "2px 8px" }}>
            ⚠ {stats.blocked} bloqueio{stats.blocked > 1 ? "s" : ""}
          </span>
        )}
        {stats.inProgress > 0 && (
          <span style={{ fontSize: 11, fontWeight: 600, color: "#1e40af", background: "#dbeafe", borderRadius: 999, padding: "2px 8px" }}>
            {stats.inProgress} em andamento
          </span>
        )}
        {stats.todo > 0 && (
          <span style={{ fontSize: 11, fontWeight: 600, color: "#475569", background: "#f1f5f9", borderRadius: 999, padding: "2px 8px" }}>
            {stats.todo} a fazer
          </span>
        )}
      </div>

      {/* Preview de issues ativas */}
      {activeIssues.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {activeIssues.map(issue => {
            const cfg = STATUS_CFG[issue.status];
            return (
              <li key={issue.key} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                <span style={{
                  fontSize: 11, fontWeight: 600, color: "#2563eb",
                  background: "#eff6ff", borderRadius: 3, padding: "0 4px", flexShrink: 0,
                }}>{issue.key}</span>
                <span style={{ fontSize: 11, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {issue.title}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Bloqueios ou OK */}
      {stats.blocked === 0 && stats.inProgress === 0 && stats.todo === 0 ? (
        <div style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>✓ Entrega concluída</div>
      ) : stats.blocked === 0 ? (
        <div style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>✓ Sem bloqueios</div>
      ) : null}

      {/* CTA */}
      <div style={{
        display: "flex", justifyContent: "flex-end", alignItems: "center",
        fontSize: 12, color: meta.color, fontWeight: 600,
        opacity: hovered ? 1 : 0.45, transition: "opacity 0.15s", marginTop: "auto",
      }}>
        Ver todas as issues →
      </div>
    </div>
  );
}

// ── Month section ─────────────────────────────────────────────────────────────

function MonthSection({ delivery }: { delivery: MonthDelivery }) {
  const isCurrent = delivery.monthIdx === TODAY_MONTH;
  const isNext = delivery.monthIdx === TODAY_MONTH + 1;
  const [isOpen, setIsOpen] = useState(isCurrent || isNext);
  const [selected, setSelected] = useState<FeatureGroup | null>(null);

  const allStats = useMemo(() => delivery.groups.map(g => groupStats(g)), [delivery]);
  const totalBlockers = allStats.reduce((s, st) => s + st.blocked, 0);
  const avgProgress = allStats.length === 0 ? 0 : Math.round(allStats.reduce((s, st) => s + st.progress, 0) / allStats.length);
  const badge = isCurrent ? "Mês atual" : isNext ? "Planejamento" : null;

  return (
    <section style={{ marginBottom: 20 }}>
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          background: isOpen ? "transparent" : "#fff",
          border: isOpen ? "none" : "1px solid #e2e8f0", borderRadius: 10,
          padding: isOpen ? "0 0 12px" : "12px 14px",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s", flexShrink: 0 }}>
          <polyline points="9 6 15 12 9 18" />
        </svg>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          {monthName(delivery.monthLabel, delivery.year)}
        </h2>
        {badge && (
          <span style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3,
            color: isCurrent ? "#a16207" : "#1d4ed8",
            background: isCurrent ? "#fef3c7" : "#dbeafe",
            borderRadius: 999, padding: "3px 10px",
          }}>
            {badge}
          </span>
        )}
        {!isOpen && (
          <span style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: avgProgress >= 80 ? "#15803d" : avgProgress >= 40 ? "#2563eb" : "#f59e0b" }}>
              {avgProgress}% médio
            </span>
            {delivery.groups.map((g, i) => {
              const m = featureMeta(g.feature);
              return (
                <span key={i} style={{
                  fontSize: 11, fontWeight: 600, color: m.color, background: m.bg,
                  borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap",
                }}>
                  {m.label} · {allStats[i].progress}%
                </span>
              );
            })}
            {totalBlockers > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: "#b91c1c", whiteSpace: "nowrap" }}>
                ⚠ {totalBlockers}
              </span>
            )}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          {delivery.groups.map((g, i) => (
            <FeatureCard
              key={`${delivery.monthLabel}-${g.feature}-${i}`}
              group={g}
              onClick={() => setSelected(g)}
            />
          ))}
        </div>
      )}

      {selected && (
        <FeatureSlideOver group={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export default function GanttGoalsView() {
  const { deliveries } = useRoadmap();
  const sorted = useMemo(
    () => [...deliveries].sort((a, b) => a.monthIdx - b.monthIdx),
    [deliveries],
  );

  return (
    <div className="g-page">
      <div className="g-page-head">
        <h1 className="g-page-title">Entrega do Mês</h1>
        <p className="g-page-sub">
          Objetivo mensal por frente de trabalho · % de conclusão calculado ao vivo do Jira · clique em um card para ver as issues
        </p>
      </div>

      {sorted.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
          Nenhuma entrega cadastrada — adicione entradas em src/data/labeledDeliveries.ts.
        </div>
      )}

      {sorted.map(delivery => (
        <MonthSection key={`${delivery.monthLabel}-${delivery.year}`} delivery={delivery} />
      ))}
    </div>
  );
}
