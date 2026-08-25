import { formatNotaPrintDate } from './notaPrint';
import type { ReportCellValue, ValueFormat } from './types/report';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const decimalFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const EMPTY = '-';

/**
 * Converte um valor de célula em número, aceitando tanto número quanto texto em formato pt-BR.
 * A exportação Excel usa isto para gravar números reais em vez de texto, o que permite somar e
 * ordenar na planilha.
 */
export const parseReportNumber = (value: ReportCellValue): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Formata um valor de relatório conforme o formato declarado pelo servidor. É o único ponto do
 * frontend que sabe traduzir dados de relatório para texto, o que mantém o motor agnóstico de
 * domínio: tabela, KPIs, gráficos, Excel e PDF passam todos por aqui.
 *
 * Percentual assume valor já em pontos percentuais (12.5 vira "12,5%"), não fração.
 */
export const formatReportValue = (value: ReportCellValue, formato: ValueFormat): string => {
  if (value === null || value === undefined || value === '') return EMPTY;

  switch (formato) {
    case 'moeda': {
      const numero = parseReportNumber(value);
      return numero === null ? String(value) : currencyFormatter.format(numero);
    }
    case 'numero': {
      const numero = parseReportNumber(value);
      return numero === null ? String(value) : decimalFormatter.format(numero);
    }
    case 'inteiro': {
      const numero = parseReportNumber(value);
      return numero === null ? String(value) : integerFormatter.format(numero);
    }
    case 'percentual': {
      const numero = parseReportNumber(value);
      return numero === null ? String(value) : `${percentFormatter.format(numero)}%`;
    }
    case 'data':
      return formatNotaPrintDate(String(value));
    case 'texto':
    default:
      return String(value);
  }
};

/** Formatos cujo alinhamento natural é à direita, usado como default de coluna. */
const NUMERIC_FORMATS: ValueFormat[] = ['moeda', 'numero', 'inteiro', 'percentual'];

export const isNumericReportFormat = (formato: ValueFormat): boolean =>
  NUMERIC_FORMATS.includes(formato);

/** Formato de célula do Excel correspondente, para exportação com tipagem nativa. */
export const getExcelNumberFormat = (formato: ValueFormat): string | undefined => {
  switch (formato) {
    case 'moeda':
      return 'R$ #,##0.00';
    case 'numero':
      return '#,##0.00';
    case 'inteiro':
      return '#,##0';
    case 'percentual':
      return '0.00"%"';
    case 'data':
      return 'dd/mm/yyyy';
    default:
      return undefined;
  }
};
