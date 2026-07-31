import {
  filterNotasByPesquisa,
  flattenNotasToRows,
  mapProtheusNotasDebitoCreditoResponse,
  type DebitCreditNote,
  type NotaListRow,
} from "@gestao-compra/shared";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";
import type { NotasListFilters } from "@/components/notas/listagem/notasListFilters";

export const NOTAS_PAGE_SIZE = 20;

export interface GetNotasDebitoCreditoParams {
  filters: NotasListFilters;
  page: number;
  pageSize: number;
  accessToken: string;
}

export interface GetNotasDebitoCreditoResult {
  notas: DebitCreditNote[];
  rows: NotaListRow[];
  hasNextPage: boolean;
  lineCount: number;
}

export async function getNotasDebitoCredito({
  filters,
  page,
  pageSize,
  accessToken,
}: GetNotasDebitoCreditoParams): Promise<GetNotasDebitoCreditoResult> {
  const data = await invokeProtheusFunction<Record<string, unknown>>(
    "protheus-notas-debito-credito",
    {
      page,
      pageSize,
      accessToken,
      tipo:
        filters.tipo === "credito"
          ? "C"
          : filters.tipo === "debito"
            ? "D"
            : "",
      cliFor: filters.cliFor.trim() || undefined,
      filtro: filters.pesquisa.trim() || undefined,
      dtInicial: filters.dataInicio.trim() || undefined,
      dtFinal: filters.dataFim.trim() || undefined,
    },
    "Falha ao buscar notas de débito/crédito",
  );

  const mapped = mapProtheusNotasDebitoCreditoResponse(data ?? {});
  const tipoFiltro = filters.tipo !== "all" ? filters.tipo : null;
  const notas = filterNotasByPesquisa(
    tipoFiltro
      ? mapped.notas.map((nota) => ({ ...nota, tipo: tipoFiltro }))
      : mapped.notas,
    filters.pesquisa,
  );

  return {
    notas,
    rows: flattenNotasToRows(notas),
    hasNextPage: mapped.lineCount >= pageSize,
    lineCount: mapped.lineCount,
  };
}
