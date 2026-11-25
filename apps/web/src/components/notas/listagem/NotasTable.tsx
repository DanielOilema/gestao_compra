import React from "react";
import type { NotaListRow } from "@gestao-compra/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@gestao-compra/ui";
import StatusBadge from "@/components/shared/StatusBadge";

interface NotasTableProps {
  rows: NotaListRow[];
  selectedRowId: string | null;
  onSelectRow: (row: NotaListRow) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatDate = (date: string) => {
  if (!date) return "-";
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
};

const NotasTable: React.FC<NotasTableProps> = ({ rows, selectedRowId, onSelectRow }) => {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum recibo encontrado.
      </p>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead>Filial</TableHead>
            <TableHead>Número</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Cliente / Fornecedor</TableHead>
            <TableHead>Emissão</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.rowId}
              onClick={() => onSelectRow(row)}
              className={cn(
                "cursor-pointer",
                index % 2 === 1 && "bg-muted/40",
                selectedRowId === row.rowId && "bg-accent",
              )}
            >
              <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                {row.filialLabel || row.filial || "-"}
              </TableCell>
              <TableCell className="font-semibold">{row.numero}</TableCell>
              <TableCell>
                <StatusBadge status={row.tipo} />
              </TableCell>
              <TableCell className="max-w-[220px] truncate">{row.nomeCliFor || "-"}</TableCell>
              <TableCell>{formatDate(row.dataEmissao)}</TableCell>
              <TableCell className="text-right font-semibold text-primary">
                {formatCurrency(row.valorTotal)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default NotasTable;
