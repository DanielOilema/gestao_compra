import type { PurchaseRequest, PurchaseRequestItem } from "./types/purchaseRequest";

const itemKey = (item: PurchaseRequestItem): string => item.item.trim() || item.id;

const compareItem = (a: PurchaseRequestItem, b: PurchaseRequestItem): number =>
  a.item.localeCompare(b.item, undefined, { numeric: true });

/** Junta páginas da mesma SC, sem repetir o número do item. */
export function mergePurchaseRequests(requests: PurchaseRequest[]): PurchaseRequest | null {
  if (requests.length === 0) return null;

  const [first] = requests;
  const itens = new Map<string, PurchaseRequestItem>();

  for (const request of requests) {
    for (const item of request.itens) {
      const key = itemKey(item);
      if (!itens.has(key)) itens.set(key, item);
    }
  }

  const tipoCompra = requests.find((request) => request.tipoCompra)?.tipoCompra ?? first.tipoCompra;

  return {
    ...first,
    tipoCompra,
    itens: [...itens.values()].sort(compareItem),
  };
}
