import React from "react";
import type { PurchaseRequest } from "@gestao-compra/shared";
import { getPurchaseRequestTotal } from "@gestao-compra/shared";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@gestao-compra/ui";
import StatusBadge from "@/components/shared/StatusBadge";

interface SolicitacaoStatusTableProps {
  requests: PurchaseRequest[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatDate = (date: string) =>
  new Date(date + "T00:00:00").toLocaleDateString("pt-BR");

const SolicitacaoStatusTable: React.FC<SolicitacaoStatusTableProps> = ({ requests }) => {
  if (requests.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma solicitação encontrada com os filtros selecionados.
      </p>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor total</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">{req.numero}</TableCell>
              <TableCell>{formatDate(req.dataCriacao)}</TableCell>
              <TableCell>
                <StatusBadge status={req.status} />
              </TableCell>
              <TableCell className="text-right">{formatCurrency(getPurchaseRequestTotal(req))}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" disabled title="Em desenvolvimento">
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SolicitacaoStatusTable;
