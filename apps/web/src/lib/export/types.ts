import type { ReportColumn, ReportRow } from "@gestao-compra/shared";

export interface ExportFilterSummary {
  label: string;
  valor: string;
}

export interface ExportMeta {
  /** Título exibido no documento. */
  titulo: string;
  subtitulo?: string;
  /** Nome do arquivo sem extensão. Sanitizado e datado na gravação. */
  nomeArquivo?: string;
  /** Filtros aplicados, impressos para que o documento seja auditável. */
  filtros?: ExportFilterSummary[];
  /** Totais por chave de coluna, exibidos no rodapé da tabela. */
  totais?: Record<string, number>;
}

export interface ExportPayload {
  colunas: ReportColumn[];
  linhas: ReportRow[];
  meta: ExportMeta;
}
