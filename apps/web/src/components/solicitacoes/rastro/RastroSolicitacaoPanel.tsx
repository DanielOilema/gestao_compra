import React, { useState } from "react";
import { encontrarNoRastro } from "@gestao-compra/shared";
import { Button } from "@gestao-compra/ui";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRastroSolicitacao } from "@/hooks/useRastroSolicitacao";
import RastroDocumentoDetalhe from "./RastroDocumentoDetalhe";
import RastroGrafo from "./RastroGrafo";

interface RastroSolicitacaoPanelProps {
  filial: string;
  numero: string;
  onBack: () => void;
}

const RastroTopo: React.FC<{ onBack: () => void; titulo: string; descricao: string }> = ({
  onBack,
  titulo,
  descricao,
}) => (
  <div className="flex items-center gap-3 pr-8 sm:gap-4">
    <Button type="button" variant="ghost" size="icon" onClick={onBack} className="shrink-0" aria-label="Voltar">
      <ArrowLeft className="h-5 w-5" />
    </Button>
    <div className="min-w-0 flex-1">
      <h2 className="truncate text-lg font-semibold text-foreground sm:text-xl">{titulo}</h2>
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{descricao}</p>
    </div>
  </div>
);

const RastroSolicitacaoPanel: React.FC<RastroSolicitacaoPanelProps> = ({ filial, numero, onBack }) => {
  const { protheusAuth } = useAuth();
  const { data, isError, isFetching, isPending, error, refetch } = useRastroSolicitacao(
    filial,
    numero,
    !!protheusAuth,
  );
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const selecionado = data && selecionadoId ? encontrarNoRastro(data, selecionadoId) : undefined;

  if (selecionado) {
    return <RastroDocumentoDetalhe no={selecionado} onBack={() => setSelecionadoId(null)} />;
  }

  const erroMensagem =
    !protheusAuth
      ? "Sessão expirada. Faça login novamente."
      : error instanceof Error && error.message.trim()
        ? error.message
        : "Falha ao buscar o rastro da solicitação";

  const carregando = !!protheusAuth && !data && !isError && (isPending || isFetching);

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      <RastroTopo
        onBack={onBack}
        titulo={`Rastro ${numero}`}
        descricao="Solicitação, cotações, pedidos e notas fiscais"
      />

      {carregando ? (
        <p role="status" className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando rastro da solicitação.
        </p>
      ) : isError || !protheusAuth ? (
        <div className="space-y-3 py-8 text-center">
          <p className="text-sm font-medium text-foreground">Não foi possível carregar o rastro.</p>
          <p className="text-sm text-muted-foreground">{erroMensagem}</p>
          {protheusAuth ? (
            <Button type="button" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          ) : null}
        </div>
      ) : !data?.solicitacao ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Não há dados de rastro para esta solicitação.
        </p>
      ) : (
        <RastroGrafo grafo={data} onSelect={setSelecionadoId} />
      )}
    </div>
  );
};

export default RastroSolicitacaoPanel;
