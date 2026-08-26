# Prompt — Sync Diário do Roadmap Wake

**Contexto:** Este é o roadmap de produto da Wake (site wake-experience.atlassian.net, cloudId `8b4d8ab2-6627-4055-b683-4c67fbf3bf0d`, projetos POS e FRONT). Os dados vivem em `src/data/ganttData.ts`, `src/data/labeledDeliveries.ts` e `src/data/monthlyGoals.ts`, dentro do repositório `/Users/babimeirelles/Github/Wake/Roadmap`.

---

## Tarefa

Execute o sync diário do roadmap com o Jira. Siga todas as regras abaixo sem exceção. Ao final, faça um commit e reporte um resumo.

---

## 1. O que verificar no Jira

1. Consulte via JQL as issues que mudaram desde ontem:
   `key in (<todas as keys POS-*/FRONT-* presentes em ganttData.ts>) AND updated >= "-1d"`
   - Use o MCP Atlassian. O conector retorna no máx. 5 issues por chamada — pagine com `ORDER BY key ASC AND key > "<última key>"`, separando POS e FRONT.
   - Delegue a paginação a um subagente (general-purpose) que acumula `KEY|STATUS` num arquivo de scratchpad para não estourar o contexto.

2. Busque também issues novas nos épicos ativos:
   `parent in (<jiraKeys dos épicos com status != concluido>) AND created >= "-1d"`

---

## 2. Mapeamento de status Jira → subtask (campo `status` no schema)

| Status no Jira | Status no ganttData.ts |
|---|---|
| Concluído, Ready to Deploy | `Done` |
| Em andamento, QA in Progress, Validation | `In Progress` |
| Tarefas pendentes, A fazer | `To Do` |
| Bloqueado / Blocked | `To Do` + marcar `blocked: true` na subtask + registrar no `note` da feature |
| Cancelado | `Done` (canceladas contam como concluídas — nunca remover da lista) |

**Flag `blocked`:** adicionar `blocked: true` em subtasks bloqueadas no Jira; remover a flag quando o bloqueio for resolvido. Essa flag alimenta os bloqueios da aba "Entrega do Mês" e dos cards da Visão Executiva.

---

## 3. Fórmula de progresso

```
progress = round((Done + 0.5 × In_Progress) / total_subtasks × 100)
```

- Atualizar o campo `progress` de cada feature afetada com essa fórmula.
- O campo `feat.progress` (usado pelo Kanban) deve ficar próximo ao `taskProgress()` (que usa apenas Done/total) — mantenha-os coerentes.

---

## 4. Regras de alocação de issues novas

- Issue nova em épico **já concluído** → alocar em `f30 Evoluções e melhorias`.
- Issue nova em épico **ativo** → alocar na própria feature.
- Toda issue nova recebe `sprint: <sprint atual>`.
- Nova feature precisa de entrada em `TRACKS_BY_ID` em ganttData.ts — array de objetivos (`migracao | evolucao | cdp`); um épico pode ter mais de um objetivo.

---

## 5. Exceções — NÃO alterar sem confirmação da Bárbara

- **cdp-2b (Integração ERPs Loja Física):** não recalcular `progress` — está no backlog por decisão da Bárbara e tem subtasks Done herdadas de outra fase em revisão.
- **POS-4249 / POS-4345 (cdp-2a Importação de pedidos):** se o Jira ainda as marcar como `Concluído`, confirmar com a Bárbara antes de alterar o status — na prática seguem em andamento.

---

## 6. Consistência entre as três abas (regra crítica)

As três abas — **Entrega do Mês**, **Visão Executiva** e **Kanban** — devem sempre ter o mesmo status, progresso e discurso para cada iniciativa.

As fórmulas diferem por aba:
- **Exec + S-curve:** `taskProgress()` = Done / total subtasks
- **Kanban (% textual):** campo `feat.progress` (manual, atualizado pelo sync)
- **Entrega do Mês:** `(Done + 0.5 × InProgress) / jiraKeys selecionadas`

Antes de aplicar qualquer mudança, verificar o impacto nas três abas. Se detectar divergência, **sinalizar no relatório final** antes de ajustar.

---

## 7. Aba "Entrega do Mês" — sync do `labeledDeliveries.ts`

