import React from "react";
import type { TransportadoraListItem } from "@gestao-compra/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@gestao-compra/ui";

interface TransportadorasTableProps {
  rows: TransportadoraListItem[];
  selectedCodigo: string | null;
  onSelectRow: (row: TransportadoraListItem) => void;
  isLoading?: boolean;
}

const TransportadorasTable: React.FC<TransportadorasTableProps> = ({
  rows,
  selectedCodigo,
  onSelectRow,
  isLoading,
}) => {
  if (isLoading && rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">Carregando transportadoras...</p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma transportadora encontrada.
      </p>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead>Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>CGC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.codigo}
              onClick={() => onSelectRow(row)}
              className={cn(
                "cursor-pointer",
                index % 2 === 1 && "bg-muted/40",
                selectedCodigo === row.codigo && "bg-accent",
              )}
            >
              <TableCell className="font-medium">{row.codigo}</TableCell>
              <TableCell>{row.nome || "-"}</TableCell>
              <TableCell>{row.cgc || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransportadorasTable;
