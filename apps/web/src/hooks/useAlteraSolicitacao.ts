import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AlteraSCPayload, AlteraSCResult } from "@gestao-compra/shared";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export const useAlteraSolicitacao = () => {
  const { protheusAuth } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AlteraSCPayload): Promise<AlteraSCResult> => {
      if (!protheusAuth) {
        throw new Error("Sessão inválida. Faça login novamente.");
      }

      return invokeProtheusFunction<AlteraSCResult>(
        "protheus-altera-sc",
        { ...payload, basicAuth: protheusAuth },
        "Falha ao alterar solicitação de compra",
      );
    },
    onSuccess: (result) => {
      const numero = result.numeroSC ? ` SC ${result.numeroSC}` : "";
      toast.success(`${result.mensagem}${numero}`);
      void queryClient.invalidateQueries({ queryKey: ["solicitacoes-compra"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao alterar solicitação");
    },
  });
};
