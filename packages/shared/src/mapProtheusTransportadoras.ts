import { isTipoAntt, mapProtheusTipoAntt } from './tipoAntt';
import {
  ACAO_ALTERA_TRANSPORTADORA,
  ACAO_INCLUI_TRANSPORTADORA,
  type AcaoTransportadora,
  type IncluiTransportadoraPayload,
  type IncluiTransportadoraResult,
  type TransportadoraDetalhe,
  type TransportadoraFormDraft,
  type TransportadoraFormErrors,
  type TransportadoraListItem,
} from './types/transportadora';
import { isViaTransporte, mapProtheusViaTransporte } from './viaTransporte';

const t = (v: unknown) => {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
};

const readField = (record: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) {
    const match = Object.entries(record).find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (match) {
      const value = t(match[1]);
      if (value) return value;
    }
  }
  return '';
};

const extractArray = (res: Record<string, unknown>, preferredKeys: string[]): unknown[] => {
  if (Array.isArray(res)) return res;

  for (const key of preferredKeys) {
    const match = Object.entries(res).find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (match && Array.isArray(match[1])) return match[1];
  }

  for (const value of Object.values(res)) {
    if (Array.isArray(value)) return value;
  }

  return [];
};

const emptyDetalhe = (): TransportadoraDetalhe => ({
  codigo: '',
  nome: '',
  nomeReduzido: '',
  via: '',
  endereco: '',
  bairro: '',
  municipio: '',
  estado: '',
  cep: '',
  ddd: '',
  telefone: '',
  cgc: '',
  tipoAntt: '',
  inscEstadual: '',
  email: '',
  antt: '',
  codMunicipio: '',
});

const mapDetalheRecord = (
  record: Record<string, unknown>,
  header?: TransportadoraListItem,
): TransportadoraDetalhe => ({
  codigo: readField(record, 'codigo', 'code', 'cod') || header?.codigo || '',
  nome: readField(record, 'nome', 'name', 'razaoSocial', 'razaosocial') || header?.nome || '',
  nomeReduzido: readField(record, 'nomeReduzido', 'nomereduzido', 'fantasia'),
  via: readField(record, 'via', 'viaTransp', 'viatransp'),
  endereco: readField(record, 'endereco', 'end', 'address'),
  bairro: readField(record, 'bairro'),
  municipio: readField(record, 'municipio', 'cidade', 'mun'),
  estado: readField(record, 'estado', 'uf'),
  cep: readField(record, 'cep'),
  ddd: readField(record, 'ddd'),
  telefone: readField(record, 'telefone', 'fone', 'tel'),
  cgc: readField(record, 'cgc', 'cnpj', 'cpf') || header?.cgc || '',
  tipoAntt: readField(record, 'tipoAntt', 'tipoantt'),
  inscEstadual: readField(record, 'inscEstadual', 'inscestadual', 'ie'),
  email: readField(record, 'email'),
  antt: readField(record, 'antt', 'rntrc'),
  codMunicipio: readField(record, 'codMunicipio', 'codmunicipio', 'codMun', 'codmun'),
});

export const mapProtheusTransportadorasList = (res: unknown): TransportadoraListItem[] => {
  const record = Array.isArray(res)
    ? { transportadoras: res }
    : ((res ?? {}) as Record<string, unknown>);

  const rows = extractArray(record, ['transportadoras', 'items', 'data']);

  return rows
    .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .map((row) => ({
      codigo: readField(row, 'codigo', 'code', 'cod'),
      nome: readField(row, 'nome', 'name', 'razaoSocial', 'razaosocial'),
      cgc: readField(row, 'cgc', 'cnpj', 'cpf'),
    }))
    .filter((item) => item.codigo);
};

export const mapProtheusTransportadoraDetalhe = (
  res: unknown,
  header?: TransportadoraListItem,
): TransportadoraDetalhe => {
  if (!res || typeof res !== 'object') {
    return header
      ? { ...emptyDetalhe(), codigo: header.codigo, nome: header.nome, cgc: header.cgc }
      : emptyDetalhe();
  }

  const record = res as Record<string, unknown>;
  const nested = Object.entries(record).find(
    ([key, value]) =>
      key.toLowerCase() === 'transportadora' && typeof value === 'object' && value !== null,
  )?.[1] as Record<string, unknown> | undefined;

  return mapDetalheRecord(nested ?? record, header);
};

