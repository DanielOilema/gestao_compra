import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { PurchaseRequest, SolicitacaoCompraRow } from "@gestao-compra/shared";
import { flattenPurchaseRequests } from "@gestao-compra/shared";
import {
  emptySolicitacaoCompraListFilters,
  type SolicitacaoCompraListFilters,
} from "./solicitacaoCompraListFilters";
import {
  getSolicitacaoCompraCompleta,
  getSolicitacoesCompra,
  SOLICITACOES_PAGE_SIZE,
} from "@/hooks/getSolicitacoesCompra";
import { useAuth } from "@/contexts/AuthContext";

export function useSolicitacaoCompraList() {
  const { protheusAuth, user } = useAuth();
  const codUser = user?.protheusId?.trim() || user?.id?.trim() || "";
  const nomeUser = user?.userName?.trim() || "";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<SolicitacaoCompraListFilters>(
    emptySolicitacaoCompraListFilters(),
  );
  const [appliedFilters, setAppliedFilters] = useState<SolicitacaoCompraListFilters>(
    emptySolicitacaoCompraListFilters(),
  );
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState<PurchaseRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const detailToken = useRef(0);
  const detailSource = useRef<PurchaseRequest | null>(null);

  const loadData = useCallback(
    async (filters: SolicitacaoCompraListFilters, targetPage: number) => {
      if (!protheusAuth) return;

      setIsLoading(true);
      try {
        const result = await getSolicitacoesCompra({
          filters,
          page: targetPage,
          pageSize: SOLICITACOES_PAGE_SIZE,
          basicAuth: protheusAuth,
          codUser,
          nomeUser,
        });
        setRequests(result.requests);
        setHasNextPage(result.hasNextPage);
        setPage(targetPage);
        setAppliedFilters(filters);
        setSelectedRowId(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao buscar solicitações";
        toast.error(message);
        setRequests([]);
        setHasNextPage(false);
      } finally {
        setIsLoading(false);
      }
    },
    [protheusAuth, codUser, nomeUser],
  );

  useEffect(() => {
    if (protheusAuth) {
      void loadData(emptySolicitacaoCompraListFilters(), 1);
    }
  }, [protheusAuth, loadData]);

  const filteredRows = useMemo(
    () => flattenPurchaseRequests(requests),
    [requests],
  );

  const hasPreviousPage = page > 1;

  const toggleFilters = useCallback(() => {
    setFiltersOpen((prev) => !prev);
  }, []);

  const handleBuscar = useCallback(() => {
    void loadData(draftFilters, 1);
  }, [draftFilters, loadData]);

  const handleNextPage = useCallback(() => {
    if (!hasNextPage || isLoading) return;
    void loadData(appliedFilters, page + 1);
  }, [hasNextPage, isLoading, appliedFilters, page, loadData]);

  const handlePreviousPage = useCallback(() => {
    if (page <= 1 || isLoading) return;
    void loadData(appliedFilters, page - 1);
  }, [page, isLoading, appliedFilters, loadData]);

  const loadDetail = useCallback(
    (request: PurchaseRequest) => {
      if (!protheusAuth) return;
      const token = detailToken.current + 1;
      detailToken.current = token;
      detailSource.current = request;
      setDetailOpen(true);
      setDetailRequest(null);
      setDetailError(null);
      setDetailLoading(true);

      void getSolicitacaoCompraCompleta({
        filial: request.filial,
        numero: request.numero,
        basicAuth: protheusAuth,
        codUser,
        nomeUser,
      })
        .then((full) => {
          if (detailToken.current !== token) return;
          setDetailRequest(full);
        })
        .catch((err: unknown) => {
          if (detailToken.current !== token) return;
          const message =
            err instanceof Error ? err.message : "Erro ao carregar a solicitação";
          setDetailError(message);
          toast.error(message);
        })
        .finally(() => {
          if (detailToken.current === token) setDetailLoading(false);
        });
    },
    [protheusAuth, codUser, nomeUser],
  );

  const handleSelectRow = useCallback(
    (row: SolicitacaoCompraRow) => {
      setSelectedRowId(row.rowId);
      const request = requests.find((item) => item.id === row.requestId);
      if (request) loadDetail(request);
    },
    [loadDetail, requests],
  );

  const handleCloseDetail = useCallback(() => {
    detailToken.current += 1;
    setDetailOpen(false);
    setDetailLoading(false);
    setDetailError(null);
  }, []);

  const handleRetryDetail = useCallback(() => {
    if (detailSource.current) loadDetail(detailSource.current);
  }, [loadDetail]);

  return {
    filtersOpen,
    setFiltersOpen,
    draftFilters,
    setDraftFilters,
    appliedFilters,
    isLoading,
    page,
    hasNextPage,
    hasPreviousPage,
    selectedRowId,
    filteredRows,
    detailOpen,
    detailRequest,
    detailLoading,
    detailError,
    toggleFilters,
    handleBuscar,
    handleNextPage,
    handlePreviousPage,
    handleSelectRow,
    handleCloseDetail,
    handleRetryDetail,
  };
}
