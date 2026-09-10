import {
  getSetorNotaDCCodigo,
  getSetorNotaDCLabel,
  type DebitCreditNote,
  type FormaPagamentoNotaDC,
  type NotaItemDraft,
  type NotaTipo,
} from "@gestao-compra/shared";

export interface NovaNotaLocationState {
  copyFrom?: DebitCreditNote;
}

export interface NotaInclusaoDraft {
  filial: string;
  tipo: NotaTipo;
  cliForKey: string;
  cliForLabel: string;
  codigoCliFor: string;
  lojaCliFor: string;
  nomeCliFor: string;
  cnpj: string;
  referenteA: string;
  formaPagamento: FormaPagamentoNotaDC | "";
  banco: string;
  agencia: string;
  conta: string;
  nomeRecebedor: string;
  cpfCnpjRecebedor: string;
  setor: string;
  setorLabel: string;
  natureza: string;
  naturezaLabel: string;
  tes: string;
  tesLabel: string;
  itens: NotaItemDraft[];
}

export const emptyNotaInclusaoDraft = (): NotaInclusaoDraft => ({
  filial: "",
  tipo: "debito",
  cliForKey: "",
  cliForLabel: "",
  codigoCliFor: "",
  lojaCliFor: "",
  nomeCliFor: "",
  cnpj: "",
  referenteA: "",
  formaPagamento: "",
  banco: "",
  agencia: "",
  conta: "",
  nomeRecebedor: "",
  cpfCnpjRecebedor: "",
  setor: "",
  setorLabel: "",
  natureza: "",
  naturezaLabel: "",
  tes: "",
  tesLabel: "",
  itens: [],
});

const newDraftItemId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `item-${Math.random().toString(36).slice(2)}`;

const codeLabel = (codigo?: string, descricao?: string): string => {
  const code = codigo?.trim() ?? "";
  if (!code) return "";
  const desc = descricao?.trim() ?? "";
  return desc ? `${code} - ${desc}` : code;
};

export const mapNotaToInclusaoDraft = (nota: DebitCreditNote): NotaInclusaoDraft => {
  const codigoCliFor = nota.codigoCliFor?.trim() ?? "";
  const lojaCliFor = nota.lojaCliFor?.trim() ?? "";
  const nomeCliFor = nota.nomeCliFor?.trim() ?? "";
  const setor = getSetorNotaDCCodigo(nota.setor);
  const natureza = nota.natureza?.trim() ?? "";
  const tes = nota.tes?.trim() ?? "";

  return {
    filial: nota.filial?.trim() ?? "",
    tipo: nota.tipo,
    cliForKey: codigoCliFor && lojaCliFor ? `${codigoCliFor}|${lojaCliFor}` : "",
    cliForLabel:
      codigoCliFor && lojaCliFor
        ? `${codigoCliFor}/${lojaCliFor}${nomeCliFor ? ` - ${nomeCliFor}` : ""}`
        : "",
    codigoCliFor,
    lojaCliFor,
    nomeCliFor,
    cnpj: nota.cnpj?.trim() ?? "",
    referenteA: nota.referenteA?.trim() ?? "",
    formaPagamento: nota.formaPagamento ?? "",
    banco: nota.banco?.trim() ?? "",
    agencia: nota.agencia?.trim() ?? "",
    conta: nota.conta?.trim() ?? "",
    nomeRecebedor: nota.nomeRecebedor?.trim() ?? "",
    cpfCnpjRecebedor: nota.cpfCnpjRecebedor?.trim() ?? "",
    setor,
    setorLabel: setor ? getSetorNotaDCLabel(setor) : "",
    natureza,
    naturezaLabel: codeLabel(natureza, nota.naturezaDescricao),
    tes,
    tesLabel: codeLabel(tes, nota.tesDescricao),
    itens: nota.itens.map((item) => ({
      id: newDraftItemId(),
      produto: item.produto,
      produtoDescricao: item.descricao,
      valor: item.valor,
      observacao: item.observacao ?? "",
      centroCusto: item.codigoCentroCusto ?? "",
      centroCustoDescricao: item.descricaoCentroCusto ?? "",
    })),
  };
};
