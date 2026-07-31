import { Order, OrderItem } from './types/order';

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
  itens: ProtheusItem[];
  logAprova?: string;
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

  return {
    id: `${filial}-${numero}`,
    numero,
    filial,
    fornecedor: nome,
    cnpj,
    valor: Number(p.total) || 0,
    dataEmissao: parseDate(p.emissao),
    dataEntrega: parseDate(p.entrega || p.emissao),
    solicitante,
    status: 'pending',
    itens,
    logAprova: t(p.logAprova) || undefined,
  };
};

export const mapProtheusResponse = (res: ProtheusPedidosResponse | null | undefined): Order[] => {
  if (!res?.pedidos) return [];
  return res.pedidos.map(mapProtheusPedido);
};
