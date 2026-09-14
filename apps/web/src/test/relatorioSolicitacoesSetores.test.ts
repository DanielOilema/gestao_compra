import { describe, expect, it } from "vitest";
import {
  mapProtheusGruposSolicitacoes,
  mapRelScSetoresToEnvelope,
  RELATORIO_SC_SETORES_COLUMNS,
  RELATORIO_SC_SETORES_ID,
} from "@gestao-compra/shared";
import { appModuleGroups } from "@/config/navigation";
import { findReportDefinition, getReportsByModule } from "@/config/reports";
import { buildUserMenu } from "@/lib/buildUserMenu";
import { buildRelatorioScSetoresExportPayload } from "@/lib/relatorios/buildRelatorioScSetoresExportPayload";
import { validateReportFilters } from "@/lib/relatorios/validateReportFilters";

const definition = () => findReportDefinition(RELATORIO_SC_SETORES_ID)!;

describe("menu Relatórios de Compras", () => {
  it("shows Relatórios de Compras for an admin", () => {
    const menu = buildUserMenu(appModuleGroups, [], true);
    const paths = menu.flatMap((group) => group.routines.map((routine) => routine.path));

    expect(paths).toContain("/relatorios/compras");
  });

  it("keeps Relatórios de Compras behind its permission", () => {
    const menu = buildUserMenu(appModuleGroups, ["solicitacoes-compra"], false);
    const paths = menu.flatMap((group) => group.routines.map((routine) => routine.path));

    expect(paths).not.toContain("/relatorios/compras");
  });

  it("shows Relatórios de Compras when only the purchase orders report is granted", () => {
    const menu = buildUserMenu(appModuleGroups, ["relatorios-pedidos"], false);
    const paths = menu.flatMap((group) => group.routines.map((routine) => routine.path));

    expect(paths).toContain("/relatorios/compras");
  });
});

describe("catálogo do relatório de solicitações", () => {
  it("registers the purchases report with required period and group filters", () => {
    const report = findReportDefinition(RELATORIO_SC_SETORES_ID);

    expect(report).toMatchObject({
      id: RELATORIO_SC_SETORES_ID,
      modulo: "compras",
      titulo: "Solicitações de Compras",
    });
    expect(getReportsByModule("compras").map((item) => item.id)).toContain(RELATORIO_SC_SETORES_ID);

    const keys = report?.filtros.map((filtro) => filtro.key);
    expect(keys).toEqual(["dt", "grupoAprovacao"]);
    expect(report?.filtros.every((filtro) => filtro.obrigatorio)).toBe(true);
    expect(report?.filtros.find((filtro) => filtro.key === "grupoAprovacao")).toMatchObject({
      tipo: "selecao",
      fonteOpcoes: "grupos-solicitacoes",
    });
  });
});

describe("mapProtheusGruposSolicitacoes", () => {
  it("maps codigo as value and descricao as the visible label", () => {
    const grupos = mapProtheusGruposSolicitacoes({
      grupos_solicitacoes: [
        { codigo: "000001", descricao: "MARKETING - SC" },
        { codigo: "000002", descricao: "TI - SC" },
      ],
    });

    expect(grupos).toEqual([
      { codigo: "000001", descricao: "MARKETING - SC" },
      { codigo: "000002", descricao: "TI - SC" },
    ]);
  });

  it("skips groups without a code", () => {
    const grupos = mapProtheusGruposSolicitacoes({
      grupos_solicitacoes: [{ descricao: "SEM CODIGO" }, { codigo: "000003", descricao: "RH" }],
    });

    expect(grupos).toEqual([{ codigo: "000003", descricao: "RH" }]);
  });
});

describe("mapRelScSetoresToEnvelope", () => {
  it("maps SOLICITACOES_SETORES into the generic report envelope", () => {
    const envelope = mapRelScSetoresToEnvelope({
      SOLICITACOES_SETORES: [
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

    expect(envelope.id).toBe(RELATORIO_SC_SETORES_ID);
    expect(envelope.colunas).toEqual(RELATORIO_SC_SETORES_COLUMNS);
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
    const envelope = mapRelScSetoresToEnvelope({ SOLICITACOES_SETORES: [] });

    expect(envelope.linhas).toEqual([]);
    expect(envelope.colunas).toEqual(RELATORIO_SC_SETORES_COLUMNS);
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

  it("rejects a start date after the end date", () => {
    const result = validateReportFilters(definition().filtros, {
      dtInicial: "10/09/2026",
      dtFinal: "01/09/2026",
      grupoAprovacao: "000001",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/data inicial/i);
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

describe("exportação do relatório de solicitações", () => {
  it("names the file with the consulted period and includes title, filters and rows", () => {
    const envelope = mapRelScSetoresToEnvelope({
      SOLICITACOES_SETORES: [
        {
          filial: "01",
          numero: "000001",
          produto: "MAT001",
          descricao: "Material X",
          quantidade: 2,
        },
      ],
    });

    const payload = buildRelatorioScSetoresExportPayload({
      envelope,
      dtInicial: "2026-09-01",
      dtFinal: "2026-09-10",
      grupoLabel: "MARKETING - SC",
    });

    expect(payload.meta.titulo).toBe("Solicitações de Compras");
    expect(payload.meta.nomeArquivo).toBe("relatorio-solicitacoes-2026-09-01-a-2026-09-10");
    expect(payload.meta.filtros).toEqual([
      { label: "Data inicial", valor: "01/09/2026" },
      { label: "Data final", valor: "10/09/2026" },
      { label: "Grupo de compras", valor: "MARKETING - SC" },
    ]);
    expect(payload.colunas).toEqual(envelope.colunas);
    expect(payload.linhas).toEqual(envelope.linhas);
  });
});
