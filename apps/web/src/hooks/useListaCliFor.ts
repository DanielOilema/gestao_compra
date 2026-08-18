import { useQuery } from "@tanstack/react-query";
import { mapProtheusCliForResponse, type CliForTipo } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export const CLI_FOR_PAGE_SIZE = 20;

export interface UseListaCliForParams {
  tipo: CliForTipo;
  search: string;
  enabled?: boolean;
}

export const useListaCliFor = ({ tipo, search, enabled = true }: UseListaCliForParams) => {
  const { token } = useAuth();
  const { ambiente } = useEnvironment();
  const trimmed = search.trim();

  return useQuery({
    queryKey: ["lista-cli-for", ambiente, tipo, trimmed],
    enabled: !!token && enabled && trimmed.length >= 2,
    queryFn: async () => {
      const data = await invokeProtheusFunction<Record<string, unknown>>(
        "protheus-lista-cli-for",
        {
          page: 1,
          pageSize: CLI_FOR_PAGE_SIZE,
          tipo,
          accessToken: token!,
          filtro: trimmed,
        },
        "Falha ao buscar clientes/fornecedores",
      );
      return mapProtheusCliForResponse(data ?? {});
    },
  });
};
