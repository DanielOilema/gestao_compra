import type { ReportFilterDef, ReportFilterOption } from "@gestao-compra/shared";
import {
  RELATORIO_PC_SETORES_FILTRO_GRUPOS,
  RELATORIO_PC_SETORES_LOOKUP_GRUPOS,
  RELATORIO_SC_SETORES_LOOKUP_GRUPOS,
} from "@gestao-compra/shared";
import { useGruposAprovacao } from "@/hooks/useGruposAprovacao";
import { useGruposSolicitacoes } from "@/hooks/useGruposSolicitacoes";

export interface ReportFilterLookup {
  options: ReportFilterOption[];
  isLoading: boolean;
  error: string | null;
}

const lookupError = (error: unknown): string | null => {
  if (!error) return null;
  return error instanceof Error ? error.message : String(error);
};

export function useReportLookups(filtros: ReportFilterDef[]): Record<string, ReportFilterLookup> {
  const needsGruposSc = filtros.some(
    (filtro) => filtro.fonteOpcoes === RELATORIO_SC_SETORES_LOOKUP_GRUPOS,
  );
  const needsGruposPc = filtros.some(
    (filtro) => filtro.fonteOpcoes === RELATORIO_PC_SETORES_LOOKUP_GRUPOS,
  );
  const gruposSc = useGruposSolicitacoes(needsGruposSc);
  const gruposPc = useGruposAprovacao(RELATORIO_PC_SETORES_FILTRO_GRUPOS, needsGruposPc);

  const lookups: Record<string, ReportFilterLookup> = {};

  if (needsGruposSc) {
    lookups[RELATORIO_SC_SETORES_LOOKUP_GRUPOS] = {
      options: (gruposSc.data ?? []).map((grupo) => ({
        valor: grupo.codigo,
        label: grupo.descricao,
      })),
      isLoading: gruposSc.isLoading,
      error: lookupError(gruposSc.error),
    };
  }

  if (needsGruposPc) {
    lookups[RELATORIO_PC_SETORES_LOOKUP_GRUPOS] = {
      options: (gruposPc.data ?? []).map((grupo) => ({
        valor: grupo.codigo,
        label: grupo.descricao,
      })),
      isLoading: gruposPc.isLoading,
      error: lookupError(gruposPc.error),
    };
  }

  return lookups;
}
