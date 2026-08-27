import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@gestao-compra/shared';
import { toast } from 'sonner';
import { parseProtheusResult } from '@gestao-compra/shared';
import { invokeProtheusFunction } from '@/lib/invokeProtheusFunction';
import { handleSessionExpired } from '@/lib/sessionExpired';

type Acao = 'liberar' | 'bloquear';
export type AprovaCompraDocumento = 'pedido' | 'solicitacao';

export const useAprovaCompra = (order: Order, documento: AprovaCompraDocumento = 'pedido') => {
  const { user, token, expireSession } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const executar = useCallback(
    async (acao: Acao, observacao = ''): Promise<boolean> => {
      if (!user || !token) {
        const msg = 'Sessão inválida. Faça login novamente.';
        expireSession(msg);
        setError(msg);
        return false;
      }
      setIsLoading(true);
      setError(undefined);
      try {
        const data = await invokeProtheusFunction<Record<string, unknown>>(
          'protheus-aprova-compra',
          {
            filial: order.filial,
            numero: order.numero,
            tipo: documento === 'solicitacao' ? 'SC' : 'IP',
            user: user.nome,
            acao,
            observacao,
            accessToken: token,
          },
          'Falha ao processar ação no Protheus',
        );

        const { success, message } = parseProtheusResult(data ?? {});

        if (!success) {
          const msg = message || 'Falha ao processar ação no Protheus';
          if (handleSessionExpired(msg)) return false;
          setError(msg);
          toast.error(msg);
          return false;
        }

        toast.success(
          message ||
            (acao === 'liberar'
              ? documento === 'solicitacao'
                ? 'Solicitação aprovada com sucesso'
                : 'Pedido aprovado com sucesso'
              : documento === 'solicitacao'
                ? 'Solicitação bloqueada com sucesso'
                : 'Pedido bloqueado com sucesso'),
        );

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['pedidos-pendentes'] }),
          queryClient.invalidateQueries({ queryKey: ['solicitacoes-pendentes'] }),
        ]);

        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido';
        if (handleSessionExpired(msg)) return false;
        setError(msg);
        toast.error(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [order.filial, order.numero, documento, user, token, queryClient, expireSession],
  );

  return {
    aprovar: (observacao?: string) => executar('liberar', observacao),
    bloquear: (observacao?: string) => executar('bloquear', observacao),
    isLoading,
    error,
  };
};
