import React, { useState, useCallback, useMemo } from "react";

import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import OrderDetail from "@/components/OrderDetail";
import PedidoList from "@/components/PedidoList";
import SolicitacaoList from "@/components/SolicitacaoList";
import OrderSearchBar from "@/components/OrderSearchBar";
import AprovacaoCategoryCard from "@/components/aprovacoes/AprovacaoCategoryCard";
import { Order } from "@gestao-compra/shared";
import { Button, cn } from "@gestao-compra/ui";
import { ShoppingCart, FileText, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePedidosPendentes } from "@/hooks/usePedidosPendentes";
import { useSolicitacoesPendentes } from "@/hooks/useSolicitacoesPendentes";

type CategoryType = "pedidos" | "solicitacoes";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("pedidos");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pedidoSearch, setPedidoSearch] = useState("");
  const [solicitacaoSearch, setSolicitacaoSearch] = useState("");

  const { data: pendingOrders = [], isLoading, isFetching, refetch } = usePedidosPendentes();
  const {
    data: pendingSolicitations = [],
    isLoading: isLoadingSC,
    isFetching: isFetchingSC,
    refetch: refetchSC,
  } = useSolicitacoesPendentes();

  const handleBackFromDetail = () => {
    setSelectedOrder(null);
  };

  const handleRefresh = useCallback(async () => {
    const [resPed, resSC] = await Promise.all([refetch(), refetchSC()]);
    const err = resPed.error || resSC.error;
    if (err) {
      toast.error(err.message || "Falha ao atualizar dados");
    } else {
      toast.success("Dados atualizados com sucesso");
    }
  }, [refetch, refetchSC]);

  const dedupeById = <T extends { id: string }>(list: T[]): T[] => {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const item of list) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
    return out;
  };

  const uniquePedidos = useMemo(() => dedupeById(pendingOrders), [pendingOrders]);
  const uniqueSolicitacoes = useMemo(() => dedupeById(pendingSolicitations), [pendingSolicitations]);

  const filteredPedidos = useMemo(() => {
    const q = pedidoSearch.trim().toLowerCase();
    if (!q) return uniquePedidos;
    return uniquePedidos.filter(
      (o) => o.numero.toLowerCase().includes(q) || (o.fornecedor || "").toLowerCase().includes(q),
    );
  }, [uniquePedidos, pedidoSearch]);

  const filteredSolicitacoes = useMemo(() => {
    const q = solicitacaoSearch.trim().toLowerCase();
    if (!q) return uniqueSolicitacoes;
    return uniqueSolicitacoes.filter(
      (o) => o.numero.toLowerCase().includes(q) || (o.solicitante || "").toLowerCase().includes(q),
    );
  }, [uniqueSolicitacoes, solicitacaoSearch]);

  const activeList = selectedCategory === "pedidos" ? filteredPedidos : filteredSolicitacoes;
  const activeLabel = selectedCategory === "pedidos" ? "Pedidos de Compra" : "Solicitações de Compra";
  const activeLoading = selectedCategory === "pedidos" ? isLoading : isLoadingSC;
  const hasAnyInCategory =
    selectedCategory === "pedidos" ? uniquePedidos.length > 0 : uniqueSolicitacoes.length > 0;

  return (
    <AppLayout>
      {selectedOrder ? (
        <OrderDetail
          order={selectedOrder}
          onBack={handleBackFromDetail}
          tipo={selectedCategory === "solicitacoes" ? "solicitacao" : "pedido"}
        />
      ) : (
        <div className="animate-fade-in">
          <PageHeader
            title=""
            description="Aprove ou bloqueie pedidos e solicitações pendentes"
            actions={
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching || isFetchingSC}>
                {isFetching || isFetchingSC ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Atualizar
              </Button>
            }
          />

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <AprovacaoCategoryCard
              title="Pedidos de Compra"
              count={uniquePedidos.length}
              selected={selectedCategory === "pedidos"}
              onSelect={() => setSelectedCategory("pedidos")}
              icon={
                <ShoppingCart
                  className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6",
                    selectedCategory === "pedidos" ? "text-primary" : "text-muted-foreground",
                  )}
                />
              }
            />

            <AprovacaoCategoryCard
              title="Solicitações de Compra"
              count={uniqueSolicitacoes.length}
              selected={selectedCategory === "solicitacoes"}
              onSelect={() => setSelectedCategory("solicitacoes")}
              icon={
                <FileText
                  className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6",
                    selectedCategory === "solicitacoes" ? "text-primary" : "text-muted-foreground",
                  )}
                />
              }
            />
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {activeLabel} Pendentes ({activeList.length})
            </h3>
            {!activeLoading && hasAnyInCategory && (
              <div className="mb-4">
                {selectedCategory === "pedidos" ? (
                  <OrderSearchBar
                    value={pedidoSearch}
                    onChange={setPedidoSearch}
                    placeholder="Buscar por número do pedido ou fornecedor..."
                  />
                ) : (
                  <OrderSearchBar
                    value={solicitacaoSearch}
                    onChange={setSolicitacaoSearch}
                    placeholder="Buscar por número da solicitação ou solicitante..."
                  />
                )}
              </div>
            )}
            {activeLoading ? (
              <div key={selectedCategory} className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Carregando {selectedCategory === "pedidos" ? "pedidos" : "solicitações"}...
              </div>
            ) : selectedCategory === "pedidos" ? (
              <PedidoList key="pedidos" orders={filteredPedidos} onSelectOrder={setSelectedOrder} />
            ) : (
              <SolicitacaoList key="solicitacoes" orders={filteredSolicitacoes} onSelectOrder={setSelectedOrder} />
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
