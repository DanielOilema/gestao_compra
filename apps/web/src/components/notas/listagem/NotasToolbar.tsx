import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, ChevronUp } from "lucide-react";
import { Button, cn } from "@gestao-compra/ui";
import NotasSearchInput from "./NotasSearchInput";

interface NotasToolbarProps {
  filtersOpen: boolean;
  onToggleFilters: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
}

const NotasToolbar: React.FC<NotasToolbarProps> = ({
  filtersOpen,
  onToggleFilters,
  search,
  onSearchChange,
  isLoading,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => navigate("/notas-debito-credito/nova")}>
          <Plus className="mr-2 h-4 w-4" />
          Incluir
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onToggleFilters}
          className={cn(filtersOpen && "border-primary text-primary")}
        >
          {filtersOpen ? (
            <ChevronUp className="mr-2 h-4 w-4" />
          ) : (
            <Filter className="mr-2 h-4 w-4" />
          )}
          Filtros
        </Button>
      </div>
      <NotasSearchInput
        value={search}
        onChange={onSearchChange}
        disabled={isLoading}
        className="w-full"
      />
    </div>
  );
};

export default NotasToolbar;
