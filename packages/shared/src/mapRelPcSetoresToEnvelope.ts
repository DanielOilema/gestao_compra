import { parseReportNumber } from './reportFormat';
import {
  RELATORIO_PC_SETORES_COLUMNS,
  RELATORIO_PC_SETORES_ID,
  RELATORIO_PC_SETORES_TITULO,
} from './relatorioPcSetores';
import type { ReportEnvelope, ReportRow } from './types/report';

const t = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

const readField = (record: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) {
    const match = Object.entries(record).find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (!match) continue;
    if (typeof match[1] === 'number' && Number.isFinite(match[1])) return String(match[1]);
    const value = t(match[1]);
    if (value) return value;
  }
  return '';
};

const readQuantity = (record: Record<string, unknown>): number | null => {
  for (const key of ['quantidade', 'quant', 'qtd']) {
    const match = Object.entries(record).find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (!match) continue;
    return parseReportNumber(typeof match[1] === 'number' ? match[1] : t(match[1]));
  }
  return null;
};

const extractArray = (res: Record<string, unknown>, preferredKeys: string[]): unknown[] => {
  if (Array.isArray(res)) return res;

  for (const key of preferredKeys) {
    const match = Object.entries(res).find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (match && Array.isArray(match[1])) return match[1];
  }

  for (const value of Object.values(res)) {
    if (Array.isArray(value)) return value;
  }

  return [];
};

const toRow = (record: Record<string, unknown>): ReportRow => ({
  filial: readField(record, 'filial'),
  tipoCompra: readField(record, 'tipoCompra', 'tipocompra', 'tipo'),
  numero: readField(record, 'numero', 'numpc', 'pc', 'pedido', 'numeropc'),
  emissao: readField(record, 'emissao', 'dataemissao', 'dtemissao'),
  produto: readField(record, 'produto'),
  descricao: readField(record, 'descricao', 'descri', 'descprod'),
  quantidade: readQuantity(record),
  centroCusto: readField(record, 'centroCusto', 'cc', 'custo'),
  descCC: readField(record, 'descCC', 'desccc', 'desccentrocusto'),
  solicitante: readField(record, 'solicitante'),
  observacao: readField(record, 'observacao', 'obs'),
});

export const mapRelPcSetoresToEnvelope = (res: unknown): ReportEnvelope => {
  const record = Array.isArray(res)
    ? { PEDIDOS_SETORES: res }
    : ((res ?? {}) as Record<string, unknown>);

  const rows = extractArray(record, [
    'PEDIDOS_SETORES',
    'pedidos_setores',
    'PEDIDOS_COMPRA_SETORES',
    'items',
    'data',
  ]);

  const linhas = rows
    .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .map(toRow);

  return {
    id: RELATORIO_PC_SETORES_ID,
    titulo: RELATORIO_PC_SETORES_TITULO,
    kpis: [],
    series: [],
    rankings: [],
    colunas: RELATORIO_PC_SETORES_COLUMNS,
    linhas,
  };
};
