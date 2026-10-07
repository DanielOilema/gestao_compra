import type { PurchaseRequest } from "@gestao-compra/shared";
import { formatNumeroSc } from "@gestao-compra/shared";
import { emptySolicitacaoCompraListFilters } from "@/components/solicitacoes/listagem/solicitacaoCompraListFilters";
import { getSolicitacoesCompra, SOLICITACOES_PAGE_SIZE } from "@/hooks/getSolicitacoesCompra";

const DETALHE_NAO_ENCONTRADO = "Não foi possível encontrar os detalhes desta solicitação.";
const MAX_PAGES = 20;

const sameDocument = (request: PurchaseRequest, filial: string, numSC: string): boolean => {
  const filialOk = !filial || request.filial.trim() === filial;
  const numeroOk =
    request.numero.trim() === numSC || formatNumeroSc(request.numero) === formatNumeroSc(numSC);
  return filialOk && numeroOk;
};

const mergeRequest = (current: PurchaseRequest | undefined, next: PurchaseRequest): PurchaseRequest => {
  if (!current) return { ...next, itens: [...next.itens] };
  return {
    ...current,
    status: next.status,
    solicitante: current.solicitante || next.solicitante,
    tipoCompra: current.tipoCompra ?? next.tipoCompra,
    itens: [...current.itens, ...next.itens],
  };
};

export async function getSolicitacaoCompraDetalhe(
  filial: string,
  numSC: string,
  basicAuth: string,
  codUser: string,
  nomeUser: string,
): Promise<PurchaseRequest> {
  const filters = {
    ...emptySolicitacaoCompraListFilters(),
    filial: filial.trim(),
    numSC: numSC.trim(),
  };

  let merged: PurchaseRequest | undefined;

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await getSolicitacoesCompra({
      filters,
      page,
      pageSize: SOLICITACOES_PAGE_SIZE,
      basicAuth,
      codUser,
      nomeUser,
    });
    const match = result.requests.find((request) => sameDocument(request, filters.filial, filters.numSC));
    if (match) merged = mergeRequest(merged, match);
    if (!result.hasNextPage) break;
  }

  if (!merged) throw new Error(DETALHE_NAO_ENCONTRADO);
  return merged;
}
