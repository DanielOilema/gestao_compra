import { useOutletContext } from "react-router-dom";
import type { ReportModuleId } from "@gestao-compra/shared";

export interface RelatoriosOutletContext {
  modulo: ReportModuleId;
}

/** Disponível apenas em rotas filhas de RelatoriosLayout, onde o módulo já foi validado. */
export const useRelatoriosContext = (): RelatoriosOutletContext =>
  useOutletContext<RelatoriosOutletContext>();
