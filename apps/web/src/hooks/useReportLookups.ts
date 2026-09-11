import type { ReportFilterDef, ReportFilterOption } from "@gestao-compra/shared";
import { RELATORIO_SC_SETORES_LOOKUP_GRUPOS } from "@gestao-compra/shared";
import { useGruposSolicitacoes } from "@/hooks/useGruposSolicitacoes";

export interface ReportFilterLookup {
  options: ReportFilterOption[];
  isLoading: boolean;
  error: string | null;
}

export function useReportLookups(filtros: ReportFilterDef[]): Record<string, ReportFilterLookup> {
  const needsGrupos = filtros.some((filtro) => filtro.fonteOpcoes === RELATORIO_SC_SETORES_LOOKUP_GRUPOS);
  const grupos = useGruposSolicitacoes(needsGrupos);

  if (!needsGrupos) return {};

  return {
    [RELATORIO_SC_SETORES_LOOKUP_GRUPOS]: {
      options: (grupos.data ?? []).map((grupo) => ({
        valor: grupo.codigo,
        label: grupo.descricao,
      })),
      isLoading: grupos.isLoading,
      error: grupos.error instanceof Error ? grupos.error.message : grupos.error ? String(grupos.error) : null,
    },
  };
}
