import { useQuery } from "@tanstack/react-query";
import { mapProtheusMunicipioResponse } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export interface UseBuscaMunicipioParams {
  search: string;
  enabled?: boolean;
}

export const useBuscaMunicipio = ({ search, enabled = true }: UseBuscaMunicipioParams) => {
  const { protheusAuth } = useAuth();
  const { ambiente } = useEnvironment();
  const trimmed = search.trim();

  return useQuery({
    queryKey: ["busca-municipio", ambiente, trimmed],
    enabled: !!protheusAuth && enabled && trimmed.length >= 2,
    queryFn: async () => {
      const data = await invokeProtheusFunction<Record<string, unknown>>(
        "protheus-busca-municipio",
        {
          basicAuth: protheusAuth!,
          filtro: trimmed,
        },
        "Falha ao buscar municípios",
      );
      return mapProtheusMunicipioResponse(data ?? {});
    },
  });
};
