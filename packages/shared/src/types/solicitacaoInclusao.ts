import type { TipoCompra } from "../tipoCompra";

export const ACAO_INCLUI_SC = "incluir" as const;
export const ACAO_ALTERA_SC = "alterar" as const;

export type AcaoSolicitacaoCompra = typeof ACAO_INCLUI_SC | typeof ACAO_ALTERA_SC;

export interface RateioCCPayload {
  cc: string;
  percentual: number;
}

export interface RateioCCDraft extends RateioCCPayload {
  descricao?: string;
}

export interface SolicitacaoItemDraft {
  id: string;
  item?: string;
  produto: string;
  produtoDescricao: string;
  unidade: string;
  centroCusto: string;
  centroCustoDescricao: string;
  quantidade: number;
  observacao?: string;
  placa?: string;
  dataEntrega: string;
  rateioCC?: RateioCCDraft[];
}

export interface SolicitacaoFormPayload {
  filial: string;
  tipoCompra: TipoCompra;
  itens: Omit<SolicitacaoItemDraft, "id">[];
}

export interface IncluiSCItemPayload {
  item: string;
  codigoProduto: string;
  quantidade: number;
  centroCusto?: string;
  rateioCC?: RateioCCPayload[];
  observacao?: string;
  placa: string;
  dataEntrega: string;
}

export interface IncluiSCPayload {
  filial: string;
  solicitante: string;
  tipoCompra: TipoCompra;
  acao: AcaoSolicitacaoCompra;
  numeroSC?: string;
  itens: IncluiSCItemPayload[];
  excluir?: ExcluirSCItemPayload[];
}

export interface ExcluirSCItemPayload {
  item: number;
  produto: string;
}

export interface IncluiSCResult {
  mensagem: string;
  numeroSC?: string;
}

export interface AlteraSCItemPayload extends IncluiSCItemPayload {
  item: string;
}

export interface AlteraSCPayload extends IncluiSCPayload {
  acao: typeof ACAO_ALTERA_SC;
  numeroSC: string;
  excluir?: ExcluirSCItemPayload[];
}

export interface AlteraSCResult {
  mensagem: string;
  numeroSC?: string;
}
