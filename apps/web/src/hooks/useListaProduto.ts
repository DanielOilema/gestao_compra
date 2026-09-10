import { useQuery } from "@tanstack/react-query";
import { mapProtheusProdutoResponse } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export const PRODUTO_PAGE_SIZE = 50;

export interface UseListaProdutoParams {
  search: string;
  enabled?: boolean;
}

export const useListaProduto = ({ search, enabled = true }: UseListaProdutoParams) => {
  const { protheusAuth } = useAuth();
  const { ambiente } = useEnvironment();
  const trimmed = search.trim();

  return useQuery({
    queryKey: ["lista-produto", ambiente, trimmed],
    enabled: !!protheusAuth && enabled && trimmed.length >= 2,
    queryFn: async () => {
      const data = await invokeProtheusFunction<Record<string, unknown>>(
        "protheus-lista-produto",
        {
          page: 1,
          pageSize: PRODUTO_PAGE_SIZE,
          basicAuth: protheusAuth!,
          filtro: trimmed,
        },
        "Falha ao buscar produtos",
      );
      return mapProtheusProdutoResponse(data ?? {});
    },
  });
};
