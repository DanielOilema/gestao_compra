import React from "react";
import { Search, X } from "lucide-react";
import { Input, Button } from "@gestao-compra/ui";

interface OrderSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const OrderSearchBar: React.FC<OrderSearchBarProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Buscar..."}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default OrderSearchBar;
