import {
  padNumSC,
  type CliForOption,
  type DebitCreditNote,
  type IncluiNotaDCPayload,
  type NotaFormPayload,
  type NotaItem,
  type NotaListRow,
  type NotaParte,
  type NotaStatus,
  type NotaTipo,
} from "./types/debitCreditNote";
import type { FormaPagamentoNotaDC } from "./formaPagamentoNotaDC";
import { formatFilialLabel } from "./flattenPurchaseRequests";

const t = (v: unknown) => {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
};

const readField = (record: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) {
    const match = Object.entries(record).find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (match) {
      const value = t(match[1]);
      if (value) return value;
    }
  }
  return "";
};

const readNumber = (record: Record<string, unknown>, ...keys: string[]): number => {
  for (const key of keys) {
    const match = Object.entries(record).find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (!match || match[1] == null) continue;
    const n = Number(match[1]);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
};

const extractArray = (res: Record<string, unknown>, preferredKeys: string[]): unknown[] => {
  if (Array.isArray(res)) return res;

  for (const key of preferredKeys) {
    const match = Object.entries(res).find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (match && Array.isArray(match[1])) return match[1];
  }

  for (const value of Object.values(res)) {
    if (Array.isArray(value) && value.length > 0) return value;
  }

  return [];
};

const parseDate = (raw?: string): string => {
  const s = t(raw);
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // YYYY/MM/DD or YYYY-MM-DD
  const ymd = s.match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})$/);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;
  // DD/MM/YYYY or DD-MM-YYYY
  const br = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  return s.replace(/\//g, "-");
};

export const mapNotaTipo = (raw?: string): NotaTipo => {
  const key = t(raw)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (!key) return "debito";

  if (key === "c" || key === "credito" || key.startsWith("cred")) return "credito";
  if (key === "d" || key === "debito" || key.startsWith("deb")) return "debito";

  return "debito";
};

export const mapNotaStatus = (raw?: string): NotaStatus => {
  const key = t(raw)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (!key) return "aberto";
  if (key.includes("cancel")) return "cancelada";
  if (key.includes("process") || key.includes("atendid")) return "processada";
  if (key.includes("pend")) return "pendente";
  if (key.includes("rascun")) return "rascunho";
  return key;
};

const mapLineToNota = (row: Record<string, unknown>): DebitCreditNote => {
  const filial = readField(row, "filial", "filialsc");
  const numero = readField(row, "codigo", "numero", "numnota", "nota", "numeroNota");
  const rawTipo = readField(row, "tipo", "tiponota", "tipodc", "tpdebcre");
  const condPagto = readField(row, "condPagto", "condpagto", "formaPagamento");
  const tipo = mapNotaTipo(rawTipo || (condPagto === "6" ? "C" : condPagto ? "D" : ""));
  const codigoCliFor = readField(row, "clifor", "codcli", "codfor", "cliente", "fornecedor");
  const lojaCliFor = readField(row, "loja", "lojcli", "lojfor") || "01";
  const nomeCliFor = readField(row, "nome", "razao", "razaosocial", "nomecli", "nomefor");
  const valorTotal = readNumber(row, "valor", "valortotal", "total", "vlrtotal");

  return {
    id: `NDC-${filial}-${numero}`,
    numero,
    filial,
    tipo,
    codigoCliFor,
    lojaCliFor,
    nomeCliFor,
    cnpj: readField(row, "cnpj", "cgc", "cpf"),
    dataEmissao: parseDate(readField(row, "emissao", "dataemissao", "data", "dtemissao")),
    dataVencimento: parseDate(
      readField(row, "vencto", "vencimento", "datavencimento", "dtvencimento"),
    ),
    responsavel: readField(row, "responsavel", "user", "usuario", "emissor"),
    referenteA: readField(row, "referentea", "referente", "observacao", "obs", "descricao"),
    natureza: readField(row, "natureza", "codnatureza") || undefined,
    naturezaDescricao: readField(row, "descnatureza", "naturezadescricao") || undefined,
    tes: readField(row, "tes", "codtes") || undefined,
    tesDescricao: readField(row, "desctes", "tesdescricao") || undefined,
    valorTotal,
    status: mapNotaStatus(readField(row, "status", "situacao")),
    itens: [],
  };
};

export interface MapProtheusNotasResult {
  notas: DebitCreditNote[];
  lineCount: number;
}

export const mapProtheusNotasDebitoCreditoResponse = (
  res: Record<string, unknown>,
): MapProtheusNotasResult => {
  const rows = extractArray(res, [
    "notasDebCred",
    "notas",
    "NOTAS",
    "notasDebitoCredito",
    "items",
    "data",
    "lista",
  ]);

  const notas = rows
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    .map(mapLineToNota)
    .filter((n) => n.numero || n.filial);

  return { notas, lineCount: notas.length };
};

