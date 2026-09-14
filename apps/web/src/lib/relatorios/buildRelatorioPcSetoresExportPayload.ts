import {
  RELATORIO_PC_SETORES_TITULO,
  type ReportEnvelope,
} from "@gestao-compra/shared";
import { isoToBrDate } from "@/lib/dateBr";
import type { ExportPayload } from "@/lib/export/types";

interface BuildRelatorioPcSetoresExportPayloadInput {
  envelope: ReportEnvelope;
  dtInicial: string;
  dtFinal: string;
  grupoLabel: string;
}

export function buildRelatorioPcSetoresFileName(dtInicial: string, dtFinal: string): string {
  return `relatorio-pedidos-${dtInicial}-a-${dtFinal}`;
}

export function buildRelatorioPcSetoresExportPayload({
  envelope,
  dtInicial,
  dtFinal,
  grupoLabel,
}: BuildRelatorioPcSetoresExportPayloadInput): ExportPayload {
  return {
    colunas: envelope.colunas,
    linhas: envelope.linhas,
    meta: {
      titulo: envelope.titulo || RELATORIO_PC_SETORES_TITULO,
      subtitulo: `${envelope.linhas.length} ${envelope.linhas.length === 1 ? "registro" : "registros"}`,
      nomeArquivo: buildRelatorioPcSetoresFileName(dtInicial, dtFinal),
      filtros: [
        { label: "Data inicial", valor: isoToBrDate(dtInicial) || dtInicial },
        { label: "Data final", valor: isoToBrDate(dtFinal) || dtFinal },
        { label: "Grupo de compras", valor: grupoLabel },
      ],
    },
  };
}
