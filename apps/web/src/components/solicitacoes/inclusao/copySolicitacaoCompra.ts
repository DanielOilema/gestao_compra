import type {
  PurchaseRequest,
  SolicitacaoItemDraft,
  TipoCompra,
} from "@gestao-compra/shared";

export interface NovaSolicitacaoLocationState {
  copyFrom?: PurchaseRequest;
  alterFrom?: PurchaseRequest;
}

export interface SolicitacaoInclusaoDraft {
  filial: string;
  tipoCompra: TipoCompra | "";
  itens: SolicitacaoItemDraft[];
}

const newDraftItemId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `item-${Math.random().toString(36).slice(2)}`;

export const mapPurchaseRequestToInclusaoDraft = (
  request: PurchaseRequest,
): SolicitacaoInclusaoDraft => ({
  filial: request.filial,
  tipoCompra: request.tipoCompra ?? "",
  itens: request.itens.map((item) => {
    const hasRateio = Boolean(item.rateioCC && item.rateioCC.length > 0);
    return {
      id: newDraftItemId(),
      produto: item.produto,
      produtoDescricao: item.descricao,
      unidade: item.unidade || "UN",
      centroCusto: hasRateio ? "" : (item.codigoCentroCusto ?? ""),
      centroCustoDescricao: hasRateio ? "" : (item.descricaoCentroCusto ?? ""),
      quantidade: item.quantidade,
      observacao: item.observacao ?? "",
      placa: "",
      dataEntrega: item.dataEntrega || request.dataCriacao || "",
      ...(hasRateio
        ? {
            rateioCC: item.rateioCC!.map((row) => ({
              cc: row.cc.trim(),
              percentual: Number(row.percentual),
              descricao: row.descricao,
            })),
          }
        : {}),
    };
  }),
});
