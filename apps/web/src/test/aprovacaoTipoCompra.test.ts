import { describe, expect, it } from "vitest";
import {
  compareByTipoCompraPrioridade,
  getTipoCompraPrioridade,
  mapProtheusPedido,
  mapProtheusResponse,
  mapProtheusSC,
  mapProtheusSCResponse,
  type TipoCompra,
} from "@gestao-compra/shared";

describe("mapProtheusSC tipoCompra", () => {
  it("maps tipoCompra code from busca_sc_pendentes payload", () => {
    const order = mapProtheusSC({
      filial: "0101",
      numero: "000123",
      emissao: "2026-09-01",
      total: 100,
      tipoCompra: "2",
      itens: [],
    });

    expect(order.tipoCompra).toBe("2");
  });

  it("maps textual tipoCompra labels", () => {
    expect(mapProtheusSC({ numero: "1", tipoCompra: "Urgente" }).tipoCompra).toBe("2");
    expect(mapProtheusSC({ numero: "2", tipoCompra: "Normal" }).tipoCompra).toBe("1");
    expect(mapProtheusSC({ numero: "3", tipoCompra: "Imediato/Direto" }).tipoCompra).toBe("3");
    expect(mapProtheusSC({ numero: "4", tipoCompra: "Regulariza" }).tipoCompra).toBe("4");
  });

  it("maps tipoCompra through response list", () => {
    const orders = mapProtheusSCResponse({
      solicitacoes: [
        { filial: "01", numero: "10", tipoCompra: "1", itens: [] },
        { filial: "01", numero: "11", tipocompra: "2", itens: [] },
      ],
    });

    expect(orders.map((o) => o.tipoCompra)).toEqual(["1", "2"]);
  });
});

describe("mapProtheusPedido tipoCompra", () => {
  const base = {
    filial: "0101",
    numero: "000456",
    fornecedor: "Fornecedor A",
    emissao: "2026-09-01",
    total: 200,
    itens: [],
  };

  it("maps tipoCompra code from busca_pc_pendentes payload", () => {
    const order = mapProtheusPedido({ ...base, tipoCompra: "2" });
    expect(order.tipoCompra).toBe("2");
  });

  it("maps textual tipoCompra labels", () => {
    expect(mapProtheusPedido({ ...base, tipoCompra: "Urgente" }).tipoCompra).toBe("2");
    expect(mapProtheusPedido({ ...base, tipoCompra: "Normal" }).tipoCompra).toBe("1");
    expect(mapProtheusPedido({ ...base, tipoCompra: "Imediato/Direto" }).tipoCompra).toBe("3");
    expect(mapProtheusPedido({ ...base, tipoCompra: "Regulariza" }).tipoCompra).toBe("4");
  });

  it("maps tipoCompra through response list", () => {
    const orders = mapProtheusResponse({
      pedidos: [
        { ...base, numero: "10", tipoCompra: "1" },
        { ...base, numero: "11", tipocompra: "2" },
      ],
    });

    expect(orders.map((o) => o.tipoCompra)).toEqual(["1", "2"]);
  });
});

describe("compareByTipoCompraPrioridade", () => {
  it("orders Urgente, Normal, then Imediato/Direto and Regulariza", () => {
    const tipos: Array<TipoCompra | undefined> = ["4", "1", "3", "2", undefined];
    const sorted = [...tipos].sort(compareByTipoCompraPrioridade);

    expect(sorted).toEqual(["2", "1", "4", "3", undefined]);
    expect(getTipoCompraPrioridade("2")).toBeLessThan(getTipoCompraPrioridade("1"));
    expect(getTipoCompraPrioridade("1")).toBeLessThan(getTipoCompraPrioridade("3"));
    expect(getTipoCompraPrioridade("3")).toBe(getTipoCompraPrioridade("4"));
  });
});
