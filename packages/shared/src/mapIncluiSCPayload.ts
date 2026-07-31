import type {
  IncluiSCPayload,
  SolicitacaoFormPayload,
} from "./types/solicitacaoInclusao";

export const mapFormToIncluiSCPayload = (
  form: SolicitacaoFormPayload,
  solicitante: string,
): IncluiSCPayload => ({
  filial: form.filial,
  solicitante,
  tipoCompra: form.tipoCompra,
  itens: form.itens.map((item) => ({
    codigoProduto: item.produto,
    quantidade: item.quantidade,
    centroCusto: item.centroCusto,
    observacao: item.observacao?.trim() || undefined,
    dataEntrega: item.dataEntrega,
  })),
});
