import { useQuery } from "@tanstack/react-query";
import { mapProtheusTesResponse } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export const TES_PAGE_SIZE = 50;

export interface UseTesSaidaParams {
  filial: string;
  search: string;
  enabled?: boolean;
}

export const useTesSaida = ({ filial, search, enabled = true }: UseTesSaidaParams) => {
  const { protheusAuth } = useAuth();
  const { ambiente } = useEnvironment();
  const trimmed = search.trim();
  const filialTrimmed = filial.trim();

  return useQuery({
    queryKey: ["tes-saida", ambiente, filialTrimmed, trimmed],
    enabled: !!protheusAuth && enabled && !!filialTrimmed && trimmed.length >= 2,
    queryFn: async () => {
      const data = await invokeProtheusFunction<Record<string, unknown>>(
        "protheus-tes-saida",
        {
          page: 1,
          pageSize: TES_PAGE_SIZE,
          filial: filialTrimmed,
          basicAuth: protheusAuth!,
          filtro: trimmed,
        },
        "Falha ao buscar TES",
      );
      return mapProtheusTesResponse(data ?? {});
    },
  });
};
