import React from 'react';
import { OrderStatus } from '@gestao-compra/shared';
import { Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface StatusCardProps {
  status: OrderStatus | 'total';
  count: number;
  value?: number;
  onClick?: () => void;
}

const statusConfig = {
  pending: {
    label: 'Pendentes',
    icon: Clock,
    cardClass: 'status-card status-card-pending',
    iconClass: 'text-status-pending',
  },
  blocked: {
    label: 'Bloqueados',
    icon: AlertTriangle,
    cardClass: 'status-card status-card-blocked',
    iconClass: 'text-status-blocked',
  },
  approved: {
    label: 'Aprovados',
    icon: CheckCircle,
    cardClass: 'status-card status-card-approved',
    iconClass: 'text-status-approved',
  },
  total: {
    label: 'Valor Total',
    icon: TrendingUp,
    cardClass: 'status-card bg-card border-2 border-border',
    iconClass: 'text-primary',
  },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const StatusCard: React.FC<StatusCardProps> = ({ status, count, value, onClick }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={config.cardClass}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {config.label}
          </p>
          {status === 'total' && value !== undefined ? (
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {formatCurrency(value)}
            </p>
          ) : (
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{count}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-card/50`}>
          <Icon className={`w-6 h-6 ${config.iconClass}`} />
        </div>
      </div>
      {onClick && (
        <p className="text-xs text-muted-foreground mt-3">
          Clique para ver detalhes →
        </p>
      )}
    </div>
  );
};

export default StatusCard;
