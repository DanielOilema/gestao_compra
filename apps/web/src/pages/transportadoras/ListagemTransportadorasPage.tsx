import React from "react";
import TransportadorasToolbar from "@/components/transportadoras/listagem/TransportadorasToolbar";
import TransportadorasResponsiveView from "@/components/transportadoras/listagem/TransportadorasResponsiveView";
import TransportadorasDetailDialog from "@/components/transportadoras/listagem/TransportadorasDetailDialog";
import { useTransportadorasList } from "@/components/transportadoras/listagem/useTransportadorasList";

const ListagemTransportadorasPage: React.FC = () => {
  const {
    pesquisa,
    setPesquisa,
    isLoading,
    selectedCodigo,
    rows,
    detailOpen,
    detail,
    detailLoading,
    handlePesquisaSubmit,
    handleLimpar,
    handleSelectRow,
    handleCloseDetail,
  } = useTransportadorasList();

  return (
    <div className="animate-fade-in space-y-4">
      <TransportadorasToolbar
        search={pesquisa}
        onSearchChange={setPesquisa}
        onSearchSubmit={handlePesquisaSubmit}
        onClear={handleLimpar}
        isLoading={isLoading}
      />
      <TransportadorasResponsiveView
        rows={rows}
        selectedCodigo={selectedCodigo}
        onSelectRow={handleSelectRow}
        isLoading={isLoading}
      />
      <TransportadorasDetailDialog
        transportadora={detail}
        open={detailOpen}
        loading={detailLoading}
        onOpenChange={handleCloseDetail}
      />
    </div>
  );
};

export default ListagemTransportadorasPage;
