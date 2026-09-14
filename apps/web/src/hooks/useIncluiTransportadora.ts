import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ACAO_ALTERA_TRANSPORTADORA,
  type IncluiTransportadoraPayload,
  type IncluiTransportadoraResult,
} from "@gestao-compra/shared";
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

      const isAlter = payload.acao === ACAO_ALTERA_TRANSPORTADORA;
      return invokeProtheusFunction<IncluiTransportadoraResult>(
        "protheus-inclui-transportadora",
        { ...payload, basicAuth: protheusAuth },
        isAlter ? "Falha ao alterar transportadora" : "Falha ao incluir transportadora",
      );
    },
    onSuccess: (result, payload) => {
      const isAlter = payload.acao === ACAO_ALTERA_TRANSPORTADORA;
      const codigo = result.codigo ? ` ${result.codigo}` : "";
      toast.success(`${result.mensagem}${isAlter ? "" : codigo}`);
      void queryClient.invalidateQueries({ queryKey: ["transportadoras"] });
    },
    onError: (error, payload) => {
      const fallback =
        payload.acao === ACAO_ALTERA_TRANSPORTADORA
          ? "Falha ao alterar transportadora"
          : "Falha ao incluir transportadora";
      toast.error(error instanceof Error ? error.message : fallback);
    },
  });
};
