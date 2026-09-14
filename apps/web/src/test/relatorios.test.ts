import { describe, expect, it } from "vitest";
import {
  buildDefaultReportFilters,
  formatReportValue,
  getPeriodoFilterKeys,
  getReportModulePermission,
  getReportPermission,
  isReportModuleId,
  sortReportDefinitions,
  type ReportDefinition,
} from "@gestao-compra/shared";
import {
  ReportEnvelopeError,
  parseReportEnvelope,
} from "@/lib/relatorios/reportEnvelopeSchema";

/** O Intl usa espaço não separável em moeda; normaliza para asserções estáveis. */
const normalize = (value: string) => value.replace(/\u00a0/g, " ");

describe("formatReportValue", () => {
  it("formats currency", () => {
    expect(normalize(formatReportValue(1234.5, "moeda"))).toBe("R$ 1.234,50");
  });

  it("formats decimal and integer", () => {
    expect(formatReportValue(1234.5, "numero")).toBe("1.234,50");
    expect(formatReportValue(1234, "inteiro")).toBe("1.234");
  });

  it("formats percentage as percentage points", () => {
    expect(formatReportValue(12.5, "percentual")).toBe("12,5%");
  });

  it("formats ISO date as pt-BR", () => {
    expect(formatReportValue("2026-08-19", "data")).toBe("19/08/2026");
  });

  it("renders empty values as dash", () => {
    expect(formatReportValue(null, "moeda")).toBe("-");
    expect(formatReportValue("", "texto")).toBe("-");
  });

  it("keeps zero instead of treating it as empty", () => {
    expect(normalize(formatReportValue(0, "moeda"))).toBe("R$ 0,00");
  });

  it("parses numeric strings sent as pt-BR text", () => {
    expect(normalize(formatReportValue("1.234,50", "moeda"))).toBe("R$ 1.234,50");
  });
});

describe("permissão por módulo", () => {
  it("derives the routine permission from the module", () => {
    expect(getReportModulePermission("financeiro")).toBe("relatorios-financeiro");
    expect(getReportModulePermission("compras")).toBe("relatorios-compras");
  });

  it("uses a specific report permission when declared", () => {
    expect(
      getReportPermission({ modulo: "compras", permission: "relatorios-pedidos" }),
    ).toBe("relatorios-pedidos");
    expect(
      getReportPermission({ modulo: "compras", permission: "relatorios-passagens" }),
    ).toBe("relatorios-passagens");
    expect(getReportPermission({ modulo: "compras" })).toBe("relatorios-compras");
  });

  it("validates module ids coming from the URL", () => {
    expect(isReportModuleId("financeiro")).toBe(true);
    expect(isReportModuleId("rh")).toBe(false);
    expect(isReportModuleId(undefined)).toBe(false);
  });
});

describe("filtros declarativos", () => {
  it("expands a period filter into two request keys", () => {
    expect(getPeriodoFilterKeys("dt")).toEqual({ inicial: "dtInicial", final: "dtFinal" });
  });

  it("builds default values, expanding periods", () => {
    const filters = buildDefaultReportFilters([
      { key: "dt", label: "Período", tipo: "periodo", valorPadrao: "2026-01-01" },
      { key: "filial", label: "Filial", tipo: "filial" },
      { key: "carteira", label: "Carteira", tipo: "selecao", valorPadrao: "pagar" },
    ]);

    expect(filters).toEqual({
      dtInicial: "2026-01-01",
      dtFinal: "2026-01-01",
      carteira: "pagar",
    });
  });
});

describe("sortReportDefinitions", () => {
  const build = (id: string, titulo: string, ordem?: number): ReportDefinition => ({
    id,
    modulo: "financeiro",
    titulo,
    descricao: "",
    filtros: [],
    ordem,
  });

  it("orders by ordem, then title, leaving unordered last", () => {
    const sorted = sortReportDefinitions([
      build("c", "Aging"),
      build("a", "Zebra", 1),
      build("b", "Alfa", 2),
    ]);

    expect(sorted.map((report) => report.id)).toEqual(["a", "b", "c"]);
  });
});

describe("parseReportEnvelope", () => {
  it("accepts a minimal envelope and defaults the empty sections", () => {
    const envelope = parseReportEnvelope({ id: "financeiro-aging" });

    expect(envelope.id).toBe("financeiro-aging");
    expect(envelope.kpis).toEqual([]);
    expect(envelope.series).toEqual([]);
    expect(envelope.rankings).toEqual([]);
    expect(envelope.colunas).toEqual([]);
    expect(envelope.linhas).toEqual([]);
  });

  it("accepts a fully populated envelope", () => {
    const envelope = parseReportEnvelope({
      id: "financeiro-aging",
      titulo: "Títulos em Aberto",
      kpis: [{ key: "saldo", label: "Saldo", valor: 1000, formato: "moeda" }],
      series: [
        {
          key: "vencimentos",
          label: "Vencimentos",
          tipo: "barra",
          pontos: [{ x: "1-30", y: 500 }],
        },
      ],
      rankings: [
        {
          key: "clientes",
          label: "Clientes",
          itens: [{ codigo: "001", descricao: "Cliente A", valor: 500 }],
        },
      ],
      colunas: [{ key: "numero", label: "Título", formato: "texto" }],
      linhas: [{ numero: "000123" }],
      totais: { saldo: 1000 },
      paginacao: { page: 1, pageSize: 50, hasNext: false },
    });

    expect(envelope.kpis[0].valor).toBe(1000);
    expect(envelope.paginacao?.hasNext).toBe(false);
  });

  it("coerces boolean cells into readable text", () => {
    const envelope = parseReportEnvelope({
      id: "x",
      linhas: [{ vencido: true, quitado: false }],
    });

    expect(envelope.linhas[0]).toEqual({ vencido: "Sim", quitado: "Não" });
  });

  it("rejects an envelope without id", () => {
    expect(() => parseReportEnvelope({ titulo: "sem id" })).toThrow(ReportEnvelopeError);
  });

  it("rejects an unknown value format", () => {
    expect(() =>
      parseReportEnvelope({
        id: "x",
        colunas: [{ key: "a", label: "A", formato: "dinheiro" }],
      }),
    ).toThrow(ReportEnvelopeError);
  });
});
