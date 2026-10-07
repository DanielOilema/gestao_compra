import type { PurchaseRequest } from "@gestao-compra/shared";
import { mapProtheusListaSolicitacoesResponse, mergePurchaseRequests } from "@gestao-compra/shared";
import type { SolicitacaoCompraListFilters } from "@/components/solicitacoes/listagem/solicitacaoCompraListFilters";
import { emptySolicitacaoCompraListFilters } from "@/components/solicitacoes/listagem/solicitacaoCompraListFilters";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";
import { toApiDate } from "@/lib/dateBr";

export const SOLICITACOES_PAGE_SIZE = 20;
const SOLICITACAO_COMPLETA_MAX_PAGES = 50;

export interface GetSolicitacoesCompraParams {
  filters: SolicitacaoCompraListFilters;
  page: number;
  pageSize: number;
  basicAuth: string;
  codUser: string;
  nomeUser: string;
}

export interface GetSolicitacoesCompraResult {
  requests: PurchaseRequest[];
  hasNextPage: boolean;
}

export async function getSolicitacoesCompra({
  filters,
  page,
  pageSize,
  basicAuth,
  codUser,
  nomeUser,
}: GetSolicitacoesCompraParams): Promise<GetSolicitacoesCompraResult> {
  const body: Record<string, string | number> = {
    page,
    pageSize,
    basicAuth,
  };

  if (codUser.trim()) body.codUser = codUser.trim();
  if (nomeUser.trim()) body.nomeUser = nomeUser.trim();

  if (filters.filial.trim()) body.filial = filters.filial.trim();
  if (filters.numSC.trim()) body.numSC = filters.numSC.trim();
  if (filters.produto.trim()) body.produto = filters.produto.trim();
  if (filters.solicitante.trim()) body.solicitante = filters.solicitante.trim();

  const dtInicial = toApiDate(filters.dataInicio);
  const dtFinal = toApiDate(filters.dataFim);
  if (dtInicial) body.dtInicial = dtInicial;
  if (dtFinal) body.dtFinal = dtFinal;

  const data = await invokeProtheusFunction<Record<string, unknown>>(
    "protheus-lista-solicitacoes",
    body,
    "Falha ao buscar solicitações",
  );

  const { requests, lineCount } = mapProtheusListaSolicitacoesResponse(data ?? {});

  return {
    requests,
    hasNextPage: lineCount === pageSize,
  };
}

const sameSolicitacao = (request: PurchaseRequest, filial: string, numero: string): boolean =>
  request.filial.trim() === filial.trim() && request.numero.trim() === numero.trim();

/** Busca todas as páginas da SC (filial + número) e agrupa os itens. */
export async function getSolicitacaoCompraCompleta({
  filial,
  numero,
  basicAuth,
  codUser,
  nomeUser,
}: {
  filial: string;
  numero: string;
  basicAuth: string;
  codUser: string;
  nomeUser: string;
}): Promise<PurchaseRequest> {
  const filters: SolicitacaoCompraListFilters = {
    ...emptySolicitacaoCompraListFilters(),
    filial: filial.trim(),
    numSC: numero.trim(),
  };
  const pages: PurchaseRequest[] = [];

  for (let page = 1; page <= SOLICITACAO_COMPLETA_MAX_PAGES; page += 1) {
    const result = await getSolicitacoesCompra({
      filters,
      page,
      pageSize: SOLICITACOES_PAGE_SIZE,
      basicAuth,
      codUser,
      nomeUser,
    });
    pages.push(...result.requests.filter((request) => sameSolicitacao(request, filial, numero)));
    if (!result.hasNextPage) break;
  }

  const merged = mergePurchaseRequests(pages);
  if (!merged || merged.itens.length === 0) {
    throw new Error("Não foi possível carregar todos os itens da solicitação");
  }
  return merged;
}
