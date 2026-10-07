import type { PurchaseRequest, PurchaseRequestItem } from './types/purchaseRequest';
import type { RateioCCDraft } from './types/solicitacaoInclusao';
import { mapProtheusSolicitacaoCompraStatus } from './solicitacaoCompraStatus';
import { formatNumeroItem, parseNumeroItem } from './numeroItemSolicitacao';
import { mapProtheusTipoCompra, type TipoCompra } from './tipoCompra';

export interface ProtheusListaSCRateioLine {
  item?: string;
  cc?: string;
  percentual?: number | string;
}

export interface ProtheusListaSCLine {
  filial?: string;
  numero?: string;
  item?: string;
  produto?: string;
  descricao?: string;
  quant?: number;
  quantidade?: number;
  cc?: string;
  desccc?: string;
  obs?: string;
  observacao?: string;
  solicitante?: string;
  emissao?: string;
  unidade?: string;
  unid?: string;
  unidadeMedida?: string;
  status?: string;
  situacao?: string;
  tipoCompra?: string;
  tipo?: string;
  tpcompra?: string;
  entrega?: string;
  dataEntrega?: string;
  datprf?: string;
  dtentrega?: string;
  rateio?: ProtheusListaSCRateioLine[];
}

const t = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

const asText = (value: unknown): string => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(Math.trunc(value));
  return t(value);
};

const readNamed = (line: ProtheusListaSCLine, names: string[]): string => {
  const record = line as Record<string, unknown>;
  for (const name of names) {
    const direct = asText(record[name]);
    if (direct) return direct;
  }
  for (const [key, value] of Object.entries(record)) {
    if (!names.includes(key.toLowerCase())) continue;
    const text = asText(value);
    if (text) return text;
  }
  return '';
};

const readUnidade = (line: ProtheusListaSCLine): string =>
  readNamed(line, ['unidadeMedida', 'unidademedida', 'unidade', 'unid']) || 'UN';

const readItemNumero = (line: ProtheusListaSCLine): string => {
  const numero = parseNumeroItem(readNamed(line, ['item']));
  return numero != null ? formatNumeroItem(numero) : '0001';
};

const parseDate = (raw?: string): string => {
  const s = t(raw);
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s.replace(/\//g, '-');
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const extractList = (res: Record<string, unknown>): ProtheusListaSCLine[] => {
  if (Array.isArray(res)) return res as ProtheusListaSCLine[];

  const preferred = ['solicitacoes', 'items', 'data', 'lista', 'scs'];
  const entries = Object.entries(res);

  for (const key of preferred) {
    const match = entries.find(([k]) => k.toLowerCase() === key);
    if (match && Array.isArray(match[1])) {
      return match[1] as ProtheusListaSCLine[];
    }
  }

  for (const [, value] of entries) {
    if (Array.isArray(value) && value.length > 0 && isPlainObject(value[0])) {
      return value as ProtheusListaSCLine[];
    }
  }

  return [];
};

/** Lê `status` da linha (campo status / situacao, case-insensitive). */
const readLineStatusRaw = (line: ProtheusListaSCLine): string | undefined => {
  if (line.status != null && String(line.status).trim()) {
    return String(line.status).trim();
  }
  if (line.situacao != null && String(line.situacao).trim()) {
    return String(line.situacao).trim();
  }

  const record = line as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey !== "status" && normalizedKey !== "situacao") continue;
    if (value == null) continue;

    const text = String(value).trim();
    if (text) return text;
  }

  return undefined;
};

const resolveLineStatus = (line: ProtheusListaSCLine) =>
  mapProtheusSolicitacaoCompraStatus(readLineStatusRaw(line));

const readLineTipoCompra = (line: ProtheusListaSCLine): TipoCompra | undefined => {
  const record = line as Record<string, unknown>;
  const candidates = [line.tipoCompra, line.tpcompra];

  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey === "tipocompra" || normalizedKey === "tpcompra") {
      candidates.push(value == null ? undefined : String(value));
    }
  }

  for (const candidate of candidates) {
    const mapped = mapProtheusTipoCompra(candidate);
    if (mapped) return mapped;
  }

  return undefined;
};

const readLineDataEntrega = (line: ProtheusListaSCLine): string | undefined => {
  const direct =
    t(line.entrega) || t(line.dataEntrega) || t(line.datprf) || t(line.dtentrega);
  if (direct) return parseDate(direct);

  const record = line as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = key.toLowerCase();
    if (
      normalizedKey !== "entrega" &&
      normalizedKey !== "dataentrega" &&
      normalizedKey !== "datprf" &&
      normalizedKey !== "dtentrega"
    ) {
      continue;
    }
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return parseDate(text);
  }

  return undefined;
};

