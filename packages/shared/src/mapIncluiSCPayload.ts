import type { PurchaseRequest } from "./types/purchaseRequest";
import type {
  AlteraSCPayload,
  IncluiSCPayload,
  SolicitacaoFormPayload,
  SolicitacaoItemDraft,
} from "./types/solicitacaoInclusao";
import type { TipoCompra } from "./tipoCompra";

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

export const mapFormToAlteraSCPayload = (
  form: SolicitacaoFormPayload,
  solicitante: string,
  numeroSC: string,
): AlteraSCPayload => ({
  filial: form.filial,
  numeroSC,
  solicitante,
  tipoCompra: form.tipoCompra,
  itens: form.itens.map((item) => ({
    item: item.item?.trim() || undefined,
    codigoProduto: item.produto,
    quantidade: item.quantidade,
    centroCusto: item.centroCusto,
    observacao: item.observacao?.trim() || undefined,
    dataEntrega: item.dataEntrega,
  })),
});

export interface SolicitacaoAlteracaoDraft {
  filial: string;
  tipoCompra: TipoCompra | "";
  numeroSC: string;
  itens: SolicitacaoItemDraft[];
}

export const mapPurchaseRequestToSolicitacaoDraft = (
  request: PurchaseRequest,
): SolicitacaoAlteracaoDraft => ({
  filial: request.filial,
  tipoCompra: request.tipoCompra ?? "",
  numeroSC: request.numero,
  itens: request.itens.map((item) => ({
    id: item.id,
    item: item.item,
    produto: item.produto,
    produtoDescricao: item.descricao,
    unidade: item.unidade || "UN",
    centroCusto: item.codigoCentroCusto ?? "",
    centroCustoDescricao: item.descricaoCentroCusto ?? "",
    quantidade: item.quantidade,
    observacao: item.observacao ?? "",
    dataEntrega: item.dataEntrega || request.dataCriacao || "",
  })),
});

