import { mapProtheusRastroSolicitacao, type RastroSolicitacaoGrafo } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";
import { useQuery } from "@tanstack/react-query";

export const useRastroSolicitacao = (filial: string, numero: string, enabled = true) => {
  const { protheusAuth } = useAuth();
  const { ambiente } = useEnvironment();
  const filialValue = filial.trim();
  const numeroValue = numero.trim();

  return useQuery({
    queryKey: ["rastro-solicitacao", ambiente, filialValue, numeroValue],
    enabled: enabled && !!protheusAuth && !!filialValue && !!numeroValue,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<RastroSolicitacaoGrafo> => {
      const data = await invokeProtheusFunction(
        "protheus-rastro-solicitacao",
        {
          basicAuth: protheusAuth!,
          filial: filialValue,
          numSc: numeroValue,
        },
        "Falha ao buscar o rastro da solicitação",
      );
      const grafo = mapProtheusRastroSolicitacao(data);
      if (grafo.invalido) {
        throw new Error("Resposta inválida do rastro da solicitação.");
      }
      return grafo;
    },
  });
};
