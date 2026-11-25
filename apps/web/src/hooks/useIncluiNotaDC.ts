import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IncluiNotaDCPayload, IncluiNotaDCResult } from "@gestao-compra/shared";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";

export const useIncluiNotaDC = () => {
  const { protheusAuth } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IncluiNotaDCPayload): Promise<IncluiNotaDCResult> => {
      if (!protheusAuth) {
        throw new Error("Sessão inválida. Faça login novamente.");
      }

      return invokeProtheusFunction<IncluiNotaDCResult>(
        "protheus-inclui-nota-dc",
        { ...payload, basicAuth: protheusAuth },
        "Falha ao incluir recibo de débito/crédito",
      );
    },
    onSuccess: (result) => {
      const numero = result.numero ? ` ${result.numero}` : "";
      toast.success(`${result.mensagem}${numero}`);
      void queryClient.invalidateQueries({ queryKey: ["notas-debito-credito"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao incluir recibo");
    },
  });
};
