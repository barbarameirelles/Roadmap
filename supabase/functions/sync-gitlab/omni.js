// Leitura do GitLab para a área Iniciativas Omni — fonte ÚNICA das regras.
// Usado por scripts/gen-omni-data.mjs (Node, gera src/data/omni/omniData.ts) e
// pela Edge Function sync-gitlab (Deno, botão "Sincronizar"). JavaScript puro
// para rodar igual nos dois.
//
// Iniciativas = épicos de OMS, Wake U e PDV + grupos sugeridos para objetivos/
// projetos que ainda não estão em épico. Cada iniciativa e tarefa carrega
// `adjust`: o que ainda precisa ser ajustado no GitLab (vira o "(!)" na tela).

const GROUP = 5910344;               // sintesesolucoes
const API = "https://gitlab.com/api/v4";

// ── Regras de classificação ──────────────────────────────────────────────────
const PDV_LABELS = ["vertical::PDV", "prod::Wake PDV Loja", "prod::Wake PDV BackOffice", "prod::Wake Pdv", "prod::Wake broker"];
const CANON = { OMS: "prod::SinOMS", "Wake U": "prod::WakeU", PDV: "vertical::PDV" };
const CLIENTS = ["Levi's", "Levis", "Grupo Soma", "Taco", "Gregory", "Shoulder", "Osklen", "Track&Field",
  "Reserva", "Tommy", "Andriello", "Intimissimi", "Soneda", "Ave Rara", "AramisWake", "AZZAS"];
const PROJECT_CODE = /\(20\d\d\.\d{3}\.\d\d\)/;
const IN_PROGRESS_WAIT = ["wait::Ag. Code Review", "wait::Ag. Deploy", "wait::Comunicação Suporte"];
const MONTHS_PT = { janeiro: 1, fevereiro: 2, "março": 3, abril: 4, maio: 5, junho: 6, julho: 7,
  agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12 };

// Épicos sem etiqueta de produto: produto assumido (vira ajuste).
const ASSUMED_PRODUCT = { 83: "OMS", 97: "OMS", 101: "OMS", 79: "OMS" };
const EXCLUDE_EPICS = new Set([91]); // "Operacional - métricas de produtos non-OMS"

// Objetivos/projetos sem épico → grupo sugerido (ainda não existe no GitLab).
const GP = "ss-gestao-produtos/gestao-produtos";
const SUGGESTED = {
  "devolucoes":   { title: "Wake OMS - Evolução do Módulo de Devoluções", refs: [`${GP}#387`, `${GP}#649`] },
  "aguard-fat":   { title: "Wake OMS - Pedidos Aguardando Faturamento", refs: [`${GP}#389`, `${GP}#673`] },
  "nova-ux":      { title: "Wake OMS - Nova UX do módulo de Pedidos", refs: [`${GP}#307`] },
  "fulfillment":  { title: "Wake OMS - Endpoints Fulfillment (Projeto Tommy / WMS Unlock)", refs: [`${GP}#627`] },
  "observab":     { title: "Wake OMS - Observabilidade", refs: [`${GP}#656`] },
  "multi-wh":     { title: "Wake OMS - Estoque de múltiplas Warehouses (1T25)", refs: [`${GP}#126`] },
  "vd-vtex":      { title: "Wake U - Venda Digital VTEX", refs: [`${GP}#301`, `${GP}#526`, `${GP}#533`, `${GP}#306`] },
  "on-hands":     { title: "Wake U - Vendas Presenciais (On-Hands)", refs: [`${GP}#382`, `${GP}#383`] },
  "gregory":      { title: "[Gregory] Integração financeira multi-origem (2024.037.09)", refs: [`${GP}#742`] },
  "reserva":      { title: "[Reserva] Change Seller por segmentação (2021.069.81)", refs: [`${GP}#596`] },
  "soma-cash":    { title: "[Grupo Soma] Cashback App Soma Box (2021.070.29)", refs: [`${GP}#754`] },
  "taco":         { title: "[Taco] Transportadora Anjun Express (2018.001.10)", refs: [`${GP}#743`] },
};
// Itens que entram em um épico que JÁ existe (sugestão de mover).
const MOVE_TO_EPIC = {
  "sintesesolucoes/wake/wake-backoffice/wake-backoffice-backend#11": 81,
  "sintesesolucoes/wake/wake-backoffice/wake-backoffice-backend#19": 81,
  "sintesesolucoes/wake/wake-sync/wake-broker#1": 81,
  "sintesesolucoes/wake/wake-sync/wake-broker#5": 81,
  [`sintesesolucoes/${GP}#610`]: 97,
};

