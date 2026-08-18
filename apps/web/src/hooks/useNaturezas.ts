import { useQuery } from "@tanstack/react-query";
import { mapProtheusNaturezaResponse } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export const NATUREZA_PAGE_SIZE = 50;

export interface UseNaturezasParams {
  search: string;
  enabled?: boolean;
}

export const useNaturezas = ({ search, enabled = true }: UseNaturezasParams) => {
  const { token } = useAuth();
  const { ambiente } = useEnvironment();
  const trimmed = search.trim();

  return useQuery({
    queryKey: ["naturezas", ambiente, trimmed],
    enabled: !!token && enabled && trimmed.length >= 2,
    queryFn: async () => {
      const data = await invokeProtheusFunction<Record<string, unknown>>(
        "protheus-natureza",
        {
          page: 1,
          pageSize: NATUREZA_PAGE_SIZE,
          accessToken: token!,
          filtro: trimmed,
        },
        "Falha ao buscar naturezas",
      );
      return mapProtheusNaturezaResponse(data ?? {});
    },
  });
};
