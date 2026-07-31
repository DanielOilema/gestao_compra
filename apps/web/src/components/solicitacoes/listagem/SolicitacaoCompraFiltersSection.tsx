import React from "react";
import { Collapsible, CollapsibleContent } from "@gestao-compra/ui";
import SolicitacaoCompraFiltersPanel from "./SolicitacaoCompraFiltersPanel";
import type { SolicitacaoCompraListFilters } from "./solicitacaoCompraListFilters";

interface SolicitacaoCompraFiltersSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SolicitacaoCompraListFilters;
  onChange: (filters: SolicitacaoCompraListFilters) => void;
  onBuscar: () => void;
  isLoading?: boolean;
}

const SolicitacaoCompraFiltersSection: React.FC<SolicitacaoCompraFiltersSectionProps> = ({
  open,
  onOpenChange,
  filters,
  onChange,
  onBuscar,
  isLoading,
}) => {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleContent>
        <div className="rounded-lg border bg-card p-4">
          <SolicitacaoCompraFiltersPanel
            filters={filters}
            onChange={onChange}
            onBuscar={onBuscar}
            isLoading={isLoading}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SolicitacaoCompraFiltersSection;
