import React from "react";
import type { NotaListRow } from "@gestao-compra/shared";
import NotasMobileItem from "./NotasMobileItem";

interface NotasMobileListProps {
  rows: NotaListRow[];
  selectedRowId: string | null;
  onSelectRow: (row: NotaListRow) => void;
}

const NotasMobileList: React.FC<NotasMobileListProps> = ({
  rows,
  selectedRowId,
  onSelectRow,
}) => {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma nota encontrada.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <NotasMobileItem
          key={row.rowId}
          row={row}
          selected={selectedRowId === row.rowId}
          onSelect={onSelectRow}
        />
      ))}
    </div>
  );
};

export default NotasMobileList;
