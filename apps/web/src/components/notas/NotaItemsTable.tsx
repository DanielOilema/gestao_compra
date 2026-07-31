import React, { useState } from "react";
import {
  Button,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@gestao-compra/ui";
import { Plus, Trash2 } from "lucide-react";

export interface NotaItemForm {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

interface NotaItemsTableProps {
  items: NotaItemForm[];
  onChange: (items: NotaItemForm[]) => void;
}

const emptyItem = (): NotaItemForm => ({
  id: crypto.randomUUID(),
  descricao: "",
  quantidade: 1,
  valorUnitario: 0,
});

const NotaItemsTable: React.FC<NotaItemsTableProps> = ({ items, onChange }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<NotaItemForm>(emptyItem());

  const addItem = () => {
    if (!draft.descricao.trim()) return;
    onChange([...items, draft]);
    setDraft(emptyItem());
    setDialogOpen(false);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar item
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
          Nenhum item adicionado
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Valor unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.descricao}</TableCell>
                  <TableCell className="text-right">{item.quantidade}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.valorUnitario)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.quantidade * item.valorUnitario)}
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={draft.descricao}
                onChange={(e) => setDraft({ ...draft, descricao: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min={1}
                  value={draft.quantidade}
                  onChange={(e) => setDraft({ ...draft, quantidade: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor unitário</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.valorUnitario}
                  onChange={(e) => setDraft({ ...draft, valorUnitario: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={addItem}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotaItemsTable;
