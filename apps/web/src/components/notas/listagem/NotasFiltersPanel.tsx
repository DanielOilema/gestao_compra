import React from "react";
import { Search, Loader2 } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gestao-compra/ui";
import BrDateInput from "@/components/shared/BrDateInput";
import type { NotasListFilters } from "./notasListFilters";

interface NotasFiltersPanelProps {
  filters: NotasListFilters;
  onChange: (filters: NotasListFilters) => void;
  onBuscar: () => void;
  isLoading?: boolean;
}

const NotasFiltersPanel: React.FC<NotasFiltersPanelProps> = ({
  filters,
  onChange,
  onBuscar,
  isLoading = false,
}) => {
  const update = (partial: Partial<NotasListFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscar();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="filtro-tipo">Tipo</Label>
          <Select
            value={filters.tipo}
            onValueChange={(v) => update({ tipo: v as NotasListFilters["tipo"] })}
          >
            <SelectTrigger id="filtro-tipo">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="debito">Débito</SelectItem>
              <SelectItem value="credito">Crédito</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filtro-clifor">Cliente / Fornecedor</Label>
          <Input
            id="filtro-clifor"
            value={filters.cliFor}
            onChange={(e) => update({ cliFor: e.target.value })}
            placeholder="Código ou nome"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filtro-data-inicio">Data inicial</Label>
          <BrDateInput
            id="filtro-data-inicio"
            value={filters.dataInicio}
            onChange={(dataInicio) => update({ dataInicio })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filtro-data-fim">Data final</Label>
          <BrDateInput
            id="filtro-data-fim"
            value={filters.dataFim}
            onChange={(dataFim) => update({ dataFim })}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Buscar
        </Button>
      </div>
    </form>
  );
};

export default NotasFiltersPanel;
