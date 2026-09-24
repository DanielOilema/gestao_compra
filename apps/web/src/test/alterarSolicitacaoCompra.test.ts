import { describe, expect, it } from "vitest";
import {
  isSolicitacaoAlterFormDirty,
  isSolicitacaoItemObservacaoPreenchida,
} from "@/components/solicitacoes/inclusao/solicitacaoFormDirty";
import {
  ALTERAR_SOLICITACAO_SOLICITANTE_MESSAGE,
  ALTERAR_SOLICITACAO_STATUS_MESSAGE,
  canAlterSolicitacaoCompra,
  getAlterarSolicitacaoMessage,
  isSolicitacaoCompraAlteravelPorStatus,
  isSolicitacaoCompraStatusAlteravel,
  isSolicitanteDaSolicitacao,
  mapFormToAlteraSCPayload,
  mapFormToIncluiSCPayload,
  mapProtheusListaSolicitacoesResponse,
  mapProtheusTipoCompra,
  mapPurchaseRequestToSolicitacaoDraft,
  type PurchaseRequest,
} from "@gestao-compra/shared";

const user = { nome: "Daniel Silveira", userName: "daniel.silveira" };

const baseRequest = (overrides: Partial<PurchaseRequest> = {}): PurchaseRequest => ({
  id: "SC-0101-000123",
  numero: "000123",
  dataCriacao: "2026-08-01",
  status: "aberto",
  solicitante: "Daniel Silveira",
  filial: "0101",
  tipoCompra: "1",
  itens: [
    {
      id: "item-1",
      item: "0001",
      produto: "8001000013",
      unidade: "UN",
      descricao: "BIG BAG",
      quantidade: 10,
      valorEstimado: 0,
      status: "aberto",
      codigoCentroCusto: "1101",
      descricaoCentroCusto: "ADMIN",
      dataEntrega: "2026-08-10",
    },
  ],
  ...overrides,
});

describe("isSolicitacaoCompraStatusAlteravel", () => {
  it("allows aberto and bloqueada", () => {
    expect(isSolicitacaoCompraStatusAlteravel("aberto")).toBe(true);
    expect(isSolicitacaoCompraStatusAlteravel("bloqueada")).toBe(true);
    expect(isSolicitacaoCompraStatusAlteravel("Bloqueada")).toBe(true);
  });

  it("rejects other statuses", () => {
    expect(isSolicitacaoCompraStatusAlteravel("em_cotacao")).toBe(false);
    expect(isSolicitacaoCompraStatusAlteravel("totalmente_atendida")).toBe(false);
    expect(isSolicitacaoCompraStatusAlteravel("rejeitada")).toBe(false);
    expect(isSolicitacaoCompraStatusAlteravel("pendente")).toBe(false);
  });
});

describe("isSolicitacaoCompraAlteravelPorStatus", () => {
  it("allows open and blocked requests", () => {
    expect(isSolicitacaoCompraAlteravelPorStatus(baseRequest())).toBe(true);
    expect(
      isSolicitacaoCompraAlteravelPorStatus(
        baseRequest({
          status: "bloqueada",
          itens: [{ ...baseRequest().itens[0], status: "bloqueada" }],
        }),
      ),
    ).toBe(true);
  });

  it("rejects requests with another status", () => {
    expect(
      isSolicitacaoCompraAlteravelPorStatus(
        baseRequest({
          status: "em_cotacao",
          itens: [{ ...baseRequest().itens[0], status: "em_cotacao" }],
        }),
      ),
    ).toBe(false);
  });
});

describe("isSolicitanteDaSolicitacao", () => {
  it("matches display name ignoring case and accents", () => {
    expect(isSolicitanteDaSolicitacao("DANIEL SILVEIRA", user)).toBe(true);
    expect(isSolicitanteDaSolicitacao("Daniel Silveira", user)).toBe(true);
  });

  it("matches Protheus userName", () => {
    expect(isSolicitanteDaSolicitacao("daniel.silveira", user)).toBe(true);
  });

  it("rejects another requester", () => {
    expect(isSolicitanteDaSolicitacao("Maria Santos", user)).toBe(false);
  });
});

