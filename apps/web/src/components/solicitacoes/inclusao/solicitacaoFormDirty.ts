import type { SolicitacaoItemDraft } from "@gestao-compra/shared";

export interface SolicitacaoDraftState {
  produto: string;
  centroCusto: string;
  quantidade: number;
  observacao?: string;
  dataEntrega?: string;
}

export function isSolicitacaoItemObservacaoPreenchida(value?: string): boolean {
  return Boolean(value?.trim());
}

export function isSolicitacaoFormDirty(
  filial: string,
  tipoCompra: string,
  itens: SolicitacaoItemDraft[],
  draft: SolicitacaoDraftState,
): boolean {
  if (filial.trim()) return true;
  if (tipoCompra.trim()) return true;
  if (itens.length > 0) return true;
  if (draft.produto.trim() || draft.centroCusto.trim()) return true;
  if (draft.observacao?.trim()) return true;
  if (draft.dataEntrega?.trim()) return true;
  if (draft.quantidade !== 1) return true;
  return false;
}

const snapshotItens = (itens: SolicitacaoItemDraft[]) =>
  itens.map((item) => ({
    item: item.item ?? "",
    produto: item.produto,
    produtoDescricao: item.produtoDescricao,
    unidade: item.unidade,
    centroCusto: item.centroCusto,
    centroCustoDescricao: item.centroCustoDescricao,
    quantidade: item.quantidade,
    observacao: item.observacao?.trim() ?? "",
    dataEntrega: item.dataEntrega,
  }));

export function isItemDraftInProgress(
  draft: SolicitacaoDraftState,
  defaultDataEntrega = "",
): boolean {
  if (draft.produto.trim() || draft.centroCusto.trim()) return true;
  if (draft.observacao?.trim()) return true;
  if (draft.quantidade !== 1) return true;
  const entrega = draft.dataEntrega?.trim() ?? "";
  if (entrega && entrega !== defaultDataEntrega.trim()) return true;
  return false;
}

export function isSolicitacaoAlterFormDirty(
  initial: { filial: string; tipoCompra: string; itens: SolicitacaoItemDraft[] },
  current: { filial: string; tipoCompra: string; itens: SolicitacaoItemDraft[] },
  draft: SolicitacaoDraftState,
  defaultDataEntrega = "",
): boolean {
  if (isItemDraftInProgress(draft, defaultDataEntrega)) return true;
  if (initial.filial !== current.filial) return true;
  if (initial.tipoCompra !== current.tipoCompra) return true;
  return JSON.stringify(snapshotItens(initial.itens)) !== JSON.stringify(snapshotItens(current.itens));
}
