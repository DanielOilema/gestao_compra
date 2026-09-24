import type { TipoCompra } from '../tipoCompra';

export type OrderStatus = 'pending' | 'blocked' | 'approved';

export interface OrderItem {
  id: string;
  codigoProduto: string;
  descricaoProduto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  codigoCentroCusto: string;
  descricaoCentroCusto: string;
  observacao?: string;
  solicitante?: string;
}

export interface Order {
  id: string;
  numero: string;
  filial: string;
  fornecedor: string;
  cnpj: string;
  valor: number;
  dataEmissao: string;
  dataEntrega: string;
  solicitante: string;
  status: OrderStatus;
  motivoBloqueio?: string;
  itens: OrderItem[];
  observacaoGeral?: string;
  logAprova?: string;
  /** Tipo de compra da SC (aprovação); ausente em pedidos. */
  tipoCompra?: TipoCompra;
}

export interface OrderSummary {
  pending: number;
  blocked: number;
  approved: number;
  totalValue: number;
}

import type { RoutinePermissionId } from './permissions';

export interface User {
  id: string;
  nome: string;
  email: string;
  alcada: number;
  filial: string;
  protheusId?: string;
  userName?: string;
  isAdmin?: boolean;
  permissions?: RoutinePermissionId[];
}
