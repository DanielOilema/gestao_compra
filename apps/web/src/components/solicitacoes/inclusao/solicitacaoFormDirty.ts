import type { SolicitacaoItemDraft } from "@gestao-compra/shared";

export interface SolicitacaoDraftState {
  produto: string;
  centroCusto: string;
  quantidade: number;
  observacao?: string;
  dataEntrega?: string;
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
