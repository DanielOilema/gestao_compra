import React from "react";
import type { SolicitacaoCompraRow } from "@gestao-compra/shared";
import SolicitacaoCompraMobileItem from "./SolicitacaoCompraMobileItem";

interface SolicitacaoCompraMobileListProps {
  rows: SolicitacaoCompraRow[];
  selectedRowId: string | null;
  onSelectRow: (row: SolicitacaoCompraRow) => void;
}

const SolicitacaoCompraMobileList: React.FC<SolicitacaoCompraMobileListProps> = ({
  rows,
  selectedRowId,
  onSelectRow,
}) => {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma solicitação encontrada.
      </p>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {rows.map((row) => (
        <SolicitacaoCompraMobileItem
          key={row.rowId}
          row={row}
          selected={selectedRowId === row.rowId}
          onSelect={onSelectRow}
        />
      ))}
    </div>
  );
};

export default SolicitacaoCompraMobileList;
