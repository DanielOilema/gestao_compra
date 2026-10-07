import React from "react";
import { fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  colunasDoRastro,
  formatRastroData,
  mapProtheusRastroSolicitacao,
  type PurchaseRequest,
} from "@gestao-compra/shared";
import SolicitacaoCompraDetailContent from "@/components/solicitacoes/listagem/SolicitacaoCompraDetailContent";
import SolicitacaoCompraDetailDialog from "@/components/solicitacoes/listagem/SolicitacaoCompraDetailDialog";
import { useRastroSolicitacao } from "@/hooks/useRastroSolicitacao";

const invokeProtheusFunction = vi.fn();
const navigate = vi.fn();

vi.mock("@/lib/invokeProtheusFunction", () => ({
  invokeProtheusFunction: (...args: unknown[]) => invokeProtheusFunction(...args),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ protheusAuth: "basic-auth" }),
}));

vi.mock("@/contexts/EnvironmentContext", () => ({
  useEnvironment: () => ({ ambiente: "homologacao" }),
}));

vi.mock("@/hooks/useLogAprovacao", () => ({
  useLogAprovacao: () => ({ data: [], isLoading: false, isError: false, error: null }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

const amostra = {
  solicitacao: [
    {
      numero: "009241",
      filial: "0101",
      emissao: "2026/05/01",
      itens: [
        {
          item: "0001",
          produto: "9801000081",
          quantidade: 20,
          centroCusto: "3101001",
          observacao: "MATERIAL PARA USO GERAL DA UBS",
          unidadeMedida: "UN",
        },
      ],
    },
  ],
  cotacoes: [
    {
      cotacao: "000887",
      fornecedor: "34054429",
      loja: "0001",
      nomeFornecedor: "PORTO BRASIL MOTORES E FERRAMENTAS LTDA",
      condPagto: "105",
      emissao: "2026/05/10",
      itens: [
        {
          item: "0001",
          produto: "9801000081",
          quantidade: 20,
          preco: 48,
          total: 960,
          desconto: 0,
          itemSC: "0001",
          numPedido: "XXXXXX",
          itemPedido: "XXXX",
        },
      ],
    },
    {
      cotacao: "000887",
      fornecedor: "45686519",
      loja: "0001",
      nomeFornecedor: "GP DISTRIBUIDORA DE LUBRIFICANTES E FILTROS LTDA",
      condPagto: "105",
      emissao: "2026/05/15",
      itens: [
        {
          item: "0001",
          produto: "9801000081",
          quantidade: 20,
          preco: 47,
          total: 940,
          desconto: 0,
          itemSC: "0001",
          numPedido: "011092",
          itemPedido: "0001",
        },
      ],
    },
  ],
  pedidos: [
    {
      pedido: "011092",
      fornecedor: "45686519",
      loja: "0001",
      nomeFornecedor: "GP DISTRIBUIDORA DE LUBRIFICANTES E FILTROS LTDA",
      emissao: "2026/06/02",
      itens: [
        {
          item: "0001",
          produto: "9801000081",
          quantidade: 20,
          preco: 47,
          total: 940,
          centroCusto: "3101001",
        },
      ],
    },
  ],
  notasFiscais: [
    {
      fornecedor: "45686519",
      loja: "0001",
      nomeFornecedor: "GP DISTRIBUIDORA DE LUBRIFICANTES E FILTROS LTDA",
      notaFiscal: "000004898-003",
      documento: "000004898",
      serie: "003",
      status: "CLASSIFICADA",
      emissao: "2026/06/10",
      itens: [
        {
          item: "0001",
          produto: "9801000081",
          descricao: "",
          quantidade: 20,
          valorUnitario: 47,
          total: 940,
          tes: "074",
          centroCusto: "3101001",
          pedido: "011092",
          itemPedido: "0001",
        },
      ],
    },
  ],
};

const solicitacao = (overrides: Partial<PurchaseRequest> = {}): PurchaseRequest => ({
  id: "SC-0101-009241",
  numero: "009241",
  dataCriacao: "2026-06-01",
  status: "aberto",
  solicitante: "Daniel Silveira",
  filial: "0101",
  itens: [
    {
      id: "item-1",
      item: "0001",
      produto: "9801000081",
      unidade: "UN",
      descricao: "MATERIAL",
      quantidade: 20,
      valorEstimado: 0,
      codigoCentroCusto: "3101001",
    },
  ],
  ...overrides,
});

const renderComQuery = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

beforeEach(() => {
  invokeProtheusFunction.mockReset();
  invokeProtheusFunction.mockResolvedValue(amostra);
});

describe("mapProtheusRastroSolicitacao", () => {
  it("mantém cotações do mesmo número, liga só o pedido real e a nota pelo item", () => {
    const grafo = mapProtheusRastroSolicitacao(amostra);

    expect(grafo.invalido).toBe(false);
    expect(grafo.solicitacao?.documento).toMatchObject({
      numero: "009241",
      filial: "0101",
      emissao: "2026/05/01",
    });
    expect(grafo.cotacoes.map((cotacao) => cotacao.documento.fornecedor)).toEqual(["34054429", "45686519"]);
    expect(new Set(grafo.cotacoes.map((cotacao) => cotacao.id)).size).toBe(2);
    expect(grafo.cotacoes[0].documento.itens[0].numPedido).toBe("XXXXXX");
    expect(grafo.pedidos[0].documento.emissao).toBe("2026/06/02");
    expect(grafo.cotacoes[1].documento.emissao).toBe("2026/05/15");
    expect(grafo.notasFiscais[0].documento).toMatchObject({
      status: "CLASSIFICADA",
      emissao: "2026/06/10",
    });
    expect(grafo.ligacoes).toEqual([
      { origemId: grafo.solicitacao!.id, destinoId: grafo.cotacoes[0].id },
      { origemId: grafo.solicitacao!.id, destinoId: grafo.cotacoes[1].id },
      { origemId: grafo.cotacoes[1].id, destinoId: grafo.pedidos[0].id },
      { origemId: grafo.pedidos[0].id, destinoId: grafo.notasFiscais[0].id },
    ]);
    expect(colunasDoRastro(grafo).map((coluna) => coluna.id)).toEqual([
      "solicitacao",
      "cotacao",
      "pedido",
      "nota",
    ]);
  });

  it("mantém a nota com outro status ou sem status", () => {
    const digitada = mapProtheusRastroSolicitacao({
      ...amostra,
      notasFiscais: [{ ...amostra.notasFiscais[0], status: "DIGITADA" }],
    });
    const semStatus = mapProtheusRastroSolicitacao({
      ...amostra,
      notasFiscais: [{ ...amostra.notasFiscais[0], status: "" }],
    });

    expect(digitada.notasFiscais[0].documento.status).toBe("DIGITADA");
    expect(digitada.notasFiscais[0].subtitulo).toBe("000004898-003");
    expect(semStatus.notasFiscais).toHaveLength(1);
    expect(semStatus.notasFiscais[0].documento.status).toBeUndefined();
  });

  it("omite etapas vazias e liga documento sem pai direto na solicitação", () => {
    const soSolicitacao = mapProtheusRastroSolicitacao({
      solicitacao: amostra.solicitacao,
      cotacoes: [],
      pedidos: [],
    });
    const pedidoSolto = mapProtheusRastroSolicitacao({
      solicitacao: amostra.solicitacao,
      pedidos: [{ ...amostra.pedidos[0], pedido: "022222" }],
    });

    expect(colunasDoRastro(soSolicitacao).map((coluna) => coluna.id)).toEqual(["solicitacao"]);
    expect(pedidoSolto.ligacoes).toEqual([
      { origemId: pedidoSolto.solicitacao!.id, destinoId: pedidoSolto.pedidos[0].id },
    ]);
  });

  it("distingue documentos repetidos e rejeita resposta inválida", () => {
    const repetida = mapProtheusRastroSolicitacao({
      solicitacao: amostra.solicitacao,
      cotacoes: [amostra.cotacoes[0], amostra.cotacoes[0]],
    });

    expect(repetida.cotacoes).toHaveLength(2);
    expect(repetida.cotacoes[0].id).not.toBe(repetida.cotacoes[1].id);
    expect(mapProtheusRastroSolicitacao(null).invalido).toBe(true);
    expect(mapProtheusRastroSolicitacao("invalido").invalido).toBe(true);
    expect(formatRastroData("2026/06/02")).toBe("02/06/2026");
  });
});

describe("ação Rastrear", () => {
  it("mostra Rastrear junto com Copiar e Alterar", () => {
    const onRastrear = vi.fn();
    render(
      <SolicitacaoCompraDetailContent
        request={solicitacao()}
        onBack={() => undefined}
        onRastrear={onRastrear}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Rastrear" }));

    expect(onRastrear).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Copiar" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Alterar" })).toBeEnabled();
  });

  it("rastreia a solicitação aberta sem as ações de copiar e alterar", async () => {
    invokeProtheusFunction.mockResolvedValue(amostra);
    renderComQuery(
      <SolicitacaoCompraDetailDialog
        request={solicitacao()}
        open
        showActions={false}
        onOpenChange={() => undefined}
      />,
    );

    expect(screen.queryByRole("button", { name: "Copiar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Alterar" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Rastrear" }));

    expect(await screen.findByRole("button", { name: /PORTO BRASIL/ })).toBeInTheDocument();
    await waitFor(() => {
      expect(invokeProtheusFunction).toHaveBeenCalledWith(
        "protheus-rastro-solicitacao",
        {
          basicAuth: "basic-auth",
          filial: "0101",
          numSc: "009241",
        },
        "Falha ao buscar o rastro da solicitação",
      );
    });
  });

  it("abre o rastro da solicitação selecionada e o detalhe da cotação", async () => {
    invokeProtheusFunction.mockResolvedValue(amostra);
    renderComQuery(
      <SolicitacaoCompraDetailDialog request={solicitacao()} open onOpenChange={() => undefined} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Rastrear" }));

    expect(await screen.findByRole("button", { name: /PORTO BRASIL/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /GP DISTRIBUIDORA/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /000004898-003/ })).toHaveTextContent("CLASSIFICADA");

    await waitFor(() => {
      expect(invokeProtheusFunction).toHaveBeenCalledWith(
        "protheus-rastro-solicitacao",
        {
          basicAuth: "basic-auth",
          filial: "0101",
          numSc: "009241",
        },
        "Falha ao buscar o rastro da solicitação",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /GP DISTRIBUIDORA/ }));

    expect(screen.getByRole("heading", { name: "Cotação 000887" })).toBeInTheDocument();
    expect(screen.getByText("Condição de pagamento")).toBeInTheDocument();
    expect(screen.getByText("Emissão")).toBeInTheDocument();
    expect(screen.getByText("15/05/2026")).toBeInTheDocument();
    expect(screen.getAllByText((_, element) => {
      const normalizado = element?.textContent?.replace(/\u00a0/g, " ") ?? "";
      return normalizado.includes("R$ 47,00");
    }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));

    expect(screen.getByRole("button", { name: /PORTO BRASIL/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));

    expect(screen.getByRole("button", { name: "Copiar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alterar" })).toBeInTheDocument();
  });

  it("mostra ausência de dados e erro de resposta inválida", async () => {
    invokeProtheusFunction.mockResolvedValueOnce({ solicitacao: [] });
    const { unmount } = renderComQuery(
      <SolicitacaoCompraDetailDialog request={solicitacao()} open onOpenChange={() => undefined} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Rastrear" }));
    expect(await screen.findByText("Não há dados de rastro para esta solicitação.")).toBeInTheDocument();
    unmount();

    invokeProtheusFunction.mockResolvedValueOnce("sem json");
    renderComQuery(
      <SolicitacaoCompraDetailDialog
        request={solicitacao({ numero: "009242", id: "SC-0101-009242" })}
        open
        onOpenChange={() => undefined}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Rastrear" }));
    expect(await screen.findByText("Resposta inválida do rastro da solicitação.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});

describe("useRastroSolicitacao", () => {
  it("consulta pela filial e pelo número originais", async () => {
    invokeProtheusFunction.mockClear();
    invokeProtheusFunction.mockResolvedValue(amostra);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    renderHook(() => useRastroSolicitacao("0101", "009241"), { wrapper });

    await waitFor(() => {
      expect(invokeProtheusFunction).toHaveBeenCalledWith(
        "protheus-rastro-solicitacao",
        expect.objectContaining({ filial: "0101", numSc: "009241" }),
        expect.any(String),
      );
    });
  });
});
