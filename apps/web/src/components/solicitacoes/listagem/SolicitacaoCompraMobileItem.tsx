import React from "react";
import type { SolicitacaoCompraRow } from "@gestao-compra/shared";
import { cn } from "@gestao-compra/ui";
import SolicitacaoCompraStatusDot from "./SolicitacaoCompraStatusDot";

interface SolicitacaoCompraMobileItemProps {
  row: SolicitacaoCompraRow;
  selected: boolean;
  onSelect: (row: SolicitacaoCompraRow) => void;
}

const formatQuantity = (value: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

const SolicitacaoCompraMobileItem: React.FC<SolicitacaoCompraMobileItemProps> = ({
  row,
  selected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(row)}
      className={cn(
        "w-full border-b border-border px-3 py-3 text-left transition-colors",
        selected ? "bg-accent" : "hover:bg-muted/50",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <SolicitacaoCompraStatusDot status={row.status} />
          <span className="truncate text-xs text-muted-foreground">{row.filialLabel}</span>
        </div>
        <span className="shrink-0 text-sm font-semibold text-foreground">SC {row.numeroSc}</span>
      </div>

      <p className="mt-1 truncate text-sm font-medium uppercase text-foreground">{row.descricao}</p>

      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-xs text-muted-foreground">Cod: {row.produto}</span>
        <span className="shrink-0 text-sm font-semibold text-primary">
          {formatQuantity(row.quantidade)} {row.unidade}
        </span>
      </div>
    </button>
  );
};

export default SolicitacaoCompraMobileItem;
