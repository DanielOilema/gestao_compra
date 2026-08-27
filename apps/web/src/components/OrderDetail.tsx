import React, { useState } from "react";
import { Order, OrderStatus } from "@gestao-compra/shared";
import { formatOrderDisplay } from "@gestao-compra/shared";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Separator,
} from "@gestao-compra/ui";
import { ArrowLeft, FileText, Calendar, Building, CheckCircle, XCircle, Package, User } from "lucide-react";
import OrderObservationField from "@/components/OrderObservationField";
import { useAprovaCompra } from "@/hooks/useAprovaCompra";

interface OrderDetailProps {
  order: Order;
  onBack: () => void;
  tipo?: "pedido" | "solicitacao";
}

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pendente",
  blocked: "Bloqueado",
  approved: "Aprovado",
};

const statusBadgeVariants: Record<OrderStatus, "default" | "destructive" | "secondary"> = {
  pending: "default",
  blocked: "destructive",
  approved: "secondary",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

const formatObservacao = (obs?: string, solicitante?: string): string => {
  const parts: string[] = [];
  if (obs) parts.push(obs);
  if (solicitante) parts.push(`Solicitante: ${solicitante}`);
  return parts.length ? parts.join(" | ") : "-";
};

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onBack, tipo = "pedido" }) => {
  const [observacao, setObservacao] = useState("");
  const [obsError, setObsError] = useState<string | undefined>();
  const { aprovar, bloquear, isLoading } = useAprovaCompra(order, tipo);

  const handleBlock = async () => {
    if (!observacao.trim()) {
      setObsError("Observação é obrigatória para bloquear o pedido.");
      return;
    }
    setObsError(undefined);
    const ok = await bloquear(observacao);
    if (ok) onBack();
  };

  const handleApprove = async () => {
    setObsError(undefined);
    const ok = await aprovar(observacao);
    if (ok) onBack();
  };

  const handleObservacaoChange = (value: string) => {
    setObservacao(value);
    if (obsError && value.trim()) setObsError(undefined);
  };

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <span className="truncate">{formatOrderDisplay(order)}</span>
            </h2>
            <Badge variant={statusBadgeVariants[order.status]}>{statusLabels[order.status]}</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {tipo === "solicitacao" ? "Solicitação de Compra" : "Pedido de Compra"}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {tipo === "solicitacao" ? (
          <Card>
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="font-medium text-foreground text-sm sm:text-base">{order.solicitante || "-"}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                Fornecedor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="font-medium text-foreground text-sm sm:text-base">{order.fornecedor}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">CNPJ: {order.cnpj}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Datas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 px-3 sm:px-6 pb-3 sm:pb-6">
            <p className="text-xs sm:text-sm">
              <span className="text-muted-foreground">Emissão:</span>{" "}
              <span className="font-medium">{formatDate(order.dataEmissao)}</span>
            </p>
            <p className="text-xs sm:text-sm">
              <span className="text-muted-foreground">Entrega:</span>{" "}
              <span className="font-medium">{formatDate(order.dataEntrega)}</span>
            </p>
            {order.logAprova && (
              <p className="text-xs sm:text-sm pt-1 border-t border-border mt-2">
                <span className="text-muted-foreground">Motivo Aprov.:</span>{" "}
                <span className="font-medium break-words">{order.logAprova}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alert for blocked orders */}
      {order.motivoBloqueio && (
        <Card className="border-status-blocked bg-status-blocked-bg">
          <CardContent className="py-3 sm:py-4 px-3 sm:px-6">
            <p className="text-xs sm:text-sm font-medium text-status-blocked-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              Motivo do bloqueio: {order.motivoBloqueio}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Items - Card layout on mobile, Table on desktop */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Itens ({order.itens.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          {/* Mobile: Card layout */}
          <div className="space-y-3 sm:hidden">
            {order.itens.map((item) => (
              <div key={item.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Produto</p>
                  <p className="font-medium text-sm text-foreground">{item.codigoProduto}</p>
                  <p className="text-xs text-muted-foreground">{item.descricaoProduto}</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantidade</p>
                    <p className="font-medium text-sm">{item.quantidade}</p>
                  </div>
                  {tipo !== "solicitacao" && (
                    <div>
                      <p className="text-xs text-muted-foreground">Valor Unit.</p>
                      <p className="font-medium text-sm">{formatCurrency(item.valorUnitario)}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Centro de Custo</p>
                  <p className="font-medium text-sm text-foreground">{item.codigoCentroCusto}</p>
                  <p className="text-xs text-muted-foreground">{item.descricaoCentroCusto}</p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Observação</p>
                    <p className="text-xs text-muted-foreground">
                      {formatObservacao(item.observacao, item.solicitante)}
                    </p>
                  </div>
                  {tipo !== "solicitacao" && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-bold text-sm text-primary">{formatCurrency(item.valorTotal)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead>Centro de Custo</TableHead>
                  {tipo !== "solicitacao" && (
                    <>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </>
                  )}
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{item.codigoProduto}</p>
                        <p className="text-sm text-muted-foreground">{item.descricaoProduto}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{item.quantidade}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{item.codigoCentroCusto}</p>
                        <p className="text-sm text-muted-foreground">{item.descricaoCentroCusto}</p>
                      </div>
                    </TableCell>
                    {tipo !== "solicitacao" && (
                      <>
                        <TableCell className="text-right">{formatCurrency(item.valorUnitario)}</TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {formatCurrency(item.valorTotal)}
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatObservacao(item.observacao, item.solicitante)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {tipo !== "solicitacao" && (
            <>
              <Separator className="my-3 sm:my-4" />

              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-muted-foreground">Valor Total do Pedido</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(order.valor)}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Observação do pedido (obrigatória para bloquear) */}
      {order.status !== "approved" && (
        <OrderObservationField
          value={observacao}
          onChange={handleObservacaoChange}
          required={order.status === "pending"}
          error={obsError}
        />
      )}

      {/* Action Buttons */}
      {order.status !== "approved" && (
        <div className="flex flex-col sm:flex-row gap-3 pb-4">
          <Button
            onClick={handleApprove}
            disabled={isLoading}
            className="flex-1 h-11 sm:h-10 bg-status-approved hover:bg-status-approved/90 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprovar
          </Button>
          {order.status === "pending" && (
            <Button onClick={handleBlock} disabled={isLoading} variant="destructive" className="flex-1 h-11 sm:h-10">
              <XCircle className="h-4 w-4 mr-2" />
              Bloquear
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
