import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@gestao-compra/ui";
import type { SolicitacaoItemDraft } from "@gestao-compra/shared";

interface SolicitacaoItensTableProps {
  itens: SolicitacaoItemDraft[];
  onEdit: (item: SolicitacaoItemDraft) => void;
  onRemove: (id: string) => void;
}

const formatDataEntrega = (iso: string): string => {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
};

const SolicitacaoItensTable: React.FC<SolicitacaoItensTableProps> = ({
  itens,
  onEdit,
  onRemove,
}) => {
  if (itens.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nenhum item adicionado. Use o formulário acima para incluir produtos na solicitação.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Centro de Custo</TableHead>
            <TableHead className="w-20 text-right">Qtd</TableHead>
            <TableHead className="w-16">Un.</TableHead>
            <TableHead className="w-28">Entrega</TableHead>
            <TableHead>Observação</TableHead>
            <TableHead className="w-24 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itens.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-medium">{item.produto}</div>
                <div className="text-xs text-muted-foreground">{item.produtoDescricao}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{item.centroCusto}</div>
                <div className="text-xs text-muted-foreground">{item.centroCustoDescricao}</div>
              </TableCell>
              <TableCell className="text-right">{item.quantidade}</TableCell>
              <TableCell>{item.unidade}</TableCell>
              <TableCell>{formatDataEntrega(item.dataEntrega)}</TableCell>
              <TableCell className="max-w-[200px] truncate">{item.observacao || "—"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(item)}
                    aria-label="Editar item"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(item.id)}
                    aria-label="Remover item"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SolicitacaoItensTable;
