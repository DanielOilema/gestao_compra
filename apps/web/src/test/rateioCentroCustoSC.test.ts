import { describe, expect, it } from "vitest";
import {
  mapFormToIncluiSCPayload,
  validateRateioCC,
} from "@gestao-compra/shared";

describe("validateRateioCC", () => {
  it("accepts two distinct cost centers that sum to 100%", () => {
    expect(
      validateRateioCC([
        { cc: "1101", percentual: 60 },
        { cc: "1102", percentual: 40 },
      ]),
    ).toEqual({ ok: true });
  });

  it("rejects empty or single cost center", () => {
    expect(validateRateioCC([])).toEqual({
      ok: false,
      error: "Informe o rateio de centros de custo",
    });
    expect(validateRateioCC([{ cc: "1101", percentual: 100 }])).toEqual({
      ok: false,
      error: "Informe pelo menos 2 centros de custo diferentes",
    });
  });

  it("rejects duplicate cost centers", () => {
    expect(
      validateRateioCC([
        { cc: "1101", percentual: 50 },
        { cc: "1101", percentual: 50 },
      ]),
    ).toEqual({
      ok: false,
      error: "Os centros de custo do rateio devem ser diferentes",
    });
  });

  it("rejects when the sum is not 100%", () => {
    expect(
      validateRateioCC([
        { cc: "1101", percentual: 60 },
        { cc: "1102", percentual: 30 },
      ]),
    ).toEqual({
      ok: false,
      error: "A soma do rateio deve ser 100% (atual: 90%)",
    });
  });

  it("rejects missing cost center or non-positive percentual", () => {
    expect(
      validateRateioCC([
        { cc: "", percentual: 60 },
        { cc: "1102", percentual: 40 },
      ]),
    ).toEqual({
      ok: false,
      error: "Selecione o centro de custo em todas as linhas",
    });
    expect(
      validateRateioCC([
        { cc: "1101", percentual: 0 },
        { cc: "1102", percentual: 100 },
      ]),
    ).toEqual({
      ok: false,
      error: "Informe um percentual maior que zero em todas as linhas",
    });
  });
});

describe("mapFormToIncluiSCPayload rateioCC", () => {
  it("sends centroCusto when there is no rateio", () => {
    const payload = mapFormToIncluiSCPayload(
      {
        filial: "0101",
        tipoCompra: "1",
        itens: [
          {
            produto: "12312123",
            produtoDescricao: "Produto A",
            unidade: "UN",
            centroCusto: "99999997",
            centroCustoDescricao: "ALMOX",
            quantidade: 5,
            observacao: "Entrega no almoxarifado central.",
            dataEntrega: "2026-07-25",
          },
        ],
      },
      "000000",
    );

    expect(payload.itens[0]).toEqual({
      codigoProduto: "12312123",
      quantidade: 5,
      centroCusto: "99999997",
      observacao: "Entrega no almoxarifado central.",
      placa: "",
      dataEntrega: "2026-07-25",
    });
    expect(payload.itens[0]).not.toHaveProperty("rateioCC");
  });

  it("sends rateioCC and omits centroCusto when rateio is present", () => {
    const payload = mapFormToIncluiSCPayload(
      {
        filial: "0101",
        tipoCompra: "1",
        itens: [
          {
            produto: "12312123",
            produtoDescricao: "Produto A",
            unidade: "UN",
            centroCusto: "",
            centroCustoDescricao: "",
            quantidade: 10,
            observacao: "Material para manutenção preventiva.",
            dataEntrega: "2026-07-20",
            rateioCC: [
              { cc: "9999999", percentual: 60, descricao: "CC A" },
              { cc: "9999998", percentual: 40, descricao: "CC B" },
            ],
          },
          {
            produto: "9813000016",
            produtoDescricao: "Produto B",
            unidade: "UN",
            centroCusto: "99999997",
            centroCustoDescricao: "ALMOX",
            quantidade: 5,
            observacao: "Entrega no almoxarifado central.",
            dataEntrega: "2026-07-25",
          },
        ],
      },
      "000000",
    );

    expect(payload).toEqual({
      filial: "0101",
      solicitante: "000000",
      tipoCompra: "1",
      acao: "incluir",
      itens: [
        {
          codigoProduto: "12312123",
          quantidade: 10,
          observacao: "Material para manutenção preventiva.",
          placa: "",
          dataEntrega: "2026-07-20",
          rateioCC: [
            { cc: "9999999", percentual: 60 },
            { cc: "9999998", percentual: 40 },
          ],
        },
        {
          codigoProduto: "9813000016",
          quantidade: 5,
          centroCusto: "99999997",
          observacao: "Entrega no almoxarifado central.",
          placa: "",
          dataEntrega: "2026-07-25",
        },
      ],
    });
  });

  it("sends placa when informed and empty string when omitted", () => {
    const payload = mapFormToIncluiSCPayload(
      {
        filial: "0101",
        tipoCompra: "1",
        itens: [
          {
            produto: "12312123",
            produtoDescricao: "Produto A",
            unidade: "UN",
            centroCusto: "1101",
            centroCustoDescricao: "ADMIN",
            quantidade: 1,
            observacao: "Obs",
            placa: "ABC1D23",
            dataEntrega: "2026-07-20",
          },
          {
            produto: "9813000016",
            produtoDescricao: "Produto B",
            unidade: "UN",
            centroCusto: "1102",
            centroCustoDescricao: "OP",
            quantidade: 2,
            observacao: "Obs 2",
            dataEntrega: "2026-07-21",
          },
        ],
      },
      "000000",
    );

    expect(payload.itens[0].placa).toBe("ABC1D23");
    expect(payload.itens[1].placa).toBe("");
  });
});
