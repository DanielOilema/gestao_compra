import { useCallback, useMemo, useState } from "react";
import {
  buildDefaultReportFilters,
  RELATORIO_HOSP_PASS_ID,
  RELATORIO_PC_SETORES_ID,
  RELATORIO_SC_SETORES_ID,
  type ReportDefinition,
  type ReportEnvelope,
} from "@gestao-compra/shared";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getRelatorioHospPass } from "@/hooks/getRelatorioHospPass";
import { getRelatorioPcSetores } from "@/hooks/getRelatorioPcSetores";
import { getRelatorioScSetores } from "@/hooks/getRelatorioScSetores";
import { useReportLookups } from "@/hooks/useReportLookups";
import { buildRelatorioHospPassExportPayload } from "@/lib/relatorios/buildRelatorioHospPassExportPayload";
import { buildRelatorioPcSetoresExportPayload } from "@/lib/relatorios/buildRelatorioPcSetoresExportPayload";
import { buildRelatorioScSetoresExportPayload } from "@/lib/relatorios/buildRelatorioScSetoresExportPayload";
import { validateReportFilters } from "@/lib/relatorios/validateReportFilters";
import type { ExportPayload } from "@/lib/export/types";

export const RELATORIO_PAGE_SIZE = 50;

const fetchEnvelope = async (
  reportId: string,
  query: Record<string, string>,
  basicAuth: string,
): Promise<ReportEnvelope> => {
  if (reportId === RELATORIO_SC_SETORES_ID) {
    return getRelatorioScSetores({
      dtInicial: query.dtInicial,
      dtFinal: query.dtFinal,
      grupoAprovacao: query.grupoAprovacao,
      basicAuth,
    });
  }

  if (reportId === RELATORIO_PC_SETORES_ID) {
    return getRelatorioPcSetores({
      dtInicial: query.dtInicial,
      dtFinal: query.dtFinal,
      grupoAprovacao: query.grupoAprovacao,
      basicAuth,
    });
  }

  if (reportId === RELATORIO_HOSP_PASS_ID) {
    return getRelatorioHospPass({
      dtInicial: query.dtInicial,
      dtFinal: query.dtFinal,
      basicAuth,
    });
  }

  throw new Error("Relatório ainda não disponível.");
};

export function useRelatorioView(definition: ReportDefinition) {
  const { protheusAuth } = useAuth();
  const lookups = useReportLookups(definition.filtros);
  const [draftFilters, setDraftFilters] = useState<Record<string, string>>(() =>
    buildDefaultReportFilters(definition.filtros),
  );
  const [appliedQuery, setAppliedQuery] = useState<Record<string, string> | null>(null);
  const [envelope, setEnvelope] = useState<ReportEnvelope | null>(null);
  const [hasConsulted, setHasConsulted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const handleConsultar = useCallback(async () => {
    const validation = validateReportFilters(definition.filtros, draftFilters);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    if (!protheusAuth) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEnvelope(null);
    setHasConsulted(true);
    setPage(1);

    try {
      const result = await fetchEnvelope(definition.id, validation.query, protheusAuth);
      setEnvelope(result);
      setAppliedQuery(validation.query);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao consultar o relatório.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [definition, draftFilters, protheusAuth]);

  const linhas = envelope?.linhas ?? [];
  const pageCount = Math.max(1, Math.ceil(linhas.length / RELATORIO_PAGE_SIZE));
  const visibleLinhas = useMemo(() => {
    const allRows = envelope?.linhas ?? [];
    return allRows.slice((page - 1) * RELATORIO_PAGE_SIZE, page * RELATORIO_PAGE_SIZE);
  }, [envelope?.linhas, page]);

  const grupoFonteOpcoes = definition.filtros.find((filtro) => filtro.key === "grupoAprovacao")
    ?.fonteOpcoes;

  const grupoLabel = useMemo(() => {
    const codigo = appliedQuery?.grupoAprovacao ?? draftFilters.grupoAprovacao ?? "";
    const options = (grupoFonteOpcoes ? lookups[grupoFonteOpcoes]?.options : undefined) ?? [];
    return options.find((option) => option.valor === codigo)?.label ?? codigo;
  }, [appliedQuery, draftFilters.grupoAprovacao, grupoFonteOpcoes, lookups]);

  const getExportPayload = useCallback((): ExportPayload => {
    if (!envelope || !appliedQuery) {
      return {
        colunas: envelope?.colunas ?? [],
        linhas: [],
        meta: { titulo: definition.titulo },
      };
    }

    if (definition.id === RELATORIO_SC_SETORES_ID) {
      return buildRelatorioScSetoresExportPayload({
        envelope,
        dtInicial: appliedQuery.dtInicial,
        dtFinal: appliedQuery.dtFinal,
        grupoLabel,
      });
    }

    if (definition.id === RELATORIO_PC_SETORES_ID) {
      return buildRelatorioPcSetoresExportPayload({
        envelope,
        dtInicial: appliedQuery.dtInicial,
        dtFinal: appliedQuery.dtFinal,
        grupoLabel,
      });
    }

    if (definition.id === RELATORIO_HOSP_PASS_ID) {
      return buildRelatorioHospPassExportPayload({
        envelope,
        dtInicial: appliedQuery.dtInicial,
        dtFinal: appliedQuery.dtFinal,
      });
    }

    return {
      colunas: envelope.colunas,
      linhas: envelope.linhas,
      meta: { titulo: envelope.titulo || definition.titulo },
    };
  }, [appliedQuery, definition, envelope, grupoLabel]);

  return {
    draftFilters,
    setDraftFilters,
    lookups,
    envelope,
    visibleLinhas,
    hasConsulted,
    isLoading,
    error,
    page,
    hasNextPage: page < pageCount && linhas.length > 0,
    hasPreviousPage: page > 1,
    handleNextPage: () => setPage((current) => current + 1),
    handlePreviousPage: () => setPage((current) => Math.max(1, current - 1)),
    handleConsultar,
    getExportPayload,
    canExport: !isLoading && linhas.length > 0,
  };
}
