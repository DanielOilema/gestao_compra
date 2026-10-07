import React, { Suspense, lazy } from "react";
import { Toaster, Sonner, TooltipProvider, Skeleton } from "@gestao-compra/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { EnvironmentProvider } from "@/contexts/EnvironmentContext";
import ProtectedRoute, { PermissionRoute } from "@/components/layout/ProtectedRoute";
import AuthSessionRedirect from "@/components/layout/AuthSessionRedirect";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import LoginPage from "@/pages/LoginPage";
import Home from "@/pages/Home";
import PwaInstallGate from "@/components/PwaInstallGate";
import NotFound from "./pages/NotFound";

const Dashboard = lazy(() => import("@/pages/aprovacoes/Dashboard"));
const SolicitacoesCompraLayout = lazy(() => import("@/pages/solicitacoes-compra/SolicitacoesCompraLayout"));
const NovaSolicitacaoPage = lazy(() => import("@/pages/solicitacoes-compra/NovaSolicitacaoPage"));
const AlterarSolicitacaoPage = lazy(() => import("@/pages/solicitacoes-compra/AlterarSolicitacaoPage"));
const MinhasSolicitacoesPage = lazy(() => import("@/pages/solicitacoes-compra/MinhasSolicitacoesPage"));
const AcompanhamentoSolicitacoesPage = lazy(() =>
  import("@/pages/solicitacoes-compra/AcompanhamentoSolicitacoesPage").then((module) => ({
    default: module.AcompanhamentoSolicitacoesRoute,
  })),
);
const NotasLayout = lazy(() => import("@/pages/notas/NotasLayout"));
const NovaNotaPage = lazy(() => import("@/pages/notas/NovaNotaPage"));
const RelatoriosLayout = lazy(() => import("@/pages/relatorios/RelatoriosLayout"));
const RelatoriosModulePage = lazy(() => import("@/pages/relatorios/RelatoriosModulePage"));
const RelatorioPage = lazy(() => import("@/pages/relatorios/RelatorioPage"));
const PermissoesPage = lazy(() => import("@/pages/admin/PermissoesPage"));
const TransportadorasLayout = lazy(() => import("@/pages/transportadoras/TransportadorasLayout"));
const NovaTransportadoraPage = lazy(() => import("@/pages/transportadoras/NovaTransportadoraPage"));

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
        <PwaInstallGate />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <EnvironmentProvider>
            <AuthSessionRedirect />
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LoginPage />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<Home />} />
                    <Route
                      path="/aprovacoes"
                      element={
                        <PermissionRoute permission="aprovacoes">
                          <Dashboard />
                        </PermissionRoute>
                      }
                    />
                    <Route path="/dashboard" element={<Navigate to="/aprovacoes" replace />} />

                    <Route
                      path="/solicitacoes-compra"
                      element={
                        <PermissionRoute permission="solicitacoes-compra">
                          <SolicitacoesCompraLayout />
                        </PermissionRoute>
                      }
                    >
                      <Route path="nova" element={<NovaSolicitacaoPage />} />
                      <Route path="alterar" element={<AlterarSolicitacaoPage />} />
                      <Route path="minhas" element={<MinhasSolicitacoesPage />} />
                    </Route>

                    <Route
                      path="/acompanhamento-solicitacoes"
                      element={
                        <PermissionRoute permission="acompanhamento-solicitacoes">
                          <AcompanhamentoSolicitacoesPage />
                        </PermissionRoute>
                      }
                    />
                    <Route
                      path="/solicitacoes-compra/acompanhamento"
                      element={<Navigate to="/acompanhamento-solicitacoes" replace />}
                    />

                    <Route
                      path="/notas-debito-credito"
                      element={
                        <PermissionRoute permission="notas-debito-credito">
                          <NotasLayout />
                        </PermissionRoute>
                      }
                    >
                      <Route path="nova" element={<NovaNotaPage />} />
                      <Route path="listagem" element={<Navigate to="/notas-debito-credito" replace />} />
                    </Route>

                    {/* A permissão é por módulo e vem da URL, então o guard fica em RelatoriosLayout. */}
                    <Route path="/relatorios/:moduloId" element={<RelatoriosLayout />}>
                      <Route index element={<RelatoriosModulePage />} />
                      <Route path=":reportId" element={<RelatorioPage />} />
                    </Route>

                    <Route
                      path="/transportadoras"
                      element={
                        <PermissionRoute permission="transportadoras">
                          <TransportadorasLayout />
                        </PermissionRoute>
                      }
                    >
                      <Route path="nova" element={<NovaTransportadoraPage />} />
                    </Route>

                    <Route
                      path="/admin/permissoes"
                      element={
                        <PermissionRoute permission="gestao-permissoes">
                          <PermissoesPage />
                        </PermissionRoute>
                      }
                    />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </EnvironmentProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