export const flattenNotasToRows = (notas: DebitCreditNote[]): NotaListRow[] =>
  notas.map((nota) => ({
    rowId: nota.id,
    notaId: nota.id,
    numero: nota.numero,
    filial: nota.filial,
    filialLabel: formatFilialLabel(nota.filial),
    tipo: nota.tipo,
    nomeCliFor: nota.nomeCliFor,
    dataEmissao: nota.dataEmissao,
    valorTotal: nota.valorTotal,
    status: nota.status,
  }));


const parseFormaPagamento = (raw: string): FormaPagamentoNotaDC | undefined => {
  const value = raw.trim();
  if (value === "1" || value === "2" || value === "3" || value === "4" || value === "5" || value === "6") {
    return value;
  }
  return undefined;
};

const resolveNotaTipo = (
  rawTipo: string,
  condPagto?: string,
  fallback?: NotaTipo,
): NotaTipo => {
  if (rawTipo) return mapNotaTipo(rawTipo);
  if (fallback) return fallback;
  const forma = parseFormaPagamento(condPagto ?? "");
  if (forma === "6") return "credito";
  if (forma) return "debito";
  return "debito";
};

const extractDetNotaRecord = (res: Record<string, unknown>): Record<string, unknown> => {
  const match = Object.entries(res).find(([key]) => key.toLowerCase() === "detnotadebcre");
  if (match && typeof match[1] === "object" && match[1] !== null) {
    return match[1] as Record<string, unknown>;
  }
  return res;
};

const readNotaParte = (
  record: Record<string, unknown>,
  nomeKeys: string[],
  cnpjKeys: string[],
  addressKeys: {
    endereco?: string[];
    bairro?: string[];
    cidade?: string[];
    estado?: string[];
    cep?: string[];
    telefone?: string[];
  } = {},
): NotaParte | undefined => {
  const nome = readField(record, ...nomeKeys);
  if (!nome) return undefined;

  return {
    nome,
    cnpj: readField(record, ...cnpjKeys) || undefined,
    endereco: readField(record, ...(addressKeys.endereco ?? ["endereco", "end"])) || undefined,
    bairro: readField(record, ...(addressKeys.bairro ?? ["bairro"])) || undefined,
    cidade: readField(record, ...(addressKeys.cidade ?? ["cidade", "mun", "municipio"])) || undefined,
    estado: readField(record, ...(addressKeys.estado ?? ["estado", "uf"])) || undefined,
    cep: readField(record, ...(addressKeys.cep ?? ["cep"])) || undefined,
    telefone: readField(record, ...(addressKeys.telefone ?? ["telefone", "fone", "tel"])) || undefined,
  };
};

const readCliForCgc = (det: Record<string, unknown>): string => readField(det, "cgc");

const readFilialCgc = (det: Record<string, unknown>): string =>
  readField(det, "cgcFilial", "cgcfilial", "cnpjfilial", "cgcempresa");

const mapCliForParte = (
  det: Record<string, unknown>,
  cgcCliFor = readCliForCgc(det),
): NotaParte | undefined => {
  const nome = readField(det, "nome", "razao", "razaosocial", "nomecli", "nomefor");
  if (!nome) return undefined;

  const enderecoCliFor = readField(det, "enderecoCliFor", "endereoclifor");

  return {
    nome,
    cnpj: cgcCliFor || readField(det, "cnpj", "cpf", "cgccli", "cgcf") || undefined,
    endereco:
      enderecoCliFor ||
      readField(det, "endereco", "end", "endcli", "endfor") ||
      undefined,
    bairro: readField(det, "bairro") || undefined,
    cidade: readField(det, "cidade", "mun", "municipio") || undefined,
    estado: readField(det, "estado", "uf") || undefined,
    cep: readField(det, "cep") || undefined,
    telefone: readField(det, "telefone", "fone", "tel", "ddd") || undefined,
  };
};

const mapFilialParte = (
  det: Record<string, unknown>,
  cgcFilial = readFilialCgc(det),
): NotaParte | undefined => {
  const nome = readField(det, "nomeFilial", "nomefilial", "razaofilial");
  const enderecoFilial = readField(det, "enderecoFilial", "enderecofilial");

  if (!nome && !enderecoFilial) {
    return mapEmpresaParte(det);
  }

  return {
    nome: nome || "-",
    cnpj: cgcFilial || undefined,
    endereco: enderecoFilial || readField(det, "enderecoempresa", "endempresa") || undefined,
    telefone: readField(det, "telefoneFilial", "fonefilial", "telefoneempresa") || undefined,
  };
};

