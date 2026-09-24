import React from "react";
import { useNavigate } from "react-router-dom";
import type { PurchaseRequest, PurchaseRequestItem } from "@gestao-compra/shared";
import {
  ALTERAR_SOLICITACAO_STATUS_MESSAGE,
  formatNumeroSc,
  getFilialState,
  hasValidRateioCC,
  isSolicitacaoCompraAlteravelPorStatus,
} from "@gestao-compra/shared";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@gestao-compra/ui";
import { ArrowLeft, FileText, Calendar, Package, User, Pencil, Copy } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import type { NovaSolicitacaoLocationState } from "@/components/solicitacoes/inclusao/copySolicitacaoCompra";
import SolicitacaoCompraLogAprovacao from "./SolicitacaoCompraLogAprovacao";

interface SolicitacaoCompraDetailContentProps {
  request: PurchaseRequest;
  onBack: () => void;
}

const formatDate = (date: string) =>
  new Date(date + "T00:00:00").toLocaleDateString("pt-BR");

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatItemObservacao = (item: PurchaseRequestItem): string => {
  const parts: string[] = [];
  if (item.observacao) parts.push(item.observacao);
  if (item.fornecedorPreferencial) parts.push(`Fornecedor: ${item.fornecedorPreferencial}`);
  if (parts.length === 0 && item.valorEstimado > 0) {
    parts.push(formatCurrency(item.valorEstimado));
  }
  return parts.length ? parts.join(" | ") : "-";
};

const formatCentroCusto = (item: PurchaseRequestItem) => {
  if (hasValidRateioCC(item.rateioCC)) {
    const resumo = item.rateioCC!
      .map((row) => `${row.cc} (${row.percentual}%)`)
      .join(" / ");
    return {
      title: `Rateio (${item.rateioCC!.length})`,
      subtitle: resumo,
    };
  }
  return {
    title: item.codigoCentroCusto || "-",
    subtitle: item.descricaoCentroCusto || "",
  };
};

const SolicitacaoCompraDetailContent: React.FC<SolicitacaoCompraDetailContentProps> = ({
  request,
  onBack,
}) => {
  const navigate = useNavigate();
  const title = `${formatNumeroSc(request.numero)} (${getFilialState(request.filial)})`;
  const canAlter = isSolicitacaoCompraAlteravelPorStatus(request);

  const handleCopy = () => {
    const state: NovaSolicitacaoLocationState = { copyFrom: request };
    navigate("/solicitacoes-compra/nova", { state });
  };

  const handleAlterar = () => {
    if (!canAlter) return;
    const state: NovaSolicitacaoLocationState = { alterFrom: request };
    navigate("/solicitacoes-compra/nova", { state });
  };

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <span className="truncate">{title}</span>
            </h2>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Solicitação de Compra</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Solicitante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 px-3 sm:px-6 pb-3 sm:pb-6">
            <p className="font-medium text-foreground text-sm sm:text-base">
              {request.solicitante || "-"}
            </p>
          </CardContent>
        </Card>

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
              <span className="font-medium">{formatDate(request.dataCriacao)}</span>
            </p>
            <p className="text-xs sm:text-sm">
              <span className="text-muted-foreground">Entrega:</span>{" "}
              <span className="font-medium">{formatDate(request.dataCriacao)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Itens ({request.itens.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="space-y-3 sm:hidden">
            {request.itens.map((item) => {
              const cc = formatCentroCusto(item);
              return (
              <div key={item.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Produto</p>
                  <p className="font-medium text-sm text-foreground">{item.produto}</p>
                  <p className="text-xs text-muted-foreground uppercase">{item.descricao}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quantidade</p>
                  <p className="font-medium text-sm">{item.quantidade}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Centro de Custo</p>
                  <p className="font-medium text-sm text-foreground">{cc.title}</p>
                  {cc.subtitle ? (
                    <p className="text-xs text-muted-foreground">{cc.subtitle}</p>
                  ) : null}
                </div>
                <div className="pt-1 border-t border-border">
                  <p className="text-xs text-muted-foreground">Observação</p>
                  <p className="text-xs text-muted-foreground">{formatItemObservacao(item)}</p>
                </div>
              </div>
              );
            })}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead>Centro de Custo</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {request.itens.map((item) => {
                  const cc = formatCentroCusto(item);
                  return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{item.produto}</p>
                        <p className="text-sm text-muted-foreground uppercase">{item.descricao}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{item.quantidade}</TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{cc.title}</p>
                      {cc.subtitle ? (
                        <p className="text-sm text-muted-foreground">{cc.subtitle}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatItemObservacao(item)}
                      </span>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={!canAlter}
          title={!canAlter ? ALTERAR_SOLICITACAO_STATUS_MESSAGE : undefined}
          onClick={handleAlterar}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Alterar
        </Button>
      </div>

      <SolicitacaoCompraLogAprovacao
        filial={request.filial}
        numDoc={formatNumeroSc(request.numero)}
      />
    </div>
  );
};

export default SolicitacaoCompraDetailContent;
