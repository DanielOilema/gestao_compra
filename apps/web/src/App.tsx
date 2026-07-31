import React, { Suspense, lazy } from "react";
import { Toaster, Sonner, TooltipProvider, Skeleton } from "@gestao-compra/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import InactivityGuard from "@/components/InactivityGuard";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AuthSessionRedirect from "@/components/layout/AuthSessionRedirect";
import LoginPage from "@/pages/LoginPage";
import NotFound from "./pages/NotFound";

const Home = lazy(() => import("@/pages/Home"));
const Dashboard = lazy(() => import("@/pages/aprovacoes/Dashboard"));
const SolicitacoesCompraLayout = lazy(() => import("@/pages/solicitacoes-compra/SolicitacoesCompraLayout"));
const NovaSolicitacaoPage = lazy(() => import("@/pages/solicitacoes-compra/NovaSolicitacaoPage"));
const MinhasSolicitacoesPage = lazy(() => import("@/pages/solicitacoes-compra/MinhasSolicitacoesPage"));
const NotasLayout = lazy(() => import("@/pages/notas/NotasLayout"));
const NovaNotaPage = lazy(() => import("@/pages/notas/NovaNotaPage"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="container mx-auto px-4 py-8 space-y-4">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-48 w-full" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <InactivityGuard />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthSessionRedirect />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<Home />} />
                <Route path="/aprovacoes" element={<Dashboard />} />
                <Route path="/dashboard" element={<Navigate to="/aprovacoes" replace />} />

                <Route path="/solicitacoes-compra" element={<SolicitacoesCompraLayout />}>
                  <Route path="nova" element={<NovaSolicitacaoPage />} />
                  <Route path="minhas" element={<MinhasSolicitacoesPage />} />
                </Route>

                <Route path="/notas-debito-credito" element={<NotasLayout />}>
                  <Route path="nova" element={<NovaNotaPage />} />
                  <Route path="listagem" element={<Navigate to="/notas-debito-credito" replace />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
