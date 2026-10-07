import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AcompanhamentoSolicitacaoFilters,
  PurchaseRequest,
  SolicitacaoAcompanhamento,
  SolicitacaoStatusNaoReconhecido,
} from "@gestao-compra/shared";
import { emptyAcompanhamentoSolicitacaoFilters } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import {
  ACOMPANHAMENTO_PAGE_SIZE,
  getAcompanhamentoSolicitacoes,
} from "@/hooks/getAcompanhamentoSolicitacoes";
import { getSolicitacaoCompraDetalhe } from "@/hooks/getSolicitacaoCompraDetalhe";

const SESSAO_INDISPONIVEL = "Não foi possível identificar a sessão do Protheus. Faça login novamente.";

export function useAcompanhamentoSolicitacoes() {
  const { protheusAuth, user } = useAuth();
  const codUser = user?.protheusId?.trim() || user?.id?.trim() || "";
  const nomeUser = user?.userName?.trim() || "";
  const [numero, setNumero] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<AcompanhamentoSolicitacaoFilters>(
    emptyAcompanhamentoSolicitacaoFilters(),
  );
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAcompanhamento[]>([]);
  const [naoReconhecidas, setNaoReconhecidas] = useState<SolicitacaoStatusNaoReconhecido[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<SolicitacaoAcompanhamento | null>(null);
  const [detailRequest, setDetailRequest] = useState<PurchaseRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const detailRequestId = useRef(0);

  const load = useCallback(
    async (filters: AcompanhamentoSolicitacaoFilters) => {
      if (!protheusAuth) {
        setIsLoading(false);
        setError(SESSAO_INDISPONIVEL);
        setSolicitacoes([]);
        setNaoReconhecidas([]);
        setHasNextPage(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const result = await getAcompanhamentoSolicitacoes({
          filters,
          page: 1,
          pageSize: ACOMPANHAMENTO_PAGE_SIZE,
          basicAuth: protheusAuth,
          codUser,
          nomeUser,
        });
        setSolicitacoes(result.solicitacoes);
        setNaoReconhecidas(result.naoReconhecidas);
        setHasNextPage(result.hasNextPage);
        setAppliedFilters(filters);
        detailRequestId.current += 1;
        setDetailTarget(null);
        setDetailRequest(null);
        setDetailError(null);
        setDetailLoading(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Não foi possível carregar as solicitações.";
        setError(message);
        setSolicitacoes([]);
        setNaoReconhecidas([]);
        setHasNextPage(false);
      } finally {
        setIsLoading(false);
      }
    },
    [protheusAuth, codUser, nomeUser],
  );

  useEffect(() => {
    if (!protheusAuth) {
      setIsLoading(false);
      setError(SESSAO_INDISPONIVEL);
      return;
    }
    void load(emptyAcompanhamentoSolicitacaoFilters());
  }, [protheusAuth, load]);

  const buscar = useCallback(() => {
    void load({
      ...emptyAcompanhamentoSolicitacaoFilters(),
      numero: numero.trim(),
    });
  }, [load, numero]);

  const retry = useCallback(() => {
    void load(appliedFilters);
  }, [appliedFilters, load]);

  const loadDetail = useCallback(
    async (solicitacao: SolicitacaoAcompanhamento) => {
      const requestId = detailRequestId.current + 1;
      detailRequestId.current = requestId;
      setDetailTarget(solicitacao);
      setDetailRequest(null);
      setDetailError(null);

      if (!protheusAuth) {
        setDetailLoading(false);
        setDetailError(SESSAO_INDISPONIVEL);
        return;
      }

      setDetailLoading(true);
      try {
        const request = await getSolicitacaoCompraDetalhe(
          solicitacao.filial ?? "",
          solicitacao.numero,
          protheusAuth,
          codUser,
          nomeUser,
        );
        if (detailRequestId.current !== requestId) return;
        setDetailRequest(request);
      } catch (err) {
        if (detailRequestId.current !== requestId) return;
        const message =
          err instanceof Error ? err.message : "Não foi possível carregar os detalhes da solicitação.";
        setDetailError(message);
      } finally {
        if (detailRequestId.current === requestId) setDetailLoading(false);
      }
    },
    [protheusAuth, codUser, nomeUser],
  );

  const selectSolicitacao = useCallback(
    (solicitacao: SolicitacaoAcompanhamento) => {
      void loadDetail(solicitacao);
    },
    [loadDetail],
  );

  const retryDetail = useCallback(() => {
    if (detailTarget) void loadDetail(detailTarget);
  }, [detailTarget, loadDetail]);

  const closeDetail = useCallback(() => {
    detailRequestId.current += 1;
    setDetailTarget(null);
    setDetailRequest(null);
    setDetailError(null);
    setDetailLoading(false);
  }, []);

  return {
    numero,
    setNumero,
    solicitacoes,
    naoReconhecidas,
    hasNextPage,
    isLoading,
    error,
    detailOpen: detailTarget !== null,
    detailRequest,
    detailLoading,
    detailError,
    buscar,
    retry,
    selectSolicitacao,
    retryDetail,
    closeDetail,
  };
}
