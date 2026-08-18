import { getFormaPagamentoLabel } from "./formaPagamentoNotaDC";
import { getSetorNotaDCDescricao } from "./setorNotaDC";
import type { DebitCreditNote, NotaItem, NotaParte } from "./types/debitCreditNote";

export const formatNotaPrintDate = (date?: string): string => {
  if (!date) return "-";
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
    const [year, month, day] = date.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
  }
  const br = date.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (br) return `${br[1]}/${br[2]}/${br[3]}`;
  const ymd = date.match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})$/);
  if (ymd) return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;
  return date;
};

export const formatNotaPrintCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

export const getNotaPrintTitle = (tipo: DebitCreditNote["tipo"]): string =>
  tipo === "credito" ? "NOTA DE CRÉDITO" : "NOTA DE DÉBITO";

export const getNotaPrintNumeroLabel = (tipo: DebitCreditNote["tipo"]): string =>
  tipo === "credito" ? "Nota de Crédito Número" : "Nota de Débito Número";

export const formatNotaPrintCnpjCpf = (value?: string): string => {
  const raw = value?.trim() ?? "";
  if (!raw) return "";
  if (raw.toUpperCase().startsWith("CNPJ:") || raw.toUpperCase().startsWith("CPF:")) {
    return raw;
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return raw;
};

const withCnpjLabel = (cnpj?: string): string => {
  const formatted = formatNotaPrintCnpjCpf(cnpj);
  if (!formatted) return "";
  if (formatted.toUpperCase().startsWith("CNPJ:") || formatted.toUpperCase().startsWith("CPF:")) {
    return formatted;
  }

  const digits = formatted.replace(/\D/g, "");
  const label = digits.length === 11 ? "CPF" : "CNPJ";
  return `${label}: ${formatted}`;
};

const formatCidadeEstadoCep = (parte: NotaParte): string => {
  const cidadeEstado = [parte.cidade, parte.estado].filter(Boolean).join("-");
  const cep = parte.cep?.trim();
  if (cidadeEstado && cep) return `${cidadeEstado} ${cep}`;
  return cidadeEstado || cep || "";
};

const splitEnderecoLines = (endereco?: string): string[] => {
  if (!endereco?.trim()) return [];
  return endereco
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

export const formatNotaParteLines = (parte?: NotaParte): string[] => {
  if (!parte?.nome?.trim()) return ["-"];

  const lines = [parte.nome.trim()];
  const cnpj = withCnpjLabel(parte.cnpj);
  if (cnpj) lines.push(cnpj);

  const enderecoLines = splitEnderecoLines(parte.endereco);
  if (enderecoLines.length > 0) {
    lines.push(...enderecoLines);
  } else if (parte.endereco?.trim()) {
    lines.push(parte.endereco.trim());
  }

  if (parte.bairro?.trim()) lines.push(parte.bairro.trim());
  const cidadeLinha = formatCidadeEstadoCep(parte);
  if (cidadeLinha) lines.push(cidadeLinha);
  if (parte.telefone?.trim()) lines.push(parte.telefone.trim());
  return lines;
};

/** CGC da filial no detNotaDebCre — CNPJ da filial emissora. */
export const getNotaFilialCgc = (nota: DebitCreditNote): string =>
  nota.cgcFilial?.trim() ||
  nota.filialParte?.cnpj?.trim() ||
  nota.empresaParte?.cnpj?.trim() ||
  "";

export const getNotaFilialParte = (nota: DebitCreditNote): NotaParte => {
  const cgcFilial = getNotaFilialCgc(nota);

  if (nota.filialParte?.nome?.trim()) {
    return {
      ...nota.filialParte,
      cnpj: cgcFilial || undefined,
      endereco: nota.filialParte.endereco || nota.enderecoFilial,
    };
  }

  if (nota.empresaParte?.nome?.trim()) {
    return {
      ...nota.empresaParte,
      cnpj: cgcFilial || nota.empresaParte.cnpj || undefined,
      endereco: nota.empresaParte.endereco || nota.enderecoFilial,
    };
  }

  return {
    nome: nota.nomeFilial?.trim() || (nota.filial ? `Filial ${nota.filial}` : "-"),
    cnpj: cgcFilial || undefined,
    endereco: nota.enderecoFilial?.trim() || undefined,
  };
};

/** CGC do detNotaDebCre — CPF/CNPJ do cliente/fornecedor. */
export const getNotaCliForCgc = (nota: DebitCreditNote): string =>
  nota.cnpj?.trim() || nota.cliForParte?.cnpj?.trim() || "";

export const getNotaCliForParte = (nota: DebitCreditNote): NotaParte => {
  const cgc = getNotaCliForCgc(nota);

  if (nota.cliForParte?.nome?.trim()) {
    return {
      ...nota.cliForParte,
      cnpj: cgc || undefined,
      endereco: nota.cliForParte.endereco || nota.enderecoCliFor,
    };
  }

  return {
    nome: nota.nomeCliFor?.trim() || "-",
    cnpj: cgc || undefined,
    endereco: nota.enderecoCliFor?.trim() || undefined,
  };
};

/** Crédito: filial recebe. Débito: fornecedor recebe. */
export const getNotaRecebedorParte = (nota: DebitCreditNote): NotaParte =>
  nota.tipo === "credito" ? getNotaFilialParte(nota) : getNotaCliForParte(nota);

/** Crédito: cliente paga. Débito: filial paga. */
export const getNotaTomadorParte = (nota: DebitCreditNote): NotaParte =>
  nota.tipo === "credito" ? getNotaCliForParte(nota) : getNotaFilialParte(nota);

export const getNotaPrintItemDescription = (item: NotaItem): string => {
  const produto = item.produto?.trim() ?? "";
  const descricao = item.descricao?.trim() ?? "";

  let label = "-";
  if (produto && descricao) {
    label = `${produto}-${descricao}`;
  } else if (produto) {
    label = produto;
  } else if (descricao) {
    label = descricao;
  }

  const observacao = item.observacao?.trim();
  if (!observacao) return label;
  return `${label} (${observacao})`;
};

export const getNotaPrintItemCentroCusto = (item: NotaItem): string => {
  const codigo = item.codigoCentroCusto?.trim() ?? "";
  const descricao = item.descricaoCentroCusto?.trim() ?? "";

  if (codigo && descricao) return `${codigo}-${descricao}`;
  if (codigo) return codigo;
  if (descricao) return descricao;
  return "-";
};

export const getNotaPrintResponsavel = (nota: DebitCreditNote): string => {
  const setor = getSetorNotaDCDescricao(nota.setor);
  if (setor) return setor;
  return nota.responsavel?.trim() || "-";
};

export const getNotaPrintFormaPagamento = (nota: DebitCreditNote): string =>
  nota.formaPagamento ? getFormaPagamentoLabel(nota.formaPagamento) : "-";

export const getNotaPrintTotal = (nota: DebitCreditNote): number => {
  if (nota.itens.length > 0) {
    return nota.itens.reduce((sum, item) => sum + (Number(item.valor) || 0), 0);
  }
  return nota.valorTotal || 0;
};

export const getNotaPrintNumeroDoc = (nota: DebitCreditNote): string =>
  nota.numeroDoc?.trim() || "";
