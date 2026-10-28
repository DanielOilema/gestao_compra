import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  emptyAcompanhamentoSolicitacaoFilters,
  groupSolicitacoesPorColuna,
  mapProtheusAcompanhamentoSolicitacoesResponse,
  type PurchaseRequest,
  type SolicitacaoAcompanhamento,
} from "@gestao-compra/shared";
import { filtrarAcompanhamentoSolicitacoes } from "@/hooks/getAcompanhamentoSolicitacoes";
import KanbanSolicitacoes from "@/components/solicitacoes/acompanhamento/KanbanSolicitacoes";
import AcompanhamentoSolicitacoesPage from "@/pages/solicitacoes-compra/AcompanhamentoSolicitacoesPage";

const getAcompanhamentoSolicitacoes = vi.fn();
const getSolicitacoesCompra = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    protheusAuth: "basic-auth",
    user: { id: "000005", protheusId: "000005", userName: "daniel.silveira" },
  }),
}));

vi.mock("@/hooks/getAcompanhamentoSolicitacoes", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/getAcompanhamentoSolicitacoes")>();
  return {
    ...actual,
    getAcompanhamentoSolicitacoes: (...args: unknown[]) => getAcompanhamentoSolicitacoes(...args),
  };
});

vi.mock("@/hooks/getSolicitacoesCompra", () => ({
  SOLICITACOES_PAGE_SIZE: 20,
  getSolicitacoesCompra: (...args: unknown[]) => getSolicitacoesCompra(...args),
}));

vi.mock("@/hooks/useLogAprovacao", () => ({
  useLogAprovacao: () => ({ data: [], isLoading: false, isError: false, error: null }),
}));

const detalheSolicitacao = (overrides: Partial<PurchaseRequest> = {}): PurchaseRequest => ({
  id: "SC-0101-010152",
  numero: "010152",
  filial: "0101",
  dataCriacao: "2026-10-04",
  status: "bloqueada",
  solicitante: "Administrador",
  itens: [
    {
      id: "item-1",
      item: "0001",
      produto: "9899000009",
      unidade: "UN",
      descricao: "PLANO DE SAUDE BRADESCO",
      quantidade: 1,
      valorEstimado: 0,
      codigoCentroCusto: "3101001",
      descricaoCentroCusto: "UBS BA - PLACAS - SO",
      observacao: "TESTE",
    },
  ],
  ...overrides,
});

const amostra = {
  solicitacoes: [
    {
      numero: "001245",
      filial: "01",
      solicitante: "João Silva",
      dataSolicitacao: "2026-10-02",
      statusAtual: "EM_COTACAO",
      quantidadeItens: 5,
      observacoes: "Urgente",
      centroCusto: "1001",
      aprovacao: {
        observacoes: "Liberado",
        aprovadores: [{ nome: "Maria", status: "Aprovado", dataHora: "2026-10-01" }],
      },
      cotacoes: [{ numero: "000111", status: "Aberta", fornecedorEscolhido: "ACME" }],
      pedidos: [{ numero: "000222", fornecedor: "ACME", valor: 10.5, status: "Liberado" }],
      notasFiscais: [{ numero: "000333", chaveNfe: "123", statusEntrada: "Pré-nota" }],
    },
    { numero: "001246", statusAtual: "Em cotação" },
    { numero: "001247", status: "Pré-nota" },
    { numero: "001248", statusAtual: "Bloqueadas" },
    { numero: "001249", statusAtual: "Pedidos" },
    { numero: "001250", statusAtual: "Aprovada" },
    { numero: "001251", statusAtual: "rascunho" },
    { filial: "01", statusAtual: "BLOQUEADA" },
  ],
};

