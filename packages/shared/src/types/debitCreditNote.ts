import type { FormaPagamentoNotaDC } from "../formaPagamentoNotaDC";

export type NotaTipo = "debito" | "credito";

export interface NotaParte {
  nome: string;
  cnpj?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
}

export type NotaStatus =
  | "rascunho"
  | "pendente"
  | "processada"
  | "cancelada"
  | "aberto"
  | string;

export interface NotaItem {
  id: string;
  produto: string;
  descricao: string;
  valor: number;
  observacao?: string;
  codigoCentroCusto?: string;
  descricaoCentroCusto?: string;
}

export interface DebitCreditNote {
  id: string;
  numero: string;
  filial: string;
  tipo: NotaTipo;
  codigoCliFor: string;
  lojaCliFor: string;
  nomeCliFor: string;
  cnpj: string;
  dataEmissao: string;
  dataVencimento: string;
  responsavel: string;
  referenteA: string;
  natureza?: string;
  naturezaDescricao?: string;
  tes?: string;
  tesDescricao?: string;
  formaPagamento?: FormaPagamentoNotaDC;
  banco?: string;
  agencia?: string;
  conta?: string;
  nomeRecebedor?: string;
  cpfCnpjRecebedor?: string;
  setor?: string;
  numeroDoc?: string;
  nomeFilial?: string;
  enderecoFilial?: string;
  cgcFilial?: string;
  enderecoCliFor?: string;
  filialParte?: NotaParte;
  cliForParte?: NotaParte;
  recebedorParte?: NotaParte;
  tomadorParte?: NotaParte;
  empresaParte?: NotaParte;
  valorTotal: number;
  status: NotaStatus;
  itens: NotaItem[];
}

export interface NotaListRow {
  rowId: string;
  notaId: string;
  numero: string;
  filial: string;
  filialLabel: string;
  tipo: NotaTipo;
  nomeCliFor: string;
  dataEmissao: string;
  valorTotal: number;
  status: NotaStatus;
}

export interface NotaItemDraft {
  id: string;
  produto: string;
  produtoDescricao: string;
  valor: number;
  observacao?: string;
  centroCusto: string;
  centroCustoDescricao: string;
}

export interface NotaFormPayload {
  filial: string;
  tipo: NotaTipo;
  codigoCliFor: string;
  lojaCliFor: string;
  nomeCliFor: string;
  cnpj: string;
  dataEmissao: string;
  dataVencimento: string;
  referenteA: string;
  setor: string;
  natureza?: string;
  tes?: string;
  formaPagamento: FormaPagamentoNotaDC;
  banco?: string;
  agencia?: string;
  conta?: string;
  nomeRecebedor?: string;
  cpfCnpjRecebedor?: string;
  /** Débito: se true, Protheus gera a SC; se false, vincula à SC informada em `numSC`. */
  gerarSolicitacao?: boolean;
  /** Número da SC existente (débito, quando `gerarSolicitacao` é false). */
  numSC?: string;
  itens: Omit<NotaItemDraft, "id">[];
}

export interface IncluiNotaDCItemPayload {
  produto: string;
  valor: number;
  obs?: string;
  ccusto?: string;
}

/** Corpo enviado ao endpoint REST `financeiro/inclui_nota_deb_cred`. */
export interface IncluiNotaDebCreBody {
  filial: string;
  tipo: "C" | "D";
  emissao: string;
  vencto: string;
  clifor: string;
  loja: string;
  condPagto: FormaPagamentoNotaDC;
  banco: string;
  agencia: string;
  conta: string;
  setor: string;
  usuario: string;
  recebedor: string;
  cgcRecebedor: string;
  natureza?: string;
  tes?: string;
  referenteA: string;
  /** SC existente (6 caracteres) quando a nota de débito não gera nova SC. */
  numSC?: string;
  itens: IncluiNotaDCItemPayload[];
}

/** Normaliza o número da SC para 6 caracteres com zeros à esquerda. */
export function padNumSC(value: string): string {
  return value.trim().slice(-6).padStart(6, "0");
}

export interface IncluiNotaDCPayload {
  detNotaDebCre: IncluiNotaDebCreBody;
}

export interface IncluiNotaDCResult {
  mensagem: string;
  numero?: string;
}

export type CliForTipo = "C" | "F";

export const getCliForTipoFromNotaTipo = (tipo: NotaTipo): CliForTipo =>
  tipo === "credito" ? "C" : "F";

/** Parâmetro `tipo` do endpoint detNotaDebCre (C = crédito, D = débito). */
export const getDetNotaDebCreTipoParam = (tipo: NotaTipo): "C" | "D" =>
  tipo === "credito" ? "C" : "D";

export interface CliForOption {
  codigo: string;
  loja: string;
  nome: string;
  cnpj: string;
}

export function getNotaItemsTotal(nota: DebitCreditNote): number {
  if (nota.itens.length === 0) return nota.valorTotal;
  return nota.itens.reduce((sum, item) => sum + item.valor, 0);
}

export function getNotaDraftItemsTotal(itens: Array<{ valor: number }>): number {
  return itens.reduce((sum, item) => sum + (Number(item.valor) || 0), 0);
}
