import React from "react";
import { getTipoCompraLabel, type TipoCompra } from "@gestao-compra/shared";
import { Badge, cn } from "@gestao-compra/ui";

const TIPO_COMPRA_BADGE_CLASS: Record<TipoCompra, string> = {
  "2": "border-transparent bg-red-600 text-white hover:bg-red-600",
  "1": "border-transparent bg-orange-500 text-white hover:bg-orange-500",
  "3": "border-orange-500 bg-white text-orange-500 hover:bg-white",
  "4": "border-orange-500 bg-white text-orange-500 hover:bg-white",
};

interface TipoCompraBadgeProps {
  tipoCompra?: TipoCompra;
  className?: string;
}

const TipoCompraBadge: React.FC<TipoCompraBadgeProps> = ({ tipoCompra, className }) => {
  if (!tipoCompra) {
    return (
      <Badge variant="default" className={cn("text-xs", className)}>
        Pendente
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn("text-xs", TIPO_COMPRA_BADGE_CLASS[tipoCompra], className)}
    >
      {getTipoCompraLabel(tipoCompra)}
    </Badge>
  );
};

export default TipoCompraBadge;
