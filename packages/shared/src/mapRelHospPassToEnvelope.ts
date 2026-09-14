import { parseReportNumber } from './reportFormat';
import {
  RELATORIO_HOSP_PASS_COLUMNS,
  RELATORIO_HOSP_PASS_ID,
  RELATORIO_HOSP_PASS_TITULO,
} from './relatorioHospPass';
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

const readNumber = (record: Record<string, unknown>, ...keys: string[]): number | null => {
  for (const key of keys) {
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
  nf: readField(record, 'nf', 'nota', 'notafiscal', 'doc'),
  serie: readField(record, 'serie'),
  fornecedor: readField(record, 'fornecedor'),
  loja: readField(record, 'loja'),
  nome: readField(record, 'nome', 'nomefor', 'nomeFornecedor'),
  emissao: readField(record, 'emissao', 'dataemissao', 'dtemissao'),
  produto: readField(record, 'produto'),
  descricao: readField(record, 'descricao', 'descri', 'descprod'),
  quantidade: readNumber(record, 'quantidade', 'quant', 'qtd'),
  valorUnit: readNumber(record, 'valorUnit', 'valorunit', 'vunit', 'vlrunit'),
  total: readNumber(record, 'total', 'valortotal', 'vtotal', 'vlrtotal'),
  centroCusto: readField(record, 'centroCusto', 'cc', 'custo'),
  descCC: readField(record, 'descCC', 'desccc', 'desccentrocusto'),
  observacao: readField(record, 'observacao', 'obs'),
});

export const mapRelHospPassToEnvelope = (res: unknown): ReportEnvelope => {
  const record = Array.isArray(res)
    ? { HOSP_PASS: res }
    : ((res ?? {}) as Record<string, unknown>);

  const rows = extractArray(record, [
    'HOSP_PASS',
    'hosp_pass',
    'HOSPEDAGENS',
    'PASSAGENS',
    'REL_HOSP_PASS',
    'items',
    'data',
  ]);

  const linhas = rows
    .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .map(toRow);

  return {
    id: RELATORIO_HOSP_PASS_ID,
    titulo: RELATORIO_HOSP_PASS_TITULO,
    kpis: [],
    series: [],
    rankings: [],
    colunas: RELATORIO_HOSP_PASS_COLUMNS,
    linhas,
  };
};
