import type { SolicitacaoCompraProtheusStatus } from "../solicitacaoCompraStatus";
import type { TipoCompra } from "../tipoCompra";

export type PurchaseRequestStatus =
  | "rascunho"
  | "pendente"
  | "aprovada"
  | "rejeitada"
  | "cancelada";

export interface PurchaseRequestItem {
  id: string;
  item: string;
  produto: string;
  unidade: string;
  descricao: string;
  quantidade: number;
  valorEstimado: number;
  fornecedorPreferencial?: string;
  observacao?: string;
  codigoCentroCusto?: string;
  descricaoCentroCusto?: string;
  dataEntrega?: string;
  status?: SolicitacaoCompraProtheusStatus;
}

export interface SolicitacaoCompraRow {
  rowId: string;
  requestId: string;
  filial: string;
  filialLabel: string;
  numeroSc: string;
  item: string;
  produto: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  status: SolicitacaoCompraProtheusStatus;
  solicitante: string;
  dataCriacao: string;
}

export interface PurchaseRequest {
  id: string;
  numero: string;
  dataCriacao: string;
  status: SolicitacaoCompraProtheusStatus | PurchaseRequestStatus;
  solicitante: string;
  filial: string;
  tipoCompra?: TipoCompra;
  itens: PurchaseRequestItem[];
}

export function getPurchaseRequestTotal(request: PurchaseRequest): number {
  return request.itens.reduce(
    (sum, item) => sum + item.quantidade * item.valorEstimado,
    0,
  );
}
