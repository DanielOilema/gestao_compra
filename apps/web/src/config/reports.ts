import {
  RELATORIO_HOSP_PASS_ID,
  RELATORIO_HOSP_PASS_TITULO,
  RELATORIO_PC_SETORES_ID,
  RELATORIO_PC_SETORES_LOOKUP_GRUPOS,
  RELATORIO_PC_SETORES_TITULO,
  RELATORIO_SC_SETORES_ID,
  RELATORIO_SC_SETORES_LOOKUP_GRUPOS,
  RELATORIO_SC_SETORES_TITULO,
  sortReportDefinitions,
  type ReportDefinition,
  type ReportModuleId,
} from "@gestao-compra/shared";

/**
 * Catálogo de relatórios disponíveis no app.
 *
 * Registry local por enquanto. A Fase 7 troca a fonte por `/rest/relatorio/catalogo` servido pelo
 * Protheus, mantendo esta lista como fallback — por isso os consumidores acessam sempre pelas
 * funções abaixo, nunca pelo array direto.
 */
export const reportDefinitions: ReportDefinition[] = [
  {
    id: RELATORIO_SC_SETORES_ID,
    modulo: "compras",
    titulo: RELATORIO_SC_SETORES_TITULO,
    descricao: "Consultar solicitações de compra por período e grupo de compras",
    icone: "ShoppingCart",
    ordem: 1,
    filtros: [
      {
        key: "dt",
        label: "Período",
        tipo: "periodo",
        obrigatorio: true,
      },
      {
        key: "grupoAprovacao",
        label: "Grupo de compras",
        tipo: "selecao",
        obrigatorio: true,
        fonteOpcoes: RELATORIO_SC_SETORES_LOOKUP_GRUPOS,
        placeholder: "Selecione um grupo",
      },
    ],
  },
  {
    id: RELATORIO_PC_SETORES_ID,
    modulo: "compras",
    titulo: RELATORIO_PC_SETORES_TITULO,
    descricao: "Consultar pedidos de compra por período e grupo de compras",
    icone: "ClipboardList",
    ordem: 2,
    permission: "relatorios-pedidos",
    filtros: [
      {
        key: "dt",
        label: "Período",
        tipo: "periodo",
        obrigatorio: true,
      },
      {
        key: "grupoAprovacao",
        label: "Grupo de compras",
        tipo: "selecao",
        obrigatorio: true,
        fonteOpcoes: RELATORIO_PC_SETORES_LOOKUP_GRUPOS,
        placeholder: "Selecione um grupo",
      },
    ],
  },
  {
    id: RELATORIO_HOSP_PASS_ID,
    modulo: "compras",
    titulo: RELATORIO_HOSP_PASS_TITULO,
    descricao: "Consultar notas de passagens e hospedagens por período",
    icone: "Hotel",
    ordem: 3,
    permission: "relatorios-passagens",
    filtros: [
      {
        key: "dt",
        label: "Período",
        tipo: "periodo",
        obrigatorio: true,
      },
    ],
  },
];

export const findReportDefinition = (reportId: string): ReportDefinition | undefined =>
  reportDefinitions.find((report) => report.id === reportId);

export const getReportsByModule = (modulo: ReportModuleId): ReportDefinition[] =>
  sortReportDefinitions(reportDefinitions.filter((report) => report.modulo === modulo));
