import {
  getSolicitacaoCompraStatusLabel,
  type ReportColumn,
  type ReportRow,
  type SolicitacaoCompraRow,
} from "@gestao-compra/shared";
import type { ExportPayload } from "@/lib/export/types";
import type { SolicitacaoCompraListFilters } from "./solicitacaoCompraListFilters";

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
];

const FILTER_LABELS: Array<{ key: keyof SolicitacaoCompraListFilters; label: string }> = [
  { key: "filial", label: "Filial" },
  { key: "numSC", label: "Solicitação" },
  { key: "produto", label: "Produto" },
  { key: "solicitante", label: "Solicitante" },
  { key: "dataInicio", label: "Emissão de" },
  { key: "dataFim", label: "Emissão até" },
];

const toRow = (row: SolicitacaoCompraRow): ReportRow => ({
  filial: row.filialLabel || row.filial,
  numeroSc: row.numeroSc,
  item: row.item,
  produto: row.produto,
  descricao: row.descricao,
  unidade: row.unidade,
  quantidade: row.quantidade,
  status: getSolicitacaoCompraStatusLabel(row.status),
  solicitante: row.solicitante,
  dataCriacao: row.dataCriacao,
});

export function buildSolicitacoesExportPayload(
  rows: SolicitacaoCompraRow[],
  filters: SolicitacaoCompraListFilters,
  page: number,
): ExportPayload {
  const filtros = FILTER_LABELS.map(({ key, label }) => ({
    label,
    valor: String(filters[key] ?? "").trim(),
  })).filter((filtro) => filtro.valor.length > 0);

  return {
    colunas: COLUNAS,
    linhas: rows.map(toRow),
    meta: {
      titulo: "Solicitações de Compra",
      // A listagem é paginada, então o documento diz o que ele realmente contém.
      subtitulo: `Página ${page} — ${rows.length} ${rows.length === 1 ? "item" : "itens"}`,
      nomeArquivo: "solicitacoes-compra",
      filtros,
    },
  };
}
