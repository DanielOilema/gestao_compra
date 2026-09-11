import {
  mapProtheusTransportadoraDetalhe,
  type TransportadoraDetalhe,
  type TransportadoraListItem,
} from "@gestao-compra/shared";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export async function getDetTransportadora(params: {
  codigo: string;
  basicAuth: string;
  header?: TransportadoraListItem;
}): Promise<TransportadoraDetalhe> {
  const data = await invokeProtheusFunction<Record<string, unknown>>(
    "protheus-det-transportadora",
    {
      codigo: params.codigo,
      basicAuth: params.basicAuth,
    },
    "Falha ao buscar detalhe da transportadora",
  );

  return mapProtheusTransportadoraDetalhe(data ?? {}, params.header);
}
