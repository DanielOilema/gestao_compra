import type {
  RastroColuna,
  RastroCotacaoDoc,
  RastroCotacaoItem,
  RastroLigacao,
  RastroNo,
  RastroNoCotacao,
  RastroNoNota,
  RastroNoPedido,
  RastroNoSolicitacao,
  RastroNotaDoc,
  RastroNotaItem,
  RastroPedidoDoc,
  RastroPedidoItem,
  RastroSolicitacaoDoc,
  RastroSolicitacaoGrafo,
  RastroSolicitacaoItem,
} from "./types/rastroSolicitacao";

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

const readArray = (record: Record<string, unknown>, keys: readonly string[]): unknown[] => {
  const wanted = new Set(keys.map((key) => key.toLowerCase()));
  for (const [key, value] of Object.entries(record)) {
    if (wanted.has(key.toLowerCase()) && Array.isArray(value)) return value;
  }
  return [];
};

const optionalText = (value: string): string | undefined => value || undefined;

const uniqueId = (base: string, seen: Map<string, number>): string => {
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}#${count}`;
};

/** `AAAA/MM/DD` vira `dd/MM/aaaa`. Valor que não é data volta como veio. */
export const formatRastroData = (raw?: string): string => {
  const value = raw?.trim() ?? "";
  if (!value) return "";
  const yearFirst = /^(\d{4})[/-](\d{2})[/-](\d{2})/.exec(value);
  if (yearFirst) return `${yearFirst[3]}/${yearFirst[2]}/${yearFirst[1]}`;
  const br = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(value);
  if (br) return `${br[1]}/${br[2]}/${br[3]}`;
  if (/^\d{8}$/.test(value)) return `${value.slice(6, 8)}/${value.slice(4, 6)}/${value.slice(0, 4)}`;
  return value;
};

const isReferenciaPedido = (value?: string): boolean => {
  const text = value?.trim() ?? "";
  if (!text) return false;
  return !/^x+$/i.test(text);
};

const emptyGrafo = (invalido: boolean): RastroSolicitacaoGrafo => ({
  invalido,
  solicitacao: null,
  cotacoes: [],
  pedidos: [],
  notasFiscais: [],
  ligacoes: [],
});

const mapSolicitacaoItem = (value: unknown): RastroSolicitacaoItem | undefined => {
  if (!isRecord(value)) return undefined;
  const item: RastroSolicitacaoItem = {
    item: optionalText(readField(value, ["item"])),
    produto: optionalText(readField(value, ["produto"])),
    quantidade: readNumber(value, ["quantidade"]),
    centroCusto: optionalText(readField(value, ["centroCusto", "cc"])),
    observacao: optionalText(readField(value, ["observacao", "obs"])),
    unidadeMedida: optionalText(readField(value, ["unidadeMedida", "unidade"])),
  };
  return Object.values(item).some((entry) => entry != null && entry !== "") ? item : undefined;
};

const mapCotacaoItem = (value: unknown): RastroCotacaoItem | undefined => {
  if (!isRecord(value)) return undefined;
  const item: RastroCotacaoItem = {
    item: optionalText(readField(value, ["item"])),
    produto: optionalText(readField(value, ["produto"])),
    quantidade: readNumber(value, ["quantidade"]),
    preco: readNumber(value, ["preco"]),
    total: readNumber(value, ["total"]),
    desconto: readNumber(value, ["desconto"]),
    itemSC: optionalText(readField(value, ["itemSC", "itemSc"])),
    numPedido: optionalText(readField(value, ["numPedido"])),
    itemPedido: optionalText(readField(value, ["itemPedido"])),
  };
  return Object.values(item).some((entry) => entry != null && entry !== "") ? item : undefined;
};

const mapPedidoItem = (value: unknown): RastroPedidoItem | undefined => {
  if (!isRecord(value)) return undefined;
  const item: RastroPedidoItem = {
    item: optionalText(readField(value, ["item"])),
    produto: optionalText(readField(value, ["produto"])),
    quantidade: readNumber(value, ["quantidade"]),
    preco: readNumber(value, ["preco"]),
    total: readNumber(value, ["total"]),
    centroCusto: optionalText(readField(value, ["centroCusto", "cc"])),
  };
  return Object.values(item).some((entry) => entry != null && entry !== "") ? item : undefined;
};

const mapNotaItem = (value: unknown): RastroNotaItem | undefined => {
  if (!isRecord(value)) return undefined;
  const item: RastroNotaItem = {
    item: optionalText(readField(value, ["item"])),
    produto: optionalText(readField(value, ["produto"])),
    descricao: optionalText(readField(value, ["descricao"])),
    quantidade: readNumber(value, ["quantidade"]),
    valorUnitario: readNumber(value, ["valorUnitario", "preco"]),
    total: readNumber(value, ["total"]),
    tes: optionalText(readField(value, ["tes"])),
    centroCusto: optionalText(readField(value, ["centroCusto", "cc"])),
    pedido: optionalText(readField(value, ["pedido"])),
    itemPedido: optionalText(readField(value, ["itemPedido"])),
  };
  return Object.values(item).some((entry) => entry != null && entry !== "") ? item : undefined;
};

