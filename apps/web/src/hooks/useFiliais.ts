import { mapProtheusFiliaisResponse } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";
import { useQuery } from "@tanstack/react-query";

export const useFiliais = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["filiais"],
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const data = await invokeProtheusFunction<Record<string, unknown>>(
        "protheus-filiais",
        { accessToken: token! },
        "Falha ao buscar filiais",
      );
      return mapProtheusFiliaisResponse(data ?? {});
    },
  });
};
