import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/LoginForm";

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <LoginForm />;
};

export default LoginPage;
