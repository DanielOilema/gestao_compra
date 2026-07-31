import { useQuery } from "@tanstack/react-query";
import { mapProtheusProdutoResponse } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export const PRODUTO_PAGE_SIZE = 50;

export interface UseListaProdutoParams {
  search: string;
  enabled?: boolean;
}

export const useListaProduto = ({ search, enabled = true }: UseListaProdutoParams) => {
  const { token } = useAuth();
  const trimmed = search.trim();

  return useQuery({
    queryKey: ["lista-produto", trimmed],
    enabled: !!token && enabled && trimmed.length >= 2,
    queryFn: async () => {
      const data = await invokeProtheusFunction<Record<string, unknown>>(
        "protheus-lista-produto",
        {
          page: 1,
          pageSize: PRODUTO_PAGE_SIZE,
          accessToken: token!,
          filtro: trimmed,
        },
        "Falha ao buscar produtos",
      );
      return mapProtheusProdutoResponse(data ?? {});
    },
  });
};
