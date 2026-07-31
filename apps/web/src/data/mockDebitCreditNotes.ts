import type { DebitCreditNote } from "@gestao-compra/shared";

/** Dados mock legados — a listagem real usa a API Protheus. */
export const mockDebitCreditNotes: DebitCreditNote[] = [
  {
    id: "NDC-0101-000001",
    numero: "000001",
    filial: "0101",
    tipo: "debito",
    codigoCliFor: "000001",
    lojaCliFor: "01",
    nomeCliFor: "Cliente Exemplo",
    cnpj: "00.000.000/0001-00",
    dataEmissao: "2026-01-10",
    dataVencimento: "2026-02-10",
    responsavel: "admin",
    referenteA: "Ajuste de frete",
    valorTotal: 1500,
    status: "pendente",
    itens: [
      {
        id: "1",
        produto: "000001",
        descricao: "Frete",
        valor: 1500,
      },
    ],
  },
];
