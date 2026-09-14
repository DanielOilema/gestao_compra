import { describe, expect, it } from "vitest";
import {
  mapProtheusGruposSolicitacoes,
  mapRelPcSetoresToEnvelope,
  RELATORIO_PC_SETORES_COLUMNS,
  RELATORIO_PC_SETORES_ID,
  RELATORIO_PC_SETORES_LOOKUP_GRUPOS,
} from "@gestao-compra/shared";
import { findReportDefinition, getReportsByModule } from "@/config/reports";
import { buildRelatorioPcSetoresExportPayload } from "@/lib/relatorios/buildRelatorioPcSetoresExportPayload";
import { validateReportFilters } from "@/lib/relatorios/validateReportFilters";

const definition = () => findReportDefinition(RELATORIO_PC_SETORES_ID)!;

describe("catálogo do relatório de pedidos", () => {
  it("registers the purchase orders report with required period and group filters", () => {
    const report = findReportDefinition(RELATORIO_PC_SETORES_ID);

    expect(report).toMatchObject({
      id: RELATORIO_PC_SETORES_ID,
      modulo: "compras",
      titulo: "Pedidos de Compras",
      permission: "relatorios-pedidos",
    });
    expect(getReportsByModule("compras").map((item) => item.id)).toContain(RELATORIO_PC_SETORES_ID);

    const keys = report?.filtros.map((filtro) => filtro.key);
    expect(keys).toEqual(["dt", "grupoAprovacao"]);
    expect(report?.filtros.every((filtro) => filtro.obrigatorio)).toBe(true);
    expect(report?.filtros.find((filtro) => filtro.key === "grupoAprovacao")).toMatchObject({
      tipo: "selecao",
      fonteOpcoes: RELATORIO_PC_SETORES_LOOKUP_GRUPOS,
    });
  });
});

describe("mapProtheusGruposAprovacao", () => {
  it("maps codigo as value and descricao as the visible label", () => {
    const grupos = mapProtheusGruposSolicitacoes({
      grupos_aprovacao: [
        { codigo: "000001", descricao: "MARKETING - PC" },
        { codigo: "000002", descricao: "TI - PC" },
      ],
    });

    expect(grupos).toEqual([
      { codigo: "000001", descricao: "MARKETING - PC" },
      { codigo: "000002", descricao: "TI - PC" },
    ]);
  });
});

describe("mapRelPcSetoresToEnvelope", () => {
  it("maps PEDIDOS_SETORES into the generic report envelope", () => {
    const envelope = mapRelPcSetoresToEnvelope({
      PEDIDOS_SETORES: [
        {
          filial: "01",
          tipoCompra: "Normal",
          numero: "000001",
          emissao: "2026-09-01",
          produto: "MAT001",
          descricao: "Material X",
          quantidade: 10,
          centroCusto: "10101",
          descCC: "Departamento Y",
          solicitante: "FULANO",
          observacao: "Obs...",
        },
      ],
    });

    expect(envelope.id).toBe(RELATORIO_PC_SETORES_ID);
    expect(envelope.colunas).toEqual(RELATORIO_PC_SETORES_COLUMNS);
    expect(envelope.linhas).toHaveLength(1);
    expect(envelope.linhas[0]).toMatchObject({
      filial: "01",
      tipoCompra: "Normal",
      numero: "000001",
      produto: "MAT001",
      quantidade: 10,
      observacao: "Obs...",
    });
  });

  it("returns an empty table when the API list is empty", () => {
    const envelope = mapRelPcSetoresToEnvelope({ PEDIDOS_SETORES: [] });

    expect(envelope.linhas).toEqual([]);
    expect(envelope.colunas).toEqual(RELATORIO_PC_SETORES_COLUMNS);
  });
});

describe("validateReportFilters", () => {
  it("requires both dates and a purchase group", () => {
    expect(validateReportFilters(definition().filtros, {}).ok).toBe(false);

    const withoutGroup = validateReportFilters(definition().filtros, {
      dtInicial: "01/09/2026",
      dtFinal: "10/09/2026",
    });
    expect(withoutGroup.ok).toBe(false);
    if (!withoutGroup.ok) expect(withoutGroup.message).toMatch(/grupo/i);
  });

  it("sends ISO dates and only the group code", () => {
    const result = validateReportFilters(definition().filtros, {
      dtInicial: "01/09/2026",
      dtFinal: "10/09/2026",
      grupoAprovacao: "000001",
    });

    expect(result).toEqual({
      ok: true,
      query: {
        dtInicial: "2026-09-01",
        dtFinal: "2026-09-10",
        grupoAprovacao: "000001",
      },
    });
  });
});

describe("exportação do relatório de pedidos", () => {
  it("names the file with the consulted period and includes title, filters and rows", () => {
    const envelope = mapRelPcSetoresToEnvelope({
      PEDIDOS_SETORES: [
        {
          filial: "01",
          numero: "000001",
          produto: "MAT001",
          descricao: "Material X",
          quantidade: 2,
        },
      ],
    });

    const payload = buildRelatorioPcSetoresExportPayload({
      envelope,
      dtInicial: "2026-09-01",
      dtFinal: "2026-09-10",
      grupoLabel: "MARKETING - PC",
    });

    expect(payload.meta.titulo).toBe("Pedidos de Compras");
    expect(payload.meta.nomeArquivo).toBe("relatorio-pedidos-2026-09-01-a-2026-09-10");
    expect(payload.meta.filtros).toEqual([
      { label: "Data inicial", valor: "01/09/2026" },
      { label: "Data final", valor: "10/09/2026" },
      { label: "Grupo de compras", valor: "MARKETING - PC" },
    ]);
    expect(payload.colunas).toEqual(envelope.colunas);
    expect(payload.linhas).toEqual(envelope.linhas);
  });
});
