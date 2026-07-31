import React from "react";
import type { NotaItemDraft } from "@gestao-compra/shared";
import { Button } from "@gestao-compra/ui";
import { Trash2 } from "lucide-react";

interface NotaItemMobileCardProps {
  item: NotaItemDraft;
  onRemove: (id: string) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const NotaItemMobileCard: React.FC<NotaItemMobileCardProps> = ({ item, onRemove }) => (
  <div className="rounded-lg border bg-card p-3 space-y-2">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm">{item.produto}</p>
        <p className="text-xs text-muted-foreground break-words">{item.produtoDescricao}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={() => onRemove(item.id)}
        aria-label="Remover item"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
    {item.centroCusto && (
      <p className="text-xs text-muted-foreground break-words">
        C.Custo: {item.centroCusto}
        {item.centroCustoDescricao ? ` — ${item.centroCustoDescricao}` : ""}
      </p>
    )}
    {item.observacao && (
      <p className="text-xs text-muted-foreground break-words">Obs.: {item.observacao}</p>
    )}
    <p className="text-sm font-semibold text-primary text-right">{formatCurrency(item.valor)}</p>
  </div>
);

export default NotaItemMobileCard;
