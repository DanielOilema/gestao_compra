import type { TipoCompra } from "./tipoCompra";

const OFFSET_BY_TIPO: Record<TipoCompra, number> = {
  "1": 7, // Normal
  "2": 1, // Urgente
  "3": 0, // Imediato/Direto
  "4": 0, // Regulariza
};

const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getDefaultDataEntrega = (
  tipoCompra: TipoCompra,
  baseDate: Date = new Date(),
): string => {
  const offset = OFFSET_BY_TIPO[tipoCompra] ?? 0;
  const result = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  result.setDate(result.getDate() + offset);
  return toIsoDate(result);
};
