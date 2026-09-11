export const TIPO_ANTT_IDS = ['ETC', 'CTC', 'TAC'] as const;

export type TipoAntt = (typeof TIPO_ANTT_IDS)[number];

export interface TipoAnttOption {
  value: TipoAntt;
  label: string;
}

export const TIPO_ANTT_OPTIONS: TipoAnttOption[] = [
  { value: 'ETC', label: 'ETC - EMPRESA DE TRANSPORTE DE CARGAS' },
  { value: 'CTC', label: 'CTC - COOPERATIVA DE TRANSPORTE DE CAR' },
  { value: 'TAC', label: 'TAC - TRANSPORTADOR AUTÔNOMO DE CARGAS' },
];

export const isTipoAntt = (value: string): value is TipoAntt =>
  (TIPO_ANTT_IDS as readonly string[]).includes(value);

export const getTipoAnttLabel = (value: string): string =>
  TIPO_ANTT_OPTIONS.find((option) => option.value === value)?.label ?? value;
