import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import type { RoutinePermissionId } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionRouteProps {
  permission?: RoutinePermissionId;
  adminOnly?: boolean;
  children: React.ReactNode;
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  permission,
  adminOnly,
  children,
}) => {
  const { hasPermission, isAdmin } = useAuth();

  if (adminOnly && !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
