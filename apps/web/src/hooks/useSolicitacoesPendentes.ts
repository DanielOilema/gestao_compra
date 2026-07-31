import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { mapProtheusSCResponse } from '@gestao-compra/shared';
import { invokeProtheusFunction } from '@/lib/invokeProtheusFunction';

export const useSolicitacoesPendentes = () => {
  const { user, token } = useAuth();
  const aprovador = user?.nome ?? '';

  const query = useQuery({
    queryKey: ['solicitacoes-pendentes', aprovador],
    enabled: !!aprovador && !!token,
    queryFn: async () => {
      const data = await invokeProtheusFunction(
        'protheus-sc-pendentes',
        { aprovador, accessToken: token! },
        'Falha ao buscar solicitações',
      );
      return mapProtheusSCResponse(data);
    },
  });

  return query;
};