const readCentroCusto = (line: ProtheusListaSCLine): { codigo: string; descricao: string } => {
  const codigo = t(line.cc);
  const descricao = t(line.desccc);
  if (codigo || descricao) return { codigo, descricao };

  const record = line as Record<string, unknown>;
  let codigoAlt = '';
  let descricaoAlt = '';
  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = key.toLowerCase();
    if (value == null) continue;
    const text = String(value).trim();
    if (!text) continue;
    if (normalizedKey === 'cc' || normalizedKey === 'ccusto' || normalizedKey === 'centrocusto') {
      codigoAlt = text;
    }
    if (normalizedKey === 'desccc' || normalizedKey === 'descccusto' || normalizedKey === 'descricaocc') {
      descricaoAlt = text;
    }
  }
  return { codigo: codigoAlt, descricao: descricaoAlt };
};

const readRateioArray = (line: ProtheusListaSCLine): unknown[] | undefined => {
  if (Array.isArray(line.rateio)) return line.rateio;

  const record = line as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    if (key.toLowerCase() !== 'rateio') continue;
    if (Array.isArray(value)) return value;
  }
  return undefined;
};

/** Lê `rateio` da linha da listagem e mapeia para RateioCCDraft[]. */
export const readRateio = (line: ProtheusListaSCLine): RateioCCDraft[] | undefined => {
  const raw = readRateioArray(line);
  if (!raw || raw.length === 0) return undefined;

  const mapped: RateioCCDraft[] = [];
  for (const entry of raw) {
    if (!isPlainObject(entry)) continue;
    const cc = t(entry.cc);
    const percentual = Number(entry.percentual);
    if (!cc || !Number.isFinite(percentual)) continue;
    mapped.push({ cc, percentual });
  }

  return mapped.length > 0 ? mapped : undefined;
};

const mapLineToItem = (line: ProtheusListaSCLine, filial: string, numero: string): PurchaseRequestItem => {
  const item = readItemNumero(line);
  const produto = t(line.produto) || readNamed(line, ['produto']);
  const rateioCC = readRateio(line);

  if (rateioCC) {
    return {
      id: `${filial}-${numero}-${item}`,
      item,
      produto,
      unidade: readUnidade(line),
      descricao: t(line.descricao),
      quantidade: Number(line.quant ?? line.quantidade) || 0,
      valorEstimado: 0,
      observacao: t(line.obs) || t(line.observacao) || undefined,
      rateioCC,
      dataEntrega: readLineDataEntrega(line),
      status: resolveLineStatus(line),
    };
  }

  const centroCusto = readCentroCusto(line);
  return {
    id: `${filial}-${numero}-${item}`,
    item,
    produto,
    unidade: readUnidade(line),
    descricao: t(line.descricao),
    quantidade: Number(line.quant ?? line.quantidade) || 0,
    valorEstimado: 0,
    observacao: t(line.obs) || t(line.observacao) || undefined,
    codigoCentroCusto: centroCusto.codigo || undefined,
    descricaoCentroCusto: centroCusto.descricao || undefined,
    dataEntrega: readLineDataEntrega(line),
    status: resolveLineStatus(line),
  };
};

/** Agrupa uma linha flat da API em um PurchaseRequest de um único item. */
export const mapProtheusPurchaseRequest = (line: ProtheusListaSCLine): PurchaseRequest => {
  const filial = t(line.filial);
  const numero = t(line.numero);
  return {
    id: `SC-${filial}-${numero}`,
    numero,
    filial,
    dataCriacao: parseDate(line.emissao),
    status: resolveLineStatus(line),
    solicitante: t(line.solicitante),
    tipoCompra: readLineTipoCompra(line),
    itens: [mapLineToItem(line, filial, numero)],
  };
};

export interface MapProtheusListaSolicitacoesResult {
  requests: PurchaseRequest[];
  lineCount: number;
}

/**
 * Converte o retorno flat `{ SOLICITACOES: [...] }` em PurchaseRequest[]
 * agrupados por filial+numero. `lineCount` reflete o total de linhas da API
 * (base da paginação no ERP).
 */
export const mapProtheusListaSolicitacoesResponse = (
  res: Record<string, unknown>,
): MapProtheusListaSolicitacoesResult => {
  const lines = extractList(res);
  const byKey = new Map<string, PurchaseRequest>();

  for (const line of lines) {
    const filial = t(line.filial);
    const numero = t(line.numero);
    const key = `${filial}|${numero}`;
    const item = mapLineToItem(line, filial, numero);
    const existing = byKey.get(key);
    const tipoCompra = readLineTipoCompra(line);

    if (existing) {
      existing.itens.push(item);
      existing.status = resolveLineStatus(line);
      if (!existing.tipoCompra && tipoCompra) existing.tipoCompra = tipoCompra;
      continue;
    }

    byKey.set(key, {
      id: `SC-${filial}-${numero}`,
      numero,
      filial,
      dataCriacao: parseDate(line.emissao),
      status: resolveLineStatus(line),
      solicitante: t(line.solicitante),
      tipoCompra,
      itens: [item],
    });
  }

  return {
    requests: Array.from(byKey.values()),
    lineCount: lines.length,
  };
};
