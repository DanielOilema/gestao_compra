import React from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@gestao-compra/ui";
import {
  sumRateioPercentual,
  validateRateioCC,
  type RateioCCDraft,
} from "@gestao-compra/shared";
import CentroCustoCombobox from "./CentroCustoCombobox";

interface RateioCentroCustoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: RateioCCDraft[];
  disabled?: boolean;
  onConfirm: (rateio: RateioCCDraft[]) => void;
  onClear?: () => void;
}

const emptyRow = (): RateioCCDraft => ({
  cc: "",
  percentual: 0,
  descricao: "",
});

const RateioCentroCustoDialog: React.FC<RateioCentroCustoDialogProps> = ({
  open,
  onOpenChange,
  value,
  disabled,
  onConfirm,
  onClear,
}) => {
  const [rows, setRows] = React.useState<RateioCCDraft[]>([emptyRow(), emptyRow()]);
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    if (!open) return;
    if (value && value.length > 0) {
      setRows(value.map((row) => ({ ...row })));
    } else {
      setRows([emptyRow(), emptyRow()]);
    }
    setError(undefined);
  }, [open, value]);

  const total = Math.round(sumRateioPercentual(rows) * 100) / 100;
  const hasExisting = Boolean(value && value.length > 0);

  const updateRow = (index: number, patch: Partial<RateioCCDraft>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    setError(undefined);
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
    setError(undefined);
  };

  const removeRow = (index: number) => {
    setRows((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)));
    setError(undefined);
  };

  const handleConfirm = () => {
    const result = validateRateioCC(rows);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onConfirm(
      rows.map((row) => ({
        cc: row.cc.trim(),
        percentual: Number(row.percentual),
        descricao: row.descricao?.trim() || undefined,
      })),
    );
    onOpenChange(false);
  };

  const handleClear = () => {
    onClear?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rateio de centros de custo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Informe pelo menos 2 centros de custo diferentes. A soma dos percentuais deve ser 100%.
          </p>

          {rows.map((row, index) => (
            <div
              key={`rateio-row-${index}`}
              className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_7rem_auto] sm:items-end"
            >
              <CentroCustoCombobox
                id={`rateio-cc-${index}`}
                value={row.cc}
                selectedLabel={
                  row.cc ? `${row.cc}${row.descricao ? ` - ${row.descricao}` : ""}` : undefined
                }
                onValueChange={(custo, option) =>
                  updateRow(index, {
                    cc: custo,
                    descricao: option?.descricao ?? "",
                  })
                }
                disabled={disabled}
                required
                label="Centro de custo"
              />
              <div className="space-y-2">
                <Label htmlFor={`rateio-pct-${index}`}>Percentual *</Label>
                <Input
                  id={`rateio-pct-${index}`}
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={row.percentual || ""}
                  disabled={disabled}
                  onChange={(e) =>
                    updateRow(index, { percentual: Number(e.target.value) })
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                disabled={disabled || rows.length <= 2}
                onClick={() => removeRow(index)}
                aria-label="Remover centro de custo"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addRow}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar centro de custo
            </Button>
            <p className={`text-sm font-medium ${total === 100 ? "text-foreground" : "text-destructive"}`}>
              Total: {total}%
            </p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <div>
            {hasExisting && onClear ? (
              <Button type="button" variant="ghost" disabled={disabled} onClick={handleClear}>
                Remover rateio
              </Button>
            ) : null}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={disabled} onClick={handleConfirm}>
              Confirmar rateio
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RateioCentroCustoDialog;
