import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mapProtheusLogAprovacao } from "@gestao-compra/shared";
import SolicitacaoCompraLogAprovacao from "@/components/solicitacoes/listagem/SolicitacaoCompraLogAprovacao";

const useLogAprovacao = vi.fn();

vi.mock("@/hooks/useLogAprovacao", () => ({
  useLogAprovacao: (...args: unknown[]) => useLogAprovacao(...args),
}));

describe("mapProtheusLogAprovacao", () => {
  it("maps the Protheus approval log payload", () => {
    const result = mapProtheusLogAprovacao({
      LOG_APROVACAO: [
        {
          filial: "0101",
          numero: "010136",
          tipo: "SC",
          usuario: "andrews.andrade",
          status: "Pendente",
          nivel: "01",
        },
      ],
    });

    expect(result).toEqual([
      {
        filial: "0101",
        numero: "010136",
        tipo: "SC",
        usuario: "andrews.andrade",
        status: "Pendente",
        nivel: "01",
      },
    ]);
  });

  it("reads numeric level and ignores empty rows", () => {
    const result = mapProtheusLogAprovacao({
      log_aprovacao: [{ usuario: "admin", status: "Aprovado", nivel: 2 }, {}],
    });

    expect(result).toEqual([
      {
        filial: "",
        numero: "",
        tipo: "",
        usuario: "admin",
        status: "Aprovado",
        nivel: "2",
      },
    ]);
  });
});

describe("SolicitacaoCompraLogAprovacao", () => {
  it("shows the approval log of the selected request", () => {
    useLogAprovacao.mockReturnValue({
      data: [
        {
          filial: "0101",
          numero: "010146",
          tipo: "SC",
          usuario: "andrews.andrade",
          status: "Pendente",
          nivel: "01",
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(React.createElement(SolicitacaoCompraLogAprovacao, { filial: "0101", numDoc: "010146" }));

    expect(useLogAprovacao).toHaveBeenCalledWith("0101", "010146");
    expect(screen.getByText("Log de aprovação (1)")).toBeInTheDocument();
    expect(screen.getAllByText("andrews.andrade").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pendente").length).toBeGreaterThan(0);
    expect(screen.getAllByText("01").length).toBeGreaterThan(0);
  });

  it("shows an empty message when the log has no rows", () => {
    useLogAprovacao.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(React.createElement(SolicitacaoCompraLogAprovacao, { filial: "0101", numDoc: "010146" }));

    expect(screen.getByText("Nenhum registro no log de aprovação.")).toBeInTheDocument();
  });
});
