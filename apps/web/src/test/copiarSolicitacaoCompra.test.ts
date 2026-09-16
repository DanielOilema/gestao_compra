import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  mapFormToIncluiSCPayload,
  type PurchaseRequest,
} from "@gestao-compra/shared";
import { mapPurchaseRequestToInclusaoDraft } from "@/components/solicitacoes/inclusao/copySolicitacaoCompra";
import SolicitacaoCompraDetailContent from "@/components/solicitacoes/listagem/SolicitacaoCompraDetailContent";

const navigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { nome: "Daniel Silveira", userName: "daniel.silveira" },
  }),
}));

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
      observacao: "Urgente",
      status: "aberto",
      codigoCentroCusto: "1101",
      descricaoCentroCusto: "ADMIN",
      dataEntrega: "2026-08-10",
    },
  ],
  ...overrides,
});

describe("mapPurchaseRequestToInclusaoDraft", () => {
  it("copies header and item fields for a new inclusion", () => {
    const draft = mapPurchaseRequestToInclusaoDraft(baseRequest());

    expect(draft.filial).toBe("0101");
    expect(draft.tipoCompra).toBe("1");
    expect(draft.itens).toHaveLength(1);
    expect(draft.itens[0]).toMatchObject({
      produto: "8001000013",
      produtoDescricao: "BIG BAG",
      unidade: "UN",
      centroCusto: "1101",
      centroCustoDescricao: "ADMIN",
      quantidade: 10,
      observacao: "Urgente",
      dataEntrega: "2026-08-10",
    });
  });

  it("does not keep the original SC number or item line codes", () => {
    const draft = mapPurchaseRequestToInclusaoDraft(baseRequest());

    expect(draft).not.toHaveProperty("numeroSC");
    expect(draft.itens[0].item).toBeUndefined();
    expect(draft.itens[0].id).not.toBe("item-1");
  });

  it("falls back to emission date when the item has no delivery date", () => {
    const draft = mapPurchaseRequestToInclusaoDraft(
      baseRequest({
        itens: [{ ...baseRequest().itens[0], dataEntrega: undefined }],
      }),
    );

    expect(draft.itens[0].dataEntrega).toBe("2026-08-01");
  });

  it("maps the copied draft into an include payload without original identities", () => {
    const draft = mapPurchaseRequestToInclusaoDraft(baseRequest());
    const payload = mapFormToIncluiSCPayload(
      {
        filial: draft.filial,
        tipoCompra: draft.tipoCompra as "1",
        itens: draft.itens.map(({ id: _id, ...item }) => item),
      },
      "Maria Santos",
    );

    expect(payload).toEqual({
      filial: "0101",
      solicitante: "Maria Santos",
      tipoCompra: "1",
      acao: "incluir",
      itens: [
        {
          codigoProduto: "8001000013",
          quantidade: 10,
          centroCusto: "1101",
          observacao: "Urgente",
          dataEntrega: "2026-08-10",
        },
      ],
    });
  });
});

describe("SolicitacaoCompraDetailContent copy action", () => {
  it("opens the inclusion screen with the selected request", () => {
    navigate.mockReset();
    const request = baseRequest();

    render(
      React.createElement(SolicitacaoCompraDetailContent, {
        request,
        onBack: () => undefined,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Copiar" }));

    expect(navigate).toHaveBeenCalledWith("/solicitacoes-compra/nova", {
      state: { copyFrom: request },
    });
  });

  it("keeps Alterar visible and enabled for open requests", () => {
    render(
      React.createElement(SolicitacaoCompraDetailContent, {
        request: baseRequest(),
        onBack: () => undefined,
      }),
    );

    expect(screen.getByRole("button", { name: "Alterar" })).toBeEnabled();
  });

  it("keeps Alterar visible and enabled for blocked requests", () => {
    render(
      React.createElement(SolicitacaoCompraDetailContent, {
        request: baseRequest({
          status: "bloqueada",
          itens: [{ ...baseRequest().itens[0], status: "bloqueada" }],
        }),
        onBack: () => undefined,
      }),
    );

    expect(screen.getByRole("button", { name: "Alterar" })).toBeEnabled();
  });

  it("shows Alterar disabled for other statuses", () => {
    render(
      React.createElement(SolicitacaoCompraDetailContent, {
        request: baseRequest({
          status: "em_cotacao",
          itens: [{ ...baseRequest().itens[0], status: "em_cotacao" }],
        }),
        onBack: () => undefined,
      }),
    );

    expect(screen.getByRole("button", { name: "Alterar" })).toBeDisabled();
  });

  it("opens the inclusion screen with the selected request for alter", () => {
    navigate.mockReset();
    const request = baseRequest();

    render(
      React.createElement(SolicitacaoCompraDetailContent, {
        request,
        onBack: () => undefined,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Alterar" }));

    expect(navigate).toHaveBeenCalledWith("/solicitacoes-compra/nova", {
      state: { alterFrom: request },
    });
  });
});
