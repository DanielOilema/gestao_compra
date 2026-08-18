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
import type { SolicitacaoCompraListFilters } from "./solicitacaoCompraListFilters";

interface SolicitacaoCompraFiltersPanelProps {
  filters: SolicitacaoCompraListFilters;
  onChange: (filters: SolicitacaoCompraListFilters) => void;
  onBuscar: () => void;
  isLoading?: boolean;
}

const FILIAIS = [
  { value: "0101", label: "0101 - Oilema Comércio BA" },
  { value: "0102", label: "0102 - Oilema Comércio TO" },
  { value: "0103", label: "0103 - Oilema Comércio MT" },
  { value: "0104", label: "0104 - Oilema Comércio MA" },
  { value: "0105", label: "0105 - Oilema Comércio GO" },
  { value: "0106", label: "0106 - Oilema Comércio PA" },
  { value: "0107", label: "0107 - Oilema Comércio PI" },
  { value: "0201", label: "0201 - Sementes Oilema" },
  { value: "0301", label: "0301 - Oilema Participações" },
];

const ALL_FILIAIS = "__all__";

const SolicitacaoCompraFiltersPanel: React.FC<SolicitacaoCompraFiltersPanelProps> = ({
  filters,
  onChange,
  onBuscar,
  isLoading = false,
}) => {
  const update = (partial: Partial<SolicitacaoCompraListFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscar();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="filtro-filial">Filial</Label>
          <Select
            value={filters.filial || ALL_FILIAIS}
            onValueChange={(v) => update({ filial: v === ALL_FILIAIS ? "" : v })}
          >
            <SelectTrigger id="filtro-filial">
              <SelectValue placeholder="Todas as filiais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILIAIS}>Todas as filiais</SelectItem>
              {FILIAIS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filtro-num-sc">Número da Solicitação</Label>
          <Input
            id="filtro-num-sc"
            value={filters.numSC}
            onChange={(e) => update({ numSC: e.target.value })}
            placeholder="Ex.: 008004"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filtro-produto">Produto</Label>
          <Input
            id="filtro-produto"
            value={filters.produto}
            onChange={(e) => update({ produto: e.target.value })}
            placeholder="Código ou descrição do produto"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filtro-solicitante">Solicitante</Label>
          <Input
            id="filtro-solicitante"
            value={filters.solicitante}
            onChange={(e) => update({ solicitante: e.target.value })}
            placeholder="Nome do solicitante"
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

export default SolicitacaoCompraFiltersPanel;
