import {
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
export const reportDefinitions: ReportDefinition[] = [];

export const findReportDefinition = (reportId: string): ReportDefinition | undefined =>
  reportDefinitions.find((report) => report.id === reportId);

export const getReportsByModule = (modulo: ReportModuleId): ReportDefinition[] =>
  sortReportDefinitions(reportDefinitions.filter((report) => report.modulo === modulo));
