import { Order, OrderItem } from './types/order';

interface ProtheusSCItem {
  produto?: string;
  descProduto?: string;
  quantidade?: number;
  valorUnitario?: number;
  total?: number;
  ccusto?: string;
  observacao?: string;
  solicitante?: string;
}

interface ProtheusSC {
  filial?: string;
  numero?: string;
  emissao?: string;
  entrega?: string;
  total?: number;
  solicitante?: string;
  usuario?: string;
  userLgi?: string;
  comprador?: string;
  logAprova?: string;
  itens?: ProtheusSCItem[];
}

const t = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

const parseCcusto = (raw?: string): { codigo: string; descricao: string } => {
  const s = t(raw);
  const idx = s.indexOf('-');
  if (idx === -1) return { codigo: s, descricao: '' };
  return { codigo: s.slice(0, idx).trim(), descricao: s.slice(idx + 1).trim() };
};

const parseDate = (raw?: string): string => t(raw).replace(/\//g, '-');

export const mapProtheusSC = (s: ProtheusSC): Order => {
  const filial = t(s.filial);
  const numero = t(s.numero);

  const itens: OrderItem[] = (s.itens ?? []).map((it, idx) => {
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

  const solicitante =
    t(s.solicitante) ||
    t(s.usuario) ||
    t(s.userLgi) ||
    t((s as { comprador?: string }).comprador) ||
    t(s.itens?.[0]?.solicitante) ||
    '';

  return {
    id: `SC-${filial}-${numero}`,
    numero,
    filial,
    fornecedor: 'A definir',
    cnpj: '',
    valor: Number(s.total) || 0,
    dataEmissao: parseDate(s.emissao),
    dataEntrega: parseDate(s.entrega || s.emissao),
    solicitante,
    status: 'pending',
    itens,
    logAprova: t(s.logAprova) || undefined,
  };
};

export const mapProtheusSCResponse = (res: Record<string, unknown>): Order[] => {
  const list =
    (res?.solicitacoes as ProtheusSC[] | undefined) ??
    (res?.pedidos as ProtheusSC[] | undefined) ??
    (res?.scs as ProtheusSC[] | undefined) ??
    [];
  if (!Array.isArray(list)) return [];
  return list.map(mapProtheusSC);
};
