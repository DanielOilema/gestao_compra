import { mapRelScSetoresToEnvelope, type ReportEnvelope } from "@gestao-compra/shared";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export interface GetRelatorioScSetoresParams {
  dtInicial: string;
  dtFinal: string;
  grupoAprovacao: string;
  basicAuth: string;
}

export async function getRelatorioScSetores({
  dtInicial,
  dtFinal,
  grupoAprovacao,
  basicAuth,
}: GetRelatorioScSetoresParams): Promise<ReportEnvelope> {
  const data = await invokeProtheusFunction<Record<string, unknown>>(
    "protheus-rel-sc-setores",
    { dtInicial, dtFinal, grupoAprovacao, basicAuth },
    "Falha ao consultar o relatório de solicitações",
  );

  return mapRelScSetoresToEnvelope(data ?? {});
}
