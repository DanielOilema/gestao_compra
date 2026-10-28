import { describe, expect, it } from "vitest";
import {
  mapFormToIncluiNotaDCPayload,
  padNumSC,
  type NotaFormPayload,
} from "@gestao-compra/shared";

const baseDebitoForm = (): NotaFormPayload => ({
  filial: "0101",
  tipo: "debito",
  codigoCliFor: "000001",
  lojaCliFor: "01",
  nomeCliFor: "Fornecedor Teste",
  cnpj: "12345678000199",
  dataEmissao: "2026-10-23",
  dataVencimento: "2026-11-23",
  referenteA: "Referente teste",
  setor: "01",
  formaPagamento: "1",
  itens: [{ produto: "PROD1", produtoDescricao: "Produto", valor: 100, centroCusto: "1101" }],
});

describe("padNumSC", () => {
  it("pads with leading zeros to 6 characters", () => {
    expect(padNumSC("123")).toBe("000123");
    expect(padNumSC("AB12")).toBe("00AB12");
  });

  it("keeps the last 6 characters when longer", () => {
    expect(padNumSC("1234567")).toBe("234567");
  });
});

describe("mapFormToIncluiNotaDCPayload numSC", () => {
  it("includes padded numSC when debito does not generate SC", () => {
    const payload = mapFormToIncluiNotaDCPayload(
      {
        ...baseDebitoForm(),
        gerarSolicitacao: false,
        numSC: "152",
      },
      "Administrador",
    );

    expect(payload.detNotaDebCre.numSC).toBe("000152");
  });

  it("omits numSC when debito generates SC", () => {
    const payload = mapFormToIncluiNotaDCPayload(
      {
        ...baseDebitoForm(),
        gerarSolicitacao: true,
        numSC: "152",
      },
      "Administrador",
    );

    expect(payload.detNotaDebCre.numSC).toBeUndefined();
  });

  it("omits numSC for credito even if fields are present", () => {
    const payload = mapFormToIncluiNotaDCPayload(
      {
        ...baseDebitoForm(),
        tipo: "credito",
        formaPagamento: "6",
        natureza: "NAT01",
        tes: "501",
        gerarSolicitacao: false,
        numSC: "152",
        itens: [{ produto: "PROD1", produtoDescricao: "Produto", valor: 100, centroCusto: "" }],
      },
      "Administrador",
    );

    expect(payload.detNotaDebCre.tipo).toBe("C");
    expect(payload.detNotaDebCre.numSC).toBeUndefined();
  });
});
