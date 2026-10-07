import React from "react";
import type { StatusAcompanhamentoSolicitacao } from "@gestao-compra/shared";
import { KANBAN_SOLICITACAO_COLUMNS } from "@gestao-compra/shared";
import { cn } from "@gestao-compra/ui";

interface SolicitacaoTimelineProps {
  statusAtual: StatusAcompanhamentoSolicitacao;
}

const SolicitacaoTimeline: React.FC<SolicitacaoTimelineProps> = ({ statusAtual }) => {
  return (
    <ol className="space-y-3">
      {KANBAN_SOLICITACAO_COLUMNS.map((column) => {
        const atual = column.status === statusAtual;
        return (
          <li key={column.status} className="flex items-center gap-3" aria-current={atual ? "step" : undefined}>
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                atual ? "bg-primary" : "bg-muted-foreground/30",
              )}
            />
            <span className={cn("text-sm", atual ? "font-semibold text-foreground" : "text-muted-foreground")}>
              {column.title}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default SolicitacaoTimeline;
