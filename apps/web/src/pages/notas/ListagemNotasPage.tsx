import React, { useCallback } from "react";
import ExportMenu from "@/components/relatorios/ExportMenu";
import { buildNotasExportPayload } from "@/components/notas/listagem/notasExport";
import { useNotasDebitoCreditoList } from "@/components/notas/listagem/useNotasDebitoCreditoList";
import NotasToolbar from "@/components/notas/listagem/NotasToolbar";
import NotasFiltersSection from "@/components/notas/listagem/NotasFiltersSection";
import NotasResponsiveView from "@/components/notas/listagem/NotasResponsiveView";
import NotasDetailDialog from "@/components/notas/listagem/NotasDetailDialog";
import NotasPagination from "@/components/notas/listagem/NotasPagination";

const ListagemNotasPage: React.FC = () => {
  const {
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
  } = useNotasDebitoCreditoList();

  const getExportPayload = useCallback(
    () => buildNotasExportPayload(rows, appliedFilters, page),
    [rows, appliedFilters, page],
  );

  return (
    <div className="animate-fade-in space-y-4">
      <NotasToolbar
        filtersOpen={filtersOpen}
        onToggleFilters={toggleFilters}
        search={draftFilters.pesquisa}
        onSearchChange={handlePesquisaChange}
        onSearchSubmit={handlePesquisaSubmit}
        onClear={handleLimpar}
        isLoading={isLoading}
        exportSlot={
          <ExportMenu getPayload={getExportPayload} disabled={isLoading || rows.length === 0} />
        }
      />
      <NotasFiltersSection
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={draftFilters}
        onChange={setDraftFilters}
        onBuscar={handleBuscar}
        isLoading={isLoading}
      />
      <NotasResponsiveView
        rows={rows}
        selectedRowId={selectedRowId}
        onSelectRow={handleSelectRow}
      />
      <NotasPagination
        page={page}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
        isLoading={isLoading}
      />
      <NotasDetailDialog
        nota={detailNota}
        open={detailOpen}
        loading={detailLoading}
        onOpenChange={(open) => {
          if (!open) handleCloseDetail();
        }}
      />
    </div>
  );
};

export default ListagemNotasPage;