describe("mapProtheusAcompanhamentoSolicitacoesResponse", () => {
  it("traduz os status conhecidos e preserva a cadeia quando ela vem no payload", () => {
    const result = mapProtheusAcompanhamentoSolicitacoesResponse(amostra);
    const porNumero = Object.fromEntries(result.solicitacoes.map((item) => [item.numero, item]));

    expect(porNumero["001245"]).toMatchObject({
      id: "SC-01-001245",
      filial: "01",
      solicitante: "João Silva",
      dataSolicitacao: "2026-10-02",
      statusAtual: "EM_COTACAO",
      quantidadeItens: 5,
      observacoes: "Urgente",
      centroCusto: "1001",
      aprovacao: {
        observacoes: "Liberado",
        aprovadores: [{ nome: "Maria", status: "Aprovado" }],
      },
      cotacoes: [{ numero: "000111", fornecedorEscolhido: "ACME" }],
      pedidos: [{ numero: "000222", valor: 10.5 }],
      notasFiscais: [{ numero: "000333", chaveNfe: "123" }],
    });
    expect(porNumero["001246"]?.statusAtual).toBe("EM_COTACAO");
    expect(porNumero["001247"]?.statusAtual).toBe("PRE_NOTA");
    expect(porNumero["001248"]?.statusAtual).toBe("BLOQUEADA");
    expect(porNumero["001249"]?.statusAtual).toBe("PEDIDO");
    expect(porNumero["001250"]?.statusAtual).toBe("APROVADA");
    expect(result.naoReconhecidas).toEqual([
      { id: "SC-001251", numero: "001251", filial: undefined, statusInformado: "rascunho" },
    ]);
    expect(result.lineCount).toBe(amostra.solicitacoes.length);
  });

  it("lê o layout de busca_sc_situacao, inclusive EM COTACAO com espaço", () => {
    const result = mapProtheusAcompanhamentoSolicitacoesResponse({
      solicitacoes: [
        { filial: "0101", numero: "010091", solicitante: "naiane.dani", comprador: "andrews.andrade", status: "BLOQUEADA" },
        { filial: "0101", numero: "008515", solicitante: "anabela.almeida", status: "EM COTACAO" },
        { filial: "0101", numero: "009152", solicitante: "luan.rocha", status: "PEDIDO" },
        { filial: "0101", numero: "000027", solicitante: "nicole.moraes", status: "APROVADA" },
      ],
    });

    expect(result.solicitacoes.map((item) => [item.numero, item.statusAtual, item.filial, item.comprador])).toEqual([
      ["010091", "BLOQUEADA", "0101", "andrews.andrade"],
      ["008515", "EM_COTACAO", "0101", undefined],
      ["009152", "PEDIDO", "0101", undefined],
      ["000027", "APROVADA", "0101", undefined],
    ]);
    expect(result.naoReconhecidas).toEqual([]);
  });

  it("lê tipo de compra e data do endpoint", () => {
    const result = mapProtheusAcompanhamentoSolicitacoesResponse({
      solicitacoes: [
        {
          filial: "0101",
          numero: "010091",
          solicitante: "naiane.dani",
          status: "BLOQUEADA",
          tipoCompra: "Urgente",
          data: "02/10/2026",
        },
        {
          filial: "0101",
          numero: "000027",
          solicitante: "nicole.moraes",
          status: "APROVADA",
          tipoCompra: "1",
          emissao: "2026/10/01",
        },
      ],
    });

    expect(result.solicitacoes.map((item) => [item.numero, item.tipoCompra, item.dataSolicitacao])).toEqual([
      ["010091", "2", "2026-10-02"],
      ["000027", "1", "2026-10-01"],
    ]);
  });

  it("não coloca na raia um status que o Protheus não classificou", () => {
    const result = mapProtheusAcompanhamentoSolicitacoesResponse({
      data: [{ numero: "9", situacao: "totalmente atendida" }],
    });

    expect(result.solicitacoes).toEqual([]);
    expect(result.naoReconhecidas[0]?.statusInformado).toBe("totalmente atendida");
  });

  it("agrupa linhas da mesma solicitação sem misturar status diferentes", () => {
    const result = mapProtheusAcompanhamentoSolicitacoesResponse([
      { numero: "10", filial: "01", statusAtual: "APROVADA" },
      { numero: "10", filial: "01", statusAtual: "APROVADA" },
      { numero: "11", statusAtual: "PEDIDO" },
      { numero: "11", statusAtual: "PRE_NOTA" },
    ]);

    expect(result.solicitacoes).toEqual([
      expect.objectContaining({ numero: "10", quantidadeItens: 2, statusAtual: "APROVADA" }),
    ]);
    expect(result.naoReconhecidas.map((item) => item.numero)).toEqual(["11"]);
    expect(result.lineCount).toBe(4);
  });
});

