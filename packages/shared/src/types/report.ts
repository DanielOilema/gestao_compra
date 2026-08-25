import type { RoutinePermissionId } from './permissions';

/**
 * Contrato único de relatórios. Qualquer relatório do sistema — de qualquer módulo — trafega
 * neste envelope, e o renderizador desenha apenas as seções preenchidas. Colunas e formatos são
 * declarados pelo servidor para que incluir um relatório novo não exija código de frontend.
 */

export const VALUE_FORMATS = [
  'texto',
  'numero',
  'inteiro',
  'moeda',
  'data',
  'percentual',
] as const;

export type ValueFormat = (typeof VALUE_FORMATS)[number];

export const REPORT_MODULE_IDS = ['financeiro', 'compras'] as const;

export type ReportModuleId = (typeof REPORT_MODULE_IDS)[number];

export const REPORT_MODULE_LABELS: Record<ReportModuleId, string> = {
  financeiro: 'Financeiro',
  compras: 'Compras',
};

/**
 * A permissão é derivada do módulo, não declarada no relatório: o catálogo remoto (Fase 7) não
 * precisa conhecer os ids de rotina, e não há como um relatório declarar a permissão errada.
 * O retorno tipado como RoutinePermissionId faz o compilador acusar módulo sem permissão criada.
 */
export const getReportModulePermission = (modulo: ReportModuleId): RoutinePermissionId =>
  `relatorios-${modulo}`;

export const isReportModuleId = (value: unknown): value is ReportModuleId =>
  typeof value === 'string' && (REPORT_MODULE_IDS as readonly string[]).includes(value);

export interface ReportKpi {
  key: string;
  label: string;
  valor: number | string;
  formato: ValueFormat;
  /** Variação percentual frente ao período anterior, quando o relatório souber calcular. */
  variacao?: number;
}

export const REPORT_SERIES_TIPOS = ['linha', 'barra'] as const;

export type ReportSeriesTipo = (typeof REPORT_SERIES_TIPOS)[number];

export interface ReportSeriesPoint {
  x: string;
  y: number;
}

export interface ReportSeries {
  key: string;
  label: string;
  tipo: ReportSeriesTipo;
  /** Formato do eixo de valores. Default: 'numero'. */
  formato?: ValueFormat;
  pontos: ReportSeriesPoint[];
}

export interface ReportRankingItem {
  codigo: string;
  descricao: string;
  valor: number;
}

export interface ReportRanking {
  key: string;
  label: string;
  formato?: ValueFormat;
  itens: ReportRankingItem[];
}

export const REPORT_COLUMN_ALIGNS = ['esquerda', 'centro', 'direita'] as const;

export type ReportColumnAlign = (typeof REPORT_COLUMN_ALIGNS)[number];

export interface ReportColumn {
  key: string;
  label: string;
  formato: ValueFormat;
  alinhamento?: ReportColumnAlign;
  /** Largura sugerida em caracteres, usada na exportação Excel e PDF. */
  largura?: number;
}

export type ReportCellValue = string | number | null;

export type ReportRow = Record<string, ReportCellValue>;

export interface ReportPagination {
  page: number;
  pageSize: number;
  hasNext: boolean;
}

export interface ReportEnvelope {
  id: string;
  titulo: string;
  kpis: ReportKpi[];
  series: ReportSeries[];
  rankings: ReportRanking[];
  colunas: ReportColumn[];
  linhas: ReportRow[];
  /** Totais por chave de coluna, exibidos no rodapé da tabela. */
  totais?: Record<string, number>;
  paginacao?: ReportPagination;
}

export const REPORT_FILTER_TIPOS = [
  'data',
  'periodo',
  'filial',
  'selecao',
  'texto',
  'numero',
  'booleano',
] as const;

export type ReportFilterTipo = (typeof REPORT_FILTER_TIPOS)[number];

export interface ReportFilterOption {
  valor: string;
  label: string;
}

export interface ReportFilterDef {
  key: string;
  label: string;
  tipo: ReportFilterTipo;
  obrigatorio?: boolean;
  valorPadrao?: string;
  /** Obrigatório quando tipo === 'selecao'. */
  opcoes?: ReportFilterOption[];
  placeholder?: string;
}

/**
 * Um filtro de período ocupa duas chaves na requisição, seguindo a convenção dos endpoints
 * Protheus existentes (`dtInicial` / `dtFinal`).
 */
export const getPeriodoFilterKeys = (key: string): { inicial: string; final: string } => ({
  inicial: `${key}Inicial`,
  final: `${key}Final`,
});

export interface ReportDefinition {
  id: string;
  modulo: ReportModuleId;
  titulo: string;
  descricao: string;
  filtros: ReportFilterDef[];
  /** Nome de ícone lucide-react, resolvido pelo frontend. */
  icone?: string;
  /** Ordem de exibição dentro do módulo. Ausente vai para o fim. */
  ordem?: number;
}

export interface ReportRequest {
  reportId: string;
  filtros: Record<string, string>;
  page?: number;
  pageSize?: number;
}

export const sortReportDefinitions = (definitions: ReportDefinition[]): ReportDefinition[] =>
  [...definitions].sort((a, b) => {
    const ordemA = a.ordem ?? Number.MAX_SAFE_INTEGER;
    const ordemB = b.ordem ?? Number.MAX_SAFE_INTEGER;
    if (ordemA !== ordemB) return ordemA - ordemB;
    return a.titulo.localeCompare(b.titulo, 'pt-BR');
  });

/** Filtros iniciais de um relatório, a partir dos valores padrão declarados. */
export const buildDefaultReportFilters = (
  filtros: ReportFilterDef[],
): Record<string, string> => {
  const values: Record<string, string> = {};

  for (const filtro of filtros) {
    if (filtro.valorPadrao === undefined) continue;

    if (filtro.tipo === 'periodo') {
      const { inicial, final } = getPeriodoFilterKeys(filtro.key);
      values[inicial] = filtro.valorPadrao;
      values[final] = filtro.valorPadrao;
      continue;
    }

    values[filtro.key] = filtro.valorPadrao;
  }

  return values;
};
