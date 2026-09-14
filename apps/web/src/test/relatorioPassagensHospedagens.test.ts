import { describe, expect, it } from "vitest";
import {
  mapRelHospPassToEnvelope,
  RELATORIO_HOSP_PASS_COLUMNS,
  RELATORIO_HOSP_PASS_ID,
} from "@gestao-compra/shared";
import { appModuleGroups } from "@/config/navigation";
import { findReportDefinition, getReportsByModule } from "@/config/reports";
import { buildUserMenu } from "@/lib/buildUserMenu";
import { buildRelatorioHospPassExportPayload } from "@/lib/relatorios/buildRelatorioHospPassExportPayload";
import { validateReportFilters } from "@/lib/relatorios/validateReportFilters";

const definition = () => findReportDefinition(RELATORIO_HOSP_PASS_ID)!;

describe("menu Relatórios de Compras — passagens", () => {
  it("shows Relatórios de Compras when only the travel report is granted", () => {
    const menu = buildUserMenu(appModuleGroups, ["relatorios-passagens"], false);
    const paths = menu.flatMap((group) => group.routines.map((routine) => routine.path));

    expect(paths).toContain("/relatorios/compras");
  });
});

describe("catálogo do relatório de passagens e hospedagens", () => {
  it("registers the travel report with a required period filter only", () => {
    const report = findReportDefinition(RELATORIO_HOSP_PASS_ID);

    expect(report).toMatchObject({
      id: RELATORIO_HOSP_PASS_ID,
      modulo: "compras",
      titulo: "Passagens e Hospedagens",
      permission: "relatorios-passagens",
    });
    expect(getReportsByModule("compras").map((item) => item.id)).toEqual([
      "solicitacoes-setores",
      "pedidos-setores",
      RELATORIO_HOSP_PASS_ID,
    ]);

    const keys = report?.filtros.map((filtro) => filtro.key);
    expect(keys).toEqual(["dt"]);
    expect(report?.filtros.every((filtro) => filtro.obrigatorio)).toBe(true);
  });
});

describe("mapRelHospPassToEnvelope", () => {
  it("maps HOSP_PASS into the generic report envelope", () => {
    const envelope = mapRelHospPassToEnvelope({
      HOSP_PASS: [
        {
          filial: "01",
          nf: "000123",
          serie: "1",
          fornecedor: "000001",
          loja: "01",
          nome: "HOTEL EXEMPLO",
          emissao: "2026-09-01",
          produto: "HOSP01",
          descricao: "Diária",
          quantidade: 2,
          valorUnit: 350.5,
          total: 701,
          centroCusto: "10101",
          descCC: "Comercial",
          observacao: "Viagem SP",
        },
      ],
    });

    expect(envelope.id).toBe(RELATORIO_HOSP_PASS_ID);
    expect(envelope.colunas).toEqual(RELATORIO_HOSP_PASS_COLUMNS);
    expect(envelope.linhas).toHaveLength(1);
    expect(envelope.linhas[0]).toMatchObject({
      filial: "01",
      nf: "000123",
      serie: "1",
      fornecedor: "000001",
      nome: "HOTEL EXEMPLO",
      produto: "HOSP01",
      quantidade: 2,
      valorUnit: 350.5,
      total: 701,
      observacao: "Viagem SP",
    });
  });

  it("returns an empty table when the API list is empty", () => {
    const envelope = mapRelHospPassToEnvelope({ HOSP_PASS: [] });

    expect(envelope.linhas).toEqual([]);
    expect(envelope.colunas).toEqual(RELATORIO_HOSP_PASS_COLUMNS);
  });
});

describe("validateReportFilters — passagens e hospedagens", () => {
  it("requires both dates", () => {
    expect(validateReportFilters(definition().filtros, {}).ok).toBe(false);

    const onlyStart = validateReportFilters(definition().filtros, {
      dtInicial: "01/09/2026",
    });
    expect(onlyStart.ok).toBe(false);
    if (!onlyStart.ok) expect(onlyStart.message).toMatch(/data final/i);
  });

  it("sends ISO dates without extra filters", () => {
    const result = validateReportFilters(definition().filtros, {
      dtInicial: "01/09/2026",
      dtFinal: "10/09/2026",
    });

    expect(result).toEqual({
      ok: true,
      query: {
        dtInicial: "2026-09-01",
        dtFinal: "2026-09-10",
      },
    });
  });
});

describe("exportação do relatório de passagens e hospedagens", () => {
  it("names the file with the consulted period and includes title, filters and rows", () => {
    const envelope = mapRelHospPassToEnvelope({
      HOSP_PASS: [
        {
          filial: "01",
          nf: "000123",
          produto: "HOSP01",
          descricao: "Diária",
          quantidade: 2,
          valorUnit: 350.5,
          total: 701,
        },
      ],
    });

    const payload = buildRelatorioHospPassExportPayload({
      envelope,
      dtInicial: "2026-09-01",
      dtFinal: "2026-09-10",
    });

    expect(payload.meta.titulo).toBe("Passagens e Hospedagens");
    expect(payload.meta.nomeArquivo).toBe("relatorio-passagens-hospedagens-2026-09-01-a-2026-09-10");
    expect(payload.meta.filtros).toEqual([
      { label: "Data inicial", valor: "01/09/2026" },
      { label: "Data final", valor: "10/09/2026" },
    ]);
    expect(payload.colunas).toEqual(envelope.colunas);
    expect(payload.linhas).toEqual(envelope.linhas);
  });
});
