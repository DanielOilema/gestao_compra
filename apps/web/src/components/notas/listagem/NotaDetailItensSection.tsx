import React from "react";
import type { NotaItem } from "@gestao-compra/shared";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@gestao-compra/ui";
import { Package } from "lucide-react";

interface NotaDetailItensSectionProps {
  itens: NotaItem[];
  valorTotal: number;
  loading?: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const NotaDetailItensSection: React.FC<NotaDetailItensSectionProps> = ({
  itens,
  valorTotal,
  loading,
}) => (
  <Card>
    <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        Itens ({loading ? "…" : itens.length})
      </CardTitle>
    </CardHeader>
    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full sm:hidden" />
          <Skeleton className="h-24 w-full sm:hidden" />
          <Skeleton className="h-8 w-full hidden sm:block" />
          <Skeleton className="h-8 w-full hidden sm:block" />
        </div>
      ) : itens.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum item retornado.</p>
      ) : (
        <>
          <div className="space-y-3 sm:hidden">
            {itens.map((item) => (
              <div key={item.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Produto</p>
                  <p className="font-medium text-sm text-foreground">{item.produto}</p>
                  <p className="text-xs text-muted-foreground uppercase">{item.descricao}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="font-medium text-sm text-primary">{formatCurrency(item.valor)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Centro de Custo</p>
                  <p className="font-medium text-sm text-foreground">
                    {item.codigoCentroCusto || "-"}
                  </p>
                  {item.descricaoCentroCusto ? (
                    <p className="text-xs text-muted-foreground">{item.descricaoCentroCusto}</p>
                  ) : null}
                </div>
                {item.observacao ? (
                  <div className="pt-1 border-t border-border">
                    <p className="text-xs text-muted-foreground">Observação</p>
                    <p className="text-xs text-muted-foreground">{item.observacao}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Centro de Custo</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{item.produto}</p>
                        <p className="text-sm text-muted-foreground uppercase">{item.descricao}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatCurrency(item.valor)}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {item.codigoCentroCusto || "-"}
                      </p>
                      {item.descricaoCentroCusto ? (
                        <p className="text-sm text-muted-foreground">{item.descricaoCentroCusto}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {item.observacao || "-"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <p className="mt-3 text-right font-semibold text-primary">
        Total: {formatCurrency(valorTotal)}
      </p>
    </CardContent>
  </Card>
);

export default NotaDetailItensSection;