const mapItems = <T>(values: unknown[], mapItem: (value: unknown) => T | undefined): T[] =>
  values.map(mapItem).filter((item): item is T => item != null);

const mapSolicitacao = (value: unknown, seen: Map<string, number>): RastroNoSolicitacao | undefined => {
  if (!isRecord(value)) return undefined;
  const numero = readField(value, ["numero", "numSc", "numsc"]);
  const filial = readField(value, ["filial"]);
  if (!numero && !filial) return undefined;
  const documento: RastroSolicitacaoDoc = {
    numero,
    filial,
    emissao: optionalText(readField(value, ["emissao", "data"])),
    itens: mapItems(readArray(value, ["itens"]), mapSolicitacaoItem),
  };
  return {
    id: uniqueId(`solicitacao:${filial}:${numero}`, seen),
    tipo: "solicitacao",
    titulo: "Solicitação",
    subtitulo: numero || filial,
    documento,
  };
};

const mapCotacao = (value: unknown, seen: Map<string, number>): RastroNoCotacao | undefined => {
  if (!isRecord(value)) return undefined;
  const cotacao = readField(value, ["cotacao"]);
  const fornecedor = readField(value, ["fornecedor"]);
  const loja = readField(value, ["loja"]);
  const nomeFornecedor = optionalText(readField(value, ["nomeFornecedor"]));
  if (!cotacao && !fornecedor && !loja && !nomeFornecedor) return undefined;
  const documento: RastroCotacaoDoc = {
    cotacao,
    fornecedor,
    loja,
    nomeFornecedor,
    condPagto: optionalText(readField(value, ["condPagto", "condicaoPagamento"])),
    emissao: optionalText(readField(value, ["emissao", "data"])),
    itens: mapItems(readArray(value, ["itens"]), mapCotacaoItem),
  };
  return {
    id: uniqueId(`cotacao:${cotacao}:${fornecedor}:${loja}`, seen),
    tipo: "cotacao",
    titulo: "Cotação",
    subtitulo: nomeFornecedor || fornecedor || cotacao,
    documento,
  };
};

const mapPedido = (value: unknown, seen: Map<string, number>): RastroNoPedido | undefined => {
  if (!isRecord(value)) return undefined;
  const pedido = readField(value, ["pedido"]);
  const fornecedor = readField(value, ["fornecedor"]);
  const loja = readField(value, ["loja"]);
  const nomeFornecedor = optionalText(readField(value, ["nomeFornecedor"]));
  if (!pedido && !fornecedor && !loja && !nomeFornecedor) return undefined;
  const documento: RastroPedidoDoc = {
    pedido,
    fornecedor,
    loja,
    nomeFornecedor,
    emissao: optionalText(readField(value, ["emissao", "data"])),
    itens: mapItems(readArray(value, ["itens"]), mapPedidoItem),
  };
  return {
    id: uniqueId(`pedido:${pedido}:${fornecedor}:${loja}`, seen),
    tipo: "pedido",
    titulo: "Pedido",
    subtitulo: pedido || nomeFornecedor || fornecedor,
    documento,
  };
};

const notaIdentidade = (documento: string, serie: string, notaFiscal: string): { documento: string; serie: string; notaFiscal: string } => {
  if (documento || serie) {
    return {
      documento,
      serie,
      notaFiscal: notaFiscal || [documento, serie].filter(Boolean).join("-"),
    };
  }
  const separador = notaFiscal.lastIndexOf("-");
  if (separador > 0) {
    return {
      documento: notaFiscal.slice(0, separador),
      serie: notaFiscal.slice(separador + 1),
      notaFiscal,
    };
  }
  return { documento: notaFiscal, serie: "", notaFiscal };
};

const mapNota = (value: unknown, seen: Map<string, number>): RastroNoNota | undefined => {
  if (!isRecord(value)) return undefined;
  const fornecedor = readField(value, ["fornecedor"]);
  const loja = readField(value, ["loja"]);
  const nomeFornecedor = optionalText(readField(value, ["nomeFornecedor"]));
  const identidade = notaIdentidade(
    readField(value, ["documento"]),
    readField(value, ["serie"]),
    readField(value, ["notaFiscal", "nota"]),
  );
  if (!identidade.notaFiscal && !fornecedor && !loja && !nomeFornecedor) return undefined;
  const status = optionalText(readField(value, ["status"]));
  const documento: RastroNotaDoc = {
    fornecedor,
    loja,
    nomeFornecedor,
    notaFiscal: identidade.notaFiscal,
    documento: identidade.documento,
    serie: identidade.serie,
    status,
    emissao: optionalText(readField(value, ["emissao", "data"])),
    itens: mapItems(readArray(value, ["itens"]), mapNotaItem),
  };
  return {
    id: uniqueId(`nota:${identidade.documento}:${identidade.serie}:${fornecedor}:${loja}`, seen),
    tipo: "nota",
    titulo: "Nota Fiscal",
    subtitulo: identidade.notaFiscal || nomeFornecedor || fornecedor,
    documento,
  };
};