function productsFrom(labels, title = "", projectPath = "") {
  const t = title.toLowerCase(), s = new Set();
  if (labels.some(l => PDV_LABELS.includes(l)) || projectPath.startsWith("sintesesolucoes/wake/") || /wake pdv/.test(t)) s.add("PDV");
  if (labels.includes("prod::WakeU") || /wake u\b|venda digital/.test(t)) s.add("Wake U");
  if (labels.includes("prod::SinOMS") || /wake oms|sinoms|sinomni|\boms\b/.test(t)) s.add("OMS");
  return [...s];
}
// Nomes que também são palavras comuns só contam entre colchetes ou no início ("Taco - …").
const AMBIGUOUS = new Set(["Reserva", "Taco", "Tommy"]);
const clientOf = t => {
  const c = CLIENTS.find(c => AMBIGUOUS.has(c)
    ? t.includes(`[${c}]`) || t.startsWith(`${c} -`) || t.includes(`Projeto ${c}`)
    : t.includes(c));
  return c === "Levis" ? "Levi's" : c;
};

function itemStatus(state, labels) {
  if (state === "closed" || state === "CLOSED") return { status: "Done" };
  const blocked = labels.some(l => l.startsWith("block::"));
  if (blocked) return { status: "Blocked", blocked: true };
  if (labels.some(l => l.startsWith("work::")) || labels.some(l => IN_PROGRESS_WAIT.includes(l))) return { status: "In Progress" };
  return { status: "To Do" };
}

function itemAdjust(labels, isOpen) {
  const a = [];
  const st = labels.filter(l => l.startsWith("wait::") || l.startsWith("work::"));
  if (isOpen && st.length === 0 && !labels.some(l => l.startsWith("block::"))) a.push("Sem etiqueta de status no GitLab (contado como A fazer)");
  if (st.length > 1) a.push(`Dois status ao mesmo tempo: ${st.join(", ")}`);
  if (labels.includes("prod::Wake Pdv")) a.push('Etiqueta duplicada "prod::Wake Pdv" (usar vertical::PDV)');
  return a;
}

const ym = d => d ? { year: +d.slice(0, 4), month: +d.slice(5, 7) } : null;
const fmt = d => d ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : "";

function monthFromText(s) {
  const m = s && s.match(/\[(?:OMS\] )?([A-Za-zçÇ]+)\/(\d\d)\]?/);
  if (m && MONTHS_PT[m[1].toLowerCase()]) return { year: 2000 + +m[2], month: MONTHS_PT[m[1].toLowerCase()] };
  return null;
}

// ── Acesso ao GitLab ─────────────────────────────────────────────────────────
// Cada chamada tem limite de 20s e até 2 novas tentativas (GitLab às vezes fica lento
// ou responde 429/5xx) — assim o botão não fica preso esperando.
async function fetchRetry(url, init, tries = 3) {
  for (let k = 1; ; k++) {
    try {
      const r = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
      if ((r.status === 429 || r.status >= 500) && k < tries) throw new Error(`HTTP ${r.status}`);
      return r;
    } catch (e) {
      if (k >= tries) throw e;
      await new Promise(res => setTimeout(res, 1000 * k));
    }
  }
}

