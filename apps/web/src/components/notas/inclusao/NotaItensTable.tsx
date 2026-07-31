import React, { useState } from "react";
import type { NotaItemDraft, NotaTipo } from "@gestao-compra/shared";
import {
  Button,
  Input,
  Label,
  Textarea,
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
  useIsMobile,
} from "@gestao-compra/ui";
import { Plus, Trash2 } from "lucide-react";
import ProdutoCombobox from "@/components/solicitacoes/inclusao/ProdutoCombobox";
import NotaCentroCustoCombobox from "./NotaCentroCustoCombobox";
import NotaItemMobileCard from "./NotaItemMobileCard";

interface NotaItensTableProps {
  items: NotaItemDraft[];
  tipo: NotaTipo;
  onChange: (items: NotaItemDraft[]) => void;
}

const emptyItem = (): NotaItemDraft => ({
  id: crypto.randomUUID(),
  produto: "",
  produtoDescricao: "",
  valor: 0,
  observacao: "",
  centroCusto: "",
  centroCustoDescricao: "",
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const NotaItensTable: React.FC<NotaItensTableProps> = ({ items, tipo, onChange }) => {
  const isMobile = useIsMobile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<NotaItemDraft>(emptyItem());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ccRequired = tipo === "debito";

  const openDialog = () => {
    setDraft(emptyItem());
    setErrors({});
    setDialogOpen(true);
  };

  const addItem = () => {
    const nextErrors: Record<string, string> = {};
    if (!draft.produto) nextErrors.produto = "Produto obrigatório";
    if (!draft.valor || draft.valor <= 0) nextErrors.valor = "Valor deve ser maior que zero";
    if (ccRequired && !draft.centroCusto) {
      nextErrors.centroCusto = "Centro de custo obrigatório para débito";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onChange([...items, draft]);
    setDialogOpen(false);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-3 min-w-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-medium">Itens da nota</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={openDialog}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar item
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
          Nenhum item adicionado.
        </p>
      ) : isMobile ? (
        <div className="space-y-2">
          {items.map((item) => (
            <NotaItemMobileCard key={item.id} item={item} onRemove={removeItem} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>C.Custo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.produto}</TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {item.produtoDescricao}
                    {item.observacao ? ` — ${item.observacao}` : ""}
                  </TableCell>
                  <TableCell>
                    {item.centroCusto
                      ? `${item.centroCusto}${
                          item.centroCustoDescricao ? ` - ${item.centroCustoDescricao}` : ""
                        }`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.valor)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remover item"
                    >
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
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <ProdutoCombobox
              value={draft.produto}
              selectedLabel={
                draft.produto
                  ? `${draft.produto} - ${draft.produtoDescricao}`
                  : undefined
              }
              onValueChange={(codigo, option) =>
                setDraft((prev) => ({
                  ...prev,
                  produto: codigo,
                  produtoDescricao: option?.descricao ?? "",
                }))
              }
              error={errors.produto}
            />
            <div className="space-y-2">
              <Label htmlFor="item-descricao">Descrição</Label>
              <Input
                id="item-descricao"
                value={draft.produtoDescricao}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-valor">Valor *</Label>
              <Input
                id="item-valor"
                type="number"
                min={0}
                step="0.01"
                value={draft.valor || ""}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, valor: Number(e.target.value) || 0 }))
                }
              />
              {errors.valor && <p className="text-sm text-destructive">{errors.valor}</p>}
            </div>
            <NotaCentroCustoCombobox
              value={draft.centroCusto}
              selectedLabel={
                draft.centroCusto
                  ? `${draft.centroCusto} - ${draft.centroCustoDescricao}`
                  : undefined
              }
              required={ccRequired}
              onValueChange={(custo, option) =>
                setDraft((prev) => ({
                  ...prev,
                  centroCusto: custo,
                  centroCustoDescricao: option?.descricao ?? "",
                }))
              }
              error={errors.centroCusto}
            />
            <div className="space-y-2">
              <Label htmlFor="item-obs">Observação</Label>
              <Textarea
                id="item-obs"
                value={draft.observacao ?? ""}
                onChange={(e) => setDraft((prev) => ({ ...prev, observacao: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" className="w-full sm:w-auto" onClick={addItem}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotaItensTable;
