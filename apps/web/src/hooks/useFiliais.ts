import { useEffect, useRef } from "react";
import { mapProtheusFiliaisResponse } from "@gestao-compra/shared";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export const useFiliais = () => {
  const { protheusAuth } = useAuth();
  const { ambiente } = useEnvironment();
  const lastToastKeyRef = useRef<string | null>(null);

  const query = useQuery({
    queryKey: ["filiais", ambiente],
    enabled: !!protheusAuth,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const data = await invokeProtheusFunction<Record<string, unknown>>(
        "protheus-filiais",
        { basicAuth: protheusAuth! },
        "Falha ao buscar filiais",
      );
      const filiais = mapProtheusFiliaisResponse(data ?? {});
      if (filiais.length === 0) {
        throw new Error("Nenhuma filial retornada pelo Protheus.");
      }
      return filiais;
    },
  });

  useEffect(() => {
    if (!query.isError || !query.error) return;

    const message =
      query.error instanceof Error ? query.error.message : "Falha ao buscar filiais";
    const toastKey = `${ambiente}:${message}`;
    if (lastToastKeyRef.current === toastKey) return;
    lastToastKeyRef.current = toastKey;
    toast.error(message);
  }, [ambiente, query.error, query.isError]);

  useEffect(() => {
    if (query.isSuccess) {
      lastToastKeyRef.current = null;
    }
  }, [query.isSuccess]);

  return query;
};
