export interface RastroSolicitacaoItem {
  item?: string;
  produto?: string;
  quantidade?: number;
  centroCusto?: string;
  observacao?: string;
  unidadeMedida?: string;
}

export interface RastroSolicitacaoDoc {
  numero: string;
  filial: string;
  emissao?: string;
  itens: RastroSolicitacaoItem[];
}

export interface RastroCotacaoItem {
  item?: string;
  produto?: string;
  quantidade?: number;
  preco?: number;
  total?: number;
  desconto?: number;
  itemSC?: string;
  numPedido?: string;
  itemPedido?: string;
}

export interface RastroCotacaoDoc {
  cotacao: string;
  fornecedor: string;
  loja: string;
  nomeFornecedor?: string;
  condPagto?: string;
  emissao?: string;
  itens: RastroCotacaoItem[];
}

export interface RastroPedidoItem {
  item?: string;
  produto?: string;
  quantidade?: number;
  preco?: number;
  total?: number;
  centroCusto?: string;
}

export interface RastroPedidoDoc {
  pedido: string;
  fornecedor: string;
  loja: string;
  nomeFornecedor?: string;
  emissao?: string;
  itens: RastroPedidoItem[];
}

export interface RastroNotaItem {
  item?: string;
  produto?: string;
  descricao?: string;
  quantidade?: number;
  valorUnitario?: number;
  total?: number;
  tes?: string;
  centroCusto?: string;
  pedido?: string;
  itemPedido?: string;
}

export interface RastroNotaDoc {
  fornecedor: string;
  loja: string;
  nomeFornecedor?: string;
  notaFiscal: string;
  documento: string;
  serie: string;
  status?: string;
  emissao?: string;
  itens: RastroNotaItem[];
}

export interface RastroNoBase {
  id: string;
  titulo: string;
  subtitulo: string;
}

export interface RastroNoSolicitacao extends RastroNoBase {
  tipo: "solicitacao";
  documento: RastroSolicitacaoDoc;
}

export interface RastroNoCotacao extends RastroNoBase {
  tipo: "cotacao";
  documento: RastroCotacaoDoc;
}

export interface RastroNoPedido extends RastroNoBase {
  tipo: "pedido";
  documento: RastroPedidoDoc;
}

export interface RastroNoNota extends RastroNoBase {
  tipo: "nota";
  documento: RastroNotaDoc;
}

export type RastroNo = RastroNoSolicitacao | RastroNoCotacao | RastroNoPedido | RastroNoNota;

export interface RastroLigacao {
  origemId: string;
  destinoId: string;
}

export interface RastroColuna {
  id: "solicitacao" | "cotacao" | "pedido" | "nota";
  nos: RastroNo[];
}

export interface RastroSolicitacaoGrafo {
  invalido: boolean;
  solicitacao: RastroNoSolicitacao | null;
  cotacoes: RastroNoCotacao[];
  pedidos: RastroNoPedido[];
  notasFiscais: RastroNoNota[];
  ligacoes: RastroLigacao[];
}
