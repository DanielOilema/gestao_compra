import type { TipoCompra } from "../tipoCompra";

export type StatusAcompanhamentoSolicitacao =
  | "BLOQUEADA"
  | "APROVADA"
  | "EM_COTACAO"
  | "PEDIDO"
  | "PRE_NOTA";

export interface KanbanSolicitacaoColumn {
  status: StatusAcompanhamentoSolicitacao;
  title: string;
}

/** Nova etapa do quadro = um item nesta lista. */
export const KANBAN_SOLICITACAO_COLUMNS: readonly KanbanSolicitacaoColumn[] = [
  { status: "BLOQUEADA", title: "Bloqueadas" },
  { status: "APROVADA", title: "Aprovadas" },
  { status: "EM_COTACAO", title: "Em cotação" },
  { status: "PEDIDO", title: "Pedidos" },
  { status: "PRE_NOTA", title: "Pré-nota" },
];

export interface AprovadorSolicitacao {
  nome?: string;
  status?: string;
  dataHora?: string;
  observacao?: string;
}

export interface AprovacaoSolicitacao {
  aprovadores?: AprovadorSolicitacao[];
  historico?: AprovadorSolicitacao[];
  observacoes?: string;
}

export interface CotacaoFornecedor {
  nome?: string;
  escolhido?: boolean;
}

export interface CotacaoProduto {
  codigo?: string;
  descricao?: string;
  quantidade?: number;
  preco?: number;
}

export interface CotacaoSolicitacao {
  numero?: string;
  fornecedores?: CotacaoFornecedor[];
  produtos?: CotacaoProduto[];
  condicoesComerciais?: string;
  fornecedorEscolhido?: string;
  status?: string;
}

export interface PedidoSolicitacaoItem {
  item?: string;
  produto?: string;
  descricao?: string;
  quantidade?: number;
  valor?: number;
}

export interface PedidoSolicitacao {
  numero?: string;
  fornecedor?: string;
  data?: string;
  valor?: number;
  itens?: PedidoSolicitacaoItem[];
  status?: string;
}

export interface NotaFiscalSolicitacao {
  numero?: string;
  fornecedor?: string;
  data?: string;
  valor?: number;
  chaveNfe?: string;
  statusEntrada?: string;
}

export interface SolicitacaoAcompanhamentoItem {
  item?: string;
  produto?: string;
  descricao?: string;
  quantidade?: number;
  centroCusto?: string;
}

export interface SolicitacaoAcompanhamento {
  id: string;
  numero: string;
  filial?: string;
  solicitante?: string;
  comprador?: string;
  dataSolicitacao?: string;
  tipoCompra?: TipoCompra;
  statusAtual: StatusAcompanhamentoSolicitacao;
  quantidadeItens?: number;
  observacoes?: string;
  centroCusto?: string;
  itens?: SolicitacaoAcompanhamentoItem[];
  aprovacao?: AprovacaoSolicitacao;
  cotacoes?: CotacaoSolicitacao[];
  pedidos?: PedidoSolicitacao[];
  notasFiscais?: NotaFiscalSolicitacao[];
}

export interface SolicitacaoStatusNaoReconhecido {
  id: string;
  numero: string;
  filial?: string;
  statusInformado: string;
}

/** Campos previstos para a busca. A tela inicial usa apenas `numero`. */
export interface AcompanhamentoSolicitacaoFilters {
  numero: string;
  solicitante: string;
  comprador: string;
  tipoCompra: TipoCompra | "";
  centroCusto: string;
  dataInicio: string;
  dataFim: string;
  status: StatusAcompanhamentoSolicitacao | "";
  fornecedor: string;
  filial: string;
}

export const emptyAcompanhamentoSolicitacaoFilters = (): AcompanhamentoSolicitacaoFilters => ({
  numero: "",
  solicitante: "",
  comprador: "",
  tipoCompra: "",
  centroCusto: "",
  dataInicio: "",
  dataFim: "",
  status: "",
  fornecedor: "",
  filial: "",
});

export interface KanbanSolicitacaoGrupo {
  status: StatusAcompanhamentoSolicitacao;
  title: string;
  solicitacoes: SolicitacaoAcompanhamento[];
}

export const getTituloColunaAcompanhamento = (
  status: StatusAcompanhamentoSolicitacao,
): string =>
  KANBAN_SOLICITACAO_COLUMNS.find((column) => column.status === status)?.title ?? status;

/** Posiciona cada solicitação na raia do `statusAtual` já informado pelo Protheus. */
export const groupSolicitacoesPorColuna = (
  solicitacoes: readonly SolicitacaoAcompanhamento[],
): KanbanSolicitacaoGrupo[] => {
  const buckets = new Map<StatusAcompanhamentoSolicitacao, SolicitacaoAcompanhamento[]>(
    KANBAN_SOLICITACAO_COLUMNS.map((column) => [column.status, []]),
  );

  for (const solicitacao of solicitacoes) {
    buckets.get(solicitacao.statusAtual)?.push(solicitacao);
  }

  return KANBAN_SOLICITACAO_COLUMNS.map((column) => ({
    status: column.status,
    title: column.title,
    solicitacoes: buckets.get(column.status) ?? [],
  }));
};