function gitlabClient(token) {
  async function rest(path, params = {}) {
    const out = [];
    for (let page = 1; ; page++) {
      const qs = new URLSearchParams({ ...params, per_page: "100", page: String(page) });
      const r = await fetchRetry(`${API}${path}?${qs}`, { headers: { "PRIVATE-TOKEN": token } });
      if (!r.ok) throw new Error(`GitLab ${path}: HTTP ${r.status}`);
      out.push(...await r.json());
      if (!r.headers.get("x-next-page")) return out;
    }
  }
  async function gql(query, variables = {}) {
    const r = await fetchRetry("https://gitlab.com/api/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const d = await r.json();
    if (d.errors) throw new Error(`GitLab GraphQL: ${JSON.stringify(d.errors)}`);
    return d.data;
  }
  return { rest, gql };
}

// Roda `fn` em `items` com no máximo `n` chamadas ao mesmo tempo (mantém a ordem).
async function mapLimit(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) { const k = next++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

export async function buildOmniData(token, log = () => {}) {
  const { rest, gql } = gitlabClient(token);
  const t0 = Date.now();
  const step = msg => log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${msg}`);
  const TODAY = new Date().toISOString().slice(0, 10);

  // ── Coleta ───────────────────────────────────────────────────────────────────
  step("Lendo épicos…");
  const epics = (await rest(`/groups/${GROUP}/epics`, { include_descendant_groups: "false" }))
    .filter(e => e.group_id === GROUP && !EXCLUDE_EPICS.has(e.iid));

  const CHILDREN_Q = `query($p:ID!,$iids:[String!]){ project(fullPath:$p){ workItems(iids:$iids){ nodes{ iid
    widgets{ ... on WorkItemWidgetHierarchy { children(first:100){ nodes{ iid title state webUrl workItemType{name}
    widgets{ ... on WorkItemWidgetLabels{ labels(first:50){ nodes{ title } } } } } } } } } } } }`;

  async function childrenOf(issues) {
    const byProject = {};
    for (const i of issues) (byProject[i.references.full.split("#")[0]] ??= []).push(String(i.iid));
    const res = {};
    for (const [p, iids] of Object.entries(byProject)) {
      for (let k = 0; k < iids.length; k += 50) {
        const d = await gql(CHILDREN_Q, { p, iids: iids.slice(k, k + 50) });
        for (const n of d.project?.workItems?.nodes ?? []) {
          const h = n.widgets.find(w => w.children);
          res[`${p}#${n.iid}`] = (h?.children?.nodes ?? []).map(c => ({
            ref: `${p}#${c.iid}`, title: c.title, url: c.webUrl, state: c.state,
            labels: (c.widgets.find(w => w.labels)?.labels.nodes ?? []).map(l => l.title),
          }));
        }
      }
    }
    return res;
  }

  function toItems(issues, children) {
    const items = [];
    for (const i of issues) {
      const ref = i.references.full;
      const kids = children[ref] ?? [];
      const issueAdj = itemAdjust(i.labels, i.state === "opened");
      if (kids.length) {
        // Conta as tasks filhas (a issue-mãe vira só o agrupador, como o épico no Jira).
        for (const c of kids) {
          items.push({ ref: c.ref.replace("sintesesolucoes/", ""), url: c.url, title: c.title, parent: i.title,
            ...itemStatus(c.state, c.labels), adjust: itemAdjust(c.labels, c.state !== "CLOSED") });
        }
        // Tasks todas fechadas mas a issue-mãe segue aberta (homologação, documentação…):
        // a issue entra como mais um item, para o % não marcar 100% antes da hora.
        if (i.state === "opened" && kids.every(c => c.state === "CLOSED")) {
          const st = i.labels.find(l => l.startsWith("work::") || l.startsWith("wait::"));
          items.push({ ref: ref.replace("sintesesolucoes/", ""), url: i.web_url, title: i.title,
            ...itemStatus(i.state, i.labels),
            adjust: [`Todas as tasks fechadas, mas a issue segue aberta${st ? ` em "${st.split("::")[1].trim()}"` : ""} — fechar quando terminar`, ...issueAdj] });
        }
      } else {
        items.push({ ref: ref.replace("sintesesolucoes/", ""), url: i.web_url, title: i.title,
          ...itemStatus(i.state, i.labels), adjust: issueAdj, due: i.due_date ?? undefined,
          iteration: i.iteration?.title ?? undefined });
      }
    }
    return items;
  }

  function buildInitiative({ id, title, url, labels, start, due, issues, children, suggested, epicIid }) {
    const items = toItems(issues, children);
    const adjust = [];
    // Produtos
    let products = productsFrom(labels, title);
    for (const i of issues) for (const p of productsFrom(i.labels, i.title, i.references.full)) if (!products.includes(p)) products.push(p);
    if (products.length === 0 && ASSUMED_PRODUCT[epicIid]) {
      products = [ASSUMED_PRODUCT[epicIid]];
      adjust.push(`Épico sem etiqueta de produto — assumi ${products[0]}. Adicionar ${CANON[products[0]]}`);
    } else if (!suggested) {
      const missing = products.filter(p => !labels.includes(CANON[p]) && !(p === "PDV" && labels.some(l => PDV_LABELS.includes(l))));
      if (missing.length) adjust.push(`Falta etiqueta de produto no épico: ${missing.map(p => CANON[p]).join(", ")}`);
      const other = labels.filter(l => l.startsWith("prod::") && !Object.values(CANON).includes(l) && !PDV_LABELS.includes(l));
      if (other.length) adjust.push(`Etiqueta de outro produto no épico (${other.join(", ")}) — confirmar o produto principal`);
      if (products.includes("OMS") && products.includes("Wake U")) adjust.push("Envolve OMS e Wake U — confirmar o produto principal");
    }
    // Projeto de cliente x roadmap
    // Projeto = vendido ao cliente: orig::Projeto ou código de projeto (AAAA.NNN.NN).
    // Só citar um cliente no título não basta — vira pergunta no "(!)".
    const isProject = labels.includes("orig::Projeto") || PROJECT_CODE.test(title)
      || issues.some(i => i.labels.includes("orig::Projeto") || PROJECT_CODE.test(i.title));
    const client = clientOf(title) ?? issues.map(i => clientOf(i.title)).find(Boolean);
    const kind = isProject ? "projeto" : "roadmap";
    if (!isProject && client) adjust.push(`Cita o cliente ${client} — é projeto vendido? Se sim, marcar orig::Projeto e cliente::${client}`);
    if (isProject) {
      if (!labels.includes("orig::Projeto")) adjust.push("Projeto de cliente sem orig::Projeto no épico");
      if (client) adjust.push(`Adicionar etiqueta cliente::${client}`);
      else adjust.push("Projeto sem nome de cliente identificado");
      if (issues.some(i => i.labels.includes("OKR"))) adjust.push("Também é objetivo de OKR: é roadmap ou projeto de cliente? (decisão pendente)");
    }
    // Mês de entrega
    let month = null, monthSource = "";
    const mesLabel = labels.find(l => /^mes::\d{4}-\d{2}$/.test(l));
    if (mesLabel) { month = { year: +mesLabel.slice(5, 9), month: +mesLabel.slice(10, 12) }; monthSource = "etiqueta"; }
    if (!month) { month = monthFromText(title); if (month) monthSource = "título do épico"; }
    if (!month) for (const i of issues) {
      const m = monthFromText(i.iteration?.title) ?? monthFromText(i.title.match(/\[\w+\/\d\d\]/)?.[0]);
      if (m) { month = m; monthSource = `iteration/título da issue`; break; }
    }
    const dueAll = due ?? issues.map(i => i.due_date).filter(Boolean).sort().pop() ?? null;
    if (!month && dueAll) { month = ym(dueAll); monthSource = `prazo (${fmt(dueAll)})`; }
    if (!mesLabel) adjust.push(month
      ? `Mês deduzido pelo ${monthSource} — falta etiqueta mes::${month.year}-${String(month.month).padStart(2, "0")} no épico`
      : "Sem mês de entrega — adicionar etiqueta mes::AAAA-MM no épico");
    // Datas, prazo, status
    if (!suggested && !(start && due)) adjust.push("Épico sem data de início e/ou fim");
    const allDone = items.length > 0 && items.every(i => i.status === "Done");
    if (dueAll && dueAll < TODAY && !allDone) adjust.push(`Prazo venceu em ${fmt(dueAll)} — replanejar`);
    if (items.length === 0) adjust.push("Épico sem tarefas — não dá para calcular %");
    const epicStatus = labels.find(l => l.startsWith("work::") || l.startsWith("wait::"));
    if (allDone && epicStatus) adjust.push(`Todas as tarefas fechadas, mas o épico está "${epicStatus.split("::")[1]}" — fechar o épico`);
    if (issues.some(i => i.labels.includes("OKR - Em atraso"))) adjust.push('Marcado como "OKR - Em atraso" no GitLab');
    if (suggested) adjust.unshift("Épico ainda não existe no GitLab — agrupamento sugerido. Criar o épico e mover as issues");
    return { id, title, url, products, kind, client, month, start: start ?? undefined, due: dueAll ?? undefined,
      gitlabStatus: epicStatus ? epicStatus.split("::")[1] : undefined, items, adjust };
  }

  const initiatives = [];
  const allIssuesByRef = {};
  const moved = {};
  step("Lendo issues soltas sugeridas…");
  const looseRefs = [...Object.values(SUGGESTED).flatMap(g => g.refs.map(r => `sintesesolucoes/${r}`)), ...Object.keys(MOVE_TO_EPIC)];
  const loose = await mapLimit(looseRefs, 6, ref => {
    const [p, iid] = ref.split("#");
    return rest(`/projects/${encodeURIComponent(p)}/issues`, { iids: iid }).then(r => r[0]);
  });
  for (const [k, ref] of looseRefs.entries()) {
    const i = loose[k];
    if (i) allIssuesByRef[ref] = i;
    if (i && MOVE_TO_EPIC[ref]) (moved[MOVE_TO_EPIC[ref]] ??= []).push(i);
  }

  step(`Lendo issues de ${epics.length} épicos…`);
  const epicIssues = await mapLimit(epics, 6, e => rest(`/groups/${GROUP}/epics/${e.iid}/issues`));
  step("Lendo tasks filhas…");
  const epicChildren = await mapLimit(epics, 6, (e, k) => childrenOf([...epicIssues[k], ...(moved[e.iid] ?? [])]));
  for (const [k, e] of epics.entries()) {
    let issues = epicIssues[k];
    const extra = moved[e.iid] ?? [];
    issues = [...issues, ...extra];
    const products = productsFrom(e.labels, e.title);
    const itemProducts = issues.flatMap(i => productsFrom(i.labels, i.title, i.references.full));
    if (!products.length && !itemProducts.length && !ASSUMED_PRODUCT[e.iid]) continue;
    const children = epicChildren[k];
    const ini = buildInitiative({ id: `ep-${e.iid}`, title: e.title, url: e.web_url, labels: e.labels,
      start: e.start_date, due: e.due_date, issues, children, epicIid: e.iid });
    for (const x of extra) {
      const it = ini.items.find(i => i.ref.endsWith(`#${x.iid}`) && x.references.full.endsWith(i.ref));
      if (it) it.adjust.unshift(`Issue sem épico no GitLab — sugiro mover para o épico #${e.iid}`);
    }
    initiatives.push(ini);
  }
  for (const [key, g] of Object.entries(SUGGESTED)) {
    const issues = g.refs.map(r => allIssuesByRef[`sintesesolucoes/${r}`]).filter(i => i && !i.epic);
    if (!issues.length) continue;
    const children = await childrenOf(issues);
    initiatives.push(buildInitiative({ id: `sug-${key}`, title: g.title, url: issues[0].web_url, labels: [],
      issues, children, suggested: true }));
  }

  // ── Hipóteses ─────────────────────────────────────────────────────────────────
  // Regra: épico sem nenhuma tarefa e sem status de andamento (work::) é hipótese
  // e aparece SÓ na aba Hipóteses. A etapa vem da coluna do board de épicos "Roadmap".
  // Épico com tarefas (mesmo sugeridas) fica nas abas de entrega.
  const COLUMN_OF = { "Roadmap::1. Triagem": "Triagem", "Roadmap::1.1 Backlog": "Backlog",
    "Roadmap::2. Refinamento": "Refinamento", "wait::To-Do": "To-Do" };
  const PRIORITY = { "priority::Muito Alta": "urgente", "priority::Alta": "alta", "priority::Média": "media", "priority::Baixa": "baixa" };
  const plain = md => (md ?? "").replace(/<!--[\s\S]*?-->/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[#*_`>|]/g, "").replace(/\s+/g, " ").trim();
  const epicByIid = Object.fromEntries(epics.map(e => [e.iid, e]));
  const hypotheses = [];
  for (let k = initiatives.length - 1; k >= 0; k--) {
    const ini = initiatives[k];
    if (!ini.id.startsWith("ep-") || ini.items.length > 0) continue;
    const e = epicByIid[+ini.id.slice(3)];
    if (e.labels.some(l => l.startsWith("work::"))) {
      ini.adjust.push("Épico em andamento, mas sem nenhuma tarefa — criar as issues");
      continue;                                   // fica no Kanban
    }
    initiatives.splice(k, 1);
    const column = COLUMN_OF[Object.keys(COLUMN_OF).find(l => e.labels.includes(l))] ?? "Open";
    const adjust = ini.adjust.filter(a => !/^Mês |^Sem mês|sem data de início|sem tarefas/.test(a));
    if (column === "Open") adjust.push("Ainda não triado: sem etiqueta Roadmap:: (está na coluna Open do board)");
    if (column === "Refinamento" || column === "To-Do") adjust.push(`Está em ${column} mas ainda não tem tarefas — quebrar em issues`);
    const priority = Object.entries(PRIORITY).find(([l]) => e.labels.includes(l))?.[1];
    if (!priority) adjust.push("Sem prioridade (etiqueta priority::)");
    const origin = e.labels.find(l => l.startsWith("orig::"))?.split("::")[1];
    const desc = plain(e.description);
    hypotheses.push({
      id: ini.id, iid: e.iid, title: e.title, url: e.web_url, column, products: ini.products, priority,
      client: ini.client, origin, type: e.labels.find(l => l.startsWith("type::"))?.split("::")[1],
      description: desc.length > 400 ? desc.slice(0, 400).replace(/\s\S*$/, "") + "…" : desc,
      created: e.created_at.slice(0, 10), adjust,
    });
  }
  hypotheses.sort((a, b) => b.created.localeCompare(a.created));

  // ── Suporte: chamados do projeto suporte-produtos (OMS, Wake U, PDV) ─────────
  step("Lendo chamados de suporte…");
  const SUPPORT_PROJECT = 47412592; // ss-gestao-produtos/suporte-produtos
  const SUPPORT_SINCE = "2026-06-01";
  const supRaw = (await Promise.all([
    rest(`/projects/${SUPPORT_PROJECT}/issues`, { created_after: `${SUPPORT_SINCE}T00:00:00Z` }),
    rest(`/projects/${SUPPORT_PROJECT}/issues`, { state: "opened" }),
    rest(`/projects/${SUPPORT_PROJECT}/issues`, { state: "closed", updated_after: `${SUPPORT_SINCE}T00:00:00Z` }),
  ])).flat();
  const support = [];
  const seen = new Set();
  for (const i of supRaw) {
    if (seen.has(i.id)) continue; seen.add(i.id);
    const products = productsFrom(i.labels, "", i.references.full).filter(p => p !== "OMS" || i.labels.includes("prod::SinOMS"));
    if (!products.length) continue;
    const closed = i.closed_at ? i.closed_at.slice(0, 10) : null;
    if (closed && closed < SUPPORT_SINCE) continue;
    const adjust = [];
    const priority = Object.entries(PRIORITY).find(([l]) => i.labels.includes(l))?.[1];
    if (!priority) adjust.push("Sem prioridade (etiqueta priority::)");
    if (i.state === "opened" && !i.labels.some(l => /^(wait|work|block)::/.test(l))) adjust.push("Chamado aberto sem etiqueta de status");
    if (i.state === "opened" && !i.assignees.length) adjust.push("Chamado aberto sem responsável");
    const ageDays = Math.round((Date.parse(TODAY) - Date.parse(i.created_at.slice(0, 10))) / 864e5);
    if (i.state === "opened" && ageDays > 90) adjust.push(`Aberto há ${ageDays} dias — fechar, ou virar melhoria/épico se for evolução`);
    support.push({
      ref: i.references.full.replace("sintesesolucoes/", ""), url: i.web_url, title: i.title,
      product: products[0], ...itemStatus(i.state, i.labels), priority,
      created: i.created_at.slice(0, 10), closed,
      assignee: i.assignees[0]?.name ?? null,
      type: i.labels.find(l => l.startsWith("type::"))?.split("::")[1], adjust,
    });
  }
  support.sort((a, b) => b.created.localeCompare(a.created));

  step("Pronto");
  return { generatedAt: new Date().toISOString(), initiatives, hypotheses, support };
}
