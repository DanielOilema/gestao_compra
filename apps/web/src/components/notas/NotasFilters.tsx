import React from "react";
import type { NotaStatus, NotaTipo } from "@gestao-compra/shared";
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input } from "@gestao-compra/ui";
import OrderSearchBar from "@/components/OrderSearchBar";

export interface NotasFiltersState {
  search: string;
  tipo: NotaTipo | "all";
  status: NotaStatus | "all";
  dataInicio: string;
  dataFim: string;
}

interface NotasFiltersProps {
  filters: NotasFiltersState;
  onChange: (filters: NotasFiltersState) => void;
}

const NotasFilters: React.FC<NotasFiltersProps> = ({ filters, onChange }) => {
  return (
    <div className="space-y-4">
      <OrderSearchBar
        value={filters.search}
        onChange={(search) => onChange({ ...filters, search })}
        placeholder="Buscar por número, descrição ou referência..."
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select
            value={filters.tipo}
            onValueChange={(v) => onChange({ ...filters, tipo: v as NotaTipo | "all" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="debito">Débito</SelectItem>
              <SelectItem value="credito">Crédito</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={(v) => onChange({ ...filters, status: v as NotaStatus | "all" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="processada">Processada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notaDataInicio">Data início</Label>
          <Input
            id="notaDataInicio"
            type="date"
            value={filters.dataInicio}
            onChange={(e) => onChange({ ...filters, dataInicio: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notaDataFim">Data fim</Label>
          <Input
            id="notaDataFim"
            type="date"
            value={filters.dataFim}
            onChange={(e) => onChange({ ...filters, dataFim: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default NotasFilters;
