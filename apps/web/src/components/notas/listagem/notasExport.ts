import type { NotaListRow, ReportColumn, ReportRow } from "@gestao-compra/shared";
import type { ExportPayload } from "@/lib/export/types";
import type { NotasListFilters } from "./notasListFilters";

const COLUNAS: ReportColumn[] = [
  { key: "filial", label: "Filial", formato: "texto", largura: 26 },
  { key: "numero", label: "Número", formato: "texto", largura: 14 },
  { key: "tipo", label: "Tipo", formato: "texto", largura: 10 },
  { key: "nomeCliFor", label: "Cliente / Fornecedor", formato: "texto", largura: 36 },
  { key: "dataEmissao", label: "Emissão", formato: "data", largura: 14 },
  { key: "valorTotal", label: "Valor", formato: "moeda", largura: 16, alinhamento: "direita" },
];

const TIPO_LABELS: Record<string, string> = {
  debito: "Débito",
  credito: "Crédito",
  all: "Todos",
};

const toRow = (row: NotaListRow): ReportRow => ({
  filial: row.filialLabel || row.filial,
  numero: row.numero,
  tipo: TIPO_LABELS[row.tipo] ?? row.tipo,
  nomeCliFor: row.nomeCliFor,
  dataEmissao: row.dataEmissao,
  valorTotal: row.valorTotal,
});

const buildFiltroSummary = (filters: NotasListFilters) =>
  [
    { label: "Tipo", valor: filters.tipo === "all" ? "" : (TIPO_LABELS[filters.tipo] ?? "") },
    { label: "Cliente/Fornecedor", valor: filters.cliFor },
    { label: "Pesquisa", valor: filters.pesquisa },
    { label: "Emissão de", valor: filters.dataInicio },
    { label: "Emissão até", valor: filters.dataFim },
  ]
    .map((filtro) => ({ label: filtro.label, valor: String(filtro.valor ?? "").trim() }))
    .filter((filtro) => filtro.valor.length > 0);

export function buildNotasExportPayload(
  rows: NotaListRow[],
  filters: NotasListFilters,
  page: number,
): ExportPayload {
  const total = rows.reduce((sum, row) => sum + (Number(row.valorTotal) || 0), 0);

  return {
    colunas: COLUNAS,
    linhas: rows.map(toRow),
    meta: {
      titulo: "Notas de Débito e Crédito",
      // A listagem é paginada, então o documento diz o que ele realmente contém.
      subtitulo: `Página ${page} — ${rows.length} ${rows.length === 1 ? "nota" : "notas"}`,
      nomeArquivo: "notas-debito-credito",
      filtros: buildFiltroSummary(filters),
      totais: { valorTotal: total },
    },
  };
}
