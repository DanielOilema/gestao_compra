import React from "react";
import type { DebitCreditNote } from "@gestao-compra/shared";
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

interface NotasListTableProps {
  notas: DebitCreditNote[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatDate = (date: string) =>
  new Date(date + "T00:00:00").toLocaleDateString("pt-BR");

const NotasListTable: React.FC<NotasListTableProps> = ({ notas }) => {
  if (notas.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum recibo encontrado com os filtros selecionados.
      </p>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {notas.map((nota) => (
            <TableRow key={nota.id}>
              <TableCell className="font-medium">{nota.numero}</TableCell>
              <TableCell>
                <StatusBadge status={nota.tipo} />
              </TableCell>
              <TableCell>{formatDate(nota.dataEmissao)}</TableCell>
              <TableCell className="max-w-[200px] truncate">{nota.referenteA}</TableCell>
              <TableCell>
                <StatusBadge status={String(nota.status)} />
              </TableCell>
              <TableCell className="text-right">{formatCurrency(nota.valorTotal)}</TableCell>
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

export default NotasListTable;
