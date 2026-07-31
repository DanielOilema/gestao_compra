import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IncluiSCPayload, IncluiSCResult } from "@gestao-compra/shared";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export const useIncluiSolicitacao = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IncluiSCPayload): Promise<IncluiSCResult> => {
      if (!token) {
        throw new Error("Sessão inválida. Faça login novamente.");
      }

      return invokeProtheusFunction<IncluiSCResult>(
        "protheus-inclui-sc",
        { ...payload, accessToken: token },
        "Falha ao incluir solicitação de compra",
      );
    },
    onSuccess: (result) => {
      const numero = result.numeroSC ? ` SC ${result.numeroSC}` : "";
      toast.success(`${result.mensagem}${numero}`);
      void queryClient.invalidateQueries({ queryKey: ["solicitacoes-compra"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao incluir solicitação");
    },
  });
};
