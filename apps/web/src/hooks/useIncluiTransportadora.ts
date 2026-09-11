import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IncluiTransportadoraPayload, IncluiTransportadoraResult } from "@gestao-compra/shared";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export const useIncluiTransportadora = () => {
  const { protheusAuth } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: IncluiTransportadoraPayload,
    ): Promise<IncluiTransportadoraResult> => {
      if (!protheusAuth) {
        throw new Error("Sessão inválida. Faça login novamente.");
      }

      return invokeProtheusFunction<IncluiTransportadoraResult>(
        "protheus-inclui-transportadora",
        { ...payload, basicAuth: protheusAuth },
        "Falha ao incluir transportadora",
      );
    },
    onSuccess: (result) => {
      const codigo = result.codigo ? ` ${result.codigo}` : "";
      toast.success(`${result.mensagem}${codigo}`);
      void queryClient.invalidateQueries({ queryKey: ["transportadoras"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao incluir transportadora");
    },
  });
};
