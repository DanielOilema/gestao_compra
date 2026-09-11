import React from "react";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import ListagemTransportadorasPage from "./ListagemTransportadorasPage";
import {
  TransportadoraLeaveProvider,
  useTransportadoraLeave,
} from "@/components/transportadoras/inclusao/TransportadoraLeaveContext";

const NovaTransportadoraLayout: React.FC = () => {
  const navigate = useNavigate();
  const { confirmLeave } = useTransportadoraLeave();

  return (
    <>
      <PageHeader
        title="Transportadoras"
        onBackToMenuClick={() => confirmLeave(() => navigate("/home"))}
      />
      <div className="w-full min-w-0">
        <Outlet />
      </div>
    </>
  );
};

const TransportadorasLayout: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const isNova = pathname.endsWith("/nova");
  const isIndex = pathname === "/transportadoras";

  if (!isIndex && !isNova) {
    return <Navigate to="/transportadoras" replace />;
  }

  return (
    <AppLayout>
      {isNova ? (
        <TransportadoraLeaveProvider>
          <NovaTransportadoraLayout />
        </TransportadoraLeaveProvider>
      ) : (
        <>
          <PageHeader title="Transportadoras" />
          <ListagemTransportadorasPage />
        </>
      )}
    </AppLayout>
  );
};

export default TransportadorasLayout;