describe("canAlterSolicitacaoCompra", () => {
  it("allows the requester to alter an open request", () => {
    expect(canAlterSolicitacaoCompra(baseRequest(), user)).toEqual({ ok: true });
  });

  it("allows the requester to alter a blocked request", () => {
    expect(
      canAlterSolicitacaoCompra(
        baseRequest({
          status: "bloqueada",
          itens: [{ ...baseRequest().itens[0], status: "bloqueada" }],
        }),
        user,
      ),
    ).toEqual({ ok: true });
  });

  it("blocks other statuses", () => {
    const result = canAlterSolicitacaoCompra(
      baseRequest({
        status: "em_cotacao",
        itens: [{ ...baseRequest().itens[0], status: "em_cotacao" }],
      }),
      user,
    );
    expect(result).toEqual({ ok: false, reason: "status" });
    expect(getAlterarSolicitacaoMessage(result)).toBe(ALTERAR_SOLICITACAO_STATUS_MESSAGE);
  });

  it("blocks when any item is not open or blocked", () => {
    const result = canAlterSolicitacaoCompra(
      baseRequest({
        itens: [
          { ...baseRequest().itens[0], status: "aberto" },
          { ...baseRequest().itens[0], id: "item-2", item: "0002", status: "em_cotacao" },
        ],
      }),
      user,
    );
    expect(result).toEqual({ ok: false, reason: "status" });
  });

  it("blocks a different requester", () => {
    const result = canAlterSolicitacaoCompra(baseRequest(), {
      nome: "Maria Santos",
      userName: "maria.santos",
    });
    expect(result).toEqual({ ok: false, reason: "solicitante" });
    expect(getAlterarSolicitacaoMessage(result)).toBe(ALTERAR_SOLICITACAO_SOLICITANTE_MESSAGE);
  });
});

describe("mapPurchaseRequestToSolicitacaoDraft", () => {
  it("copies header and items for the alter form", () => {
    const draft = mapPurchaseRequestToSolicitacaoDraft(baseRequest());
    expect(draft.filial).toBe("0101");
    expect(draft.tipoCompra).toBe("1");
    expect(draft.numeroSC).toBe("000123");
    expect(draft.itens[0]).toMatchObject({
      item: "0001",
      produto: "8001000013",
      centroCusto: "1101",
      quantidade: 10,
      dataEntrega: "2026-08-10",
    });
  });

  it("falls back to emission date when the item has no delivery date", () => {
    const draft = mapPurchaseRequestToSolicitacaoDraft(
      baseRequest({
        itens: [{ ...baseRequest().itens[0], dataEntrega: undefined }],
      }),
    );
    expect(draft.itens[0].dataEntrega).toBe("2026-08-01");
  });

  it("preserves rateioCC and clears single cost center on alter draft", () => {
    const draft = mapPurchaseRequestToSolicitacaoDraft(
      baseRequest({
        itens: [
          {
            ...baseRequest().itens[0],
            codigoCentroCusto: undefined,
            descricaoCentroCusto: undefined,
            rateioCC: [
              { cc: "1701001", percentual: 10 },
              { cc: "3101001", percentual: 90 },
            ],
          },
        ],
      }),
    );

    expect(draft.itens[0].centroCusto).toBe("");
    expect(draft.itens[0].centroCustoDescricao).toBe("");
    expect(draft.itens[0].rateioCC).toEqual([
      { cc: "1701001", percentual: 10 },
      { cc: "3101001", percentual: 90 },
    ]);
  });
});

describe("mapFormToAlteraSCPayload", () => {
  it("sends acao 4, numeroSC and original item codes", () => {
    const payload = mapFormToAlteraSCPayload(
      {
        filial: "0101",
        tipoCompra: "2",
        itens: [
          {
            produto: "8001000013",
            produtoDescricao: "BIG BAG",
            unidade: "UN",
            centroCusto: "1101",
            centroCustoDescricao: "ADMIN",
            quantidade: 12,
            dataEntrega: "2026-08-12",
            item: "0001",
          },
        ],
      },
      "Daniel Silveira",
      "000123",
    );

    expect(payload).toEqual({
      filial: "0101",
      numeroSC: "000123",
      solicitante: "Daniel Silveira",
      tipoCompra: "2",
      acao: "alterar",
      itens: [
        {
          item: "0001",
          codigoProduto: "8001000013",
          quantidade: 12,
          centroCusto: "1101",
          observacao: undefined,
          placa: "",
          dataEntrega: "2026-08-12",
        },
      ],
    });
  });

  it("maps an alter through the include payload with acao alterar", () => {
    const payload = mapFormToIncluiSCPayload(
      {
        filial: "0101",
        tipoCompra: "1",
        itens: [
          {
            produto: "8001000013",
            produtoDescricao: "BIG BAG",
            unidade: "UN",
            centroCusto: "1101",
            centroCustoDescricao: "ADMIN",
            quantidade: 10,
            dataEntrega: "2026-08-10",
            item: "0001",
          },
        ],
      },
      "Daniel Silveira",
      { acao: "alterar", numeroSC: "000123" },
    );

    expect(payload.acao).toBe("alterar");
    expect(payload.numeroSC).toBe("000123");
  });

  it("sends rateioCC and omits centroCusto on alter when rateio is present", () => {
    const payload = mapFormToAlteraSCPayload(
      {
        filial: "0101",
        tipoCompra: "1",
        itens: [
          {
            produto: "9899000009",
            produtoDescricao: "PLANO",
            unidade: "UN",
            centroCusto: "",
            centroCustoDescricao: "",
            quantidade: 10,
            observacao: "TESTE",
            dataEntrega: "2026-09-22",
            item: "0001",
            rateioCC: [
              { cc: "1701001", percentual: 10 },
              { cc: "3101001", percentual: 90 },
            ],
          },
        ],
      },
      "Administrador",
      "010145",
    );

    expect(payload.itens[0]).toEqual({
      item: "0001",
      codigoProduto: "9899000009",
      quantidade: 10,
      observacao: "TESTE",
      placa: "",
      dataEntrega: "2026-09-22",
      rateioCC: [
        { cc: "1701001", percentual: 10 },
        { cc: "3101001", percentual: 90 },
      ],
    });
    expect(payload.itens[0]).not.toHaveProperty("centroCusto");
  });
});

