import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil, Filter, ChevronUp } from "lucide-react";
import { Button } from "@gestao-compra/ui";
import { cn } from "@gestao-compra/ui";
import { toast } from "sonner";

interface SolicitacaoCompraToolbarProps {
  onVisualizar: () => boolean;
  onAlterar: () => boolean;
  hasSelection: boolean;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  exportSlot?: React.ReactNode;
}

const SolicitacaoCompraToolbar: React.FC<SolicitacaoCompraToolbarProps> = ({
  onVisualizar,
  onAlterar,
  hasSelection,
  filtersOpen,
  onToggleFilters,
  exportSlot,
}) => {
  const navigate = useNavigate();

  const handleVisualizar = () => {
    if (!hasSelection) {
      toast.warning("Selecione uma solicitação para visualizar");
      return;
    }
    onVisualizar();
  };

  const handleAlterar = () => {
    onAlterar();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" onClick={() => navigate("/solicitacoes-compra/nova")}>
        <Plus className="mr-2 h-4 w-4" />
        Incluir
      </Button>
      <Button size="sm" variant="outline" onClick={handleVisualizar}>
        <Eye className="mr-2 h-4 w-4" />
        Visualizar
      </Button>
      <Button size="sm" variant="outline" onClick={handleAlterar}>
        <Pencil className="mr-2 h-4 w-4" />
        Alterar
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
      {exportSlot}
    </div>
  );
};

export default SolicitacaoCompraToolbar;
