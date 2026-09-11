import {
  RELATORIO_SC_SETORES_TITULO,
  type ReportEnvelope,
} from "@gestao-compra/shared";
import { isoToBrDate } from "@/lib/dateBr";
import type { ExportPayload } from "@/lib/export/types";

interface BuildRelatorioScSetoresExportPayloadInput {
  envelope: ReportEnvelope;
  dtInicial: string;
  dtFinal: string;
  grupoLabel: string;
}

export function buildRelatorioScSetoresFileName(dtInicial: string, dtFinal: string): string {
  return `relatorio-solicitacoes-${dtInicial}-a-${dtFinal}`;
}

export function buildRelatorioScSetoresExportPayload({
  envelope,
  dtInicial,
  dtFinal,
  grupoLabel,
}: BuildRelatorioScSetoresExportPayloadInput): ExportPayload {
  return {
    colunas: envelope.colunas,
    linhas: envelope.linhas,
    meta: {
      titulo: envelope.titulo || RELATORIO_SC_SETORES_TITULO,
      subtitulo: `${envelope.linhas.length} ${envelope.linhas.length === 1 ? "registro" : "registros"}`,
      nomeArquivo: buildRelatorioScSetoresFileName(dtInicial, dtFinal),
      filtros: [
        { label: "Data inicial", valor: isoToBrDate(dtInicial) || dtInicial },
        { label: "Data final", valor: isoToBrDate(dtFinal) || dtFinal },
        { label: "Grupo de compras", valor: grupoLabel },
      ],
    },
  };
}
