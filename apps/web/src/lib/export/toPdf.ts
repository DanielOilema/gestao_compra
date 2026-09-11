import {
  formatReportValue,
  isNumericReportFormat,
  type ReportColumn,
} from "@gestao-compra/shared";
import type { TCreatedPdf, TDocumentDefinitions } from "pdfmake/interfaces";
import { buildExportFileName, saveFile } from "./saveFile";
import type { ExportPayload } from "./types";

export const PDF_MIME_TYPE = "application/pdf";

/** Acima disso a tabela não cabe em retrato de forma legível. */
const LANDSCAPE_COLUMN_THRESHOLD = 6;

const TABLE_FONT_SIZE = 8;

interface PdfMakeModule {
  createPdf: (definition: TDocumentDefinitions) => TCreatedPdf;
  addVirtualFileSystem: (vfs: Record<string, string>) => void;
  addFonts: (fonts: Record<string, Record<string, string>>) => void;
}

let pdfMakePromise: Promise<PdfMakeModule> | null = null;

/**
 * pdfmake e o pacote de fontes somam alguns megabytes, então só são baixados quando o usuário
 * realmente exporta um PDF. O build de browser do pdfmake não suporta as fontes padrão do PDF,
 * por isso o Roboto precisa ser registrado no sistema de arquivos virtual.
 *
 * Os builds são UMD; a normalização de `default` cobre as duas formas de interop.
 */
const loadPdfMake = (): Promise<PdfMakeModule> => {
  pdfMakePromise ??= (async () => {
    const [pdfMakeImport, vfsImport] = await Promise.all([
      import("pdfmake/build/pdfmake"),
      import("pdfmake/build/vfs_fonts"),
    ]);

    const pdfMake = ((pdfMakeImport as { default?: unknown }).default ??
      pdfMakeImport) as PdfMakeModule;
    const vfs = ((vfsImport as { default?: unknown }).default ?? vfsImport) as Record<
      string,
      string
    >;

    pdfMake.addVirtualFileSystem(vfs);
    pdfMake.addFonts({
      Roboto: {
        normal: "Roboto-Regular.ttf",
        bold: "Roboto-Medium.ttf",
        italics: "Roboto-Italic.ttf",
        bolditalics: "Roboto-MediumItalic.ttf",
      },
    });

    return pdfMake;
  })();

  return pdfMakePromise;
};

const alignmentOf = (coluna: ReportColumn): "left" | "center" | "right" => {
  if (coluna.alinhamento === "esquerda") return "left";
  if (coluna.alinhamento === "centro") return "center";
  if (coluna.alinhamento === "direita") return "right";
  return isNumericReportFormat(coluna.formato) ? "right" : "left";
};

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const PAGE_MARGINS: [number, number, number, number] = [24, 28, 24, 36];
const MIN_COLUMN_WIDTH_PT = 28;
/** Evita que um texto longo monopolize a página; o restante quebra linha. */
const TEXT_CONTENT_CHAR_CAP = 32;
const NUMERIC_CONTENT_CHAR_CAP = 16;

const pageContentWidth = (landscape: boolean): number =>
  (landscape ? A4_HEIGHT_PT : A4_WIDTH_PT) - PAGE_MARGINS[0] - PAGE_MARGINS[2];

const columnContentWeight = (
  coluna: ReportColumn,
  linhas: ExportPayload["linhas"],
): number => {
  const headerChars = coluna.label.trim().length;
  let maxContentChars = 0;

  for (const linha of linhas) {
    const text = formatReportValue(linha[coluna.key] ?? null, coluna.formato);
    maxContentChars = Math.max(maxContentChars, text.length);
  }

  const cap =
    isNumericReportFormat(coluna.formato) || coluna.formato === "data"
      ? NUMERIC_CONTENT_CHAR_CAP
      : TEXT_CONTENT_CHAR_CAP;

  return Math.max(4, headerChars, Math.min(Math.max(maxContentChars, coluna.largura ?? 0), cap));
};

/**
 * Larguras em pontos proporcionais ao conteúdo (cabeçalho, células e `largura` declarada),
 * limitadas à área útil da página. Colunas curtas como Filial ficam estreitas; descrição e
 * observação recebem mais espaço e quebram linha.
 */
export const computePdfColumnWidths = (
  colunas: ReportColumn[],
  linhas: ExportPayload["linhas"],
  landscape: boolean,
): number[] => {
  if (colunas.length === 0) return [];

  const available = pageContentWidth(landscape);
  const weights = colunas.map((coluna) => columnContentWeight(coluna, linhas));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  const widths = weights.map((weight) => (weight / totalWeight) * available);
  const belowMin = widths.filter((width) => width < MIN_COLUMN_WIDTH_PT).length;

  if (belowMin === 0) return widths;
  if (belowMin === widths.length) {
    return widths.map(() => available / widths.length);
  }

  const reserved = belowMin * MIN_COLUMN_WIDTH_PT;
  const leftover = Math.max(available - reserved, 0);
  const flexibleWeight = weights.reduce(
    (sum, weight, index) => (widths[index] < MIN_COLUMN_WIDTH_PT ? sum : sum + weight),
    0,
  );

  return widths.map((width, index) => {
    if (width < MIN_COLUMN_WIDTH_PT) return MIN_COLUMN_WIDTH_PT;
    if (flexibleWeight <= 0) return width;
    return (weights[index] / flexibleWeight) * leftover;
  });
};

