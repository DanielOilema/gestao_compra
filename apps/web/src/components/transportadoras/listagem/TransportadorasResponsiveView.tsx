import React from "react";
import { useIsMobile } from "@gestao-compra/ui";
import type { TransportadoraListItem } from "@gestao-compra/shared";
import TransportadorasTable from "./TransportadorasTable";
import TransportadorasMobileList from "./TransportadorasMobileList";

interface TransportadorasResponsiveViewProps {
  rows: TransportadoraListItem[];
  selectedCodigo: string | null;
  onSelectRow: (row: TransportadoraListItem) => void;
  isLoading?: boolean;
}

const TransportadorasResponsiveView: React.FC<TransportadorasResponsiveViewProps> = ({
  rows,
  selectedCodigo,
  onSelectRow,
  isLoading,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <TransportadorasMobileList
        rows={rows}
        selectedCodigo={selectedCodigo}
        onSelectRow={onSelectRow}
        isLoading={isLoading}
      />
    );
  }

  return (
    <TransportadorasTable
      rows={rows}
      selectedCodigo={selectedCodigo}
      onSelectRow={onSelectRow}
      isLoading={isLoading}
    />
  );
};

export default TransportadorasResponsiveView;
