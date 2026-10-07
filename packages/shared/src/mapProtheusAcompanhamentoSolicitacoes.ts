import {
  type AprovacaoSolicitacao,
  type AprovadorSolicitacao,
  type CotacaoFornecedor,
  type CotacaoProduto,
  type CotacaoSolicitacao,
  type NotaFiscalSolicitacao,
  type PedidoSolicitacao,
  type PedidoSolicitacaoItem,
  type SolicitacaoAcompanhamento,
  type SolicitacaoAcompanhamentoItem,
  type SolicitacaoStatusNaoReconhecido,
  type StatusAcompanhamentoSolicitacao,
} from "./types/acompanhamentoSolicitacao";
import { mapProtheusTipoCompra } from "./tipoCompra";

export interface MapAcompanhamentoSolicitacoesResult {
  solicitacoes: SolicitacaoAcompanhamento[];
  naoReconhecidas: SolicitacaoStatusNaoReconhecido[];
  lineCount: number;
}

const STATUS_BY_KEY: Record<string, StatusAcompanhamentoSolicitacao> = {
  bloqueada: "BLOQUEADA",
  bloqueadas: "BLOQUEADA",
  aprovada: "APROVADA",
  aprovadas: "APROVADA",
  em_cotacao: "EM_COTACAO",
  emcotacao: "EM_COTACAO",
  pedido: "PEDIDO",
  pedidos: "PEDIDO",
  pre_nota: "PRE_NOTA",
  prenota: "PRE_NOTA",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asText = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
};

const readField = (record: Record<string, unknown>, keys: readonly string[]): string => {
  const wanted = new Set(keys.map((key) => key.toLowerCase()));
  for (const [key, value] of Object.entries(record)) {
    if (!wanted.has(key.toLowerCase())) continue;
    const text = asText(value);
    if (text) return text;
  }
  return "";
};

