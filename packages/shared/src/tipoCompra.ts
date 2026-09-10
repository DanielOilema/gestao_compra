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

const isTipoCompra = (value: string): value is TipoCompra =>
  value === "1" || value === "2" || value === "3" || value === "4";

export const mapProtheusTipoCompra = (raw?: string | number): TipoCompra | undefined => {
  const key = String(raw ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (!key) return undefined;
  if (isTipoCompra(key)) return key;
  if (key === "normal") return "1";
  if (key === "urgente") return "2";
  if (key.includes("imediato") || key.includes("direto")) return "3";
  if (key.includes("regulariza")) return "4";
  return undefined;
};
