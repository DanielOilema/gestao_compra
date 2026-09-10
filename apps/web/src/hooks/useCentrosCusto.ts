import { useQuery } from "@tanstack/react-query";
import { mapProtheusCcustoResponse } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export const CCUSTO_PAGE_SIZE = 50;

export interface UseCentrosCustoParams {
  search: string;
  enabled?: boolean;
}

export const useCentrosCusto = ({ search, enabled = true }: UseCentrosCustoParams) => {
  const { protheusAuth } = useAuth();
  const { ambiente } = useEnvironment();
  const trimmed = search.trim();

  return useQuery({
    queryKey: ["centros-custo", ambiente, trimmed],
    enabled: !!protheusAuth && enabled && trimmed.length >= 2,
    queryFn: async () => {
      const data = await invokeProtheusFunction<Record<string, unknown>>(
        "protheus-ccusto",
        {
          page: 1,
          pageSize: CCUSTO_PAGE_SIZE,
          basicAuth: protheusAuth!,
          filtro: trimmed,
        },
        "Falha ao buscar centros de custo",
      );
      return mapProtheusCcustoResponse(data ?? {});
    },
  });
};
