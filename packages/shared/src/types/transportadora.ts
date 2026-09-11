import type { TipoAntt } from '../tipoAntt';
import type { ViaTransporte } from '../viaTransporte';

export const ACAO_INCLUI_TRANSPORTADORA = 'incluir' as const;

export interface TransportadoraListItem {
  codigo: string;
  nome: string;
  cgc: string;
}

export interface TransportadoraDetalhe {
  codigo: string;
  nome: string;
  nomeReduzido: string;
  via: string;
  endereco: string;
  bairro: string;
  municipio: string;
  estado: string;
  cep: string;
  ddd: string;
  telefone: string;
  cgc: string;
  tipoAntt: string;
  inscEstadual: string;
  email: string;
  antt: string;
  codMunicipio: string;
}

export interface TransportadoraFormDraft {
  nome: string;
  nomeReduzido: string;
  via: ViaTransporte | '';
  endereco: string;
  bairro: string;
  municipio: string;
  codMunicipio: string;
  estado: string;
  cep: string;
  ddd: string;
  telefone: string;
  cgc: string;
  tipoAntt: TipoAntt | '';
  inscEstadual: string;
  email: string;
  antt: string;
}

export interface IncluiTransportadoraPayload {
  nome: string;
  nomeReduzido: string;
  via: string;
  endereco: string;
  bairro: string;
  municipio: string;
  estado: string;
  cep: string;
  ddd: string;
  telefone: string;
  cgc: string;
  tipoAntt: string;
  inscEstadual: string;
  email: string;
  antt: string;
  acao: typeof ACAO_INCLUI_TRANSPORTADORA;
  codMunicipio: string;
  codMun: string;
}

export interface IncluiTransportadoraResult {
  mensagem: string;
  codigo?: string;
}

export type TransportadoraFormErrors = Partial<Record<keyof TransportadoraFormDraft, string>>;
