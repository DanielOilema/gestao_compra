import React from "react";
import { useIsMobile } from "@gestao-compra/ui";
import type { NotaListRow } from "@gestao-compra/shared";
import NotasTable from "./NotasTable";
import NotasMobileList from "./NotasMobileList";

interface NotasResponsiveViewProps {
  rows: NotaListRow[];
  selectedRowId: string | null;
  onSelectRow: (row: NotaListRow) => void;
}

const NotasResponsiveView: React.FC<NotasResponsiveViewProps> = ({
  rows,
  selectedRowId,
  onSelectRow,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <NotasMobileList
        rows={rows}
        selectedRowId={selectedRowId}
        onSelectRow={onSelectRow}
      />
    );
  }

  return (
    <NotasTable rows={rows} selectedRowId={selectedRowId} onSelectRow={onSelectRow} />
  );
};

export default NotasResponsiveView;
