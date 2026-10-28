// Suporte Omni: chamados do projeto suporte-produtos do GitLab, por produto e mês.
// Mesma régua da aba Sys-Ops do XP: resolvido em até 5 dias úteis (criação →
// fechamento; abertos são medidos até a data dos dados).
import { useEffect, useMemo, useState } from "react";
import { useOmniData } from "@/lib/omniSync";
import type { IssueStatus } from "@/data/labeledDeliveries";
import type { OmniPriority, OmniProduct, OmniTicket } from "@/data/omni/types";
import { AdjustFlag, MONTH_NAMES, PRODUCT_META, STATUS_CFG, useOmniArea, type OmniFilter } from "./omniShared";

const SLA_DAYS = 5;
const PRIORITY_LABEL: Record<OmniPriority, string> = { urgente: "Muito alta", alta: "Alta", media: "Média", baixa: "Baixa" };

function businessDays(start: string, end: string): number {
  const s = new Date(start + "T12:00:00");
  const e = new Date(end + "T12:00:00");
  let n = 0;
  for (const d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) if (d.getDay() % 6 !== 0) n++;
  return n;
}

const monthEnd = (m: string) => {
  const [y, mm] = m.split("-").map(Number);
  return new Date(Date.UTC(y, mm, 0)).toISOString().slice(0, 10);
};

interface MonthStats {
  tickets: (OmniTicket & { days: number; late: boolean; openAtEnd: boolean })[];
  volume: number; done: number; withinSla: number; outsideSla: number;
  open: number; atRisk: number; blocked: number;
}

// Mês fechado: abertos no fim do mês (qualquer data de criação) + fechados no mês.
// Mês corrente: abertos agora + fechados no mês.
// `now` = data dos dados (último sync), não o relógio do navegador.
function statsFor(list: OmniTicket[], month: string, now: string): MonthStats {
  const end = month === now.slice(0, 7) ? now : monthEnd(month);
  const tickets = list
    .filter(t => t.created <= end && (t.closed === null || t.closed >= `${month}-01`))
    .map(t => {
      const closedInMonth = !!t.closed && t.closed <= end;
      const openAtEnd = !closedInMonth;
      const days = businessDays(t.created, closedInMonth && t.closed ? t.closed : end);
      return { ...t, days, late: days > SLA_DAYS, openAtEnd };
    });
  const done = tickets.filter(t => !t.openAtEnd);
  const open = tickets.filter(t => t.openAtEnd);
  return {
    tickets, volume: tickets.length, done: done.length,
    withinSla: done.filter(t => !t.late).length,
    outsideSla: done.filter(t => t.late).length + open.filter(t => t.late).length,
    open: open.length, atRisk: open.filter(t => t.late).length,
    // Bloqueio só é conhecido no estado atual do GitLab.
    blocked: month === now.slice(0, 7) ? open.filter(t => t.blocked).length : 0,
  };
}

const pctColor = (p: number | null) => p === null ? "#94a3b8" : p >= 80 ? "#15803d" : p >= 60 ? "#b45309" : "#b91c1c";

function Kpi({ label, value, sub, color }: { label: string; value: string | number; sub: string; color?: string }) {
  return (
    <div className="om-kpi">
      <span>{label}</span>
      <b style={{ color }}>{value}</b>
      <span>{sub}</span>
    </div>
  );
}

function TicketsSlide({ product, monthLabel, s, onClose }: { product: OmniProduct; monthLabel: string; s: MonthStats; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);
  const groups: { title: string; items: MonthStats["tickets"]; st: IssueStatus }[] = [
    { title: "Bloqueados", st: "Blocked", items: s.tickets.filter(t => t.openAtEnd && t.status === "Blocked") },
    { title: "Em andamento", st: "In Progress", items: s.tickets.filter(t => t.openAtEnd && t.status === "In Progress") },
    { title: "Pendentes", st: "To Do", items: s.tickets.filter(t => t.openAtEnd && (t.status === "To Do" || t.status === "Done")) },
    { title: "Concluídos no mês", st: "Done", items: s.tickets.filter(t => !t.openAtEnd) },
  ];
  return (
    <>
      <div className="om-scrim" onClick={onClose} />
      <aside className="om-slide" aria-label={`Chamados ${product}`}>
        <div className="om-slide-head">
          <div className="om-row-between">
            <span className="om-tag" style={{ color: PRODUCT_META[product].color, background: PRODUCT_META[product].bg }}>{product}</span>
            <button className="om-close" onClick={onClose} aria-label="Fechar">×</button>
          </div>
          <h2 className="om-slide-title">Chamados de suporte · {monthLabel}</h2>
          <div className="om-meta">{s.volume} chamados · {s.done} concluídos · {s.open} em aberto · prazo de {SLA_DAYS} dias úteis</div>
        </div>
        <div className="om-slide-sec">
          {groups.map(g => g.items.length > 0 && (
            <div key={g.title} style={{ marginBottom: 18 }}>
              <div className="om-group-lbl" style={{ color: STATUS_CFG[g.st].color }}>
                <span className="om-dot" style={{ background: STATUS_CFG[g.st].dot }} /> {g.title} ({g.items.length})
              </div>
              {g.items.map(t => (
                <div key={t.ref} className="om-item" data-status={g.st === "Blocked" ? "Blocked" : undefined}>
                  <a className="om-key" href={t.url} target="_blank" rel="noreferrer">#{t.ref.split("#")[1]}</a>
                  <span className="om-item-title">
                    <span>{t.title}</span>
                    <span className="om-item-sub">
                      {t.created.split("-").reverse().join("/")}
                      {t.assignee ? ` · ${t.assignee}` : ""}
                      {t.priority ? ` · prioridade ${PRIORITY_LABEL[t.priority]}` : ""}
                    </span>
                  </span>
                  <AdjustFlag notes={t.adjust} size="sm" />
                  <span className="om-status" style={t.late
                    ? { color: "#b91c1c", background: "#fee2e2" }
                    : { color: "#166534", background: "#dcfce7" }}>
                    {t.days} du
                  </span>
                </div>
              ))}
            </div>
          ))}
          {s.volume === 0 && <p className="om-meta">Nenhum chamado neste mês.</p>}
        </div>
      </aside>
    </>
  );
}

