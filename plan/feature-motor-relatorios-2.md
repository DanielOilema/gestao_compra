---
goal: Implementar motor genérico de relatórios (dashboards + exportação Excel/PDF) dirigido por contrato, com agregação no Protheus via TLPP e piloto no módulo Financeiro
version: 2.0
date_created: 2026-08-19
last_updated: 2026-08-19
owner: Daniel Silveira
status: 'In progress'
tags: [feature, architecture, reporting, tlpp, capacitor, financeiro]
---

# Introduction

![Status: In progress](https://img.shields.io/badge/status-In%20progress-yellow)

Construir uma **plataforma de relatórios** no Protheus Connect, não um relatório. Um motor genérico
renderiza KPIs, gráficos e tabelas a partir de um contrato de dados padronizado, e exporta qualquer
relatório para Excel e PDF sem código específico. A agregação acontece toda no Protheus, via um
dispatcher TLPP. O primeiro relatório entregue é do **Financeiro** (aging de títulos em aberto),
escolhido por exercitar todos os tipos de visualização do contrato.

## 1. Requirements & Constraints

### Requisitos de arquitetura

- **ARQ-001**: Adicionar um novo relatório deve custar **uma função TLPP + uma entrada de catálogo**. Nenhum arquivo novo no frontend, nenhuma Edge Function nova.
- **ARQ-002**: **Uma única** Edge Function genérica serve todos os relatórios, roteando por `reportId`.
- **ARQ-003**: **Um único** endpoint dispatcher no Protheus (`/rest/relatorio`) roteia internamente para a função TLPP do relatório solicitado.
- **ARQ-004**: As **colunas são definidas pelo servidor**, não pelo frontend. É isso que torna tabela, Excel e PDF genéricos.
- **ARQ-005**: Uma única rota React (`/relatorios/:moduloId/:reportId`) renderiza qualquer relatório.
- **ARQ-006**: O motor é agnóstico de módulo. Nada em `apps/web/src/components/relatorios/` ou `apps/web/src/pages/relatorios/` pode conter lógica específica de financeiro, compras ou qualquer outro domínio.

### Requisitos funcionais

- **REQ-001**: Página por módulo (`/relatorios/:moduloId`) listando os relatórios disponíveis ao usuário.
- **REQ-002**: Renderizador genérico suportando quatro seções: KPIs, séries, rankings e tabela.
- **REQ-003**: Barra de filtros construída dinamicamente a partir do schema declarado pelo relatório.
- **REQ-004**: Exportação `.xlsx` de qualquer relatório tabular.
- **REQ-005**: Relatório impresso em PDF com logo, filtros aplicados, cabeçalho repetido por página, totalizadores e paginação.
- **REQ-006**: Exportação Excel retrofitada nas listagens já existentes (`ListagemSolicitacoesPage`, `ListagemNotasPage`).
- **REQ-007**: **Piloto** — relatório financeiro de títulos em aberto com aging, cobrindo KPIs, série de vencimentos, ranking de cliente/fornecedor por saldo e tabela detalhada.

### Requisitos de plataforma

- **PLT-001**: Download/compartilhamento deve funcionar no app Android via Capacitor 7.
- **PLT-002**: Geração de PDF deve produzir bytes, não depender de `window.print()`.
- **PLT-003**: Gráficos e tabelas responsivos (app mobile-first).

### Requisitos de segurança

- **SEC-001**: Permissão com **granularidade por módulo**: `relatorios-financeiro`, `relatorios-compras`.
- **SEC-002**: A Edge Function genérica **deve** resolver o módulo a partir do `reportId` e chamar `requirePermission` com a permissão daquele módulo antes de repassar ao Protheus. Não há RLS; essa é a única barreira.
- **SEC-003**: O dispatcher TLPP deve validar o `reportId` contra **whitelist**. Nenhum SQL, nome de tabela, campo ou cláusula pode vir do cliente.
- **SEC-004**: Definir explicitamente o escopo de visibilidade por filial/alçada antes da Fase 3.
- **SEC-005**: Queries TLPP sempre com `D_E_L_E_T_ = ' '`, filtro de filial e `FWExecStatement` parametrizado.

### Restrições

- **CON-001**: Nenhuma tabela de negócio no Supabase. O Postgres segue exclusivo para permissões.
- **CON-002**: O endpoint deve seguir a convenção `/rest/<nome>` para que `protheusUrl()` funcione sem alteração.
- **CON-003**: `exceljs` e `pdfmake` só por `import()` dinâmico, nunca no bundle inicial. Verificado: chunks de 917 KB (exceljs), 987 KB (pdfmake) e 835 KB (vfs de fontes) ficam fora do bundle principal, que cresceu 180 bytes.
- **CON-007**: Os plugins Capacitor devem ficar na linha `^7`, compatível com o `@capacitor/core` do projeto. As versões mais recentes exigem core `>=8`.
- **CON-008**: O build de browser do `pdfmake` não suporta as fontes padrão do PDF, então o Roboto precisa ser registrado via `addVirtualFileSystem`.
- **CON-004**: `ROUTINE_PERMISSION_IDS` (`packages/shared/src/types/permissions.ts`) e `ROUTINE_IDS` (`supabase/functions/_shared/routineIds.ts`) são listas duplicadas. Cada módulo novo exige editar **as duas**.
- **CON-005**: Colunas vindas do servidor enfraquecem a tipagem estática. Mitigar validando o envelope com **zod**, já dependência de `apps/web`.
- **CON-006**: `packages/shared` não tem nenhuma dependência de runtime hoje. Manter assim — o schema zod fica em `apps/web`.

### Padrões a seguir

- **PAT-001**: Edge Function espelhando `supabase/functions/protheus-lista-solicitacoes/index.ts`.
- **PAT-002**: Hook React Query espelhando `apps/web/src/hooks/usePedidosPendentes.ts`.
- **PAT-003**: Gráficos via `ChartContainer` de `@gestao-compra/ui`.
- **PAT-004**: Formatadores reaproveitados de `packages/shared/src/notaPrint.ts`.
- **PAT-005**: Convenção de filtro de período: `tipo: 'periodo'` com chave `X` emite os parâmetros `XInicial` e `XFinal`, seguindo `dtInicial`/`dtFinal` dos endpoints atuais.

## 2. Contrato de dados

Requisição (frontend -> Edge Function -> Protheus):

```
{ reportId: string; filtros: Record<string, string>; page?: number; pageSize?: number }
```

Resposta: envelope único para todo e qualquer relatório, definido em
`packages/shared/src/types/report.ts` (`ReportEnvelope`). Um relatório preenche apenas as seções
que usa; o renderizador omite as vazias.

## 3. Implementation Steps

### Implementation Phase 1 — Contrato e fundação genérica

- GOAL-001: Contrato tipado, permissões por módulo e rotas genéricas existindo, ainda sem dados.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Criar `packages/shared/src/types/report.ts` com `ReportEnvelope`, `ValueFormat`, `ReportFilterDef`, `ReportDefinition`, `ReportModuleId` | ✅ | 2026-08-19 |
| TASK-002 | Criar `apps/web/src/lib/relatorios/reportEnvelopeSchema.ts` — schema zod validando o envelope na fronteira (CON-005, CON-006) | ✅ | 2026-08-19 |
| TASK-003 | Criar `packages/shared/src/reportFormat.ts` — mapa `ValueFormat -> formatador`, reaproveitando helpers de `notaPrint.ts` | ✅ | 2026-08-19 |
| TASK-004 | Adicionar `relatorios-financeiro` e `relatorios-compras` a `ROUTINE_PERMISSION_IDS`, `ROUTINE_LABELS` e `ASSIGNABLE_PERMISSION_IDS` | ✅ | 2026-08-19 |
| TASK-005 | Adicionar os mesmos ids a `ROUTINE_IDS` em `supabase/functions/_shared/routineIds.ts` (CON-004) | ✅ | 2026-08-19 |
| TASK-006 | Criar `getReportModulePermission(modulo)` derivando a permissão do módulo, com verificação em tempo de compilação | ✅ | 2026-08-19 |
| TASK-007 | Criar `supabase/migrations/002_relatorios_permissions.sql` concedendo as novas rotinas ao admin | ✅ | 2026-08-19 |
| TASK-008 | Criar `apps/web/src/config/reports.ts` — registry local tipado, preparado para troca pelo catálogo remoto na Fase 7 | ✅ | 2026-08-19 |
| TASK-009 | Adicionar grupo `Relatórios` em `apps/web/src/config/navigation.ts`, uma entrada por módulo | ✅ | 2026-08-19 |
| TASK-010 | Criar `apps/web/src/pages/relatorios/RelatoriosModulePage.tsx` — lista os relatórios do módulo | ✅ | 2026-08-19 |
| TASK-011 | Criar `apps/web/src/pages/relatorios/RelatorioPage.tsx` — casca do renderizador genérico | ✅ | 2026-08-19 |
| TASK-012 | Registrar em `apps/web/src/App.tsx` as rotas lazy `/relatorios/:moduloId` e `/relatorios/:moduloId/:reportId` | ✅ | 2026-08-19 |
| TASK-013 | Atualizar `apps/web/src/test/permissions.test.ts` para não depender de contagem fixa de rotinas | ✅ | 2026-08-19 |

### Implementation Phase 2 — Exportação genérica e validação no Android

- GOAL-002: Exportar Excel e PDF a partir de `colunas` + `linhas`, funcionando em navegador e em Android real.

Esta fase precede a integração com o ERP de propósito: não depende de trabalho no Protheus e
derruba antecipadamente o maior risco técnico do projeto.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-014 | Instalar em `apps/web`: `exceljs`, `pdfmake`, `@types/pdfmake`, `@capacitor/filesystem`, `@capacitor/share` | ✅ | 2026-08-19 |
| TASK-015 | Criar `apps/web/src/lib/export/saveFile.ts` — abstração única de gravação (web: Blob + anchor; nativo: Filesystem + Share) | ✅ | 2026-08-19 |
| TASK-016 | Criar `apps/web/src/lib/export/toXlsx.ts` — `(colunas, linhas, meta) => Promise<Blob>`, com `import('exceljs')` dinâmico | ✅ | 2026-08-19 |
| TASK-017 | Criar `apps/web/src/lib/export/toPdf.ts` — mesma assinatura, via `pdfmake.getBlob()`, com `import()` dinâmico | ✅ | 2026-08-19 |
| TASK-018 | Criar `apps/web/src/components/relatorios/ExportMenu.tsx` — recebe `colunas`/`linhas`, dropdown Excel/PDF, loading e toast de erro | ✅ | 2026-08-19 |
| TASK-019 | Integrar `ExportMenu` em `ListagemSolicitacoesPage.tsx` | ✅ | 2026-08-19 |
| TASK-020 | Integrar `ExportMenu` em `ListagemNotasPage.tsx` | ✅ | 2026-08-19 |
| TASK-021 | Confirmar no build que `exceljs`, `pdfmake` e o vfs de fontes ficam em chunks separados (antecipa TASK-057) | ✅ | 2026-08-19 |
| TASK-022 | **Validar em device Android físico**: rodar `pnpm mobile:build`, gerar XLSX e PDF, confirmar gravação e abertura do share sheet | | |
| TASK-023 | Verificar se `printNotaDebCre` funciona hoje no Android; se não, migrar a impressão da nota para `toPdf.ts` | | |

### Implementation Phase 3 — Dispatcher TLPP e Edge Function única

- GOAL-003: Um endpoint, um proxy, roteamento por `reportId`.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-023 | Criar fonte TLPP `/rest/relatorio` — recebe `id`, `filtros`, `Page`, `PageSize`; valida `id` contra whitelist (SEC-003) | | |
| TASK-024 | Criar registry interno TLPP `id -> função`, para que registrar relatório novo seja adicionar uma linha | | |
| TASK-025 | Criar helper TLPP de montagem do envelope, para os relatórios não duplicarem serialização | | |
| TASK-026 | Criar fonte TLPP `/rest/relatorio/catalogo` devolvendo os `ReportDefinition` disponíveis | | |
| TASK-027 | Criar `supabase/functions/protheus-relatorio/index.ts` seguindo PAT-001 | | |
| TASK-028 | Na Edge Function, derivar o módulo do `reportId` e chamar `requirePermission` antes do fetch (SEC-002) | | |
| TASK-029 | Registrar as funções novas em `supabase/config.toml` | | |
| TASK-030 | Documentar os fontes com Protheus.doc e converter para CP1252 antes de compilar | | |
| TASK-031 | Criar `apps/web/src/hooks/useRelatorio.ts` — hook único parametrizado por `reportId` e filtros (PAT-002), validando com o schema zod | | |

### Implementation Phase 4 — Renderizador genérico

- GOAL-004: Qualquer envelope válido vira tela, sem código por relatório.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-032 | Criar `RelatorioFilterBar.tsx` — monta controles a partir de `ReportFilterDef[]`, incluindo tipo `filial` consumindo `protheus-filiais` | | |
| TASK-033 | Criar `KpiGrid.tsx` + `KpiCard.tsx` genéricos. **Não** reutilizar `StatusCard.tsx`, que é acoplado a `OrderStatus` | | |
| TASK-034 | Criar `SeriesChart.tsx` — linha ou barra conforme `tipo`, via `ChartContainer` (PAT-003) | | |
| TASK-035 | Criar `RankingChart.tsx` — barra horizontal, com seletor quando houver múltiplos rankings | | |
| TASK-036 | Criar `RelatorioTable.tsx` — colunas e formatação dirigidas por `colunas`, com linha de totais | | |
| TASK-037 | Montar em `RelatorioPage.tsx`, renderizando cada seção condicionalmente | | |
| TASK-038 | Responsividade: coluna única abaixo de `sm`, rótulos truncados, tabela com scroll horizontal contido | | |
| TASK-039 | Estados de `Skeleton`, estado vazio e tratamento de envelope inválido | | |

### Implementation Phase 5 — Piloto Financeiro

- GOAL-005: Primeiro relatório real, exercitando as quatro seções do contrato.

Relatório escolhido: **Títulos em Aberto com Aging**.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-040 | Levantar no dicionário os campos de SE1 e SE2: filial, prefixo, número, parcela, tipo, emissão, vencimento real, valor, saldo, cliente/fornecedor, natureza | | |
| TASK-041 | Definir faixas de aging (a vencer, 1-30, 31-60, 61-90, 90+) e a data-base de referência | | |
| TASK-042 | Implementar a função TLPP com `FWExecStatement`, filtrando `D_E_L_E_T_`, filial e saldo em aberto; agrupar aging no SQL | | |
| TASK-043 | Enriquecer com descrição de cliente/fornecedor (SA1/SA2) e natureza (SED) | | |
| TASK-044 | Registrar o relatório na whitelist e no registry do dispatcher | | |
| TASK-045 | Adicionar a `ReportDefinition` em `apps/web/src/config/reports.ts` | | |
| TASK-046 | Validar os números contra relatório padrão do Protheus (saldo total e contagem de títulos) | | |
| TASK-047 | Medir tempo de resposta com volume real e ajustar índices SIX se necessário | | |

### Implementation Phase 6 — Relatório impresso formal

- GOAL-006: PDF genérico com qualidade de documento oficial.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-048 | Criar `buildRelatorioPdfDoc.ts` — definição pdfmake genérica com logo, título, filtros aplicados, KPIs, tabela com `headerRows: 1`, totais e rodapé com paginação | | |
| TASK-049 | Orientação paisagem automática quando a contagem de colunas exceder o limite | | |
| TASK-050 | Reaproveitar formatadores de `notaPrint.ts` (PAT-004) | | |
| TASK-051 | Exportação busca o dataset completo em uma requisição, sem paginar N vezes | | |

### Implementation Phase 7 — Catálogo dinâmico e prova de custo marginal

- GOAL-007: Comprovar ARQ-001 na prática.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-052 | Trocar o registry local pelo consumo de `/rest/relatorio/catalogo`, com fallback local | | |
| TASK-053 | Página de módulo passa a listar o catálogo remoto, filtrado por permissão | | |
| TASK-054 | **Teste de arquitetura**: implementar um segundo relatório, de Compras, e cronometrar. Se exigir arquivo novo no frontend, o motor falhou em ARQ-001 | | |
| TASK-055 | Documentar em `README.md` o passo a passo de como adicionar um relatório | | |

### Implementation Phase 8 — Endurecimento

- GOAL-008: Qualidade, performance e segurança verificadas.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-056 | Testes Vitest para o schema zod, os formatadores, `toXlsx` e `buildRelatorioPdfDoc` | | |
| TASK-057 | Conferir no build que `exceljs` e `pdfmake` estão em chunks separados | | |
| TASK-058 | Teste de permissão cruzada entre módulos na Edge Function | | |
| TASK-059 | Teste de whitelist: `reportId` inexistente é rejeitado pelo dispatcher | | |
| TASK-060 | Verificar invalidação de cache do React Query na troca de ambiente | | |

## 4. Alternatives

- **ALT-001**: Endpoints e páginas dedicados por relatório (plano v1). Rejeitado — custo marginal linear e dezenas de arquivos quase idênticos.
- **ALT-002**: Um endpoint Protheus por relatório com envelope padronizado. Rejeitado em favor do dispatcher: centraliza auth, paginação e erro.
- **ALT-003**: Colunas definidas no frontend por relatório. Rejeitado — quebraria ARQ-001.
- **ALT-004**: Permissão `relatorios` única. Rejeitado por SEC-001.
- **ALT-005**: Permissão por relatório individual. Rejeitado — inflaria a lista de rotinas sem ganho prático.
- **ALT-006**: Agregar nas Edge Functions consumindo os endpoints REST atuais. Rejeitado: exigiria paginar milhares de registros por gráfico.
- **ALT-007**: Sincronizar dados para tabelas no Supabase. Rejeitado: tabelas de negócio, jobs de sync e dado desatualizado.
- **ALT-008**: Manter `window.print()` para PDF. Rejeitado por PLT-001.
- **ALT-009**: Gerar PDF server-side em Deno. Rejeitado: ecossistema frágil e latência adicional.
- **ALT-010**: Conceito `views` na `ReportDefinition` declarando quais seções renderizar. Rejeitado como redundante — o envelope já revela o que existe pelas seções preenchidas.
- **ALT-011**: Hub único em `/relatorios` com permissão composta. Rejeitado — exigiria estender `AppRoutine`/`buildUserMenu` para múltiplas permissões. Uma entrada de menu por módulo encaixa no modelo atual sem alteração.

## 5. Dependencies

- **DEP-001**: `exceljs` — geração de XLSX no cliente.
- **DEP-002**: `pdfmake` + `@types/pdfmake` — geração de PDF em bytes.
- **DEP-003**: `@capacitor/filesystem` — gravação de arquivo no Android.
- **DEP-004**: `@capacitor/share` — abertura/compartilhamento do arquivo.
- **DEP-005**: `recharts` — já disponível via `packages/ui`, nada a instalar.
- **DEP-006**: `zod` — já dependência de `apps/web`, usado para validar o envelope.
- **DEP-007**: **Bloqueante para as Fases 4-7** — dispatcher `/rest/relatorio` compilado no RPO de homologação e produção.

## 6. Files

### Alterados

- **FILE-001**: `packages/shared/src/types/permissions.ts` — permissões por módulo em três listas.
- **FILE-002**: `supabase/functions/_shared/routineIds.ts` — mesmas rotinas (CON-004).
- **FILE-003**: `apps/web/src/config/navigation.ts` — grupo Relatórios.
- **FILE-004**: `apps/web/src/App.tsx` — rotas de relatórios.
- **FILE-005**: `apps/web/package.json` — dependências da Fase 2.
- **FILE-006**: `supabase/config.toml` — funções novas.
- **FILE-007**: `ListagemSolicitacoesPage.tsx` e `ListagemNotasPage.tsx` — botão de exportação.
- **FILE-008**: `apps/web/src/test/permissions.test.ts` — contagem de rotinas derivada do config.
- **FILE-009**: `README.md` — como adicionar um relatório.

### Criados

- **FILE-010**: `supabase/migrations/002_relatorios_permissions.sql`
- **FILE-011**: `packages/shared/src/types/report.ts`, `packages/shared/src/reportFormat.ts`
- **FILE-012**: `apps/web/src/lib/relatorios/reportEnvelopeSchema.ts`
- **FILE-013**: `apps/web/src/config/reports.ts`
- **FILE-014**: `apps/web/src/lib/export/` — `saveFile.ts`, `toXlsx.ts`, `toPdf.ts`, `buildRelatorioPdfDoc.ts`
- **FILE-015**: `apps/web/src/pages/relatorios/` — `RelatoriosModulePage.tsx`, `RelatorioPage.tsx`
- **FILE-016**: `apps/web/src/components/relatorios/` — `RelatorioFilterBar`, `KpiGrid`, `KpiCard`, `SeriesChart`, `RankingChart`, `RelatorioTable`, `ExportMenu`
- **FILE-017**: `apps/web/src/hooks/useRelatorio.ts`, `useRelatorioCatalogo.ts`
- **FILE-018**: Fontes TLPP: dispatcher, helper de envelope, catálogo e função do relatório de aging

## 7. Testing

- **TEST-001**: Unitário — schema zod rejeita envelope malformado e aceita envelope com seções vazias.
- **TEST-002**: Unitário — cada `ValueFormat` formata corretamente, incluindo nulos e zero.
- **TEST-003**: Unitário — `toXlsx` gera planilha com cabeçalho e contagem de linhas correta para colunas arbitrárias.
- **TEST-004**: Unitário — `buildRelatorioPdfDoc` produz definição válida com `headerRows` e rodapé.
- **TEST-005**: Integração — Edge Function retorna mensagem de sessão expirada ao receber 401.
- **TEST-006**: Integração — permissão cruzada entre módulos é negada.
- **TEST-007**: Integração — `reportId` fora da whitelist é rejeitado.
- **TEST-008**: Manual em device Android — exportar XLSX e PDF do relatório de aging.
- **TEST-009**: Conferência funcional — totais do aging batem com relatório padrão do Protheus.
- **TEST-010**: Performance — dispatcher responde em tempo aceitável com volume real.
- **TEST-011**: Arquitetura — segundo relatório entra sem arquivo novo no frontend.

## 8. Risks & Assumptions

- **RISK-001**: Gravação de arquivo na WebView do Android é o maior desconhecido. Mitigação: validar na Fase 2, antes de investir no ERP.
- **RISK-002**: `printNotaDebCre` pode já estar quebrado no Android, pois `window.print()` não é suportado na WebView. Mitigação: TASK-022.
- **RISK-003**: **Contrato prematuro.** Desenhar o envelope com um relatório só em mente pode produzir abstração errada. Mitigação: TASK-054 força um segundo relatório de outro módulo, e revisar o contrato ali é resultado aceitável.
- **RISK-004**: Colunas dirigidas pelo servidor reduzem garantias de compilação. Mitigação: CON-005.
- **RISK-005**: A dupla lista de rotinas (CON-004) é armadilha silenciosa e agora é acionada a cada módulo novo.
- **RISK-006**: `exceljs` + `pdfmake` podem degradar o carregamento em rede móvel. Mitigação: CON-003 e TASK-057.
- **RISK-007**: `PROTHEUS_BASE_URL` tem como padrão o IP privado `192.168.200.2`. Relatórios geram payloads maiores e vão pressionar mais esse caminho.
- **RISK-008**: Sem RLS, a Edge Function é a única barreira de acesso a dado financeiro consolidado (SEC-002).
- **ASSUMPTION-001**: Há acesso para desenvolver e compilar TLPP nos dois ambientes.
- **ASSUMPTION-002**: A regra de escopo por filial/alçada (SEC-004) será definida antes da Fase 3.
- **ASSUMPTION-003**: O aging por faixas atende a necessidade do Financeiro; se o piloto real for outro relatório, as Fases 1-4 não mudam, só a Fase 5.

## 9. Related Specifications / Further Reading

- `supabase/functions/protheus-lista-solicitacoes/index.ts` — referência canônica de Edge Function.
- `supabase/functions/_shared/checkPermission.ts` — verificação de permissão usada em TASK-028.
- `apps/web/src/hooks/usePedidosPendentes.ts` — referência de hook React Query.
- `apps/web/src/lib/buildNotaPrintHtml.ts` — referência de construção de documento.
- `packages/ui/src/components/chart.tsx` — wrapper Recharts disponível.
