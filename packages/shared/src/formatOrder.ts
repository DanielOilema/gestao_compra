import { Order } from "./types/order";

const filialStateMap: Record<string, string> = {
  "0101": "Oilema Comércio BA",
  "0102": "Oilema Comércio TO",
  "0103": "Oilema Comércio MT",
  "0104": "Oilema Comércio MA",
  "0105": "Oilema Comércio GO",
  "0106": "Oilema Comércio PA",
  "0107": "Oilema Comércio PI",
  "0201": "Sementes Oilema",
  "0301": "Oilema Participações",
};

export const getFilialState = (filial: string): string => {
  return filialStateMap[filial] || filial;
};

export const formatOrderDisplay = (order: Order): string => {
  const state = getFilialState(order.filial);
  const numeroLimpo = order.numero.replace(/\D/g, "");
  const numeroSequencial = numeroLimpo.slice(-6).padStart(6, "0");
  return `${numeroSequencial} (${state})`;
};
