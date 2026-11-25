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
  basicAuth: string;
  header?: DebitCreditNote;
}): Promise<DebitCreditNote> {
  const data = await invokeProtheusFunction<Record<string, unknown>>(
    "protheus-det-nota-deb-cre",
    {
      filial: params.filial,
      tipo: getDetNotaDebCreTipoParam(params.tipo),
      codigo: params.codigo,
      basicAuth: params.basicAuth,
    },
    "Falha ao buscar detalhe do recibo",
  );

  return mapProtheusDetNotaDebCreResponse(data ?? {}, params.header);
}
