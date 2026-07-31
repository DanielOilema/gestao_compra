import React from "react";
import type { SolicitacaoCompraProtheusStatus } from "@gestao-compra/shared";
import { cn } from "@gestao-compra/ui";

interface SolicitacaoCompraStatusDotProps {
  status: SolicitacaoCompraProtheusStatus;
  className?: string;
}

const STATUS_DOT_CLASSES: Record<SolicitacaoCompraProtheusStatus, string> = {
  aberto: "bg-emerald-500",
  totalmente_atendida: "bg-red-500",
  parcialmente_atendida: "bg-yellow-500",
  em_cotacao: "bg-blue-500",
  residuo: "bg-gray-300",
  bloqueada: "bg-blue-600",
  rejeitada: "bg-orange-500",
};

const SolicitacaoCompraStatusDot: React.FC<SolicitacaoCompraStatusDotProps> = ({
  status,
  className,
}) => (
  <span
    className={cn(
      "h-2 w-2 shrink-0 rounded-full",
      STATUS_DOT_CLASSES[status] ?? STATUS_DOT_CLASSES.aberto,
      className,
    )}
    title={status}
    aria-hidden
  />
);

export default SolicitacaoCompraStatusDot;
