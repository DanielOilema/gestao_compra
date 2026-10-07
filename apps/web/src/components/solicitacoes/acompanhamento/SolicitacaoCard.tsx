import React from "react";
import { getTipoCompraLabel, type SolicitacaoAcompanhamento } from "@gestao-compra/shared";
import { cn } from "@gestao-compra/ui";
import { isoToBrDate } from "@/lib/dateBr";

interface SolicitacaoCardProps {
  solicitacao: SolicitacaoAcompanhamento;
  onSelectSolicitacao: (solicitacao: SolicitacaoAcompanhamento) => void;
}

const SolicitacaoCard: React.FC<SolicitacaoCardProps> = ({ solicitacao, onSelectSolicitacao }) => {
  const data = solicitacao.dataSolicitacao ? isoToBrDate(solicitacao.dataSolicitacao) : "";
  const tipoUrgente = solicitacao.tipoCompra === "2";

  return (
    <button
      type="button"
      onClick={() => onSelectSolicitacao(solicitacao)}
      aria-label={`Solicitação ${solicitacao.numero}`}
      className="w-full min-w-0 break-words rounded-lg border bg-card p-3 text-left shadow-sm transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <p className="font-semibold text-foreground">{solicitacao.numero}</p>
      {solicitacao.filial ? (
        <p className="mt-2 text-sm text-muted-foreground">Filial: {solicitacao.filial}</p>
      ) : null}
      {solicitacao.tipoCompra ? (
        <p className="mt-2 flex items-center gap-2 text-sm text-foreground">
          <span
            className={cn(
              "inline-block h-3 w-3 shrink-0 rounded-sm",
              tipoUrgente ? "bg-red-600" : "bg-yellow-400",
            )}
            aria-hidden
          />
          {getTipoCompraLabel(solicitacao.tipoCompra)}
        </p>
      ) : null}
      {data ? <p className="mt-2 text-sm text-muted-foreground">Data: {data}</p> : null}
      {solicitacao.solicitante ? (
        <p className="mt-2 text-sm text-foreground">Solicitante: {solicitacao.solicitante}</p>
      ) : null}
    </button>
  );
};

export default React.memo(SolicitacaoCard);
