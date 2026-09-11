import { describe, expect, it } from "vitest";
import type { ReportColumn, ReportRow } from "@gestao-compra/shared";
import { buildExportFileName, sanitizeFileName } from "@/lib/export/saveFile";
import { buildReportPdfDefinition } from "@/lib/export/toPdf";
import { buildXlsxBlob } from "@/lib/export/toXlsx";
import type { ExportPayload } from "@/lib/export/types";

const colunas: ReportColumn[] = [
  { key: "numero", label: "Número", formato: "texto" },
  { key: "emissao", label: "Emissão", formato: "data" },
  { key: "valor", label: "Valor", formato: "moeda" },
];

const linhas: ReportRow[] = [
  { numero: "000123", emissao: "2026-08-19", valor: 1500.25 },
  { numero: "000124", emissao: "2026-08-20", valor: 499.75 },
];

const payload: ExportPayload = {
  colunas,
  linhas,
  meta: {
    titulo: "Títulos em Aberto",
    subtitulo: "Página 1 — 2 itens",
    filtros: [
      { label: "Filial", valor: "01" },
      { label: "Pesquisa", valor: "   " },
    ],
    totais: { valor: 2000 },
  },
};

describe("sanitizeFileName", () => {
  it("removes characters invalid in file systems", () => {
    expect(sanitizeFileName('rel:a/t*o?r"i<o>')).toBe("rel-a-t-o-r-i-o-");
  });

  it("falls back to a default when nothing usable remains", () => {
    expect(sanitizeFileName("   ")).toBe("relatorio");
  });

  it("builds a dated file name with the requested extension", () => {
    const name = buildExportFileName("notas debito", "xlsx");
    expect(name).toMatch(/^notas debito-\d{8}-\d{4}\.xlsx$/);
  });
});

describe("buildReportPdfDefinition", () => {
  it("repeats the header row and prints applied filters", () => {
    const definition = buildReportPdfDefinition(payload);
    const content = definition.content as Array<Record<string, unknown>>;

    const table = content.find((item) => "table" in item) as {
      table: { headerRows: number; body: unknown[][] };
    };

    expect(table.table.headerRows).toBe(1);
    // cabeçalho + 2 linhas + linha de totais
    expect(table.table.body).toHaveLength(4);

    const filtros = content.find(
      (item) => typeof item.text === "string" && item.text.includes("Filial"),
    );
    expect(filtros).toBeDefined();
    // Filtro em branco não deve ser impresso.
    expect(String(filtros?.text)).not.toContain("Pesquisa");
  });

  it("switches to landscape when there are many columns", () => {
    const wide: ExportPayload = {
      ...payload,
      colunas: Array.from({ length: 9 }, (_, index) => ({
        key: `c${index}`,
        label: `Coluna ${index}`,
        formato: "texto" as const,
      })),
    };

    expect(buildReportPdfDefinition(payload).pageOrientation).toBe("portrait");
    expect(buildReportPdfDefinition(wide).pageOrientation).toBe("landscape");
  });

  it("right-aligns numeric columns by default", () => {
    const definition = buildReportPdfDefinition(payload);
    const content = definition.content as Array<Record<string, unknown>>;
    const table = content.find((item) => "table" in item) as {
      table: { body: Array<Array<{ alignment: string }>> };
    };

    const [numero, , valor] = table.table.body[1];
    expect(numero.alignment).toBe("left");
    expect(valor.alignment).toBe("right");
  });

  it("renders an explicit message when there are no rows", () => {
    const definition = buildReportPdfDefinition({ ...payload, linhas: [] });
    const content = definition.content as Array<Record<string, unknown>>;
    const texts = content.map((item) => String(item.text ?? ""));

    expect(texts.some((text) => text.includes("Nenhum registro encontrado"))).toBe(true);
  });

  it("sizes PDF columns from header and cell content instead of stretching text equally", () => {
    const definition = buildReportPdfDefinition({
      colunas: [
        { key: "filial", label: "Filial", formato: "texto" },
        { key: "numero", label: "Número", formato: "texto" },
        {
          key: "descricao",
          label: "Descrição",
          formato: "texto",
          largura: 40,
        },
      ],
      linhas: [
        { filial: "0101", numero: "009781", descricao: "ALUGUEL DE VEICULOS - RECIBO" },
        { filial: "0101", numero: "009788", descricao: "PAO COM PRESUNTO E QUEIJO" },
      ],
      meta: { titulo: "Solicitações de Compras" },
    });
    const content = definition.content as Array<Record<string, unknown>>;
    const table = content.find((item) => "table" in item) as {
      table: { widths: number[] };
    };

    const [filialWidth, numeroWidth, descricaoWidth] = table.table.widths;

    expect(filialWidth).toBeGreaterThan(0);
    expect(numeroWidth).toBeGreaterThan(0);
    expect(descricaoWidth).toBeGreaterThan(filialWidth);
    expect(descricaoWidth).toBeGreaterThan(numeroWidth);
    expect(filialWidth + numeroWidth + descricaoWidth).toBeLessThanOrEqual(800);
  });
});

describe("buildXlsxBlob", () => {
  // Carregar o bundle UMD do exceljs custa alguns segundos, daí o timeout ampliado. Vale o custo:
  // é o que garante que a biblioteca realmente funciona fora do navegador de produção.
  it(
    "produces a non-empty spreadsheet blob",
    async () => {
      const blob = await buildXlsxBlob(payload);

      expect(blob.size).toBeGreaterThan(0);
      expect(blob.type).toContain("spreadsheetml");
    },
    30_000,
  );
});
