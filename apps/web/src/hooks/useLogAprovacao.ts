import { mapProtheusLogAprovacao, type LogAprovacaoEntry } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";
import { useQuery } from "@tanstack/react-query";

export const LOG_APROVACAO_TIPO_SC = "SC";

export const useLogAprovacao = (filial: string, numDoc: string, enabled = true) => {
  const { protheusAuth } = useAuth();
  const { ambiente } = useEnvironment();
  const filialValue = filial.trim();
  const numDocValue = numDoc.trim();

  return useQuery({
    queryKey: ["log-aprovacao", ambiente, filialValue, numDocValue, LOG_APROVACAO_TIPO_SC],
    enabled: enabled && !!protheusAuth && !!filialValue && !!numDocValue,
    queryFn: async (): Promise<LogAprovacaoEntry[]> => {
      const data = await invokeProtheusFunction(
        "protheus-log-aprovacao",
        {
          basicAuth: protheusAuth!,
          filial: filialValue,
          numDoc: numDocValue,
          tipo: LOG_APROVACAO_TIPO_SC,
        },
        "Falha ao buscar o log de aprovação",
      );
      return mapProtheusLogAprovacao(data);
    },
  });
};
