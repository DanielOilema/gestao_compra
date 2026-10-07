import {
  formatFilialLabel,
  formatNumeroSc,
  getSolicitacaoCompraStatusLabel,
  mapProtheusSolicitacaoCompraStatus,
  type PurchaseRequest,
  type ReportColumn,
  type ReportRow,
  type SolicitacaoCompraProtheusStatus,
} from "@gestao-compra/shared";
import type { ExportPayload } from "@/lib/export/types";

const COLUNAS: ReportColumn[] = [
  { key: "filial", label: "Filial", formato: "texto", largura: 26 },
  { key: "numeroSc", label: "Solicitação", formato: "texto", largura: 14 },
  { key: "item", label: "Item", formato: "texto", largura: 8 },
  { key: "produto", label: "Produto", formato: "texto", largura: 16 },
  { key: "descricao", label: "Descrição", formato: "texto", largura: 40 },
  { key: "unidade", label: "UM", formato: "texto", largura: 8 },
  { key: "quantidade", label: "Quantidade", formato: "numero", largura: 14 },
  { key: "status", label: "Status", formato: "texto", largura: 22 },
  { key: "solicitante", label: "Solicitante", formato: "texto", largura: 26 },
  { key: "dataCriacao", label: "Data", formato: "data", largura: 14 },
  { key: "observacao", label: "Observação", formato: "texto", largura: 40 },
];

const headerStatus = (request: PurchaseRequest): SolicitacaoCompraProtheusStatus =>
  typeof request.status === "string"
    ? mapProtheusSolicitacaoCompraStatus(request.status)
    : "aberto";

const toRow = (request: PurchaseRequest, item: PurchaseRequest["itens"][number]): ReportRow => ({
  filial: formatFilialLabel(request.filial) || request.filial,
  numeroSc: formatNumeroSc(request.numero),
  item: item.item,
  produto: item.produto,
  descricao: item.descricao,
  unidade: item.unidade,
  quantidade: item.quantidade,
  status: getSolicitacaoCompraStatusLabel(item.status ?? headerStatus(request)),
  solicitante: request.solicitante,
  dataCriacao: request.dataCriacao,
  observacao: item.observacao?.trim() ?? "",
});

export function buildSolicitacoesExportPayload(request: PurchaseRequest): ExportPayload {
  const linhas = request.itens.map((item) => toRow(request, item));
  const numeroSc = formatNumeroSc(request.numero);

  return {
    colunas: COLUNAS,
    linhas,
    meta: {
      titulo: "Solicitações de Compra",
      subtitulo: `SC ${numeroSc} — ${linhas.length} ${linhas.length === 1 ? "item" : "itens"}`,
      nomeArquivo: `solicitacao-compra-${numeroSc}`,
    },
  };
}
