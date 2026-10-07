import { beforeEach, describe, expect, it, vi } from "vitest";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";
import { getSolicitacaoCompraCompleta } from "@/hooks/getSolicitacoesCompra";
import { mergePurchaseRequests, type PurchaseRequest } from "@gestao-compra/shared";

vi.mock("@/lib/invokeProtheusFunction", () => ({
  invokeProtheusFunction: vi.fn(),
}));

const invoke = vi.mocked(invokeProtheusFunction);

const request = (
  numero: string,
  itens: PurchaseRequest["itens"],
): PurchaseRequest => ({
  id: `SC-0101-${numero}`,
  numero,
  dataCriacao: "2026-09-22",
  status: "bloqueada",
  solicitante: "Administrador",
  filial: "0101",
  tipoCompra: "1",
  itens,
});

const item = (codigo: string): PurchaseRequest["itens"][number] => ({
  id: `0101-010145-${codigo}`,
  item: codigo,
  produto: "9899000009",
  unidade: "UN",
  descricao: "PLANO",
  quantidade: 1,
  valorEstimado: 0,
  status: "bloqueada",
});

describe("mergePurchaseRequests", () => {
  it("groups items from later pages and keeps the original item number", () => {
    const merged = mergePurchaseRequests([
      request("010145", [item("0001"), item("0002")]),
      request("010145", [item("0003")]),
    ]);

    expect(merged?.itens.map((row) => row.item)).toEqual(["0001", "0002", "0003"]);
  });

  it("does not duplicate an item that appears on more than one page", () => {
    const merged = mergePurchaseRequests([
      request("010145", [item("0002"), item("0001")]),
      request("010145", [item("0002"), item("0003")]),
    ]);

    expect(merged?.itens.map((row) => row.item)).toEqual(["0001", "0002", "0003"]);
  });
});

describe("getSolicitacaoCompraCompleta", () => {
  beforeEach(() => {
    invoke.mockReset();
  });

  it("loads every page of the solicitation and ignores other documents", async () => {
    const line = (numero: string, itemCode: string) => ({
      filial: "0101",
      numero,
      item: itemCode,
      produto: "9899000009",
      descricao: "PLANO",
      quant: 1,
      cc: "1101",
      desccc: "ADMIN",
      obs: "TESTE",
      solicitante: "Administrador",
      emissao: "2026/09/22",
      status: "Bloqueada",
    });

    invoke.mockImplementation(async (_name: string, body: Record<string, unknown>) => {
      if (body.page === 1) {
        return {
          SOLICITACOES: Array.from({ length: 20 }, (_, index) =>
            line("010145", String(index + 1).padStart(4, "0")),
          ),
        };
      }
      return {
        SOLICITACOES: [line("010145", "0021"), line("010999", "0001")],
      };
    });

    const full = await getSolicitacaoCompraCompleta({
      filial: "0101",
      numero: "010145",
      basicAuth: "Basic abc",
      codUser: "000005",
      nomeUser: "daniel.silveira",
    });

    expect(invoke).toHaveBeenCalledTimes(2);
    expect(invoke).toHaveBeenNthCalledWith(
      1,
      "protheus-lista-solicitacoes",
      expect.objectContaining({
        page: 1,
        pageSize: 20,
        filial: "0101",
        numSC: "010145",
        codUser: "000005",
        nomeUser: "daniel.silveira",
      }),
      "Falha ao buscar solicitações",
    );
    expect(full.numero).toBe("010145");
    expect(full.itens).toHaveLength(21);
    expect(full.itens[0].item).toBe("0001");
    expect(full.itens[20].item).toBe("0021");
    expect(full.itens.some((row) => row.id.includes("010999"))).toBe(false);
  });
});
