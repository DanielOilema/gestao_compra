import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { mapProtheusResponse, ProtheusPedidosResponse } from '@gestao-compra/shared';
import { invokeProtheusFunction } from '@/lib/invokeProtheusFunction';

export const usePedidosPendentes = () => {
  const { user, token } = useAuth();
  const { ambiente } = useEnvironment();
  const aprovador = user?.nome ?? '';

  const query = useQuery({
    queryKey: ['pedidos-pendentes', ambiente, aprovador],
    enabled: !!aprovador && !!token,
    queryFn: async () => {
      const data = await invokeProtheusFunction<ProtheusPedidosResponse>(
        'protheus-pedidos-pendentes',
        { aprovador, accessToken: token! },
        'Falha ao buscar pedidos',
      );
      return mapProtheusResponse(data);
    },
  });

  return query;
};
