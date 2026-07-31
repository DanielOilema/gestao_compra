import React from 'react';
import { Order } from '@gestao-compra/shared';
import { formatOrderDisplay } from '@gestao-compra/shared';
import { Card, Badge } from '@gestao-compra/ui';
import { FileText, Calendar, Package } from 'lucide-react';

interface PedidoListProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

const PedidoList: React.FC<PedidoListProps> = ({ orders, onSelectOrder }) => {
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
                  <Badge variant="default" className="text-xs">Pendente</Badge>
                </div>
                <p className="text-sm font-medium text-foreground truncate">{order.fornecedor}</p>
                <p className="text-xs text-muted-foreground">{order.cnpj}</p>
                {order.motivoBloqueio && (
                  <p className="text-xs text-status-blocked mt-1 font-medium">⚠️ {order.motivoBloqueio}</p>
                )}
              </div>

              <div className="flex flex-col sm:items-end gap-1">
                <p className="text-lg font-bold text-primary">{formatCurrency(order.valor)}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(order.dataEmissao)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {order.itens.length} {order.itens.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum pedido encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidoList;
