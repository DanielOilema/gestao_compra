export type TipoCompra =
  | "1"
  | "2"
  | "3"
  | "4";

export interface TipoCompraOption {
  value: TipoCompra;
  label: string;
}

export const TIPO_COMPRA_OPTIONS: TipoCompraOption[] = [
  { value: "1", label: "Normal" },
  { value: "2", label: "Urgente" },
  { value: "3", label: "Imediato/Direto" },
  { value: "4", label: "Regulariza" },
];

export const getTipoCompraLabel = (value: TipoCompra): string =>
  TIPO_COMPRA_OPTIONS.find((option) => option.value === value)?.label ?? value;
