import React from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { getReportModulePermission, isReportModuleId } from "@gestao-compra/shared";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import type { RelatoriosOutletContext } from "./relatoriosContext";

/**
 * A permissão de relatórios é por módulo, e o módulo vem da URL. Como PermissionRoute só aceita
 * permissão estática, a verificação acontece aqui — em um único lugar para todas as telas de
 * relatório.
 */
const RelatoriosLayout: React.FC = () => {
  const { moduloId } = useParams();
  const { hasPermission } = useAuth();

  if (!isReportModuleId(moduloId)) {
    return <Navigate to="/home" replace />;
  }

  if (!hasPermission(getReportModulePermission(moduloId))) {
    return <Navigate to="/home" replace />;
  }

  const context: RelatoriosOutletContext = { modulo: moduloId };

  return (
    <AppLayout>
      <Outlet context={context} />
    </AppLayout>
  );
};

export default RelatoriosLayout;
