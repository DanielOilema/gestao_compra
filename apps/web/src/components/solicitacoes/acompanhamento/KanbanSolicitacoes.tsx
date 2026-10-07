import React, { useState } from "react";
import type { SolicitacaoAcompanhamento } from "@gestao-compra/shared";
import { groupSolicitacoesPorColuna } from "@gestao-compra/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@gestao-compra/ui";
import KanbanColumn from "./KanbanColumn";

interface KanbanSolicitacoesProps {
  solicitacoes: SolicitacaoAcompanhamento[];
  onSelectSolicitacao: (solicitacao: SolicitacaoAcompanhamento) => void;
}

const KanbanSolicitacoes: React.FC<KanbanSolicitacoesProps> = ({
  solicitacoes,
  onSelectSolicitacao,
}) => {
  const grupos = groupSolicitacoesPorColuna(solicitacoes);
  const [aba, setAba] = useState(grupos[0]?.status ?? "BLOQUEADA");

  return (
    <>
      <div className="hidden min-h-0 w-full min-w-0 flex-1 gap-3 overflow-hidden md:flex">
        {grupos.map((grupo) => (
          <KanbanColumn
            key={grupo.status}
            title={grupo.title}
            solicitacoes={grupo.solicitacoes}
            onSelectSolicitacao={onSelectSolicitacao}
          />
        ))}
      </div>

      <Tabs value={aba} onValueChange={(value) => setAba(value as typeof aba)} className="min-w-0 md:hidden">
        <TabsList className="flex h-auto w-full min-w-0 flex-wrap justify-start gap-1">
          {grupos.map((grupo) => (
            <TabsTrigger key={grupo.status} value={grupo.status} className="shrink-0">
              {grupo.title}
              <span className="ml-1 text-muted-foreground">({grupo.solicitacoes.length})</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {grupos.map((grupo) => (
          <TabsContent key={grupo.status} value={grupo.status} className="mt-3">
            <KanbanColumn
              title={grupo.title}
              solicitacoes={grupo.solicitacoes}
              onSelectSolicitacao={onSelectSolicitacao}
              className="w-full"
            />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
};

export default KanbanSolicitacoes;
