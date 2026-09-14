import { mapRelPcSetoresToEnvelope, type ReportEnvelope } from "@gestao-compra/shared";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export interface GetRelatorioPcSetoresParams {
  dtInicial: string;
  dtFinal: string;
  grupoAprovacao: string;
  basicAuth: string;
}

export async function getRelatorioPcSetores({
  dtInicial,
  dtFinal,
  grupoAprovacao,
  basicAuth,
}: GetRelatorioPcSetoresParams): Promise<ReportEnvelope> {
  const data = await invokeProtheusFunction<Record<string, unknown>>(
    "protheus-rel-pc-setores",
    { dtInicial, dtFinal, grupoAprovacao, basicAuth },
    "Falha ao consultar o relatório de pedidos",
  );

  return mapRelPcSetoresToEnvelope(data ?? {});
}
