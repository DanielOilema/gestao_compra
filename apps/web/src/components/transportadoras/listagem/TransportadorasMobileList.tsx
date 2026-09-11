import React from "react";
import type { TransportadoraListItem } from "@gestao-compra/shared";
import TransportadorasMobileItem from "./TransportadorasMobileItem";

interface TransportadorasMobileListProps {
  rows: TransportadoraListItem[];
  selectedCodigo: string | null;
  onSelectRow: (row: TransportadoraListItem) => void;
  isLoading?: boolean;
}

const TransportadorasMobileList: React.FC<TransportadorasMobileListProps> = ({
  rows,
  selectedCodigo,
  onSelectRow,
  isLoading,
}) => {
  if (isLoading && rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">Carregando transportadoras...</p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma transportadora encontrada.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <TransportadorasMobileItem
          key={row.codigo}
          row={row}
          selected={selectedCodigo === row.codigo}
          onSelect={onSelectRow}
        />
      ))}
    </div>
  );
};

export default TransportadorasMobileList;
