import {
  RELATORIO_HOSP_PASS_TITULO,
  type ReportEnvelope,
} from "@gestao-compra/shared";
import { isoToBrDate } from "@/lib/dateBr";
import type { ExportPayload } from "@/lib/export/types";

interface BuildRelatorioHospPassExportPayloadInput {
  envelope: ReportEnvelope;
  dtInicial: string;
  dtFinal: string;
}

export function buildRelatorioHospPassFileName(dtInicial: string, dtFinal: string): string {
  return `relatorio-passagens-hospedagens-${dtInicial}-a-${dtFinal}`;
}

export function buildRelatorioHospPassExportPayload({
  envelope,
  dtInicial,
  dtFinal,
}: BuildRelatorioHospPassExportPayloadInput): ExportPayload {
  return {
    colunas: envelope.colunas,
    linhas: envelope.linhas,
    meta: {
      titulo: envelope.titulo || RELATORIO_HOSP_PASS_TITULO,
      subtitulo: `${envelope.linhas.length} ${envelope.linhas.length === 1 ? "registro" : "registros"}`,
      nomeArquivo: buildRelatorioHospPassFileName(dtInicial, dtFinal),
      filtros: [
        { label: "Data inicial", valor: isoToBrDate(dtInicial) || dtInicial },
        { label: "Data final", valor: isoToBrDate(dtFinal) || dtFinal },
      ],
    },
  };
}