const digitsOrText = (value: string, digitsOnly: boolean) => {
  const trimmed = value.trim();
  if (!digitsOnly) return trimmed;
  return trimmed.replace(/\D/g, '') || trimmed;
};

export const emptyTransportadoraFormDraft = (): TransportadoraFormDraft => ({
  codigo: '',
  nome: '',
  nomeReduzido: '',
  via: '',
  endereco: '',
  bairro: '',
  municipio: '',
  codMunicipio: '',
  estado: '',
  cep: '',
  ddd: '',
  telefone: '',
  cgc: '',
  tipoAntt: '',
  inscEstadual: '',
  email: '',
  antt: '',
});

export const mapDetalheToTransportadoraDraft = (
  detalhe: TransportadoraDetalhe,
): TransportadoraFormDraft => ({
  codigo: detalhe.codigo.trim(),
  nome: detalhe.nome,
  nomeReduzido: detalhe.nomeReduzido,
  via: mapProtheusViaTransporte(detalhe.via) ?? (isViaTransporte(detalhe.via) ? detalhe.via : ''),
  endereco: detalhe.endereco,
  bairro: detalhe.bairro,
  municipio: detalhe.municipio,
  codMunicipio: detalhe.codMunicipio,
  estado: detalhe.estado.trim().toUpperCase(),
  cep: detalhe.cep,
  ddd: detalhe.ddd,
  telefone: detalhe.telefone,
  cgc: detalhe.cgc,
  tipoAntt: mapProtheusTipoAntt(detalhe.tipoAntt) ?? (isTipoAntt(detalhe.tipoAntt) ? detalhe.tipoAntt : ''),
  inscEstadual: detalhe.inscEstadual,
  email: detalhe.email,
  antt: detalhe.antt,
});

export const validateTransportadoraForm = (
  draft: TransportadoraFormDraft,
): TransportadoraFormErrors => {
  const errors: TransportadoraFormErrors = {};
  if (!draft.nome.trim()) errors.nome = 'Informe o nome';
  if (!draft.via || !isViaTransporte(draft.via)) errors.via = 'Selecione a via de transporte';
  if (!draft.cgc.trim()) errors.cgc = 'Informe o CPF/CNPJ';
  if (!draft.tipoAntt || !isTipoAntt(draft.tipoAntt)) errors.tipoAntt = 'Selecione o tipo ANTT';
  if (!draft.antt.trim()) errors.antt = 'Informe o RNTRC';
  return errors;
};

export const mapFormToIncluiTransportadoraPayload = (
  draft: TransportadoraFormDraft,
  options?: { acao?: AcaoTransportadora },
): IncluiTransportadoraPayload => {
  const acao = options?.acao ?? ACAO_INCLUI_TRANSPORTADORA;
  const codigo = draft.codigo.trim();

  return {
    nome: draft.nome.trim(),
    nomeReduzido: draft.nomeReduzido.trim(),
    via: draft.via,
    endereco: draft.endereco.trim(),
    bairro: draft.bairro.trim(),
    municipio: draft.municipio.trim(),
    estado: draft.estado.trim().toUpperCase(),
    cep: digitsOrText(draft.cep, true),
    ddd: digitsOrText(draft.ddd, true),
    telefone: digitsOrText(draft.telefone, true),
    cgc: digitsOrText(draft.cgc, true),
    tipoAntt: draft.tipoAntt,
    inscEstadual: draft.inscEstadual.trim(),
    email: draft.email.trim(),
    antt: draft.antt.trim(),
    acao,
    ...(acao === ACAO_ALTERA_TRANSPORTADORA && codigo ? { codigo } : {}),
    codMunicipio: draft.codMunicipio.trim(),
    codMun: draft.codMunicipio.trim(),
  };
};

export const mapProtheusIncluiTransportadoraResponse = (
  res: unknown,
): IncluiTransportadoraResult => {
  const record = (res && typeof res === 'object' ? res : {}) as Record<string, unknown>;
  const mensagem =
    readField(record, 'mensagem', 'message', 'descricao') || 'Transportadora incluída com sucesso';
  const codigo = readField(record, 'codigo', 'code');
  return codigo ? { mensagem, codigo } : { mensagem };
};
