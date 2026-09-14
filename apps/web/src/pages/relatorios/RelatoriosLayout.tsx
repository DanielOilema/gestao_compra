import React from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import {
  getReportModulePermission,
  getReportPermission,
  isReportModuleId,
} from "@gestao-compra/shared";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getReportsByModule } from "@/config/reports";
import type { RelatoriosOutletContext } from "./relatoriosContext";

/**
 * A permissão de relatórios é por relatório (com fallback para o módulo). O módulo vem da URL.
 * Como PermissionRoute só aceita permissão estática, a verificação acontece aqui.
 */
const RelatoriosLayout: React.FC = () => {
  const { moduloId } = useParams();
  const { hasPermission } = useAuth();

  if (!isReportModuleId(moduloId)) {
    return <Navigate to="/home" replace />;
  }

  const reports = getReportsByModule(moduloId);
  const canAccessModule =
    reports.length === 0
      ? hasPermission(getReportModulePermission(moduloId))
      : reports.some((report) => hasPermission(getReportPermission(report)));

  if (!canAccessModule) {
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
