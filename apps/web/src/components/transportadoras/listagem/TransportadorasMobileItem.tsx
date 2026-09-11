import React from "react";
import type { TransportadoraListItem } from "@gestao-compra/shared";
import { cn } from "@gestao-compra/ui";

interface TransportadorasMobileItemProps {
  row: TransportadoraListItem;
  selected: boolean;
  onSelect: (row: TransportadoraListItem) => void;
}

const TransportadorasMobileItem: React.FC<TransportadorasMobileItemProps> = ({
  row,
  selected,
  onSelect,
}) => (
  <button
    type="button"
    onClick={() => onSelect(row)}
    className={cn(
      "w-full rounded-lg border p-3 text-left transition-colors",
      selected ? "border-primary bg-accent" : "bg-card hover:bg-muted/40",
    )}
  >
    <p className="truncate text-xs text-muted-foreground">{row.codigo}</p>
    <p className="mt-1 font-semibold text-foreground">{row.nome || "-"}</p>
    <p className="mt-1 text-sm text-muted-foreground">{row.cgc || "-"}</p>
  </button>
);

export default TransportadorasMobileItem;