O arquivo `src/data/labeledDeliveries.ts` é **independente do `ganttData.ts`** — os statuses precisam ser atualizados explicitamente a cada sync. Não adianta só atualizar o `ganttData.ts`; a aba não herda os dados de lá.

### Labels no Jira

Cada issue da aba tem duas labels:
- **Mês:** `Agosto`, `Setembro`, `Outubro`, …
- **Categoria/feature:** `Evoluções`, `Pentefino`, `ExportaçãoRelatório`, `Importaçãopedidos`, `IPDedicado`, `Novavisãocliente`

Mapeamento label → grupo exibido (`FEATURE_META` em `labeledDeliveries.ts`):

| Label Jira | Exibição na aba |
|---|---|
| `Evoluções` | Evoluções |
| `Pentefino` | Pente Fino |
| `ExportaçãoRelatório` | Exportação de Relatórios |
| `Importaçãopedidos` | Importação de Pedidos |
| `IPDedicado` / `Ipdedicado` | IP Dedicado |
| `Novavisãocliente` | Nova Visão de Cliente |

### O que verificar a cada sync

**1. Atualizar status e `blocked` das issues já listadas**

O mapeamento de status é o mesmo da seção 2. Se a issue ficou bloqueada no Jira → adicionar `blocked: true`; se o bloqueio foi resolvido → remover a flag.

**2. Adicionar issues novas que ganharam label de mês + categoria**

Use o JQL abaixo para o mês corrente e o próximo mês planejado:
```
project in (FRONT, POS) AND labels in ("Setembro") AND updated >= "-1d" ORDER BY key ASC
```
- Verificar se a issue já está no arquivo antes de adicionar (não duplicar).
- Alocar no `MonthDelivery` correto (pelo mês) e no `FeatureGroup` correto (pela label de categoria).

**3. Remover issues que perderam a label de mês**

Se uma issue listada em `labeledDeliveries.ts` já não tiver a label do mês no Jira (detectado via `updated >= "-1d"`), removê-la do arquivo.

### Commit separado para `labeledDeliveries.ts`

Se houver qualquer alteração no arquivo, fazer um commit adicional **após** o commit do `ganttData.ts`:
```
sync: atualiza labeledDeliveries — sprint <N> · YYYY-MM-DD
```

---

## 8. Sprint e datas

- Atualizar `CURRENT_SPRINT` e `SPRINT_DATES` se a sprint tiver mudado (sprints de 2 semanas).
- Sprint de referência: sprint 48 (última mencionada nos commits).

---

## 9. monthlyGoals.ts — ritual mensal

- No último dia útil de cada mês: cadastrar os objetivos do mês seguinte em `src/data/monthlyGoals.ts` (um por track, com `jiraKeys` reais que representam o escopo completo — incluindo In Progress e To Dos relevantes, não só Done).
- As `jiraKeys` em `monthlyGoals.ts` NÃO devem ser apenas tarefas já concluídas, senão a meta mensal mostra 100% enquanto o épico pai ainda tem trabalho a fazer.

---

## 10. Epícos no backlog

- Épico com `executed: null` e `progress: 0` fica fora da linha do tempo automaticamente (helper `isBacklog`). Não adicionar à linha do tempo sem instrução explícita da Bárbara.

---

## 11. Cuidados no parsing de ganttData.ts

- Linhas de subtask têm espaçamento alinhado: `key: "X",  title:` (2+ espaços).
- Títulos podem ter aspas escapadas — regex precisa de `,\s+` e `(?:[^"\\]|\\.)*`.

---

## 12. Commits

Fazer **dois commits separados** quando ambos os arquivos forem alterados:

```
sync: Jira 2.0 sync — sprint <N> · YYYY-MM-DD
```
```
sync: atualiza labeledDeliveries — sprint <N> · YYYY-MM-DD
```

Se apenas `ganttData.ts` foi alterado (sem mudanças em `labeledDeliveries.ts`), fazer só o primeiro commit.

---

## 13. Relatório final

Ao terminar, reportar:
1. Quantas issues foram atualizadas e quais features foram afetadas.
2. Issues novas encontradas e onde foram alocadas.
3. Bloqueios detectados ou resolvidos.
4. Divergências entre abas detectadas (sinalizar à Bárbara).
5. Se o mês está terminando: lembrar do ritual de cadastro dos objetivos do mês seguinte em `monthlyGoals.ts`.
