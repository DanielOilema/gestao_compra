import { mapRelHospPassToEnvelope, type ReportEnvelope } from "@gestao-compra/shared";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export interface GetRelatorioHospPassParams {
  dtInicial: string;
  dtFinal: string;
  basicAuth: string;
}

export async function getRelatorioHospPass({
  dtInicial,
  dtFinal,
  basicAuth,
}: GetRelatorioHospPassParams): Promise<ReportEnvelope> {
  const data = await invokeProtheusFunction<Record<string, unknown>>(
    "protheus-rel-hosp-pass",
    { dtInicial, dtFinal, basicAuth },
    "Falha ao consultar o relatório de passagens e hospedagens",
  );

  return mapRelHospPassToEnvelope(data ?? {});
}
