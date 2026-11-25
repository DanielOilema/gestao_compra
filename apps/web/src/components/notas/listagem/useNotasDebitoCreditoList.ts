import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { DebitCreditNote, NotaListRow } from "@gestao-compra/shared";
import { emptyNotasListFilters, type NotasListFilters } from "./notasListFilters";
import { getNotasDebitoCredito, NOTAS_PAGE_SIZE } from "@/hooks/getNotasDebitoCredito";
import { getDetNotaDebCre } from "@/hooks/getDetNotaDebCre";
import { useAuth } from "@/contexts/AuthContext";

export function useNotasDebitoCreditoList() {
  const { protheusAuth } = useAuth();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<NotasListFilters>(emptyNotasListFilters());
  const [appliedFilters, setAppliedFilters] = useState<NotasListFilters>(emptyNotasListFilters());
  const [notas, setNotas] = useState<DebitCreditNote[]>([]);
  const [rows, setRows] = useState<NotaListRow[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailNota, setDetailNota] = useState<DebitCreditNote | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = useCallback(
    async (filters: NotasListFilters, targetPage: number) => {
      if (!protheusAuth) return;

      setIsLoading(true);
      try {
        const result = await getNotasDebitoCredito({
          filters,
          page: targetPage,
          pageSize: NOTAS_PAGE_SIZE,
          basicAuth: protheusAuth,
        });
        setNotas(result.notas);
        setRows(result.rows);
        setHasNextPage(result.hasNextPage);
        setPage(targetPage);
        setAppliedFilters(filters);
        setSelectedRowId(null);
        setDetailNota(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao buscar recibos");
        setNotas([]);
        setRows([]);
        setHasNextPage(false);
      } finally {
        setIsLoading(false);
      }
    },
    [protheusAuth],
  );

  useEffect(() => {
    if (!protheusAuth) return;
    void loadData(emptyNotasListFilters(), 1);
  }, [protheusAuth, loadData]);

  const handlePesquisaChange = useCallback((value: string) => {
    setDraftFilters((prev) => ({ ...prev, pesquisa: value }));
  }, []);

  const handlePesquisaSubmit = useCallback(() => {
    void loadData(draftFilters, 1);
  }, [draftFilters, loadData]);

  const openDetail = useCallback(
    async (nota: DebitCreditNote) => {
      if (!protheusAuth) return;
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailNota(nota);
      try {
        const full = await getDetNotaDebCre({
          filial: nota.filial,
          tipo: nota.tipo,
          codigo: nota.numero,
          basicAuth: protheusAuth,
          header: nota,
        });
        setDetailNota(full);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao carregar detalhe");
      } finally {
        setDetailLoading(false);
      }
    },
    [protheusAuth],
  );

  const toggleFilters = useCallback(() => {
    setFiltersOpen((prev) => !prev);
  }, []);

  const handleBuscar = useCallback(() => {
    void loadData(draftFilters, 1);
  }, [draftFilters, loadData]);

  const handleLimpar = useCallback(() => {
    const emptyFilters = emptyNotasListFilters();
    setDraftFilters(emptyFilters);
    void loadData(emptyFilters, 1);
  }, [loadData]);

  const handleNextPage = useCallback(() => {
    if (!hasNextPage || isLoading) return;
    void loadData(appliedFilters, page + 1);
  }, [hasNextPage, isLoading, appliedFilters, page, loadData]);

  const handlePreviousPage = useCallback(() => {
    if (page <= 1 || isLoading) return;
    void loadData(appliedFilters, page - 1);
  }, [page, isLoading, appliedFilters, loadData]);

  const handleSelectRow = useCallback(
    (row: NotaListRow) => {
      setSelectedRowId(row.rowId);
      const nota = notas.find((n) => n.id === row.notaId);
      if (nota) {
        void openDetail({ ...nota, tipo: row.tipo });
      }
    },
    [notas, openDetail],
  );

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
    hasPreviousPage: page > 1,
    selectedRowId,
    rows,
    detailOpen,
    detailNota,
    detailLoading,
    toggleFilters,
    handleBuscar,
    handleLimpar,
    handlePesquisaChange,
    handlePesquisaSubmit,
    handleNextPage,
    handlePreviousPage,
    handleSelectRow,
    handleCloseDetail,
  };
}
