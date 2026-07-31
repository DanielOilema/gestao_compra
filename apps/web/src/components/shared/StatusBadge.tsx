import React from "react";
import { Badge } from "@gestao-compra/ui";
import { cn } from "@gestao-compra/ui";

type StatusVariant = "default" | "secondary" | "destructive" | "outline";

const statusStyles: Record<string, { label: string; variant: StatusVariant; className?: string }> = {
  rascunho: { label: "Rascunho", variant: "secondary" },
  pendente: { label: "Pendente", variant: "outline", className: "border-amber-500 text-amber-700" },
  aprovada: { label: "Aprovada", variant: "outline", className: "border-green-500 text-green-700" },
  rejeitada: { label: "Rejeitada", variant: "destructive" },
  cancelada: { label: "Cancelada", variant: "secondary" },
  processada: { label: "Processada", variant: "outline", className: "border-green-500 text-green-700" },
  debito: { label: "Débito", variant: "destructive" },
  credito: { label: "Crédito", variant: "outline", className: "border-green-500 text-green-700" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusStyles[status] ?? { label: status, variant: "secondary" as StatusVariant };

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
