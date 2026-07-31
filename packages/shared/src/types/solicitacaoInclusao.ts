import type { TipoCompra } from "../tipoCompra";

export interface SolicitacaoItemDraft {
  id: string;
  produto: string;
  produtoDescricao: string;
  unidade: string;
  centroCusto: string;
  centroCustoDescricao: string;
  quantidade: number;
  observacao?: string;
  dataEntrega: string;
}

export interface SolicitacaoFormPayload {
  filial: string;
  tipoCompra: TipoCompra;
  itens: Omit<SolicitacaoItemDraft, "id">[];
}

export interface IncluiSCItemPayload {
  codigoProduto: string;
  quantidade: number;
  centroCusto: string;
  observacao?: string;
  dataEntrega: string;
}

export interface IncluiSCPayload {
  filial: string;
  solicitante: string;
  tipoCompra: TipoCompra;
  itens: IncluiSCItemPayload[];
}

export interface IncluiSCResult {
  mensagem: string;
  numeroSC?: string;
}
