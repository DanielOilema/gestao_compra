import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACAO_ALTERA_SC, type IncluiSCPayload, type IncluiSCResult } from "@gestao-compra/shared";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export const useIncluiSolicitacao = () => {
  const { protheusAuth } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IncluiSCPayload): Promise<IncluiSCResult> => {
      if (!protheusAuth) {
        throw new Error("Sessão inválida. Faça login novamente.");
      }

      const isAlter = payload.acao === ACAO_ALTERA_SC;
      return invokeProtheusFunction<IncluiSCResult>(
        "protheus-inclui-sc",
        { ...payload, basicAuth: protheusAuth },
        isAlter ? "Falha ao alterar solicitação de compra" : "Falha ao incluir solicitação de compra",
      );
    },
    onSuccess: (result) => {
      const numero = result.numeroSC ? ` SC ${result.numeroSC}` : "";
      toast.success(`${result.mensagem}${numero}`);
      void queryClient.invalidateQueries({ queryKey: ["solicitacoes-compra"] });
    },
    onError: (error, payload) => {
      const fallback =
        payload.acao === ACAO_ALTERA_SC
          ? "Falha ao alterar solicitação"
          : "Falha ao incluir solicitação";
      toast.error(error instanceof Error ? error.message : fallback);
    },
  });
};