const readNumber = (record: Record<string, unknown>, keys: readonly string[]): number | undefined => {
  const wanted = new Set(keys.map((key) => key.toLowerCase()));
  for (const [key, value] of Object.entries(record)) {
    if (!wanted.has(key.toLowerCase()) || value == null || value === "") continue;
    const parsed = typeof value === "number" ? value : Number(String(value).replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const readArray = (record: Record<string, unknown>, keys: readonly string[]): unknown[] | undefined => {
  const wanted = new Set(keys.map((key) => key.toLowerCase()));
  for (const [key, value] of Object.entries(record)) {
    if (wanted.has(key.toLowerCase()) && Array.isArray(value)) return value;
  }
  return undefined;
};

const readObject = (
  record: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> | undefined => {
  const wanted = new Set(keys.map((key) => key.toLowerCase()));
  for (const [key, value] of Object.entries(record)) {
    if (wanted.has(key.toLowerCase()) && isRecord(value)) return value;
  }
  return undefined;
};

const parseDate = (raw: string): string => {
  const value = raw.trim();
  if (!value) return "";
  const yearFirst = /^(\d{4})[/-](\d{2})[/-](\d{2})/.exec(value);
  if (yearFirst) return `${yearFirst[1]}-${yearFirst[2]}-${yearFirst[3]}`;
  if (/^\d{8}$/.test(value)) return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  const br = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(value);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  return value;
};

const normalizeStatusKey = (raw: string): string =>
  raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");

/** Traduz o status já enviado pelo Protheus. Valor fora da lista fica sem raia. */
export const mapStatusAcompanhamento = (
  raw?: string,
): StatusAcompanhamentoSolicitacao | undefined => {
  const key = normalizeStatusKey(raw ?? "");
  if (!key) return undefined;
  return STATUS_BY_KEY[key];
};

const defined = <T extends object>(value: T): T | undefined => {
  const hasContent = Object.values(value).some((entry) => {
    if (entry == null || entry === "") return false;
    if (Array.isArray(entry)) return entry.length > 0;
    return true;
  });
  return hasContent ? value : undefined;
};

const mapAprovador = (value: unknown): AprovadorSolicitacao | undefined => {
  if (!isRecord(value)) return undefined;
  return defined({
    nome: readField(value, ["nome", "aprovador", "usuario", "user"]) || undefined,
    status: readField(value, ["status", "situacao"]) || undefined,
    dataHora: readField(value, ["dataHora", "datahora", "data", "quando"]) || undefined,
    observacao: readField(value, ["observacao", "observacoes", "obs"]) || undefined,
  });
};

const mapPeople = (values: unknown[] | undefined): AprovadorSolicitacao[] | undefined => {
  if (!values) return undefined;
  const mapped = values.map(mapAprovador).filter((entry): entry is AprovadorSolicitacao => !!entry);
  return mapped.length > 0 ? mapped : undefined;
};

const mapAprovacao = (record: Record<string, unknown>): AprovacaoSolicitacao | undefined => {
  const source = readObject(record, ["aprovacao", "aprovacoes"]);
  if (!source) return undefined;
  return defined({
    aprovadores: mapPeople(readArray(source, ["aprovadores", "aprovador"])),
    historico: mapPeople(readArray(source, ["historico"])),
    observacoes: readField(source, ["observacoes", "observacao", "obs"]) || undefined,
  });
};

const mapFornecedor = (value: unknown): CotacaoFornecedor | undefined => {
  if (typeof value === "string" && value.trim()) return { nome: value.trim() };
  if (!isRecord(value)) return undefined;
  const nome = readField(value, ["nome", "fornecedor", "descricao"]);
  const escolhidoRaw = readField(value, ["escolhido", "vencedor"]).toLowerCase();
  return defined({
    nome: nome || undefined,
    escolhido: escolhidoRaw === "true" || escolhidoRaw === "s" || escolhidoRaw === "sim" || undefined,
  });
};

const mapProdutoCotacao = (value: unknown): CotacaoProduto | undefined => {
  if (!isRecord(value)) return undefined;
  return defined({
    codigo: readField(value, ["codigo", "produto"]) || undefined,
    descricao: readField(value, ["descricao", "desc"]) || undefined,
    quantidade: readNumber(value, ["quantidade", "quant", "qtd"]),
    preco: readNumber(value, ["preco", "precoUnitario", "valor"]),
  });
};

const mapCotacao = (value: unknown): CotacaoSolicitacao | undefined => {
  if (!isRecord(value)) return undefined;
  const fornecedores = readArray(value, ["fornecedores", "fornecedor"])
    ?.map(mapFornecedor)
    .filter((entry): entry is CotacaoFornecedor => !!entry);
  const produtos = readArray(value, ["produtos", "itens"])
    ?.map(mapProdutoCotacao)
    .filter((entry): entry is CotacaoProduto => !!entry);
  return defined({
    numero: readField(value, ["numero", "numcot", "cotacao"]) || undefined,
    fornecedores: fornecedores && fornecedores.length > 0 ? fornecedores : undefined,
    produtos: produtos && produtos.length > 0 ? produtos : undefined,
    condicoesComerciais: readField(value, ["condicoesComerciais", "condicoes", "condicao"]) || undefined,
    fornecedorEscolhido: readField(value, ["fornecedorEscolhido", "vencedor"]) || undefined,
    status: readField(value, ["status", "situacao"]) || undefined,
  });
};

const mapPedidoItem = (value: unknown): PedidoSolicitacaoItem | undefined => {
  if (!isRecord(value)) return undefined;
  return defined({
    item: readField(value, ["item"]) || undefined,
    produto: readField(value, ["produto", "codigo"]) || undefined,
    descricao: readField(value, ["descricao"]) || undefined,
    quantidade: readNumber(value, ["quantidade", "quant", "qtd"]),
    valor: readNumber(value, ["valor", "preco"]),
  });
};

const mapPedido = (value: unknown): PedidoSolicitacao | undefined => {
  if (!isRecord(value)) return undefined;
  const itens = readArray(value, ["itens", "produtos"])
    ?.map(mapPedidoItem)
    .filter((entry): entry is PedidoSolicitacaoItem => !!entry);
  return defined({
    numero: readField(value, ["numero", "numpc", "pedido"]) || undefined,
    fornecedor: readField(value, ["fornecedor", "nomeFornecedor"]) || undefined,
    data: parseDate(readField(value, ["data", "emissao", "dataPedido"])) || undefined,
    valor: readNumber(value, ["valor", "total"]),
    itens: itens && itens.length > 0 ? itens : undefined,
    status: readField(value, ["status", "situacao"]) || undefined,
  });
};

const mapNota = (value: unknown): NotaFiscalSolicitacao | undefined => {
  if (!isRecord(value)) return undefined;
  return defined({
    numero: readField(value, ["numero", "numnf", "nota"]) || undefined,
    fornecedor: readField(value, ["fornecedor"]) || undefined,
    data: parseDate(readField(value, ["data", "emissao", "dtentrada"])) || undefined,
    valor: readNumber(value, ["valor", "total"]),
    chaveNfe: readField(value, ["chaveNfe", "chave", "chavenfe"]) || undefined,
    statusEntrada: readField(value, ["statusEntrada", "status", "situacao"]) || undefined,
  });
};

const mapItem = (value: unknown): SolicitacaoAcompanhamentoItem | undefined => {
  if (!isRecord(value)) return undefined;
  return defined({
    item: readField(value, ["item"]) || undefined,
    produto: readField(value, ["produto", "codigo"]) || undefined,
    descricao: readField(value, ["descricao"]) || undefined,
    quantidade: readNumber(value, ["quantidade", "quant", "qtd"]),
    centroCusto: readField(value, ["centroCusto", "cc", "ccusto"]) || undefined,
  });
};

const mapList = <T>(values: unknown[] | undefined, mapItemFn: (value: unknown) => T | undefined): T[] | undefined => {
  if (!values) return undefined;
  const mapped = values.map(mapItemFn).filter((entry): entry is T => entry != null);
  return mapped.length > 0 ? mapped : undefined;
};

const extractList = (res: unknown): unknown[] => {
  if (Array.isArray(res)) return res;
  if (!isRecord(res)) return [];

  const preferred = ["solicitacoes", "acompanhamento", "items", "data", "lista", "scs"];
  const entries = Object.entries(res);
  for (const key of preferred) {
    const match = entries.find(([name]) => name.toLowerCase() === key);
    if (match && Array.isArray(match[1])) return match[1];
  }

  for (const [, value] of entries) {
    if (Array.isArray(value) && value.length > 0 && isRecord(value[0])) return value;
  }

  return [];
};

interface ParsedLine {
  key: string;
  id: string;
  numero: string;
  filial?: string;
  status?: StatusAcompanhamentoSolicitacao;
  statusInformado: string;
  solicitacao?: SolicitacaoAcompanhamento;
  explicitQuantidade: boolean;
}

const parseLine = (value: unknown): ParsedLine | undefined => {
  if (!isRecord(value)) return undefined;

  const numero = readField(value, ["numero", "numsc", "numerosc", "sc"]);
  if (!numero) return undefined;

  const filial = readField(value, ["filial"]) || undefined;
  const statusInformado = readField(value, ["statusAtual", "status", "situacao", "estagio", "etapa"]);
  const status = mapStatusAcompanhamento(statusInformado);
  const itens = mapList(readArray(value, ["itens"]), mapItem);
  const quantidadeExplicita = readNumber(value, ["quantidadeItens", "qtdItens", "qtdeItens"]);
  const quantidadeItens = quantidadeExplicita ?? (itens ? itens.length : undefined);
  const id = filial ? `SC-${filial}-${numero}` : `SC-${numero}`;

  const solicitacao: SolicitacaoAcompanhamento | undefined = status
    ? {
        id,
        numero,
        filial,
        solicitante: readField(value, ["solicitante"]) || undefined,
        dataSolicitacao:
          parseDate(
            readField(value, [
              "dataSolicitacao",
              "dataEmissao",
              "dtEmissao",
              "emissao",
              "data",
            ]),
          ) || undefined,
        tipoCompra: mapProtheusTipoCompra(
          readField(value, ["tipoCompra", "tpcompra", "tipo"]),
        ),
        statusAtual: status,
        quantidadeItens,
        observacoes: readField(value, ["observacoes", "observacao", "obs"]) || undefined,
        centroCusto: readField(value, ["centroCusto", "cc", "ccusto"]) || undefined,
        itens,
        aprovacao: mapAprovacao(value),
        cotacoes: mapList(readArray(value, ["cotacoes", "cotacao"]), mapCotacao),
        pedidos: mapList(readArray(value, ["pedidos", "pedido"]), mapPedido),
        notasFiscais: mapList(readArray(value, ["notasFiscais", "notas", "prenotas"]), mapNota),
      }
    : undefined;

  return {
    key: `${filial ?? ""}|${numero}`,
    id,
    numero,
    filial,
    status,
    statusInformado,
    solicitacao,
    explicitQuantidade: quantidadeExplicita != null || (itens?.length ?? 0) > 0,
  };
};

const preferText = (current?: string, next?: string): string | undefined => current || next || undefined;

const preferList = <T>(current?: T[], next?: T[]): T[] | undefined =>
  current && current.length > 0 ? current : next;

const mergeSolicitacao = (
  current: SolicitacaoAcompanhamento,
  next: SolicitacaoAcompanhamento,
): SolicitacaoAcompanhamento => ({
  ...current,
  solicitante: preferText(current.solicitante, next.solicitante),
  dataSolicitacao: preferText(current.dataSolicitacao, next.dataSolicitacao),
  tipoCompra: current.tipoCompra ?? next.tipoCompra,
  observacoes: preferText(current.observacoes, next.observacoes),
  centroCusto: preferText(current.centroCusto, next.centroCusto),
  itens: preferList(current.itens, next.itens),
  aprovacao: current.aprovacao ?? next.aprovacao,
  cotacoes: preferList(current.cotacoes, next.cotacoes),
  pedidos: preferList(current.pedidos, next.pedidos),
  notasFiscais: preferList(current.notasFiscais, next.notasFiscais),
});

interface GroupBucket {
  id: string;
  numero: string;
  filial?: string;
  statuses: StatusAcompanhamentoSolicitacao[];
  statusInformado: string[];
  solicitacao?: SolicitacaoAcompanhamento;
  explicitQuantidade?: number;
  linhas: number;
  desconhecido: boolean;
}

/**
 * Converte o retorno do Protheus em solicitações do quadro.
 * `lineCount` é o total de registros da página (base da paginação).
 * Status fora das etapas do Kanban fica em `naoReconhecidas`.
 */
export const mapProtheusAcompanhamentoSolicitacoesResponse = (
  res: unknown,
): MapAcompanhamentoSolicitacoesResult => {
  const lines = extractList(res);
  const groups = new Map<string, GroupBucket>();

  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed) continue;

    const existing = groups.get(parsed.key);
    if (!existing) {
      groups.set(parsed.key, {
        id: parsed.id,
        numero: parsed.numero,
        filial: parsed.filial,
        statuses: parsed.status ? [parsed.status] : [],
        statusInformado: parsed.statusInformado ? [parsed.statusInformado] : [],
        solicitacao: parsed.solicitacao,
        explicitQuantidade: parsed.explicitQuantidade ? parsed.solicitacao?.quantidadeItens : undefined,
        linhas: 1,
        desconhecido: !parsed.status,
      });
      continue;
    }

    existing.linhas += 1;
    if (!parsed.status) existing.desconhecido = true;
    if (parsed.status && !existing.statuses.includes(parsed.status)) {
      existing.statuses.push(parsed.status);
    }
    if (parsed.statusInformado && !existing.statusInformado.includes(parsed.statusInformado)) {
      existing.statusInformado.push(parsed.statusInformado);
    }
    if (parsed.solicitacao) {
      existing.solicitacao = existing.solicitacao
        ? mergeSolicitacao(existing.solicitacao, parsed.solicitacao)
        : parsed.solicitacao;
    }
    if (parsed.explicitQuantidade && parsed.solicitacao?.quantidadeItens != null) {
      existing.explicitQuantidade = Math.max(
        existing.explicitQuantidade ?? 0,
        parsed.solicitacao.quantidadeItens,
      );
    }
  }

  const solicitacoes: SolicitacaoAcompanhamento[] = [];
  const naoReconhecidas: SolicitacaoStatusNaoReconhecido[] = [];

  for (const group of groups.values()) {
    const statusUnico = group.statuses.length === 1 ? group.statuses[0] : undefined;
    if (group.desconhecido || !statusUnico || !group.solicitacao) {
      naoReconhecidas.push({
        id: group.id,
        numero: group.numero,
        filial: group.filial,
        statusInformado: group.statusInformado.join(", "),
      });
      continue;
    }

    const quantidadeItens =
      group.explicitQuantidade ?? (group.linhas > 1 ? group.linhas : group.solicitacao.quantidadeItens);

    solicitacoes.push({
      ...group.solicitacao,
      statusAtual: statusUnico,
      quantidadeItens,
    });
  }

  return {
    solicitacoes,
    naoReconhecidas,
    lineCount: lines.length,
  };
};
