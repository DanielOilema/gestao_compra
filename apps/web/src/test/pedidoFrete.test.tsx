import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OrderDetail from "@/components/OrderDetail";
import { mapProtheusPedido, resolvePedidoTotais, type Order } from "@gestao-compra/shared";

vi.mock("@/hooks/useAprovaCompra", () => ({
  useAprovaCompra: () => ({
    aprovar: vi.fn(),
    bloquear: vi.fn(),
    isLoading: false,
  }),
}));

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const basePedido = {
  filial: "0101",
  numero: "009495",
  fornecedor: "94813490000198 TROMINK INDUSTRIAL LTDA",
  cnpj: "94813490000198",
  emissao: "2026/09/21",
  entrega: "2026/09/21",
  total: 5000,
  itens: [
    {
      produto: "9618000073",
      descProduto: "ALICATE DE CRIMPAR RJ45",
      quantidade: 1,
      valorUnitario: 5000,
      total: 5000,
      ccusto: "1701001-MANUTENCAO TI ADM",
    },
  ],
};

const order: Order = {
  id: "0101-009495",
  numero: "009495",
  filial: "0101",
  fornecedor: "TROMINK INDUSTRIAL LTDA",
  cnpj: "94813490000198",
  valor: 5250,
  valorItens: 5000,
  frete: 250,
  dataEmissao: "2026-09-21",
  dataEntrega: "2026-09-21",
  solicitante: "Administrador",
  status: "pending",
  itens: [
    {
      id: "1",
      codigoProduto: "9618000073",
      descricaoProduto: "ALICATE DE CRIMPAR RJ45",
      quantidade: 1,
      valorUnitario: 5000,
      valorTotal: 5000,
      codigoCentroCusto: "1701001",
      descricaoCentroCusto: "MANUTENCAO TI ADM",
    },
  ],
};

describe("mapProtheusPedido frete", () => {
  it("soma frete ao total do pedido e guarda o total dos itens", () => {
    const mapped = mapProtheusPedido({ ...basePedido, frete: 250 });

    expect(mapped.valorItens).toBe(5000);
    expect(mapped.frete).toBe(250);
    expect(mapped.valor).toBe(5250);
  });

  it("aceita frete em texto no formato brasileiro", () => {
    const mapped = mapProtheusPedido({ ...basePedido, frete: "1.250,50" });

    expect(mapped.frete).toBe(1250.5);
    expect(mapped.valor).toBe(6250.5);
  });

  it("mantém o total dos itens quando o frete não vem no payload", () => {
    const mapped = mapProtheusPedido(basePedido);

    expect(mapped.frete).toBe(0);
    expect(mapped.valorItens).toBe(5000);
    expect(mapped.valor).toBe(5000);
  });

  it("usa o valor do pedido como total dos itens quando o detalhe não veio separado", () => {
    expect(resolvePedidoTotais({ valor: 8000 })).toEqual({
      valorItens: 8000,
      frete: 0,
      valorPedido: 8000,
    });
  });
});

const money = (value: number) => formatCurrency(value).replace(/[\u00a0\u202f]/g, " ");

const valueNextTo = (label: string) =>
  (screen.getByText(label).nextElementSibling?.textContent ?? "").replace(/[\u00a0\u202f]/g, " ");

describe("OrderDetail frete", () => {
  it("exibe total dos itens, frete e a soma no total do pedido", () => {
    render(<OrderDetail order={order} onBack={() => undefined} />);

    expect(valueNextTo("Valor Total dos Itens")).toBe(money(5000));
    expect(valueNextTo("Valor do Frete")).toBe(money(250));
    expect(valueNextTo("Valor Total do Pedido")).toBe(money(5250));
  });

  it("não exibe o resumo de frete em solicitação de compra", () => {
    render(<OrderDetail order={order} onBack={() => undefined} tipo="solicitacao" />);

    expect(screen.queryByText("Valor do Frete")).not.toBeInTheDocument();
    expect(screen.queryByText("Valor Total do Pedido")).not.toBeInTheDocument();
  });
});
