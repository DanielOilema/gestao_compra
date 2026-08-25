import {
  formatReportValue,
  getExcelNumberFormat,
  isNumericReportFormat,
  parseReportNumber,
  type ReportCellValue,
  type ReportColumn,
  type ReportRow,
} from "@gestao-compra/shared";
import { buildExportFileName, saveFile } from "./saveFile";
import type { ExportPayload } from "./types";

export const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const DEFAULT_COLUMN_WIDTH = 18;
const HEADER_FILL = "FF1F3864";

/**
 * Datas viram Date de verdade quando o formato é reconhecido, para permitir ordenar e filtrar na
 * planilha. Meio-dia UTC evita que o fuso empurre a data para o dia anterior.
 */
const parseCellDate = (value: ReportCellValue): Date | null => {
  if (typeof value !== "string") return null;

  const iso = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 12));
  }

  const br = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) {
    return new Date(Date.UTC(Number(br[3]), Number(br[2]) - 1, Number(br[1]), 12));
  }

  return null;
};

const toCellValue = (value: ReportCellValue, coluna: ReportColumn) => {
  if (value === null || value === undefined || value === "") return null;

  if (isNumericReportFormat(coluna.formato)) {
    const numero = parseReportNumber(value);
    return numero ?? formatReportValue(value, coluna.formato);
  }

  if (coluna.formato === "data") {
    return parseCellDate(value) ?? formatReportValue(value, coluna.formato);
  }

  return String(value);
};

const sheetNameFrom = (titulo: string): string =>
  titulo.replace(/[\\/*?:[\]]/g, "").trim().slice(0, 31) || "Relatório";

export async function buildXlsxBlob({
  colunas,
  linhas,
  meta,
}: ExportPayload): Promise<Blob> {
  const module = await import("exceljs");
  const ExcelJS = (module as { default?: typeof module }).default ?? module;

  const workbook = new ExcelJS.Workbook();
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(sheetNameFrom(meta.titulo));

  sheet.columns = colunas.map((coluna) => ({
    key: coluna.key,
    width: coluna.largura ?? DEFAULT_COLUMN_WIDTH,
  }));

  const headerRow = sheet.addRow(colunas.map((coluna) => coluna.label));
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { vertical: "middle", wrapText: true };
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
  });

  for (const linha of linhas) {
    const row = sheet.addRow(colunas.map((coluna) => toCellValue(linha[coluna.key], coluna)));

    colunas.forEach((coluna, index) => {
      const cell = row.getCell(index + 1);
      const numFmt = getExcelNumberFormat(coluna.formato);
      if (numFmt) cell.numFmt = numFmt;
      if (coluna.alinhamento) {
        cell.alignment = {
          horizontal:
            coluna.alinhamento === "esquerda"
              ? "left"
              : coluna.alinhamento === "direita"
                ? "right"
                : "center",
        };
      }
    });
  }

  if (meta.totais && Object.keys(meta.totais).length > 0) {
    const totalsRow = sheet.addRow(
      colunas.map((coluna, index) => {
        if (index === 0) return "Total";
        const total = meta.totais?.[coluna.key];
        return total === undefined ? null : total;
      }),
    );
    totalsRow.font = { bold: true };
    colunas.forEach((coluna, index) => {
      const numFmt = getExcelNumberFormat(coluna.formato);
      if (numFmt) totalsRow.getCell(index + 1).numFmt = numFmt;
    });
  }

  sheet.views = [{ state: "frozen", ySplit: 1 }];
  if (colunas.length > 0 && linhas.length > 0) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: colunas.length },
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: XLSX_MIME_TYPE });
}

export async function exportToXlsx(payload: ExportPayload): Promise<void> {
  await saveFile({
    fileName: buildExportFileName(payload.meta.nomeArquivo ?? payload.meta.titulo, "xlsx"),
    mimeType: XLSX_MIME_TYPE,
    toBlob: () => buildXlsxBlob(payload),
  });
}
