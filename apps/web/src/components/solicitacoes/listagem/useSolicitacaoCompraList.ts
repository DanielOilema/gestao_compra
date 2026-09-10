import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { PurchaseRequest, SolicitacaoCompraRow } from "@gestao-compra/shared";
import {
  ALTERAR_SOLICITACAO_SELECIONE_MESSAGE,
  canAlterSolicitacaoCompra,
  flattenPurchaseRequests,
  getAlterarSolicitacaoMessage,
} from "@gestao-compra/shared";
import {
  emptySolicitacaoCompraListFilters,
  type SolicitacaoCompraListFilters,
} from "./solicitacaoCompraListFilters";
import {
  getSolicitacoesCompra,
  SOLICITACOES_PAGE_SIZE,
} from "@/hooks/getSolicitacoesCompra";
import { useAuth } from "@/contexts/AuthContext";

export function useSolicitacaoCompraList() {
  const { protheusAuth, user } = useAuth();
  const navigate = useNavigate();
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
    [protheusAuth],
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

  const selectedRow = useMemo(
    () => filteredRows.find((r) => r.rowId === selectedRowId) ?? null,
    [filteredRows, selectedRowId],
  );

  const selectedRequest = useMemo(() => {
    if (!selectedRow) return null;
    return requests.find((r) => r.id === selectedRow.requestId) ?? null;
  }, [requests, selectedRow]);

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

  const handleSelectRow = useCallback((row: SolicitacaoCompraRow) => {
    setSelectedRowId(row.rowId);
    setDetailOpen(true);
  }, []);

  const handleVisualizar = useCallback(() => {
    if (!selectedRequest) return false;
    setDetailOpen(true);
    return true;
  }, [selectedRequest]);

  const handleAlterar = useCallback(() => {
    if (!selectedRequest) {
      toast.warning(ALTERAR_SOLICITACAO_SELECIONE_MESSAGE);
      return false;
    }

    const eligibility = canAlterSolicitacaoCompra(selectedRequest, user);
    if (!eligibility.ok) {
      toast.warning(getAlterarSolicitacaoMessage(eligibility));
      return false;
    }

    setDetailOpen(false);
    navigate("/solicitacoes-compra/alterar", { state: { request: selectedRequest } });
    return true;
  }, [navigate, selectedRequest, user]);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
  }, []);

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
    selectedRow,
    selectedRequest,
    filteredRows,
    detailOpen,
    toggleFilters,
    handleBuscar,
    handleNextPage,
    handlePreviousPage,
    handleSelectRow,
    handleVisualizar,
    handleAlterar,
    handleCloseDetail,
  };
}
