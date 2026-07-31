import React from "react";
import type { SolicitacaoCompraRow } from "@gestao-compra/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@gestao-compra/ui";
import { cn } from "@gestao-compra/ui";
import SolicitacaoCompraStatusDot from "./SolicitacaoCompraStatusDot";

interface SolicitacaoCompraTableProps {
  rows: SolicitacaoCompraRow[];
  selectedRowId: string | null;
  onSelectRow: (row: SolicitacaoCompraRow) => void;
}

const formatQuantity = (value: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

const SolicitacaoCompraTable: React.FC<SolicitacaoCompraTableProps> = ({
  rows,
  selectedRowId,
  onSelectRow,
}) => {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma solicitação encontrada.
      </p>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead>Filial</TableHead>
            <TableHead>Número SC</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Unid.</TableHead>
            <TableHead className="text-right">Qtd.</TableHead>
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
              <TableCell>
                <div className="flex items-center gap-2 min-w-0">
                  <SolicitacaoCompraStatusDot status={row.status} />
                  <span className="truncate text-sm">{row.filialLabel}</span>
                </div>
              </TableCell>
              <TableCell className="font-semibold">{row.numeroSc}</TableCell>
              <TableCell>{row.item}</TableCell>
              <TableCell>{row.produto}</TableCell>
              <TableCell className="max-w-[200px] truncate uppercase">{row.descricao}</TableCell>
              <TableCell>{row.unidade}</TableCell>
              <TableCell className="text-right font-semibold text-primary">
                {formatQuantity(row.quantidade)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SolicitacaoCompraTable;