describe("filtrarAcompanhamentoSolicitacoes", () => {
  const base: SolicitacaoAcompanhamento[] = [
    {
      id: "1",
      numero: "010091",
      statusAtual: "BLOQUEADA",
      solicitante: "naiane.dani",
      comprador: "danilo.sampaio",
      tipoCompra: "1",
    },
    {
      id: "2",
      numero: "010116",
      statusAtual: "APROVADA",
      solicitante: "caio.batista",
      comprador: "A definir",
      tipoCompra: "2",
    },
  ];

  it("filtra por solicitante, comprador e tipo de compra", () => {
    const porSolicitante = filtrarAcompanhamentoSolicitacoes(base, [], {
      ...emptyAcompanhamentoSolicitacaoFilters(),
      solicitante: "NAIANE",
    });
    expect(porSolicitante.solicitacoes.map((item) => item.numero)).toEqual(["010091"]);

    const porComprador = filtrarAcompanhamentoSolicitacoes(base, [], {
      ...emptyAcompanhamentoSolicitacaoFilters(),
      comprador: "A definir",
    });
    expect(porComprador.solicitacoes.map((item) => item.numero)).toEqual(["010116"]);

    const porTipo = filtrarAcompanhamentoSolicitacoes(base, [], {
      ...emptyAcompanhamentoSolicitacaoFilters(),
      tipoCompra: "2",
    });
    expect(porTipo.solicitacoes.map((item) => item.numero)).toEqual(["010116"]);
  });
});

describe("groupSolicitacoesPorColuna", () => {
  it("distribui os cards pela configuração das raias", () => {
    const solicitacoes: SolicitacaoAcompanhamento[] = [
      { id: "1", numero: "1", statusAtual: "PEDIDO" },
      { id: "2", numero: "2", statusAtual: "BLOQUEADA" },
      { id: "3", numero: "3", statusAtual: "BLOQUEADA" },
    ];

    const grupos = groupSolicitacoesPorColuna(solicitacoes);

    expect(grupos.map((grupo) => [grupo.title, grupo.solicitacoes.length])).toEqual([
      ["Bloqueadas", 2],
      ["Aprovadas", 0],
      ["Em cotação", 0],
      ["Pedidos", 1],
      ["Pré-nota", 0],
    ]);
  });
});

describe("KanbanSolicitacoes", () => {
  it("mostra a raia vazia e avisa a seleção do card", () => {
    const onSelect = vi.fn();
    render(
      <KanbanSolicitacoes
        solicitacoes={[
          {
            id: "1",
            numero: "001245",
            statusAtual: "EM_COTACAO",
            solicitante: "João",
            comprador: "andrews.andrade",
            dataSolicitacao: "2026-10-02",
          },
        ]}
        onSelectSolicitacao={onSelect}
      />,
    );

    expect(screen.getAllByText("Nenhuma solicitação nesta etapa.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("001245").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Data: 02/10/2026").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Solicitante: João").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Comprador: andrews.andrade").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Solicitação 001245" })[0]);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ numero: "001245" }));
  });
});

