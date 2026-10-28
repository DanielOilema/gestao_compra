import { Order, OrderItem } from './types/order';
import { mapProtheusTipoCompra } from './tipoCompra';

interface ProtheusItem {
  produto: string;
  descProduto: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
  desconto?: number;
  ccusto: string;
  observacao?: string;
  solicitante?: string;
}

interface ProtheusPedido {
  filial: string;
  numero: string;
  fornecedor: string;
  cnpj?: string;
  condpag?: string;
  emissao: string;
  entrega?: string;
  total: number;
  frete?: number | string | null;
  itens: ProtheusItem[];
  logAprova?: string;
  tipoCompra?: string | number;
  tipocompra?: string | number;
  tpcompra?: string | number;
}

export interface ProtheusPedidosResponse {
  pedidos: ProtheusPedido[];
}

const t = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

const parseFornecedor = (raw: string): { cnpj: string; nome: string } => {
  const s = t(raw);
  const match = s.match(/^([\d./-]+)\s+(.*)$/);
  if (match) return { cnpj: match[1], nome: match[2].trim() };
  return { cnpj: '', nome: s };
};

const parseCcusto = (raw: string): { codigo: string; descricao: string } => {
  const s = t(raw);
  const idx = s.indexOf('-');
  if (idx === -1) return { codigo: s, descricao: '' };
  return { codigo: s.slice(0, idx).trim(), descricao: s.slice(idx + 1).trim() };
};

const parseDate = (raw: string): string => t(raw).replace(/\//g, '-');

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const resolvePedidoTotais = (
  order: Pick<Order, 'valor' | 'valorItens' | 'frete'>,
): { valorItens: number; frete: number; valorPedido: number } => {
  const frete = toNumber(order.frete);
  const valorItens =
    typeof order.valorItens === 'number' && Number.isFinite(order.valorItens)
      ? order.valorItens
      : toNumber(order.valor);
  return { valorItens, frete, valorPedido: valorItens + frete };
};

export const mapProtheusPedido = (p: ProtheusPedido): Order => {
  const { nome } = parseFornecedor(p.fornecedor);
  const filial = t(p.filial);
  const numero = t(p.numero);
  const cnpj = t(p.cnpj);

  const itens: OrderItem[] = (p.itens ?? []).map((it, idx) => {
    const cc = parseCcusto(it.ccusto);
    return {
      id: `${filial}-${numero}-${idx}`,
      codigoProduto: t(it.produto),
      descricaoProduto: t(it.descProduto),
      quantidade: Number(it.quantidade) || 0,
      valorUnitario: Number(it.valorUnitario) || 0,
      valorTotal: Number(it.total) || 0,
      codigoCentroCusto: cc.codigo,
      descricaoCentroCusto: cc.descricao,
      observacao: t(it.observacao) || undefined,
      solicitante: t(it.solicitante) || undefined,
    };
  });

  const solicitante = t(p.itens?.[0]?.solicitante) || '-';
  const tipoCompra = mapProtheusTipoCompra(p.tipoCompra ?? p.tipocompra ?? p.tpcompra);
  const totalInformado = Number(p.total);
  const valorItensLinhas = itens.reduce((sum, item) => sum + item.valorTotal, 0);
  const valorItens = Number.isFinite(totalInformado) ? totalInformado : valorItensLinhas;
  const frete = toNumber(p.frete);

  return {
    id: `${filial}-${numero}`,
    numero,
    filial,
    fornecedor: nome,
    cnpj,
    valorItens,
    frete,
    valor: valorItens + frete,
    dataEmissao: parseDate(p.emissao),
    dataEntrega: parseDate(p.entrega || p.emissao),
    solicitante,
    status: 'pending',
    itens,
    logAprova: t(p.logAprova) || undefined,
    tipoCompra,
  };
};

export const mapProtheusResponse = (res: ProtheusPedidosResponse | null | undefined): Order[] => {
  if (!res?.pedidos) return [];
  return res.pedidos.map(mapProtheusPedido);
};