describe("mapProtheusTipoCompra", () => {
  it("maps codes and labels", () => {
    expect(mapProtheusTipoCompra("1")).toBe("1");
    expect(mapProtheusTipoCompra("Urgente")).toBe("2");
    expect(mapProtheusTipoCompra("Imediato/Direto")).toBe("3");
  });
});

describe("mapProtheusListaSolicitacoesResponse", () => {
  it("maps tipoCompra and dataEntrega from list lines", () => {
    const mapped = mapProtheusListaSolicitacoesResponse({
      SOLICITACOES: [
        {
          filial: "0101",
          numero: "000123",
          item: "0001",
          produto: "P1",
          descricao: "Produto",
          quant: 2,
          solicitante: "Daniel Silveira",
          status: "Aberto",
          tipoCompra: "2",
          entrega: "2026-08-20",
        },
      ],
    });

    expect(mapped.requests[0].tipoCompra).toBe("2");
    expect(mapped.requests[0].itens[0].dataEntrega).toBe("2026-08-20");
  });

  it("maps rateio from list lines and trims padded cost centers", () => {
    const mapped = mapProtheusListaSolicitacoesResponse({
      SOLICITACOES: [
        {
          filial: "0101",
          numero: "010145",
          item: "0001",
          produto: "9899000009",
          descricao: "PLANO DE SAUDE BRADESCO",
          quant: 10,
          desccc: "",
          obs: "TESTE",
          solicitante: "Administrador",
          emissao: "2026/09/22",
          status: "Bloqueada",
          rateio: [
            { item: "0001", cc: "1701001       ", percentual: 10 },
            { item: "0001", cc: "3101001       ", percentual: 90 },
          ],
        },
        {
          filial: "0101",
          numero: "010144",
          item: "0001",
          produto: "9701000188",
          descricao: "COMBUSTÍVEL",
          quant: 1,
          cc: "3101001",
          desccc: "UBS BA - PLACAS - SO",
          obs: "TESTE",
          solicitante: "Administrador",
          emissao: "2026/09/22",
          status: "Bloqueada",
        },
      ],
    });

    const withRateio = mapped.requests.find((r) => r.numero === "010145")!;
    expect(withRateio.itens[0].rateioCC).toEqual([
      { cc: "1701001", percentual: 10 },
      { cc: "3101001", percentual: 90 },
    ]);
    expect(withRateio.itens[0].codigoCentroCusto).toBeUndefined();
    expect(withRateio.itens[0].descricaoCentroCusto).toBeUndefined();

    const withCc = mapped.requests.find((r) => r.numero === "010144")!;
    expect(withCc.itens[0].rateioCC).toBeUndefined();
    expect(withCc.itens[0].codigoCentroCusto).toBe("3101001");
    expect(withCc.itens[0].descricaoCentroCusto).toBe("UBS BA - PLACAS - SO");
  });
});

describe("isSolicitacaoItemObservacaoPreenchida", () => {
  it("rejects empty or blank observation", () => {
    expect(isSolicitacaoItemObservacaoPreenchida(undefined)).toBe(false);
    expect(isSolicitacaoItemObservacaoPreenchida("")).toBe(false);
    expect(isSolicitacaoItemObservacaoPreenchida("   ")).toBe(false);
  });

  it("accepts a filled observation", () => {
    expect(isSolicitacaoItemObservacaoPreenchida("Urgente")).toBe(true);
  });
});

describe("isSolicitacaoAlterFormDirty", () => {
  it("is clean when the loaded request was not changed", () => {
    const draft = mapPurchaseRequestToSolicitacaoDraft(baseRequest());
    expect(
      isSolicitacaoAlterFormDirty(draft, draft, {
        produto: "",
        centroCusto: "",
        quantidade: 1,
        observacao: "",
        dataEntrega: "",
      }),
    ).toBe(false);
  });

  it("detects item quantity changes", () => {
    const draft = mapPurchaseRequestToSolicitacaoDraft(baseRequest());
    expect(
      isSolicitacaoAlterFormDirty(
        draft,
        { ...draft, itens: [{ ...draft.itens[0], quantidade: 99 }] },
        { produto: "", centroCusto: "", quantidade: 1, dataEntrega: "" },
      ),
    ).toBe(true);
  });
});

