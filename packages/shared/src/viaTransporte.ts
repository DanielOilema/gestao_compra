export const VIA_TRANSPORTE_IDS = [
  'RODOVIARIO',
  'AEREO',
  'MARITIMO',
  'FERROVIARIO',
  'FLUVIAL',
] as const;

export type ViaTransporte = (typeof VIA_TRANSPORTE_IDS)[number];

export interface ViaTransporteOption {
  value: ViaTransporte;
  label: string;
}

export const VIA_TRANSPORTE_OPTIONS: ViaTransporteOption[] = [
  { value: 'RODOVIARIO', label: 'Rodoviário' },
  { value: 'AEREO', label: 'Aéreo' },
  { value: 'MARITIMO', label: 'Marítimo' },
  { value: 'FERROVIARIO', label: 'Ferroviário' },
  { value: 'FLUVIAL', label: 'Fluvial' },
];

export const isViaTransporte = (value: string): value is ViaTransporte =>
  (VIA_TRANSPORTE_IDS as readonly string[]).includes(value);

export const getViaTransporteLabel = (value: string): string =>
  VIA_TRANSPORTE_OPTIONS.find((option) => option.value === value)?.label ?? value;
