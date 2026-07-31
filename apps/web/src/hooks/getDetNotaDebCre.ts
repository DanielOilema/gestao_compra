import {
  getDetNotaDebCreTipoParam,
  mapProtheusDetNotaDebCreResponse,
  type DebitCreditNote,
} from "@gestao-compra/shared";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export async function getDetNotaDebCre(params: {
  filial: string;
  tipo: DebitCreditNote["tipo"];
  codigo: string;
  accessToken: string;
  header?: DebitCreditNote;
}): Promise<DebitCreditNote> {
  const data = await invokeProtheusFunction<Record<string, unknown>>(
    "protheus-det-nota-deb-cre",
    {
      filial: params.filial,
      tipo: getDetNotaDebCreTipoParam(params.tipo),
      codigo: params.codigo,
      accessToken: params.accessToken,
    },
    "Falha ao buscar detalhe da nota",
  );

  return mapProtheusDetNotaDebCreResponse(data ?? {}, params.header);
}
