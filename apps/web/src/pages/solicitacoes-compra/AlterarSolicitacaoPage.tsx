import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  ALTERAR_SOLICITACAO_STATUS_MESSAGE,
  isSolicitacaoCompraAlteravelPorStatus,
  type PurchaseRequest,
} from "@gestao-compra/shared";
import SolicitacaoForm from "@/components/solicitacoes/SolicitacaoForm";

export interface AlterarSolicitacaoLocationState {
  request?: PurchaseRequest;
}

const AlterarSolicitacaoPage: React.FC = () => {
  const location = useLocation();
  const request = (location.state as AlterarSolicitacaoLocationState | null)?.request;
  const blocked = !request || !isSolicitacaoCompraAlteravelPorStatus(request);

  React.useEffect(() => {
    if (!request) {
      toast.error("Selecione uma solicitação em aberto ou bloqueada para alterar.");
      return;
    }
    if (!isSolicitacaoCompraAlteravelPorStatus(request)) {
      toast.error(ALTERAR_SOLICITACAO_STATUS_MESSAGE);
    }
  }, [request]);

  if (blocked || !request) {
    return <Navigate to="/solicitacoes-compra" replace />;
  }

  return (
    <div className="animate-fade-in w-full min-w-0">
      <SolicitacaoForm mode="alterar" initialRequest={request} />
    </div>
  );
};

export default AlterarSolicitacaoPage;
