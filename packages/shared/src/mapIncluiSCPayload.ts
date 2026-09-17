import type { PurchaseRequest } from "./types/purchaseRequest";
import {
  ACAO_ALTERA_SC,
  ACAO_INCLUI_SC,
  type AcaoSolicitacaoCompra,
  type AlteraSCPayload,
  type IncluiSCPayload,
  type SolicitacaoFormPayload,
  type SolicitacaoItemDraft,
} from "./types/solicitacaoInclusao";
import type { TipoCompra } from "./tipoCompra";

export type IncluiSCPayloadOptions = {
  acao?: AcaoSolicitacaoCompra;
  numeroSC?: string;
};

const mapFormItens = (
  form: SolicitacaoFormPayload,
  acao: AcaoSolicitacaoCompra,
): IncluiSCPayload["itens"] =>
  form.itens.map((item) => {
    const base = {
      ...(acao === ACAO_ALTERA_SC && item.item?.trim() ? { item: item.item.trim() } : {}),
      codigoProduto: item.produto,
      quantidade: item.quantidade,
      observacao: item.observacao?.trim() || undefined,
      placa: item.placa?.trim() ?? "",
      dataEntrega: item.dataEntrega,
    };

    const rateio = item.rateioCC
      ?.map((row) => ({
        cc: row.cc.trim(),
        percentual: Number(row.percentual),
      }))
      .filter((row) => row.cc);

    if (rateio && rateio.length > 0) {
      return { ...base, rateioCC: rateio };
    }

    return { ...base, centroCusto: item.centroCusto };
  });

export const mapFormToIncluiSCPayload = (
  form: SolicitacaoFormPayload,
  solicitante: string,
  options?: IncluiSCPayloadOptions,
): IncluiSCPayload => {
  const acao = options?.acao ?? ACAO_INCLUI_SC;
  const numeroSC = options?.numeroSC?.trim();

  return {
    filial: form.filial,
    solicitante,
    tipoCompra: form.tipoCompra,
    acao,
    ...(acao === ACAO_ALTERA_SC && numeroSC ? { numeroSC } : {}),
    itens: mapFormItens(form, acao),
  };
};

export const mapFormToAlteraSCPayload = (
  form: SolicitacaoFormPayload,
  solicitante: string,
  numeroSC: string,
): AlteraSCPayload =>
  mapFormToIncluiSCPayload(form, solicitante, {
    acao: ACAO_ALTERA_SC,
    numeroSC,
  }) as AlteraSCPayload;

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
    placa: "",
    dataEntrega: item.dataEntrega || request.dataCriacao || "",
  })),
});
