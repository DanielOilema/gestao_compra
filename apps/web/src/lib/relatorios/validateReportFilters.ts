import {
  getPeriodoFilterKeys,
  type ReportFilterDef,
} from "@gestao-compra/shared";
import { toApiDate } from "@/lib/dateBr";

export type ReportFilterValidation =
  | { ok: true; query: Record<string, string> }
  | { ok: false; message: string };

const requiredMessage = (filtro: ReportFilterDef): string => {
  if (filtro.tipo === "selecao") {
    return `Selecione um ${filtro.label.toLowerCase()}.`;
  }
  return `Informe ${filtro.label.toLowerCase()}.`;
};

export function validateReportFilters(
  filtros: ReportFilterDef[],
  values: Record<string, string>,
): ReportFilterValidation {
  const query: Record<string, string> = {};

  for (const filtro of filtros) {
    if (filtro.tipo === "periodo") {
      const { inicial, final } = getPeriodoFilterKeys(filtro.key);
      const dtInicial = toApiDate(values[inicial]);
      const dtFinal = toApiDate(values[final]);

      if (filtro.obrigatorio && !dtInicial) {
        return { ok: false, message: "Informe a data inicial." };
      }
      if (filtro.obrigatorio && !dtFinal) {
        return { ok: false, message: "Informe a data final." };
      }
      if (dtInicial && dtFinal && dtInicial > dtFinal) {
        return {
          ok: false,
          message: "A data inicial deve ser menor ou igual à data final.",
        };
      }

      if (dtInicial) query[inicial] = dtInicial;
      if (dtFinal) query[final] = dtFinal;
      continue;
    }

    const value = (values[filtro.key] ?? "").trim();
    if (filtro.obrigatorio && !value) {
      return { ok: false, message: requiredMessage(filtro) };
    }
    if (value) query[filtro.key] = value;
  }

  return { ok: true, query };
}