const mapRecebedorParte = (det: Record<string, unknown>): NotaParte | undefined =>
  readNotaParte(
    det,
    ["recebedor", "nomerecebedor"],
    ["cgcrecebedor", "cgcRecebedor", "cpfcnpjrecebedor"],
    {
      endereco: ["enderecorecebedor", "endrecebedor"],
      bairro: ["bairrorecebedor"],
      cidade: ["cidaderecebedor", "munrecebedor"],
      estado: ["estadorecebedor", "ufrecebedor"],
      cep: ["ceprecebedor"],
      telefone: ["telefonerecebedor", "fonerecebedor"],
    },
  );

const mapTomadorParte = (det: Record<string, unknown>): NotaParte | undefined =>
  readNotaParte(
    det,
    ["tomador", "nometomador", "pagador", "nomepagador"],
    ["cgctomador", "cnpjtomador", "cgcpagador", "cnpjpagador"],
    {
      endereco: ["enderecotomador", "endtomador", "enderecopagador"],
      bairro: ["bairrotomador", "bairropagador"],
      cidade: ["cidadetomador", "munpagador"],
      estado: ["estadotomador", "ufpagador"],
      cep: ["ceptomador", "ceppagador"],
      telefone: ["telefonetomador", "fonepagador"],
    },
  );

const mapEmpresaParte = (det: Record<string, unknown>): NotaParte | undefined =>
  readNotaParte(
    det,
    ["nomeempresa", "razaoempresa", "empresa", "nomefilial", "razaofilial"],
    ["cnpjempresa", "cgcempresa", "cnpjfilial", "cgcfilial"],
    {
      endereco: ["enderecoempresa", "endempresa", "enderecofilial"],
      bairro: ["bairroempresa", "bairrofilial"],
      cidade: ["cidadeempresa", "munfilial"],
      estado: ["estadoempresa", "uffilial"],
      cep: ["cepempresa", "cepfilial"],
      telefone: ["telefoneempresa", "fonefilial"],
    },
  );

export const mapProtheusDetNotaDebCreResponse = (
  res: Record<string, unknown>,
  header?: DebitCreditNote,
): DebitCreditNote => {
  const det = extractDetNotaRecord(res);
  const filial = readField(det, "filial") || header?.filial || "";
  const numero = readField(det, "codigo", "numero") || header?.numero || "";
  const condPagto = readField(det, "condPagto", "condpagto", "formaPagamento");
  const rawTipo = readField(det, "tipo", "tiponota", "tipodc");
  const tipo = resolveNotaTipo(rawTipo, condPagto, header?.tipo);

  const itensRows = extractArray(det, ["itens", "ITENS", "items"]);
  const itens = itensRows
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    .map((row, index) => {
      const produto = readField(row, "produto", "codigo", "codproduto");
      const ccusto = readField(row, "ccusto", "cc", "centrocusto");
      return {
        id: readField(row, "id", "item") || `${produto}-${index}`,
        produto,
        descricao: readField(row, "descricao", "descproduto", "nome"),
        valor: readNumber(row, "valor", "valortotal", "vlr", "preco"),
        observacao: readField(row, "obs", "observacao") || undefined,
        codigoCentroCusto: ccusto || undefined,
        descricaoCentroCusto: readField(row, "desccc", "descccusto") || undefined,
      } satisfies NotaItem;
    });

  const formaPagamento = parseFormaPagamento(condPagto) ?? header?.formaPagamento;

  const cgcCliFor = readCliForCgc(det);
  const cgcFilial = readFilialCgc(det);
  const cliForParte = mapCliForParte(det, cgcCliFor);
  const filialParte = mapFilialParte(det, cgcFilial);
  const recebedorParte = mapRecebedorParte(det);
  const tomadorParte = mapTomadorParte(det);
  const empresaParte = mapEmpresaParte(det);
  const nomeFilial = readField(det, "nomeFilial", "nomefilial") || header?.nomeFilial;
  const enderecoFilial =
    readField(det, "enderecoFilial", "enderecofilial") || header?.enderecoFilial;
  const enderecoCliFor =
    readField(det, "enderecoCliFor", "endereoclifor") || header?.enderecoCliFor;

  const valorTotal =
    itens.length > 0 ? itens.reduce((sum, item) => sum + item.valor, 0) : header?.valorTotal ?? 0;

  return {
    id: header?.id ?? `NDC-${filial}-${numero}`,
    numero,
    filial,
    tipo,
    codigoCliFor: readField(det, "clifor", "codcli", "codfor") || header?.codigoCliFor || "",
    lojaCliFor: readField(det, "loja", "lojcli", "lojfor") || header?.lojaCliFor || "01",
    nomeCliFor: readField(det, "nome", "razao", "razaosocial") || header?.nomeCliFor || "",
    cnpj: cgcCliFor || readField(det, "cnpj", "cpf", "cgccli") || header?.cnpj || "",
    dataEmissao: parseDate(readField(det, "emissao", "dataemissao")) || header?.dataEmissao || "",
    dataVencimento:
      parseDate(readField(det, "vencto", "vencimento", "datavencimento")) ||
      header?.dataVencimento ||
      "",
    responsavel: readField(det, "usuario", "user", "responsavel") || header?.responsavel || "",
    referenteA:
      readField(det, "referenteA", "referente", "referentea") || header?.referenteA || "",
    natureza: readField(det, "natureza", "codnatureza") || header?.natureza,
    naturezaDescricao:
      readField(det, "descnatureza", "naturezadescricao") || header?.naturezaDescricao,
    tes: readField(det, "tes", "codtes") || header?.tes,
    tesDescricao: readField(det, "desctes", "tesdescricao") || header?.tesDescricao,
    formaPagamento,
    banco: readField(det, "banco") || header?.banco,
    agencia: readField(det, "agencia") || header?.agencia,
    conta: readField(det, "conta") || header?.conta,
    nomeRecebedor: readField(det, "recebedor", "nomerecebedor") || header?.nomeRecebedor,
    cpfCnpjRecebedor:
      readField(det, "cgcRecebedor", "cgcrecebedor", "cpfcnpjrecebedor") || header?.cpfCnpjRecebedor,
    setor: readField(det, "setor") || header?.setor,
    numeroDoc: readField(det, "numeroDoc", "numerodoc") || header?.numeroDoc,
    nomeFilial,
    enderecoFilial,
    cgcFilial: cgcFilial || header?.cgcFilial,
    enderecoCliFor,
    filialParte: filialParte
      ? { ...filialParte, cnpj: cgcFilial || filialParte.cnpj }
      : header?.filialParte
        ? { ...header.filialParte, cnpj: cgcFilial || header.filialParte.cnpj }
        : undefined,
    cliForParte: cliForParte
      ? { ...cliForParte, cnpj: cgcCliFor || cliForParte.cnpj }
      : header?.cliForParte
        ? { ...header.cliForParte, cnpj: cgcCliFor || header.cliForParte.cnpj }
        : undefined,
    recebedorParte: recebedorParte ?? header?.recebedorParte,
    tomadorParte: tomadorParte ?? header?.tomadorParte,
    empresaParte: empresaParte ?? header?.empresaParte,
    valorTotal,
    status: header?.status ?? "aberto",
    itens,
  };
};

