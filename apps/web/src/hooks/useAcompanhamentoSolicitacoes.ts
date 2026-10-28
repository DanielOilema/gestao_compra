import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  PurchaseRequest,
  SolicitacaoAcompanhamento,
  SolicitacaoStatusNaoReconhecido,
  TipoCompra,
} from "@gestao-compra/shared";
import { emptyAcompanhamentoSolicitacaoFilters } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import {
  ACOMPANHAMENTO_PAGE_SIZE,
  filtrarAcompanhamentoSolicitacoes,
  getAcompanhamentoSolicitacoes,
} from "@/hooks/getAcompanhamentoSolicitacoes";
import { getSolicitacaoCompraDetalhe } from "@/hooks/getSolicitacaoCompraDetalhe";

const SESSAO_INDISPONIVEL = "Não foi possível identificar a sessão do Protheus. Faça login novamente.";

export function useAcompanhamentoSolicitacoes() {
  const { protheusAuth, user } = useAuth();
  const codUser = user?.protheusId?.trim() || user?.id?.trim() || "";
  const nomeUser = user?.userName?.trim() || "";
  const [numero, setNumero] = useState("");
  const [solicitante, setSolicitante] = useState("");
  const [comprador, setComprador] = useState("");
  const [tipoCompra, setTipoCompra] = useState<TipoCompra | "">("");
  const [carregadas, setCarregadas] = useState<SolicitacaoAcompanhamento[]>([]);
  const [naoReconhecidasBase, setNaoReconhecidasBase] = useState<SolicitacaoStatusNaoReconhecido[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<SolicitacaoAcompanhamento | null>(null);
  const [detailRequest, setDetailRequest] = useState<PurchaseRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const detailRequestId = useRef(0);

  const load = useCallback(
    async () => {
      if (!protheusAuth) {
        setIsLoading(false);
        setError(SESSAO_INDISPONIVEL);
        setCarregadas([]);
        setNaoReconhecidasBase([]);
        setHasNextPage(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const result = await getAcompanhamentoSolicitacoes({
          filters: emptyAcompanhamentoSolicitacaoFilters(),
          page: 1,
          pageSize: ACOMPANHAMENTO_PAGE_SIZE,
          basicAuth: protheusAuth,
          codUser,
          nomeUser,
        });
        setCarregadas(result.solicitacoes);
        setNaoReconhecidasBase(result.naoReconhecidas);
        setHasNextPage(result.hasNextPage);
        detailRequestId.current += 1;
        setDetailTarget(null);
        setDetailRequest(null);
        setDetailError(null);
        setDetailLoading(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Não foi possível carregar as solicitações.";
        setError(message);
        setCarregadas([]);
        setNaoReconhecidasBase([]);
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
    void load();
  }, [protheusAuth, load]);

  const filtros = useMemo(
    () => ({
      ...emptyAcompanhamentoSolicitacaoFilters(),
      numero,
      solicitante,
      comprador,
      tipoCompra,
    }),
    [numero, solicitante, comprador, tipoCompra],
  );

  const filtrado = useMemo(
    () => filtrarAcompanhamentoSolicitacoes(carregadas, naoReconhecidasBase, filtros),
    [carregadas, naoReconhecidasBase, filtros],
  );

  const retry = useCallback(() => {
    void load();
  }, [load]);

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
    solicitante,
    setSolicitante,
    comprador,
    setComprador,
    tipoCompra,
    setTipoCompra,
    solicitacoes: filtrado.solicitacoes,
    naoReconhecidas: filtrado.naoReconhecidas,
    hasNextPage,
    isLoading,
    error,
    detailOpen: detailTarget !== null,
    detailRequest,
    detailLoading,
    detailError,
    retry,
    selectSolicitacao,
    retryDetail,
    closeDetail,
  };
}
