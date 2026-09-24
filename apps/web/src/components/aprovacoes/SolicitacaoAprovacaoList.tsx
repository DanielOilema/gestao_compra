import React from "react";
import { Order, formatOrderDisplay } from "@gestao-compra/shared";
import { Card } from "@gestao-compra/ui";
import { FileText, Calendar, Package, User } from "lucide-react";
import TipoCompraBadge from "@/components/aprovacoes/TipoCompraBadge";

interface SolicitacaoAprovacaoListProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("pt-BR");

const SolicitacaoAprovacaoList: React.FC<SolicitacaoAprovacaoListProps> = ({
  orders,
  onSelectOrder,
}) => {
  return (
    <div className="animate-fade-in">
      <div className="space-y-3">
        {orders.map((order, index) => (
          <Card
            key={order.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer animate-slide-in hover:border-primary/50"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onSelectOrder(order)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">{formatOrderDisplay(order)}</span>
                  <TipoCompraBadge tipoCompra={order.tipoCompra} />
                </div>
                {order.solicitante && order.solicitante !== "-" && (
                  <p className="text-sm text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                    <User className="h-3 w-3" />
                    <span className="font-medium text-foreground">{order.solicitante}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:items-end gap-1">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(order.dataEmissao)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {order.itens.length} {order.itens.length === 1 ? "item" : "itens"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitacaoAprovacaoList;
