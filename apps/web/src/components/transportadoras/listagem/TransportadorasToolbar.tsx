import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { Button } from "@gestao-compra/ui";
import TransportadorasSearchInput from "./TransportadorasSearchInput";

interface TransportadorasToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClear: () => void;
  isLoading?: boolean;
}

const TransportadorasToolbar: React.FC<TransportadorasToolbarProps> = ({
  search,
  onSearchChange,
  onSearchSubmit,
  onClear,
  isLoading,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => navigate("/transportadoras/nova")}>
          <Plus className="mr-2 h-4 w-4" />
          Incluir
        </Button>
        <Button size="sm" variant="outline" onClick={onClear} disabled={isLoading}>
          <X className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </div>
      <TransportadorasSearchInput
        value={search}
        onChange={onSearchChange}
        onSubmit={onSearchSubmit}
        disabled={isLoading}
        className="w-full"
      />
    </div>
  );
};

export default TransportadorasToolbar;
