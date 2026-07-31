import React from "react";
import { Collapsible, CollapsibleContent } from "@gestao-compra/ui";
import NotasFiltersPanel from "./NotasFiltersPanel";
import type { NotasListFilters } from "./notasListFilters";

interface NotasFiltersSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: NotasListFilters;
  onChange: (filters: NotasListFilters) => void;
  onBuscar: () => void;
  isLoading?: boolean;
}

const NotasFiltersSection: React.FC<NotasFiltersSectionProps> = ({
  open,
  onOpenChange,
  filters,
  onChange,
  onBuscar,
  isLoading,
}) => (
  <Collapsible open={open} onOpenChange={onOpenChange}>
    <CollapsibleContent>
      <div className="rounded-lg border bg-card p-4">
        <NotasFiltersPanel
          filters={filters}
          onChange={onChange}
          onBuscar={onBuscar}
          isLoading={isLoading}
        />
      </div>
    </CollapsibleContent>
  </Collapsible>
);

export default NotasFiltersSection;
