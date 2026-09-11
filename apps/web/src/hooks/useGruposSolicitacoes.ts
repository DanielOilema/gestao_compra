import { mapProtheusGruposSolicitacoes } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";
import { useQuery } from "@tanstack/react-query";

export const useGruposSolicitacoes = (enabled = true) => {
  const { protheusAuth } = useAuth();
  const { ambiente } = useEnvironment();

  return useQuery({
    queryKey: ["grupos-solicitacoes", ambiente],
    enabled: enabled && !!protheusAuth,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const data = await invokeProtheusFunction<Record<string, unknown>>(
        "protheus-grupos-solicitacoes",
        { basicAuth: protheusAuth! },
        "Falha ao carregar os grupos de compras",
      );
      return mapProtheusGruposSolicitacoes(data ?? {});
    },
  });
};
