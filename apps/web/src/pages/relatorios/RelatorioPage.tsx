import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import type { ReportDefinition, ReportModuleId } from "@gestao-compra/shared";
import { Alert, AlertDescription, Button, Card } from "@gestao-compra/ui";
import { ArrowLeft, Loader2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import ExportMenu from "@/components/relatorios/ExportMenu";
import RelatorioFilterBar from "@/components/relatorios/RelatorioFilterBar";
import RelatorioPagination from "@/components/relatorios/RelatorioPagination";
import RelatorioTable from "@/components/relatorios/RelatorioTable";
import { findReportDefinition } from "@/config/reports";
import { useRelatorioView } from "@/hooks/useRelatorioView";
import { useRelatoriosContext } from "./relatoriosContext";

/**
 * Renderizador genérico: qualquer relatório do catálogo é desenhado por esta página, a partir do
 * envelope devolvido pelo Protheus. Nenhuma regra de domínio pode entrar aqui.
 */
const RelatorioPage: React.FC = () => {
  const { modulo } = useRelatoriosContext();
  const { reportId } = useParams();

  const definition = useMemo(() => {
    const found = reportId ? findReportDefinition(reportId) : undefined;
    // Um relatório só é acessível pela URL do próprio módulo: o guard do layout validou a
    // permissão do módulo da URL, então aceitar um relatório de outro módulo aqui seria um
    // desvio de permissão.
    return found?.modulo === modulo ? found : undefined;
  }, [reportId, modulo]);

  if (!definition) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Relatório não encontrado"
          showBackToMenu={false}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link to={`/relatorios/${modulo}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Relatórios
              </Link>
            </Button>
          }
        />
        <Card className="max-w-2xl p-6">
          <p className="text-sm font-medium text-foreground">
            Este relatório não está disponível.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ele pode ter sido removido do catálogo ou pertencer a outro módulo.
          </p>
        </Card>
      </div>
    );
  }

  return <RelatorioPageContent key={definition.id} definition={definition} modulo={modulo} />;
};

interface RelatorioPageContentProps {
  definition: ReportDefinition;
  modulo: ReportModuleId;
}

const RelatorioPageContent: React.FC<RelatorioPageContentProps> = ({ definition, modulo }) => {
  const {
    draftFilters,
    setDraftFilters,
    lookups,
    envelope,
    visibleLinhas,
    hasConsulted,
    isLoading,
    error,
    page,
    hasNextPage,
    hasPreviousPage,
    handleNextPage,
    handlePreviousPage,
    handleConsultar,
    getExportPayload,
    canExport,
  } = useRelatorioView(definition);

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader
        title={definition.titulo}
        description={definition.descricao}
        showBackToMenu={false}
        actions={
          <div className="flex items-center gap-2">
            <ExportMenu getPayload={getExportPayload} disabled={!canExport} />
            <Button variant="outline" size="sm" asChild>
              <Link to={`/relatorios/${modulo}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Relatórios
              </Link>
            </Button>
          </div>
        }
      />

      <Card className="p-4 sm:p-6">
        <RelatorioFilterBar
          filtros={definition.filtros}
          values={draftFilters}
          onChange={setDraftFilters}
          onConsultar={() => {
            void handleConsultar();
          }}
          isLoading={isLoading}
          lookups={lookups}
        />
      </Card>

      {isLoading ? (
        <Card className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Consultando relatório...
        </Card>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!isLoading && !error && !hasConsulted ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Informe os filtros e clique em Consultar.
          </p>
        </Card>
      ) : null}

      {!isLoading && !error && hasConsulted && (envelope?.linhas.length ?? 0) === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Nenhum registro foi encontrado para os filtros selecionados.
          </p>
        </Card>
      ) : null}

      {!isLoading && !error && envelope && envelope.linhas.length > 0 ? (
        <>
          <RelatorioTable colunas={envelope.colunas} linhas={visibleLinhas} />
          <RelatorioPagination
            page={page}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
            isLoading={isLoading}
          />
        </>
      ) : null}
    </div>
  );
};

export default RelatorioPage;
