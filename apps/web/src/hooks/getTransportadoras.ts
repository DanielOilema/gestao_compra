import { mapProtheusTransportadorasList, type TransportadoraListItem } from "@gestao-compra/shared";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export async function getTransportadoras(basicAuth: string): Promise<TransportadoraListItem[]> {
  const data = await invokeProtheusFunction<Record<string, unknown>>(
    "protheus-lista-transportadoras",
    { basicAuth },
    "Falha ao buscar transportadoras",
  );

  return mapProtheusTransportadorasList(data ?? {});
}
