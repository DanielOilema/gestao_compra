import React from "react";
import { useIsMobile } from "@gestao-compra/ui";
import type { SolicitacaoCompraRow } from "@gestao-compra/shared";
import SolicitacaoCompraTable from "./SolicitacaoCompraTable";
import SolicitacaoCompraMobileList from "./SolicitacaoCompraMobileList";

interface SolicitacaoCompraResponsiveViewProps {
  rows: SolicitacaoCompraRow[];
  selectedRowId: string | null;
  onSelectRow: (row: SolicitacaoCompraRow) => void;
}

const SolicitacaoCompraResponsiveView: React.FC<SolicitacaoCompraResponsiveViewProps> = ({
  rows,
  selectedRowId,
  onSelectRow,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <SolicitacaoCompraMobileList
        rows={rows}
        selectedRowId={selectedRowId}
        onSelectRow={onSelectRow}
      />
    );
  }

  return (
    <SolicitacaoCompraTable
      rows={rows}
      selectedRowId={selectedRowId}
      onSelectRow={onSelectRow}
    />
  );
};

export default SolicitacaoCompraResponsiveView;
