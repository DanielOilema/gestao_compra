import { mapProtheusFiliaisResponse } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";
import { useQuery } from "@tanstack/react-query";

export const useFiliais = () => {
  const { protheusAuth } = useAuth();
  const { ambiente } = useEnvironment();

  return useQuery({
    queryKey: ["filiais", ambiente],
    enabled: !!protheusAuth,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const data = await invokeProtheusFunction<Record<string, unknown>>(
        "protheus-filiais",
        { basicAuth: protheusAuth! },
        "Falha ao buscar filiais",
      );
      return mapProtheusFiliaisResponse(data ?? {});
    },
  });
};
