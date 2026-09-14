import React from "react";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  ACAO_ALTERA_TRANSPORTADORA,
  ACAO_INCLUI_TRANSPORTADORA,
  TIPO_ANTT_OPTIONS,
  VIA_TRANSPORTE_OPTIONS,
  emptyTransportadoraFormDraft,
  filterTransportadorasByPesquisa,
  mapDetalheToTransportadoraDraft,
  mapFormToIncluiTransportadoraPayload,
  mapProtheusIncluiTransportadoraResponse,
  mapProtheusMunicipioResponse,
  mapProtheusTransportadoraDetalhe,
  mapProtheusTransportadorasList,
  municipioOptionKey,
  validateTransportadoraForm,
  type TransportadoraDetalhe,
} from "@gestao-compra/shared";
import { appModuleGroups } from "@/config/navigation";
import { permissionModuleGroups } from "@/components/permissoes/edicao/permissionModuleGroups";
import { buildUserMenu } from "@/lib/buildUserMenu";
import TransportadorasToolbar from "@/components/transportadoras/listagem/TransportadorasToolbar";
import TransportadorasDetailContent from "@/components/transportadoras/listagem/TransportadorasDetailContent";
import TransportadoraInclusaoForm from "@/components/transportadoras/inclusao/TransportadoraInclusaoForm";
import { TransportadoraLeaveProvider } from "@/components/transportadoras/inclusao/TransportadoraLeaveContext";

vi.mock("@/hooks/useIncluiTransportadora", () => ({
  useIncluiTransportadora: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/hooks/useBuscaMunicipio", () => ({
  useBuscaMunicipio: () => ({
    data: [],
    isLoading: false,
    isFetching: false,
    isError: false,
  }),
}));

const detalheAlteracao: TransportadoraDetalhe = {
  codigo: "999999",
  nome: "XXXX",
  nomeReduzido: "",
  via: "AEREO",
  endereco: "RUA 01, N° 991",
  bairro: "CENTRO II",
  municipio: "AGUA BOA",
  estado: "MT",
  cep: "78635000",
  ddd: "66",
  telefone: "34683033",
  cgc: "15023898000190",
  tipoAntt: "TAC",
  inscEstadual: "134122585",
  email: "faturamento@somaar.com.br",
  antt: "XXXXXXX",
  codMunicipio: "5100201",
};

describe("menu Logística", () => {
  it("shows Transportadoras for an admin", () => {
    const menu = buildUserMenu(appModuleGroups, [], true);
    const paths = menu.flatMap((group) => group.routines.map((routine) => routine.path));
    expect(paths).toContain("/transportadoras");
  });

  it("keeps Transportadoras behind its permission", () => {
    const menu = buildUserMenu(appModuleGroups, ["solicitacoes-compra"], false);
    const paths = menu.flatMap((group) => group.routines.map((routine) => routine.path));
    expect(paths).not.toContain("/transportadoras");
  });

  it("exposes Logística in the permission editor", () => {
    expect(permissionModuleGroups.find((group) => group.id === "logistica")).toEqual({
      id: "logistica",
      title: "Logística",
      permissions: ["transportadoras"],
    });
  });
});

describe("mapProtheusTransportadorasList", () => {
  it("maps a wrapped list with codigo, nome and cgc", () => {
    const items = mapProtheusTransportadorasList({
      transportadoras: [
        { codigo: "000016", nome: "J W XAVIER E CIA LTDA", cgc: "15023898000190" },
        { nome: "SEM CODIGO", cgc: "1" },
      ],
    });

    expect(items).toEqual([
      { codigo: "000016", nome: "J W XAVIER E CIA LTDA", cgc: "15023898000190" },
    ]);
  });

  it("maps a raw array response", () => {
    const items = mapProtheusTransportadorasList([
      { codigo: "000001", nome: "TRANSPORTES SUL", cnpj: "123" },
    ]);
    expect(items).toEqual([{ codigo: "000001", nome: "TRANSPORTES SUL", cgc: "123" }]);
  });
});

