import { getFilialState } from "./formatOrder";
import type { PurchaseRequest, SolicitacaoCompraRow } from "./types/purchaseRequest";
import { mapProtheusSolicitacaoCompraStatus } from "./solicitacaoCompraStatus";

export function formatNumeroSc(numero: string): string {
  const digits = numero.replace(/\D/g, "");
  return digits.slice(-6).padStart(6, "0");
}

export function formatFilialLabel(filial: string): string {
  const state = getFilialState(filial);
  return `${filial} - ${state.toUpperCase()}`;
}

export function flattenPurchaseRequests(requests: PurchaseRequest[]): SolicitacaoCompraRow[] {
  const rows: SolicitacaoCompraRow[] = [];

  for (const request of requests) {
    const numeroSc = formatNumeroSc(request.numero);
    const filialLabel = formatFilialLabel(request.filial);

    for (const item of request.itens) {
      rows.push({
        rowId: `${request.id}-${item.id}`,
        requestId: request.id,
        filial: request.filial,
        filialLabel,
        numeroSc,
        item: item.item,
        produto: item.produto,
        descricao: item.descricao,
        unidade: item.unidade,
        quantidade: item.quantidade,
        status:
          item.status ??
          (typeof request.status === "string"
            ? mapProtheusSolicitacaoCompraStatus(String(request.status))
            : "aberto"),
        solicitante: request.solicitante,
        dataCriacao: request.dataCriacao,
      });
    }
  }

  return rows;
}
