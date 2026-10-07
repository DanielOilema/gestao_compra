import {
  flattenNotasToRows,
  mapProtheusNotasDebitoCreditoResponse,
  type DebitCreditNote,
  type NotaListRow,
} from "@gestao-compra/shared";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";
import { toApiDate } from "@/lib/dateBr";
import type { NotasListFilters } from "@/components/notas/listagem/notasListFilters";

export const NOTAS_PAGE_SIZE = 20;

export interface GetNotasDebitoCreditoParams {
  filters: NotasListFilters;
  page: number;
  pageSize: number;
  basicAuth: string;
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
  basicAuth,
}: GetNotasDebitoCreditoParams): Promise<GetNotasDebitoCreditoResult> {
  const dtInicial = toApiDate(filters.dataInicio);
  const dtFinal = toApiDate(filters.dataFim);
  const filtro = filters.pesquisa.trim();

  const data = await invokeProtheusFunction<Record<string, unknown>>(
    "protheus-notas-debito-credito",
    {
      page,
      pageSize,
      basicAuth,
      tipo:
        filters.tipo === "credito"
          ? "C"
          : filters.tipo === "debito"
            ? "D"
            : "",
      cliFor: filters.cliFor.trim() || undefined,
      usuario: filters.usuario.trim() || undefined,
      filtro: filtro || undefined,
      dtInicial: dtInicial || undefined,
      dtFinal: dtFinal || undefined,
    },
    "Falha ao buscar notas de débito/crédito",
  );

  const mapped = mapProtheusNotasDebitoCreditoResponse(data ?? {});
  const tipoFiltro = filters.tipo !== "all" ? filters.tipo : null;
  const notas = tipoFiltro
    ? mapped.notas.map((nota) => ({ ...nota, tipo: tipoFiltro }))
    : mapped.notas;

  return {
    notas,
    rows: flattenNotasToRows(notas),
    hasNextPage: mapped.lineCount >= pageSize,
    lineCount: mapped.lineCount,
  };
}