export const mapProtheusCliForResponse = (res: Record<string, unknown>): CliForOption[] => {
  const rows = extractArray(res, ["listaCliFor", "clientes", "fornecedores", "clifor", "items", "data"]);

  return rows
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    .map((row) => ({
      codigo: readField(row, "codigo", "cod", "cliente", "fornecedor"),
      loja: readField(row, "loja") || "01",
      nome: readField(row, "nome", "razao", "razaosocial", "descricao"),
      cnpj: readField(row, "cnpj", "cgc", "cpf"),
    }))
    .filter((o) => o.codigo);
};

const isoToProtheusBrDate = (iso: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return iso;
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const mapNotaTipoToWire = (tipo: NotaTipo): "C" | "D" =>
  tipo === "credito" ? "C" : "D";

export const mapFormToIncluiNotaDCPayload = (
  form: NotaFormPayload,
  usuario: string,
): IncluiNotaDCPayload => {
  const vinculaScExistente =
    form.tipo === "debito" && form.gerarSolicitacao === false && Boolean(form.numSC?.trim());

  return {
    detNotaDebCre: {
      filial: form.filial,
      tipo: mapNotaTipoToWire(form.tipo),
      emissao: isoToProtheusBrDate(form.dataEmissao),
      vencto: isoToProtheusBrDate(form.dataVencimento),
      clifor: form.codigoCliFor,
      loja: form.lojaCliFor,
      condPagto: form.formaPagamento,
      banco: form.banco?.trim() ?? "",
      agencia: form.agencia?.trim() ?? "",
      conta: form.conta?.trim() ?? "",
      setor: form.setor,
      usuario,
      recebedor: form.nomeRecebedor?.trim() ?? "",
      cgcRecebedor: form.cpfCnpjRecebedor?.trim() ?? "",
      natureza: form.tipo === "credito" ? form.natureza : undefined,
      tes: form.tipo === "credito" ? form.tes : undefined,
      referenteA: form.referenteA,
      ...(vinculaScExistente ? { numSC: padNumSC(form.numSC!) } : {}),
      itens: form.itens.map((item) => ({
        produto: item.produto,
        valor: item.valor,
        obs: item.observacao?.trim() ?? "",
        ccusto:
          form.tipo === "debito"
            ? item.centroCusto
            : item.centroCusto?.trim()
              ? item.centroCusto
              : undefined,
      })),
    },
  };
};