describe("AcompanhamentoSolicitacoesPage", () => {
  beforeEach(() => {
    getAcompanhamentoSolicitacoes.mockReset();
    getSolicitacoesCompra.mockReset();
  });

  it("mostra o erro do Protheus e permite tentar de novo", async () => {
    getAcompanhamentoSolicitacoes.mockRejectedValueOnce(new Error("Protheus indisponível"));
    getAcompanhamentoSolicitacoes.mockResolvedValueOnce({
      solicitacoes: [],
      naoReconhecidas: [],
      hasNextPage: false,
    });

    render(
      <MemoryRouter>
        <AcompanhamentoSolicitacoesPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Protheus indisponível")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText("Nenhuma solicitação encontrada.")).toBeInTheDocument();
  });

  it("mostra o card quando a consulta retorna solicitações", async () => {
    getAcompanhamentoSolicitacoes.mockResolvedValue({
      solicitacoes: [
        { id: "1", numero: "010152", filial: "0101", statusAtual: "BLOQUEADA", solicitante: "Maria" },
      ],
      naoReconhecidas: [],
      hasNextPage: false,
    });
    getSolicitacoesCompra.mockResolvedValue({
      requests: [detalheSolicitacao()],
      hasNextPage: false,
    });

    render(
      <MemoryRouter>
        <AcompanhamentoSolicitacoesPage />
      </MemoryRouter>,
    );

    expect(await screen.findAllByText("010152")).not.toHaveLength(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Solicitação 010152" })[0]);

    expect(await screen.findAllByText("PLANO DE SAUDE BRADESCO")).not.toHaveLength(0);
    expect(screen.getAllByText("Administrador").length).toBeGreaterThan(0);
    expect(screen.getAllByText("04/10/2026").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Rastrear" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copiar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Alterar" })).not.toBeInTheDocument();
    expect(getSolicitacoesCompra).toHaveBeenCalledWith({
      filters: {
        filial: "0101",
        numSC: "010152",
        produto: "",
        solicitante: "",
        dataInicio: "",
        dataFim: "",
      },
      page: 1,
      pageSize: 20,
      basicAuth: "basic-auth",
      codUser: "000005",
      nomeUser: "daniel.silveira",
    });
  });

  it("junta os itens das páginas seguintes da mesma solicitação", async () => {
    getAcompanhamentoSolicitacoes.mockResolvedValue({
      solicitacoes: [{ id: "1", numero: "010152", filial: "0101", statusAtual: "BLOQUEADA" }],
      naoReconhecidas: [],
      hasNextPage: false,
    });
    getSolicitacoesCompra
      .mockResolvedValueOnce({
        requests: [detalheSolicitacao()],
        hasNextPage: true,
      })
      .mockResolvedValueOnce({
        requests: [
          detalheSolicitacao({
            itens: [
              {
                id: "item-2",
                item: "0002",
                produto: "111",
                unidade: "UN",
                descricao: "SEGUNDO ITEM",
                quantidade: 2,
                valorEstimado: 0,
              },
            ],
          }),
        ],
        hasNextPage: false,
      });

    render(
      <MemoryRouter>
        <AcompanhamentoSolicitacoesPage />
      </MemoryRouter>,
    );

    fireEvent.click((await screen.findAllByRole("button", { name: "Solicitação 010152" }))[0]);
    expect(await screen.findAllByText("SEGUNDO ITEM")).not.toHaveLength(0);
    expect(screen.getAllByText("PLANO DE SAUDE BRADESCO").length).toBeGreaterThan(0);
    expect(getSolicitacoesCompra).toHaveBeenCalledTimes(2);
    expect(getSolicitacoesCompra).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2, pageSize: 20 }),
    );
  });

  it("permite tentar de novo quando o detalhe falha", async () => {
    getAcompanhamentoSolicitacoes.mockResolvedValue({
      solicitacoes: [{ id: "1", numero: "010152", filial: "0101", statusAtual: "BLOQUEADA" }],
      naoReconhecidas: [],
      hasNextPage: false,
    });
    getSolicitacoesCompra.mockRejectedValueOnce(new Error("Falha ao buscar solicitações"));
    getSolicitacoesCompra.mockResolvedValueOnce({
      requests: [detalheSolicitacao()],
      hasNextPage: false,
    });

    render(
      <MemoryRouter>
        <AcompanhamentoSolicitacoesPage />
      </MemoryRouter>,
    );

    fireEvent.click((await screen.findAllByRole("button", { name: "Solicitação 010152" }))[0]);
    expect(await screen.findByText("Falha ao buscar solicitações")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findAllByText("PLANO DE SAUDE BRADESCO")).not.toHaveLength(0);
  });

  it("atualiza o quadro com uma nova consulta", async () => {
    getAcompanhamentoSolicitacoes
      .mockResolvedValueOnce({
        solicitacoes: [{ id: "1", numero: "001245", statusAtual: "APROVADA" }],
        naoReconhecidas: [],
        hasNextPage: false,
      })
      .mockResolvedValueOnce({
        solicitacoes: [{ id: "2", numero: "009999", statusAtual: "PEDIDO" }],
        naoReconhecidas: [],
        hasNextPage: false,
      });

    render(
      <MemoryRouter>
        <AcompanhamentoSolicitacoesPage />
      </MemoryRouter>,
    );

    expect(await screen.findAllByText("001245")).not.toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    expect(await screen.findAllByText("009999")).not.toHaveLength(0);
    expect(screen.queryByText("001245")).not.toBeInTheDocument();
    expect(getAcompanhamentoSolicitacoes).toHaveBeenCalledTimes(2);
    expect(getAcompanhamentoSolicitacoes).toHaveBeenCalledWith(
      expect.objectContaining({
        basicAuth: "basic-auth",
        codUser: "000005",
        nomeUser: "daniel.silveira",
      }),
    );
  });

  it("filtra os cards pelo solicitante sem nova consulta", async () => {
    getAcompanhamentoSolicitacoes.mockResolvedValue({
      solicitacoes: [
        { id: "1", numero: "010152", filial: "0101", statusAtual: "BLOQUEADA", solicitante: "Maria" },
        { id: "2", numero: "010200", filial: "0101", statusAtual: "APROVADA", solicitante: "João" },
      ],
      naoReconhecidas: [],
      hasNextPage: false,
    });

    render(
      <MemoryRouter>
        <AcompanhamentoSolicitacoesPage />
      </MemoryRouter>,
    );

    expect(await screen.findAllByText("010152")).not.toHaveLength(0);
    fireEvent.change(screen.getByLabelText("Solicitante"), { target: { value: "joão" } });
    expect(screen.queryByText("010152")).not.toBeInTheDocument();
    expect(screen.getAllByText("010200").length).toBeGreaterThan(0);
    expect(getAcompanhamentoSolicitacoes).toHaveBeenCalledTimes(1);
  });

  it("filtra os cards pelo número sem o campo de pesquisa antigo", async () => {
    getAcompanhamentoSolicitacoes.mockResolvedValue({
      solicitacoes: [
        { id: "1", numero: "010152", filial: "0101", statusAtual: "BLOQUEADA", solicitante: "Maria" },
        { id: "2", numero: "010200", filial: "0101", statusAtual: "APROVADA", solicitante: "João" },
      ],
      naoReconhecidas: [],
      hasNextPage: false,
    });

    render(
      <MemoryRouter>
        <AcompanhamentoSolicitacoesPage />
      </MemoryRouter>,
    );

    expect(await screen.findAllByText("010152")).not.toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Pesquisar" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Número"), { target: { value: "0102" } });
    expect(screen.queryByText("010152")).not.toBeInTheDocument();
    expect(screen.getAllByText("010200").length).toBeGreaterThan(0);
    expect(getAcompanhamentoSolicitacoes).toHaveBeenCalledTimes(1);
  });
});
