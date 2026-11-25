import React from "react";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import ListagemNotasPage from "./ListagemNotasPage";
import {
  NotaLeaveProvider,
  useNotaLeave,
} from "@/components/notas/inclusao/NotaLeaveContext";

const NovaNotaLayout: React.FC = () => {
  const navigate = useNavigate();
  const { confirmLeave } = useNotaLeave();

  return (
    <>
      <PageHeader
        title="Recibos de Débito e Crédito"
        onBackToMenuClick={() => confirmLeave(() => navigate("/home"))}
      />
      <div className="w-full min-w-0">
        <Outlet />
      </div>
    </>
  );
};

const NotasLayout: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname.endsWith("/listagem")) {
    return <Navigate to="/notas-debito-credito" replace />;
  }

  const isNova = pathname.endsWith("/nova");
  const isIndex = pathname === "/notas-debito-credito";

  if (!isIndex && !isNova) {
    return <Navigate to="/notas-debito-credito" replace />;
  }

  return (
    <AppLayout>
      {isNova ? (
        <NotaLeaveProvider>
          <NovaNotaLayout />
        </NotaLeaveProvider>
      ) : (
        <>
          <PageHeader title="Recibos de Débito e Crédito" />
          <ListagemNotasPage />
        </>
      )}
    </AppLayout>
  );
};

export default NotasLayout;