describe("filterTransportadorasByPesquisa", () => {
  const items = [
    { codigo: "000016", nome: "J W XAVIER E CIA LTDA", cgc: "15023898000190" },
    { codigo: "000178", nome: "EXPRESSO NORTE", cgc: "11222333000181" },
  ];

  it("matches by code, name or CGC digits", () => {
    expect(filterTransportadorasByPesquisa(items, "000016")).toHaveLength(1);
    expect(filterTransportadorasByPesquisa(items, "norte")).toEqual([items[1]]);
    expect(filterTransportadorasByPesquisa(items, "15.023.898/0001-90")).toEqual([items[0]]);
  });
});

describe("mapProtheusTransportadoraDetalhe", () => {
  it("maps the nested transportadora object", () => {
    const detalhe = mapProtheusTransportadoraDetalhe({
      transportadora: {
        codigo: "000016",
        nome: "J W XAVIER E CIA LTDA",
        nomeReduzido: "",
        via: "RODOVIARIO",
        endereco: "RUA 01, N° 991",
        bairro: "CENTRO II",
        municipio: "AGUA BOA",
        estado: "MT",
        cep: "78635000",
        ddd: "66",
        telefone: "34683033",
        cgc: "15023898000190",
        tipoAntt: "TAC",
        inscEstadual: "134122585",
        email: "faturamento@somaar.com.br",
        antt: "61516",
      },
    });

    expect(detalhe).toMatchObject({
      codigo: "000016",
      nome: "J W XAVIER E CIA LTDA",
      via: "RODOVIARIO",
      tipoAntt: "TAC",
      antt: "61516",
      cgc: "15023898000190",
    });
  });
});

describe("inclusão de transportadora", () => {
  it("requires nome, via, CPF/CNPJ, tipo ANTT and RNTRC", () => {
    expect(validateTransportadoraForm(emptyTransportadoraFormDraft())).toEqual({
      nome: "Informe o nome",
      via: "Selecione a via de transporte",
      cgc: "Informe o CPF/CNPJ",
      tipoAntt: "Selecione o tipo ANTT",
      antt: "Informe o RNTRC",
    });
  });

  it("builds the POST payload without codigo and with acao incluir", () => {
    const payload = mapFormToIncluiTransportadoraPayload({
      ...emptyTransportadoraFormDraft(),
      nome: "XXXX",
      via: "AEREO",
      endereco: "RUA 01, N° 991",
      bairro: "CENTRO II",
      municipio: "AGUA BOA",
      estado: "mt",
      cep: "78635-000",
      ddd: "66",
      telefone: "34683033",
      cgc: "15.023.898/0001-90",
      tipoAntt: "TAC",
      inscEstadual: "134122585",
      email: "faturamento@somaar.com.br",
      antt: "XXXXXXX",
      codMunicipio: "5100201",
    });

    expect(payload).toEqual({
      nome: "XXXX",
      nomeReduzido: "",
      via: "AEREO",
      endereco: "RUA 01, N° 991",
      bairro: "CENTRO II",
      municipio: "AGUA BOA",
      estado: "MT",
      cep: "78635000",
      ddd: "66",
      telefone: "34683033",
      cgc: "15023898000190",
      tipoAntt: "TAC",
      inscEstadual: "134122585",
      email: "faturamento@somaar.com.br",
      antt: "XXXXXXX",
      acao: ACAO_INCLUI_TRANSPORTADORA,
      codMunicipio: "5100201",
      codMun: "5100201",
    });
    expect(payload).not.toHaveProperty("codigo");
  });

  it("maps a detail into the inclusion draft and builds the alterar payload with codigo", () => {
    const draft = mapDetalheToTransportadoraDraft(detalheAlteracao);
    const payload = mapFormToIncluiTransportadoraPayload(draft, {
      acao: ACAO_ALTERA_TRANSPORTADORA,
    });

    expect(draft.codigo).toBe("999999");
    expect(payload).toEqual({
      codigo: "999999",
      nome: "XXXX",
      nomeReduzido: "",
      via: "AEREO",
      endereco: "RUA 01, N° 991",
      bairro: "CENTRO II",
      municipio: "AGUA BOA",
      estado: "MT",
      cep: "78635000",
      ddd: "66",
      telefone: "34683033",
      cgc: "15023898000190",
      tipoAntt: "TAC",
      inscEstadual: "134122585",
      email: "faturamento@somaar.com.br",
      antt: "XXXXXXX",
      acao: ACAO_ALTERA_TRANSPORTADORA,
      codMunicipio: "5100201",
      codMun: "5100201",
    });
  });

  it("exposes ANTT and via codes used by the comboboxes", () => {
    expect(TIPO_ANTT_OPTIONS.map((option) => option.value)).toEqual(["ETC", "CTC", "TAC"]);
    expect(VIA_TRANSPORTE_OPTIONS.map((option) => option.value)).toEqual([
      "RODOVIARIO",
      "AEREO",
      "MARITIMO",
      "FERROVIARIO",
      "FLUVIAL",
    ]);
  });

  it("maps the include result codigo", () => {
    expect(
      mapProtheusIncluiTransportadoraResponse({
        sucesso: true,
        mensagem: "Transportadora incluída com sucesso",
        codigo: "000178",
      }),
    ).toEqual({
      mensagem: "Transportadora incluída com sucesso",
      codigo: "000178",
    });
  });
});