export function buildReportPdfDefinition({
  colunas,
  linhas,
  meta,
}: ExportPayload): TDocumentDefinitions {
  const landscape = colunas.length > LANDSCAPE_COLUMN_THRESHOLD;
  const widths = computePdfColumnWidths(colunas, linhas, landscape);

  const header = colunas.map((coluna) => ({
    text: coluna.label,
    style: "tableHeader",
    alignment: alignmentOf(coluna),
  }));

  const body = linhas.map((linha) =>
    colunas.map((coluna) => ({
      text: formatReportValue(linha[coluna.key] ?? null, coluna.formato),
      alignment: alignmentOf(coluna),
    })),
  );

  const totalsRow =
    meta.totais && Object.keys(meta.totais).length > 0
      ? [
          colunas.map((coluna, index) => {
            if (index === 0) {
              return { text: "Total", style: "tableTotal", alignment: alignmentOf(coluna) };
            }
            const total = meta.totais?.[coluna.key];
            return {
              text: total === undefined ? "" : formatReportValue(total, coluna.formato),
              style: "tableTotal",
              alignment: alignmentOf(coluna),
            };
          }),
        ]
      : [];

  const filtros = meta.filtros?.filter((filtro) => filtro.valor.trim().length > 0) ?? [];

  return {
    pageSize: "A4",
    pageOrientation: landscape ? "landscape" : "portrait",
    pageMargins: PAGE_MARGINS,
    defaultStyle: { font: "Roboto", fontSize: TABLE_FONT_SIZE },
    content: [
      { text: meta.titulo, style: "titulo" },
      ...(meta.subtitulo ? [{ text: meta.subtitulo, style: "subtitulo" }] : []),
      ...(filtros.length > 0
        ? [
            {
              text: filtros.map((filtro) => `${filtro.label}: ${filtro.valor}`).join("   |   "),
              style: "filtros",
            },
          ]
        : []),
      colunas.length === 0
        ? { text: "Nenhuma coluna disponível para exportação.", style: "vazio" }
        : {
            table: {
              headerRows: 1,
              dontBreakRows: true,
              widths,
              body: [header, ...body, ...totalsRow],
            },
            layout: "lightHorizontalLines",
          },
      ...(linhas.length === 0
        ? [{ text: "Nenhum registro encontrado para os filtros aplicados.", style: "vazio" }]
        : []),
    ],
    footer: (currentPage: number, pageCount: number) => ({
      margin: [24, 8, 24, 0],
      columns: [
        {
          text: `Gerado em ${new Date().toLocaleString("pt-BR")}`,
          style: "rodape",
        },
        {
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: "right",
          style: "rodape",
        },
      ],
    }),
    styles: {
      titulo: { fontSize: 14, bold: true, margin: [0, 0, 0, 2] },
      subtitulo: { fontSize: 9, color: "#555555", margin: [0, 0, 0, 6] },
      filtros: { fontSize: 8, color: "#555555", margin: [0, 0, 0, 8] },
      tableHeader: { bold: true, fillColor: "#1F3864", color: "#FFFFFF", margin: [0, 2, 0, 2] },
      tableTotal: { bold: true, fillColor: "#EFEFEF" },
      vazio: { fontSize: 9, italics: true, color: "#777777", margin: [0, 8, 0, 0] },
      rodape: { fontSize: 7, color: "#777777" },
    },
  };
}

const createPdf = async (payload: ExportPayload): Promise<TCreatedPdf> => {
  const pdfMake = await loadPdfMake();
  return pdfMake.createPdf(buildReportPdfDefinition(payload));
};

export async function buildPdfBlob(payload: ExportPayload): Promise<Blob> {
  const pdf = await createPdf(payload);
  return pdf.getBlob();
}

export async function exportToPdf(payload: ExportPayload): Promise<void> {
  await saveFile({
    fileName: buildExportFileName(payload.meta.nomeArquivo ?? payload.meta.titulo, "pdf"),
    mimeType: PDF_MIME_TYPE,
    toBlob: () => buildPdfBlob(payload),
    // No app nativo o arquivo é gravado em base64; pedir direto ao pdfmake evita o Blob.
    toBase64: async () => {
      const pdf = await createPdf(payload);
      return pdf.getBase64();
    },
  });
}
