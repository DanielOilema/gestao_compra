import type { NotaTipo } from "./types/debitCreditNote";

export type FormaPagamentoNotaDC = "1" | "2" | "3" | "4" | "5" | "6";

export const FORMA_PAGAMENTO_CREDITO: FormaPagamentoNotaDC = "6";

export interface FormaPagamentoNotaDCOption {
  value: FormaPagamentoNotaDC;
  label: string;
}

export const FORMA_PAGAMENTO_DEBITO_OPTIONS: FormaPagamentoNotaDCOption[] = [
  { value: "1", label: "Abatimento de crédito" },
  { value: "2", label: "Dinheiro" },
  { value: "3", label: "Cartão corporativo" },
  { value: "4", label: "Depósito" },
  { value: "5", label: "Boleto" },
];

export const FORMA_PAGAMENTO_CREDITO_OPTION: FormaPagamentoNotaDCOption = {
  value: "6",
  label: "Crédito",
};

const ALL_OPTIONS: FormaPagamentoNotaDCOption[] = [
  ...FORMA_PAGAMENTO_DEBITO_OPTIONS,
  FORMA_PAGAMENTO_CREDITO_OPTION,
];

export const getFormaPagamentoLabel = (value: FormaPagamentoNotaDC): string =>
  ALL_OPTIONS.find((option) => option.value === value)?.label ?? value;

export const isDeposito = (forma: FormaPagamentoNotaDC | ""): boolean => forma === "4";

export const getFormaPagamentoOptionsForTipo = (
  tipo: NotaTipo,
): FormaPagamentoNotaDCOption[] =>
  tipo === "credito" ? [FORMA_PAGAMENTO_CREDITO_OPTION] : FORMA_PAGAMENTO_DEBITO_OPTIONS;

export interface NotaPagamentoInput {
  tipo: NotaTipo;
  formaPagamento: FormaPagamentoNotaDC | "";
  banco?: string;
  agencia?: string;
  conta?: string;
}

export interface NotaPagamentoValidationResult {
  valid: boolean;
  error?: string;
}

export const validateNotaPagamento = ({
  tipo,
  formaPagamento,
  banco = "",
  agencia = "",
  conta = "",
}: NotaPagamentoInput): NotaPagamentoValidationResult => {
  if (!formaPagamento) {
    return { valid: false, error: "Selecione a forma de pagamento" };
  }

  if (tipo === "credito" && formaPagamento !== FORMA_PAGAMENTO_CREDITO) {
    return {
      valid: false,
      error: "Recibos de crédito devem usar a forma de pagamento Crédito",
    };
  }

  if (tipo === "debito" && formaPagamento === FORMA_PAGAMENTO_CREDITO) {
    return {
      valid: false,
      error: "Recibos de débito não podem usar a forma de pagamento Crédito",
    };
  }

  if (tipo === "debito" && !FORMA_PAGAMENTO_DEBITO_OPTIONS.some((o) => o.value === formaPagamento)) {
    return { valid: false, error: "Forma de pagamento inválida para recibo de débito" };
  }

  if (isDeposito(formaPagamento)) {
    if (!banco.trim()) {
      return { valid: false, error: "Informe o banco para pagamento por depósito" };
    }
    if (!agencia.trim()) {
      return { valid: false, error: "Informe a agência para pagamento por depósito" };
    }
    if (!conta.trim()) {
      return { valid: false, error: "Informe a conta para pagamento por depósito" };
    }
  }

  return { valid: true };
};