describe("UI de transportadoras", () => {
  it("renders include and search controls on the list toolbar", () => {
    render(
      <MemoryRouter>
        <TransportadorasToolbar
          search=""
          onSearchChange={() => undefined}
          onSearchSubmit={() => undefined}
          onClear={() => undefined}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /incluir/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Pesquisar por código, nome ou CGC")).toBeInTheDocument();
  });

  it("renders the inclusion form with a disabled code field and required labels", () => {
    render(
      <MemoryRouter>
        <TransportadoraLeaveProvider>
          <TransportadoraInclusaoForm />
        </TransportadoraLeaveProvider>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Código")).toBeDisabled();
    expect(screen.getByLabelText("Nome *")).toBeInTheDocument();
    expect(screen.getByLabelText("CPF/CNPJ *")).toBeInTheDocument();
    expect(screen.getByLabelText("RNTRC *")).toBeInTheDocument();
    expect(screen.getByLabelText("Cód. Município")).toBeDisabled();
    expect(screen.getByLabelText("Estado")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.getByText("Informe o nome")).toBeInTheDocument();
    expect(screen.getByText("Informe o CPF/CNPJ")).toBeInTheDocument();
    expect(screen.getByText("Informe o RNTRC")).toBeInTheDocument();
  });

  it("shows the alterar button on the detail", () => {
    render(
      <MemoryRouter>
        <TransportadorasDetailContent transportadora={detalheAlteracao} onBack={() => undefined} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: /alterar/i })).toBeEnabled();
  });

  it("fills the inclusion form from the selected transportadora", () => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/transportadoras/nova", state: { alterFrom: detalheAlteracao } },
        ]}
      >
        <TransportadoraLeaveProvider>
          <TransportadoraInclusaoForm />
        </TransportadoraLeaveProvider>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Código")).toHaveValue("999999");
    expect(screen.getByLabelText("Nome *")).toHaveValue("XXXX");
    expect(screen.getByRole("button", { name: "Salvar alteração" })).toBeInTheDocument();
  });
});

describe("mapProtheusMunicipioResponse", () => {
  it("maps MUNICIPIOS into unique options with code, name and state", () => {
    const municipios = mapProtheusMunicipioResponse({
      MUNICIPIOS: [
        { codmun: "11804", municipio: "CANAPOLIS", estado: "MG" },
        { codmun: "06105", municipio: "CANAPOLIS", estado: "BA" },
        { municipio: "SEM CODIGO", estado: "SP" },
      ],
    });

    expect(municipios).toEqual([
      { codMun: "11804", municipio: "CANAPOLIS", estado: "MG" },
      { codMun: "06105", municipio: "CANAPOLIS", estado: "BA" },
    ]);
    expect(municipioOptionKey(municipios[0])).toBe("11804|MG");
    expect(municipioOptionKey(municipios[1])).toBe("06105|BA");
  });
});
