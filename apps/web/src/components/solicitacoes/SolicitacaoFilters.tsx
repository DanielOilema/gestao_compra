import React from "react";
import type { PurchaseRequestStatus } from "@gestao-compra/shared";
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gestao-compra/ui";
import BrDateInput from "@/components/shared/BrDateInput";

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
        <BrDateInput
          id="dataInicio"
          value={filters.dataInicio}
          onChange={(dataInicio) => onChange({ ...filters, dataInicio })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dataFim">Data fim</Label>
        <BrDateInput
          id="dataFim"
          value={filters.dataFim}
          onChange={(dataFim) => onChange({ ...filters, dataFim })}
        />
      </div>
    </div>
  );
};

export default SolicitacaoFilters;
