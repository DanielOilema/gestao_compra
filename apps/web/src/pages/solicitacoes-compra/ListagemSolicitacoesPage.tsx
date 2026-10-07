import React from "react";
import { useSolicitacaoCompraList } from "@/components/solicitacoes/listagem/useSolicitacaoCompraList";
import SolicitacaoCompraToolbar from "@/components/solicitacoes/listagem/SolicitacaoCompraToolbar";
import SolicitacaoCompraFiltersSection from "@/components/solicitacoes/listagem/SolicitacaoCompraFiltersSection";
import SolicitacaoCompraResponsiveView from "@/components/solicitacoes/listagem/SolicitacaoCompraResponsiveView";
import SolicitacaoCompraDetailDialog from "@/components/solicitacoes/listagem/SolicitacaoCompraDetailDialog";
import SolicitacaoCompraPagination from "@/components/solicitacoes/listagem/SolicitacaoCompraPagination";

const ListagemSolicitacoesPage: React.FC = () => {
  const {
    filtersOpen,
    setFiltersOpen,
    draftFilters,
    setDraftFilters,
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
  } = useSolicitacaoCompraList();

  return (
    <div className="animate-fade-in space-y-4">
      <SolicitacaoCompraToolbar
        filtersOpen={filtersOpen}
        onToggleFilters={toggleFilters}
      />
      <SolicitacaoCompraFiltersSection
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={draftFilters}
        onChange={setDraftFilters}
        onBuscar={handleBuscar}
        isLoading={isLoading}
      />
      <SolicitacaoCompraResponsiveView
        rows={filteredRows}
        selectedRowId={selectedRowId}
        onSelectRow={handleSelectRow}
      />
      <SolicitacaoCompraPagination
        page={page}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
        isLoading={isLoading}
      />
      <SolicitacaoCompraDetailDialog
        request={detailRequest}
        open={detailOpen}
        isLoading={detailLoading}
        error={detailError}
        onRetry={handleRetryDetail}
        onOpenChange={(open) => {
          if (!open) handleCloseDetail();
        }}
      />
    </div>
  );
};

export default ListagemSolicitacoesPage;
