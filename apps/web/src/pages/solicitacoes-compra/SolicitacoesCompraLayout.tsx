import React from "react";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import ListagemSolicitacoesPage from "./ListagemSolicitacoesPage";
import {
  SolicitacaoLeaveProvider,
  useSolicitacaoLeave,
} from "@/components/solicitacoes/inclusao/SolicitacaoLeaveContext";

const NovaSolicitacaoLayout: React.FC = () => {
  const navigate = useNavigate();
  const { confirmLeave } = useSolicitacaoLeave();

  return (
    <>
      <PageHeader
        title="Solicitações de Compra"
        onBackToMenuClick={() => confirmLeave(() => navigate("/home"))}
      />
      <Outlet />
    </>
  );
};

const SolicitacoesCompraLayout: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isNova = pathname.endsWith("/nova");
  const isIndex =
    pathname === "/solicitacoes-compra" || pathname.endsWith("/minhas");

  if (!isIndex && !isNova) {
    return <Navigate to="/solicitacoes-compra" replace />;
  }

  return (
    <AppLayout>
      {isNova ? (
        <SolicitacaoLeaveProvider>
          <NovaSolicitacaoLayout />
        </SolicitacaoLeaveProvider>
      ) : (
        <>
          <PageHeader title="Solicitações de Compra" />
          <ListagemSolicitacoesPage />
        </>
      )}
    </AppLayout>
  );
};

export default SolicitacoesCompraLayout;