const mapLista = <T>(values: unknown[], mapItem: (value: unknown, seen: Map<string, number>) => T | undefined): T[] => {
  const seen = new Map<string, number>();
  return values.map((value) => mapItem(value, seen)).filter((item): item is T => item != null);
};

const cotacaoLigaPedido = (cotacao: RastroCotacaoDoc, pedido: RastroPedidoDoc): boolean =>
  !!pedido.pedido &&
  cotacao.itens.some((item) => isReferenciaPedido(item.numPedido) && item.numPedido?.trim() === pedido.pedido);

const pedidoLigaNota = (pedido: RastroPedidoDoc, nota: RastroNotaDoc): boolean =>
  !!pedido.pedido &&
  nota.itens.some((item) => isReferenciaPedido(item.pedido) && item.pedido?.trim() === pedido.pedido);

const ligar = (
  solicitacao: RastroNoSolicitacao | null,
  cotacoes: RastroNoCotacao[],
  pedidos: RastroNoPedido[],
  notas: RastroNoNota[],
): RastroLigacao[] => {
  const ligacoes: RastroLigacao[] = [];
  if (!solicitacao) return ligacoes;

  for (const cotacao of cotacoes) {
    ligacoes.push({ origemId: solicitacao.id, destinoId: cotacao.id });
  }

  const pedidosLigados = new Set<string>();
  for (const cotacao of cotacoes) {
    for (const pedido of pedidos) {
      if (!cotacaoLigaPedido(cotacao.documento, pedido.documento)) continue;
      ligacoes.push({ origemId: cotacao.id, destinoId: pedido.id });
      pedidosLigados.add(pedido.id);
    }
  }
  for (const pedido of pedidos) {
    if (!pedidosLigados.has(pedido.id)) {
      ligacoes.push({ origemId: solicitacao.id, destinoId: pedido.id });
    }
  }

  const notasLigadas = new Set<string>();
  for (const pedido of pedidos) {
    for (const nota of notas) {
      if (!pedidoLigaNota(pedido.documento, nota.documento)) continue;
      ligacoes.push({ origemId: pedido.id, destinoId: nota.id });
      notasLigadas.add(nota.id);
    }
  }
  for (const nota of notas) {
    if (!notasLigadas.has(nota.id)) {
      ligacoes.push({ origemId: solicitacao.id, destinoId: nota.id });
    }
  }

  return ligacoes;
};

const comoLista = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (isRecord(value)) return [value];
  return [];
};

/** Converte o JSON de `rastro_solicitacao_compra` no grafo do painel. */
export const mapProtheusRastroSolicitacao = (res: unknown): RastroSolicitacaoGrafo => {
  if (!isRecord(res)) return emptyGrafo(true);

  const solicitacoes = mapLista(comoLista(res.solicitacao ?? res.Solicitacao), mapSolicitacao);
  const cotacoes = mapLista(comoLista(res.cotacoes ?? res.cotacao), mapCotacao);
  const pedidos = mapLista(comoLista(res.pedidos ?? res.pedido), mapPedido);
  const notasFiscais = mapLista(comoLista(res.notasFiscais ?? res.notas ?? res.notaFiscal), mapNota);
  const solicitacao = solicitacoes[0] ?? null;

  return {
    invalido: false,
    solicitacao,
    cotacoes,
    pedidos,
    notasFiscais,
    ligacoes: ligar(solicitacao, cotacoes, pedidos, notasFiscais),
  };
};

/** Omite a etapa quando não há documentos. A solicitação entra sempre que existir. */
export const colunasDoRastro = (grafo: RastroSolicitacaoGrafo): RastroColuna[] => {
  if (!grafo.solicitacao) return [];
  const colunas: RastroColuna[] = [{ id: "solicitacao", nos: [grafo.solicitacao] }];
  if (grafo.cotacoes.length > 0) colunas.push({ id: "cotacao", nos: grafo.cotacoes });
  if (grafo.pedidos.length > 0) colunas.push({ id: "pedido", nos: grafo.pedidos });
  if (grafo.notasFiscais.length > 0) colunas.push({ id: "nota", nos: grafo.notasFiscais });
  return colunas;
};

export const encontrarNoRastro = (grafo: RastroSolicitacaoGrafo, id: string): RastroNo | undefined =>
  colunasDoRastro(grafo)
    .flatMap((coluna) => coluna.nos)
    .find((no) => no.id === id);
