import React from "react";
import type { NotaListRow } from "@gestao-compra/shared";
import { cn } from "@gestao-compra/ui";
import StatusBadge from "@/components/shared/StatusBadge";

interface NotasMobileItemProps {
  row: NotaListRow;
  selected: boolean;
  onSelect: (row: NotaListRow) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatDate = (date: string) => {
  if (!date) return "-";
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
};

const NotasMobileItem: React.FC<NotasMobileItemProps> = ({ row, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(row)}
    className={cn(
      "w-full rounded-lg border p-3 text-left transition-colors",
      selected ? "border-primary bg-accent" : "bg-card hover:bg-muted/40",
    )}
  >
    <p className="truncate text-xs text-muted-foreground">{row.filialLabel || row.filial || "-"}</p>

    <div className="mt-1 flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="font-semibold text-foreground">Recibo {row.numero}</p>
        <p className="text-sm text-muted-foreground truncate">{row.nomeCliFor || "-"}</p>
      </div>
      <StatusBadge status={row.tipo} />
    </div>
    <div className="mt-2 flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{formatDate(row.dataEmissao)}</span>
      <span className="font-semibold text-primary">{formatCurrency(row.valorTotal)}</span>
    </div>
  </button>
);

export default NotasMobileItem;
