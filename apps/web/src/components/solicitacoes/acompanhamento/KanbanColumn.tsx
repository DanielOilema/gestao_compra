import React from "react";
import type { SolicitacaoAcompanhamento } from "@gestao-compra/shared";
import { Badge, cn } from "@gestao-compra/ui";
import SolicitacaoCard from "./SolicitacaoCard";

interface KanbanColumnProps {
  title: string;
  solicitacoes: SolicitacaoAcompanhamento[];
  onSelectSolicitacao: (solicitacao: SolicitacaoAcompanhamento) => void;
  className?: string;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  solicitacoes,
  onSelectSolicitacao,
  className,
}) => {
  return (
    <section
      aria-label={`${title}, ${solicitacoes.length} solicitações`}
      className={cn(
        "flex w-full min-w-0 flex-col rounded-xl border bg-muted/40 md:h-full md:max-h-full md:min-h-0 md:w-auto md:flex-1 md:basis-0",
        className,
      )}
    >
      <header className="hidden items-center justify-between gap-2 border-b px-3 py-2 md:flex">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <Badge variant="secondary">{solicitacoes.length}</Badge>
      </header>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
        {solicitacoes.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Nenhuma solicitação nesta etapa.
          </p>
        ) : (
          solicitacoes.map((solicitacao) => (
            <SolicitacaoCard
              key={solicitacao.id}
              solicitacao={solicitacao}
              onSelectSolicitacao={onSelectSolicitacao}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default React.memo(KanbanColumn);
