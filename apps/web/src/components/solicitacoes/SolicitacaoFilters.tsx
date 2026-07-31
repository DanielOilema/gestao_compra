import React from "react";
import type { PurchaseRequestStatus } from "@gestao-compra/shared";
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input } from "@gestao-compra/ui";

export interface SolicitacaoFiltersState {
  status: PurchaseRequestStatus | "all";
  dataInicio: string;
  dataFim: string;
}

interface SolicitacaoFiltersProps {
  filters: SolicitacaoFiltersState;
  onChange: (filters: SolicitacaoFiltersState) => void;
}

const statusOptions: { value: PurchaseRequestStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos os status" },
  { value: "rascunho", label: "Rascunho" },
  { value: "pendente", label: "Pendente" },
  { value: "aprovada", label: "Aprovada" },
  { value: "rejeitada", label: "Rejeitada" },
  { value: "cancelada", label: "Cancelada" },
];

const SolicitacaoFilters: React.FC<SolicitacaoFiltersProps> = ({ filters, onChange }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={filters.status}
          onValueChange={(v) => onChange({ ...filters, status: v as PurchaseRequestStatus | "all" })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dataInicio">Data início</Label>
        <Input
          id="dataInicio"
          type="date"
          value={filters.dataInicio}
          onChange={(e) => onChange({ ...filters, dataInicio: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dataFim">Data fim</Label>
        <Input
          id="dataFim"
          type="date"
          value={filters.dataFim}
          onChange={(e) => onChange({ ...filters, dataFim: e.target.value })}
        />
      </div>
    </div>
  );
};

export default SolicitacaoFilters;
