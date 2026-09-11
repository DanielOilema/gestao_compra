import React from "react";
import {
  formatReportValue,
  isNumericReportFormat,
  type ReportColumn,
  type ReportRow,
} from "@gestao-compra/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@gestao-compra/ui";

interface RelatorioTableProps {
  colunas: ReportColumn[];
  linhas: ReportRow[];
}

const wrapCell = (coluna: ReportColumn): boolean =>
  coluna.formato === "texto" && (coluna.largura ?? 0) >= 36;

const rowKey = (row: ReportRow, index: number): string => {
  const filial = String(row.filial ?? "");
  const numero = String(row.numero ?? "");
  const produto = String(row.produto ?? "");
  return `${filial}-${numero}-${produto}-${index}`;
};

const RelatorioTable: React.FC<RelatorioTableProps> = ({ colunas, linhas }) => {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table className="min-w-[1100px]">
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            {colunas.map((coluna) => (
              <TableHead
                key={coluna.key}
                className={cn(
                  isNumericReportFormat(coluna.formato) && "text-right",
                  wrapCell(coluna) && "min-w-[16rem]",
                )}
              >
                {coluna.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {linhas.map((row, index) => (
            <TableRow key={rowKey(row, index)} className={index % 2 === 1 ? "bg-muted/40" : undefined}>
              {colunas.map((coluna) => (
                <TableCell
                  key={coluna.key}
                  className={cn(
                    "align-top",
                    isNumericReportFormat(coluna.formato) && "text-right font-semibold text-primary",
                    wrapCell(coluna) ? "min-w-[16rem] whitespace-pre-wrap break-words" : "whitespace-nowrap",
                  )}
                >
                  {formatReportValue(row[coluna.key] ?? null, coluna.formato)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RelatorioTable;
