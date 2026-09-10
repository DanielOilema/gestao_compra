import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  canAlterSolicitacaoCompra,
  getAlterarSolicitacaoMessage,
  type PurchaseRequest,
} from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import SolicitacaoForm from "@/components/solicitacoes/SolicitacaoForm";

export interface AlterarSolicitacaoLocationState {
  request?: PurchaseRequest;
}

const AlterarSolicitacaoPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const request = (location.state as AlterarSolicitacaoLocationState | null)?.request;
  const eligibility = canAlterSolicitacaoCompra(request, user);
  const blocked = !request || !eligibility.ok;
  let blockedReason: "missing" | "status" | "solicitante" | null = null;
  if (!request) blockedReason = "missing";
  else if (!eligibility.ok) blockedReason = eligibility.reason ?? "status";

  React.useEffect(() => {
    if (blockedReason === "missing") {
      toast.error("Selecione uma solicitação em aberto ou bloqueada para alterar.");
      return;
    }
    if (blockedReason === "status" || blockedReason === "solicitante") {
      toast.error(
        getAlterarSolicitacaoMessage({ ok: false, reason: blockedReason }),
      );
    }
  }, [blockedReason]);

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
