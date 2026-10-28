import React from "react";
import { RefreshCw } from "lucide-react";
import { KANBAN_SOLICITACAO_COLUMNS } from "@gestao-compra/shared";
import {
  Alert,
  AlertDescription,
  Button,
  cn,
  Skeleton,
} from "@gestao-compra/ui";
import { useAcompanhamentoSolicitacoes } from "@/hooks/useAcompanhamentoSolicitacoes";
import AcompanhamentoFiltros from "@/components/solicitacoes/acompanhamento/AcompanhamentoFiltros";
import KanbanSolicitacoes from "@/components/solicitacoes/acompanhamento/KanbanSolicitacoes";
import SolicitacaoCompraDetailDialog from "@/components/solicitacoes/listagem/SolicitacaoCompraDetailDialog";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";

const KanbanSkeleton: React.FC = () => (
  <>
    <div className="space-y-3 md:hidden" aria-hidden>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
    <div className="hidden min-h-0 flex-1 gap-3 overflow-hidden md:flex" aria-hidden>
      {KANBAN_SOLICITACAO_COLUMNS.map((column) => (
        <div key={column.status} className="min-w-0 flex-1 basis-0 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ))}
    </div>
  </>
);

const AcompanhamentoSolicitacoesPage: React.FC = () => {
  const {
    numero,
    setNumero,
    solicitante,
    setSolicitante,
    comprador,
    setComprador,
    tipoCompra,
    setTipoCompra,
    solicitacoes,
    naoReconhecidas,
    hasNextPage,
    isLoading,
    error,
    detailOpen,
    detailRequest,
    detailLoading,
    detailError,
    retry,
    selectSolicitacao,
    retryDetail,
    closeDetail,
  } = useAcompanhamentoSolicitacoes();

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={retry} disabled={isLoading}>
          <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      <AcompanhamentoFiltros
        numero={numero}
        onNumeroChange={setNumero}
        solicitante={solicitante}
        comprador={comprador}
        tipoCompra={tipoCompra}
        disabled={isLoading}
        onSolicitanteChange={setSolicitante}
        onCompradorChange={setComprador}
        onTipoCompraChange={setTipoCompra}
      />

      {naoReconhecidas.length > 0 && !isLoading && !error ? (
        <Alert>
          <AlertDescription>
            {naoReconhecidas.length === 1
              ? "1 solicitação veio com status fora das etapas do quadro e não foi exibida."
              : `${naoReconhecidas.length} solicitações vieram com status fora das etapas do quadro e não foram exibidas.`}
          </AlertDescription>
        </Alert>
      ) : null}

      {hasNextPage && !isLoading && !error ? (
        <p className="text-sm text-muted-foreground">Há mais solicitações além das exibidas nesta consulta.</p>
      ) : null}

      {isLoading ? (
        <KanbanSkeleton />
      ) : error ? (
        <div className="space-y-3 rounded-lg border p-6 text-center">
          <p className="text-sm font-medium text-foreground">Não foi possível carregar as solicitações.</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button type="button" onClick={retry}>
            Tentar novamente
          </Button>
        </div>
      ) : solicitacoes.length === 0 ? (
        naoReconhecidas.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhuma solicitação encontrada.
          </p>
        ) : null
      ) : (
        <KanbanSolicitacoes solicitacoes={solicitacoes} onSelectSolicitacao={selectSolicitacao} />
      )}

      <SolicitacaoCompraDetailDialog
        request={detailRequest}
        open={detailOpen}
        showActions={false}
        isLoading={detailLoading}
        error={detailError}
        onRetry={retryDetail}
        onOpenChange={(open) => {
          if (!open) closeDetail();
        }}
      />
    </div>
  );
};

export default AcompanhamentoSolicitacoesPage;

export const AcompanhamentoSolicitacoesRoute: React.FC = () => (
  <AppLayout fluid>
    <PageHeader title="Acompanhamento de solicitações" />
    <AcompanhamentoSolicitacoesPage />
  </AppLayout>
);
