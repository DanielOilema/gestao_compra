import type { PurchaseRequest } from "@gestao-compra/shared";
import { mapProtheusListaSolicitacoesResponse } from "@gestao-compra/shared";
import type { SolicitacaoCompraListFilters } from "@/components/solicitacoes/listagem/solicitacaoCompraListFilters";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export const SOLICITACOES_PAGE_SIZE = 20;

export interface GetSolicitacoesCompraParams {
  filters: SolicitacaoCompraListFilters;
  page: number;
  pageSize: number;
  accessToken: string;
}

export interface GetSolicitacoesCompraResult {
  requests: PurchaseRequest[];
  hasNextPage: boolean;
}

export async function getSolicitacoesCompra({
  filters,
  page,
  pageSize,
  accessToken,
}: GetSolicitacoesCompraParams): Promise<GetSolicitacoesCompraResult> {
  const body: Record<string, string | number> = {
    page,
    pageSize,
    accessToken,
  };

  if (filters.filial.trim()) body.filial = filters.filial.trim();
  if (filters.numSC.trim()) body.numSC = filters.numSC.trim();
  if (filters.produto.trim()) body.produto = filters.produto.trim();
  if (filters.solicitante.trim()) body.solicitante = filters.solicitante.trim();
  if (filters.dataInicio.trim()) body.dtInicial = filters.dataInicio.trim();
  if (filters.dataFim.trim()) body.dtFinal = filters.dataFim.trim();

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
