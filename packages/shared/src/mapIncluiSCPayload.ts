import type { PurchaseRequest } from "./types/purchaseRequest";
import {
  ACAO_ALTERA_SC,
  ACAO_INCLUI_SC,
  type AcaoSolicitacaoCompra,
  type AlteraSCPayload,
  type ExcluirSCItemPayload,
  type IncluiSCPayload,
  type SolicitacaoFormPayload,
  type SolicitacaoItemDraft,
} from "./types/solicitacaoInclusao";
import { assignNumerosItens, formatNumeroItem, parseNumeroItem } from "./numeroItemSolicitacao";
import type { TipoCompra } from "./tipoCompra";

export type IncluiSCPayloadOptions = {
  acao?: AcaoSolicitacaoCompra;
  numeroSC?: string;
  /** Maior número de item da SC original, para não reutilizar códigos removidos. */
  numeroItemReservado?: number;
  /** Itens originais removidos na alteração. */
  excluir?: { item?: string; produto?: string }[];
};

const mapFormItens = (
  form: SolicitacaoFormPayload,
  acao: AcaoSolicitacaoCompra,
  numeroItemReservado?: number,
): IncluiSCPayload["itens"] =>
  assignNumerosItens(form.itens, {
    preserveExisting: acao === ACAO_ALTERA_SC,
    reservedMax: numeroItemReservado,
  }).map((item) => {
    const base = {
      item: item.item!.trim(),
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

const mapExcluir = (
  excluir: { item?: string; produto?: string }[] | undefined,
): ExcluirSCItemPayload[] => {
  const mapped: ExcluirSCItemPayload[] = [];
  for (const row of excluir ?? []) {
    const item = parseNumeroItem(row.item);
    const produto = row.produto?.trim() ?? "";
    if (item == null || !produto) continue;
    if (mapped.some((entry) => entry.item === item)) continue;
    mapped.push({ item, produto });
  }
  return mapped;
};

/** Itens da SC original cujo número não está mais na lista enviada. */
export const listItensExcluidos = (
  originais: { item?: string; produto?: string }[],
  atuais: { item?: string }[],
): { item: string; produto: string }[] => {
  const presentes = new Set(
    atuais
      .map((item) => parseNumeroItem(item.item))
      .filter((numero): numero is number => numero != null),
  );
  const excluidos: { item: string; produto: string }[] = [];

  for (const original of originais) {
    const numero = parseNumeroItem(original.item);
    const produto = original.produto?.trim() ?? "";
    if (numero == null || !produto || presentes.has(numero)) continue;
    if (excluidos.some((row) => parseNumeroItem(row.item) === numero)) continue;
    excluidos.push({ item: formatNumeroItem(numero), produto });
  }

  return excluidos;
};

export const mapFormToIncluiSCPayload = (
  form: SolicitacaoFormPayload,
  solicitante: string,
  options?: IncluiSCPayloadOptions,
): IncluiSCPayload => {
  const acao = options?.acao ?? ACAO_INCLUI_SC;
  const numeroSC = options?.numeroSC?.trim();
  const excluir = acao === ACAO_ALTERA_SC ? mapExcluir(options?.excluir) : [];

  return {
    filial: form.filial,
    solicitante,
    tipoCompra: form.tipoCompra,
    acao,
    ...(acao === ACAO_ALTERA_SC && numeroSC ? { numeroSC } : {}),
    itens: mapFormItens(form, acao, options?.numeroItemReservado),
    ...(excluir.length > 0 ? { excluir } : {}),
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
  itens: request.itens.map((item) => {
    const hasRateio = Boolean(item.rateioCC && item.rateioCC.length > 0);
    return {
      id: item.id,
      item: item.item,
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