export default function OmniSupportView({ filter }: { filter: OmniFilter }) {
  const { data } = useOmniData();
  const PRODUCTS = useOmniArea().products;
  const NOW = data.generatedAt.slice(0, 10);   // "hoje" = data dos dados
  const months = useMemo(() => {
    const out: string[] = [];
    for (let d = new Date("2026-07-15"); d.toISOString().slice(0, 7) <= NOW.slice(0, 7); d.setMonth(d.getMonth() + 1)) {
      out.push(d.toISOString().slice(0, 7));
    }
    return out;
  }, [NOW]);
  const [picked, setMonth] = useState<string | null>(null);
  const month = picked && months.includes(picked) ? picked : months[months.length - 1];
  const [open, setOpen] = useState<OmniProduct | null>(null);
  const products = PRODUCTS.filter(p => filter.product === "Todos" || filter.product === p);
  const label = (m: string) => MONTH_NAMES[+m.slice(5) - 1];
  const isLive = month === NOW.slice(0, 7);
  const stats = useMemo(() => Object.fromEntries(PRODUCTS.map(p =>
    [p, statsFor(data.support.filter(t => t.product === p), month, NOW)])) as Record<OmniProduct, MonthStats>, [data, month, NOW, PRODUCTS]);

  return (
    <div className="g-page">
      <div className="g-page-head">
        <h1 className="g-page-title">Suporte</h1>
        <p className="g-page-sub">
          Chamados do projeto suporte-produtos no GitLab, por produto · resolvido rápido = fechado em até {SLA_DAYS} dias úteis
        </p>
        <p className="g-page-note">
          <AdjustFlag notes={[
            `Prazo de ${SLA_DAYS} dias úteis copiado da aba Sys-Ops do XP — confirmar o prazo do suporte Omni (e se ele muda pela prioridade)`,
            "Só entram chamados do projeto suporte-produtos com etiqueta de produto. Bugs abertos direto no projeto SinOMS não contam",
            "Feriados não são descontados dos dias úteis",
          ]} /> Mês fechado = chamados que estavam abertos no fim do mês + os fechados no mês. Bloqueios só aparecem no mês atual.
        </p>
      </div>

      <div className="om-month-tabs" role="group" aria-label="Mês">
        {months.map(m => (
          <button key={m} className="om-chip" aria-pressed={month === m} onClick={() => setMonth(m)}>
            {label(m)}{m === NOW.slice(0, 7) && <span className="om-live">ao vivo</span>}
          </button>
        ))}
      </div>

      <div className="om-support-grid">
        {products.map(p => {
          const s = stats[p];
          const base = s.withinSla + s.outsideSla;
          const pct = base ? Math.round(s.withinSla / base * 100) : null;
          if (p === "PDV" && s.volume === 0) {
            return (
              <div key={p} className="om-support-col" style={{ borderTopColor: PRODUCT_META[p].color }}>
                <div className="om-row-between"><h2 className="om-h2">{p}</h2>
                  <AdjustFlag notes={["Nenhum chamado de suporte do PDV no GitLab — o PDV ainda não está em operação, ou os chamados ficam em outro lugar?"]} />
                </div>
                <p className="om-meta">Sem chamados de suporte no GitLab.</p>
              </div>
            );
          }
          return (
            <div key={p} className="om-support-col" role="button" tabIndex={0} style={{ borderTopColor: PRODUCT_META[p].color }}
              onClick={() => setOpen(p)} onKeyDown={e => e.key === "Enter" && setOpen(p)}>
              <div className="om-row-between">
                <h2 className="om-h2">{p}</h2>
                {isLive && <span className="om-live">abertos agora</span>}
              </div>
              <div className="om-kpis om-kpis--2">
                <Kpi label="Total no mês" value={s.volume} sub={`${s.done} concluídos`} />
                <Kpi label="Resolvidos rápido" value={pct === null ? "—" : `${pct}%`} color={pctColor(pct)}
                  sub={pct === null ? "sem dados" : `${s.withinSla} de ${base} em ≤${SLA_DAYS} du`} />
                <Kpi label="Em aberto" value={s.open} color={s.atRisk ? "#b91c1c" : s.open ? "#b45309" : "#15803d"}
                  sub={s.atRisk ? `${s.atRisk} passaram do prazo` : s.open ? "dentro do prazo" : "tudo resolvido"} />
                <Kpi label="Bloqueados" value={isLive ? s.blocked : "—"} color={s.blocked ? "#b91c1c" : undefined}
                  sub={isLive ? (s.blocked ? "aguardando informação" : "sem bloqueios") : "só no mês atual"} />
              </div>
              <div className="om-cta" style={{ textAlign: "left" }}>Ver {s.volume} chamados →</div>
            </div>
          );
        })}
      </div>
      {open && <TicketsSlide product={open} monthLabel={`${label(month)}/${month.slice(0, 4)}`} s={stats[open]} onClose={() => setOpen(null)} />}
    </div>
  );
}
